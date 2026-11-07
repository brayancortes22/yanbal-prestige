using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private static readonly SemaphoreSlim InvoiceLock = new(1, 1);

    private static readonly HashSet<string> AllowedPaymentStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "pendiente", "abono", "pagado", "anulada" };

    private static readonly HashSet<string> AllowedDeliveryStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "preparacion", "camino", "entregado", "cancelado" };

    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db) => _db = db;

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    private bool IsDirector => User.IsInRole(AuthRoles.Director);

    [HttpGet]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Consultant}")]
    public async Task<IActionResult> GetAll([FromQuery] OrderFilterDto filter)
    {
        var q = _db.Orders.AsNoTracking().Include(o => o.Items).AsQueryable();

        // Una consultora solo ve su propia cartera; el filtro del cliente
        // no puede ampliar el alcance (BOLA / IDOR).
        var consultantId = IsDirector ? filter.ConsultantId : CurrentUserId;
        if (!string.IsNullOrWhiteSpace(consultantId))
            q = q.Where(o => o.ConsultantId == consultantId);
        if (!string.IsNullOrWhiteSpace(filter.PaymentStatus))
            q = q.Where(o => o.PaymentStatus == filter.PaymentStatus);
        if (!string.IsNullOrWhiteSpace(filter.DeliveryStatus))
            q = q.Where(o => o.DeliveryStatus == filter.DeliveryStatus);
        if (!string.IsNullOrWhiteSpace(filter.Query))
            q = q.Where(o => o.InvoiceNumber.Contains(filter.Query) || o.ClientName.Contains(filter.Query));

        var pageSize = Math.Clamp(filter.PageSize, 1, 100);
        var page = Math.Max(1, filter.Page);
        var total = await q.CountAsync();
        var orders = await q.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = orders.Select(MapToDto).ToList() });
    }

    [HttpGet("{id}")]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Consultant}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _db.Orders.AsNoTracking().Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Orden no encontrada." });
        if (!IsDirector && order.ConsultantId != CurrentUserId)
            return NotFound(new { message = "Orden no encontrada." });

        return Ok(MapToDto(order));
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.TrapField))
            return BadRequest(new { message = "Detección de seguridad perimetral activada." });

        if (!dto.AcceptedHabeasData)
            return BadRequest(new { message = "Debe aceptar la política de tratamiento de datos (Ley 1581)." });

        if (dto.Items.Count is < 1 or > 50)
            return BadRequest(new { message = "El pedido debe tener entre 1 y 50 líneas." });

        var key = Request.Headers["X-Idempotency-Key"].FirstOrDefault() ?? dto.IdempotencyKey;
        if (!string.IsNullOrWhiteSpace(key))
        {
            var existing = await _db.Orders.AsNoTracking().Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.IdempotencyKey == key);
            if (existing != null) return Ok(MapToDto(existing));
        }

        // Anti-tampering: el precio y el nombre SIEMPRE salen del catálogo,
        // nunca de lo que envía el navegador.
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        if (productIds.Count != dto.Items.Count)
            return BadRequest(new { message = "Hay productos duplicados en el pedido." });

        var products = await _db.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id);

        var orderItems = new List<OrderItem>();
        foreach (var item in dto.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                return BadRequest(new { message = $"Producto no disponible: {item.ProductSku}." });
            if (item.Quantity is < 1 or > 99)
                return BadRequest(new { message = "La cantidad por referencia debe estar entre 1 y 99." });

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductSku = product.Code,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = item.Quantity,
                Subtotal = Math.Round(product.Price * item.Quantity, 2)
            });
        }

        var source = string.Equals(dto.Source, "web_catalogo", StringComparison.OrdinalIgnoreCase)
            ? "web_catalogo"
            : "venta_directa";

        var order = new Order
        {
            ClientId = dto.ClientId,
            ClientName = dto.ClientName.Trim(),
            ClientPhone = dto.ClientPhone.Trim(),
            ClientCity = dto.ClientCity.Trim(),
            ClientAddress = dto.ClientAddress?.Trim() ?? string.Empty,
            ConsultantId = dto.ConsultantId,
            ConsultantName = dto.ConsultantName,
            Source = source,
            Notes = dto.Notes,
            IdempotencyKey = key,
            AcceptedHabeasData = true,
            Items = orderItems
        };
        order.TotalAmount = order.Items.Sum(i => i.Subtotal);

        // Serializa la generación del correlativo dentro de la instancia para
        // evitar dos facturas con el mismo número bajo clics simultáneos.
        await InvoiceLock.WaitAsync();
        try
        {
            order.InvoiceNumber = await NextInvoiceNumberAsync();
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
        }
        finally
        {
            InvoiceLock.Release();
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapToDto(order));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Consultant}")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Orden no encontrada." });
        if (!IsDirector && order.ConsultantId != CurrentUserId)
            return NotFound(new { message = "Orden no encontrada." });

        if (!string.IsNullOrWhiteSpace(dto.PaymentStatus))
        {
            if (!AllowedPaymentStatuses.Contains(dto.PaymentStatus))
                return BadRequest(new { message = "Estado de pago no válido." });
            order.PaymentStatus = dto.PaymentStatus.ToLowerInvariant();
        }

        if (!string.IsNullOrWhiteSpace(dto.DeliveryStatus))
        {
            if (!AllowedDeliveryStatuses.Contains(dto.DeliveryStatus))
                return BadRequest(new { message = "Estado de entrega no válido." });
            order.DeliveryStatus = dto.DeliveryStatus.ToLowerInvariant();
        }

        if (dto.Notes != null) order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { success = true, order.Id, order.PaymentStatus, order.DeliveryStatus });
    }

    [HttpPatch("{id}/assign")]
    [Authorize(Roles = AuthRoles.Director)]
    public async Task<IActionResult> AssignConsultant(string id, [FromBody] AssignConsultantDto dto)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Orden no encontrada." });

        order.ConsultantId = dto.ConsultantId;
        order.ConsultantName = dto.ConsultantName;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { success = true, order.Id, order.ConsultantId, order.ConsultantName });
    }

    private async Task<string> NextInvoiceNumberAsync()
    {
        var prefix = $"FAC-{DateTime.UtcNow:yyyyMM}-";
        var latest = await _db.Orders.AsNoTracking()
            .Where(o => o.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(o => o.InvoiceNumber)
            .Select(o => o.InvoiceNumber)
            .FirstOrDefaultAsync();

        var nextSeq = latest != null && latest.Length > prefix.Length &&
                      int.TryParse(latest.AsSpan(prefix.Length), out var seq)
            ? seq + 1
            : 1;

        return $"{prefix}{nextSeq:D4}";
    }

    private static OrderDto MapToDto(Order o) => new(
        o.Id, o.InvoiceNumber, o.ClientId, o.ClientName, o.ClientPhone, o.ClientCity, o.ClientAddress,
        o.ConsultantId, o.ConsultantName, o.TotalAmount, o.PaymentStatus, o.DeliveryStatus,
        o.Source, o.Notes, o.CreatedAt, o.UpdatedAt,
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.OrderId, i.ProductId, i.ProductSku, i.ProductName, i.UnitPrice, i.Quantity, i.Subtotal
        )).ToList(),
        o.IdempotencyKey, o.AcceptedHabeasData
    );
}
