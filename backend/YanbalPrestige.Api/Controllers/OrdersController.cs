using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Enums;
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

    private static readonly HashSet<string> AllowedPaymentMethods =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "efectivo", "transferencia", "nequi", "daviplata", "tarjeta", "otro", "reembolso"
        };

    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db) => _db = db;

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    private bool IsDirector => User.IsInRole(AuthRoles.Director);

    /// <summary>La asistente administrativa también supervisa las ventas.</summary>
    private bool IsAdmin => IsDirector || User.IsInRole(AuthRoles.Assistant);

    private bool IsLeader => User.IsInRole(AuthRoles.Leader);

    /// <summary>Ids de las consultoras que reportan al líder autenticado.</summary>
    private async Task<List<string>> GetTeamIdsAsync()
    {
        var leaderId = CurrentUserId;
        return await _db.Users.AsNoTracking()
            .Where(u => u.LeaderId == leaderId)
            .Select(u => u.Id)
            .ToListAsync();
    }

    /// <summary>
    /// Valida si el usuario actual puede operar sobre un pedido.
    /// Directora: todo. Líder: su equipo. Consultora: solo lo propio.
    /// </summary>
    private async Task<bool> CanAccessOrderAsync(Order order)
    {
        if (IsAdmin) return true;
        if (order.ConsultantId == CurrentUserId) return true;
        if (!IsLeader) return false;

        var teamIds = await GetTeamIdsAsync();
        return teamIds.Contains(order.ConsultantId);
    }

    /// <summary>
    /// Decide a quién pertenece la venta. Una consultora/líder solo puede
    /// vender a su propio nombre; la administración puede asignar; el
    /// autopedido público usa la consultora activa por defecto.
    /// </summary>
    private async Task<User?> ResolveConsultantAsync(CreateOrderDto dto)
    {
        if (User.IsInRole(AuthRoles.Consultant) || User.IsInRole(AuthRoles.Leader))
        {
            return await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == CurrentUserId && u.IsActive);
        }

        if (IsAdmin && !string.IsNullOrWhiteSpace(dto.ConsultantId))
        {
            var chosen = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == dto.ConsultantId && u.IsActive &&
                    (u.Role == UserRole.Consultant ||
                     u.Role == UserRole.Leader ||
                     u.Role == UserRole.Director));
            if (chosen != null) return chosen;
        }

        if (IsAdmin) return null;

        // Autopedido público: sin sesión, la primera consultora activa.
        return await _db.Users.AsNoTracking()
            .Where(u => u.IsActive && u.Role == UserRole.Consultant)
            .OrderBy(u => u.FullName)
            .FirstOrDefaultAsync();
    }

    [HttpGet]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant},{AuthRoles.Leader},{AuthRoles.Consultant}")]
    public async Task<IActionResult> GetAll([FromQuery] OrderFilterDto filter)
    {
        var q = _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .AsSplitQuery()
            .AsQueryable();

        // Una consultora solo ve su propia cartera; un líder ve su equipo.
        // El filtro del cliente no puede ampliar el alcance (BOLA / IDOR).
        if (IsAdmin)
        {
            if (!string.IsNullOrWhiteSpace(filter.ConsultantId))
                q = q.Where(o => o.ConsultantId == filter.ConsultantId);
        }
        else if (IsLeader)
        {
            var teamIds = await GetTeamIdsAsync();
            teamIds.Add(CurrentUserId);
            q = q.Where(o => teamIds.Contains(o.ConsultantId));
        }
        else
        {
            q = q.Where(o => o.ConsultantId == CurrentUserId);
        }
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
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant},{AuthRoles.Leader},{AuthRoles.Consultant}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .AsSplitQuery()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Orden no encontrada." });
        if (!await CanAccessOrderAsync(order))
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

        var consultant = await ResolveConsultantAsync(dto);
        if (consultant == null)
            return BadRequest(new { message = "La consultora asignada no es válida o está inactiva." });

        var order = new Order
        {
            ClientId = dto.ClientId,
            ClientName = dto.ClientName.Trim(),
            ClientPhone = dto.ClientPhone.Trim(),
            ClientCity = dto.ClientCity.Trim(),
            ClientAddress = dto.ClientAddress?.Trim() ?? string.Empty,
            ClientEmail = dto.ClientEmail?.Trim() ?? string.Empty,
            ClientDocumentId = dto.ClientDocumentId?.Trim() ?? string.Empty,
            ClientNeighborhood = dto.ClientNeighborhood?.Trim() ?? string.Empty,
            ClientPostalCode = dto.ClientPostalCode?.Trim() ?? string.Empty,
            ConsultantId = consultant.Id,
            ConsultantName = consultant.FullName,
            Source = source,
            Notes = dto.Notes,
            IdempotencyKey = key,
            AcceptedHabeasData = true,
            Items = orderItems
        };
        order.TotalAmount = order.Items.Sum(i => i.Subtotal);

        var requestedPayments = dto.Payments ?? new List<CreatePaymentDto>();
        if (requestedPayments.Count > 20)
            return BadRequest(new { message = "Un pedido no puede tener más de 20 movimientos de pago." });

        foreach (var payment in requestedPayments)
        {
            if (!AllowedPaymentMethods.Contains(payment.Method))
                return BadRequest(new { message = $"Método de pago no válido: {payment.Method}." });
            if (payment.Amount <= 0)
                return BadRequest(new { message = "Cada pago inicial debe tener un monto mayor a cero." });
        }

        var paidAmount = requestedPayments.Sum(p => p.Amount);
        if (paidAmount > order.TotalAmount + 0.01m)
            return BadRequest(new { message = "La suma de los pagos supera el total del pedido." });

        order.Payments = requestedPayments.Select(p => new OrderPayment
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = order.Id,
            Amount = p.Amount,
            Method = p.Method.ToLowerInvariant(),
            Note = p.Note,
            RegisteredBy = string.IsNullOrWhiteSpace(CurrentUserId) ? null : CurrentUserId,
            Date = p.Date ?? DateTime.UtcNow,
        }).ToList();
        order.PaymentStatus = DerivePaymentStatus(order.TotalAmount, paidAmount);

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
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant},{AuthRoles.Leader},{AuthRoles.Consultant}")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Orden no encontrada." });
        if (!await CanAccessOrderAsync(order))
            return NotFound(new { message = "Orden no encontrada." });

        if (!string.IsNullOrWhiteSpace(dto.PaymentStatus) &&
            !AllowedPaymentStatuses.Contains(dto.PaymentStatus))
            return BadRequest(new { message = "Estado de pago no válido." });

        if (!string.IsNullOrWhiteSpace(dto.DeliveryStatus))
        {
            if (!AllowedDeliveryStatuses.Contains(dto.DeliveryStatus))
                return BadRequest(new { message = "Estado de entrega no válido." });
            order.DeliveryStatus = dto.DeliveryStatus.ToLowerInvariant();
        }

        var paid = order.Payments.Sum(p => p.Amount);
        var derived = order.DeliveryStatus == "cancelado"
            ? "anulada"
            : DerivePaymentStatus(order.TotalAmount, paid);

        if (!string.IsNullOrWhiteSpace(dto.PaymentStatus) &&
            !string.Equals(dto.PaymentStatus, derived, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "El estado de pago se calcula desde los pagos y la anulación. Use el endpoint de pagos."
            });
        }

        // Anular congela la factura; al reactivar la entrega se recalcula el
        // estado real según el dinero que sigue registrado.
        order.PaymentStatus = derived;

        if (dto.Notes != null) order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { success = true, order.Id, order.PaymentStatus, order.DeliveryStatus });
    }

    /// <summary>
    /// Reemplaza el historial de pagos de un pedido. El frontend envía la
    /// lista completa al registrar, editar o eliminar un abono.
    /// </summary>
    [HttpPut("{id}/payments")]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant},{AuthRoles.Leader},{AuthRoles.Consultant}")]
    public async Task<IActionResult> UpdatePayments(string id, [FromBody] List<CreatePaymentDto> payments)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .AsSplitQuery()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Orden no encontrada." });
        if (!await CanAccessOrderAsync(order))
            return NotFound(new { message = "Orden no encontrada." });

        if (payments.Count > 20)
            return BadRequest(new { message = "Un pedido no puede tener más de 20 movimientos de pago." });

        foreach (var payment in payments)
        {
            var isRefund = string.Equals(payment.Method, "reembolso", StringComparison.OrdinalIgnoreCase);

            if (isRefund && payment.Amount >= 0)
                return BadRequest(new { message = "Un reembolso debe registrarse con monto negativo." });
            if (!isRefund && payment.Amount <= 0)
                return BadRequest(new { message = "Cada pago o abono debe tener un monto mayor a cero." });

            if (!AllowedPaymentMethods.Contains(payment.Method))
                return BadRequest(new { message = $"Método de pago no válido: {payment.Method}." });
        }

        var paidAmount = payments.Sum(p => p.Amount);
        if (paidAmount > order.TotalAmount + 0.01m)
            return BadRequest(new { message = "La suma de los pagos supera el total del pedido." });
        if (paidAmount < 0)
            return BadRequest(new { message = "Los reembolsos superan el dinero recibido en el pedido." });

        _db.OrderPayments.RemoveRange(order.Payments);
        order.Payments = payments.Select(p => new OrderPayment
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = order.Id,
            Amount = p.Amount,
            Method = p.Method.ToLowerInvariant(),
            Note = p.Note,
            RegisteredBy = string.IsNullOrWhiteSpace(CurrentUserId) ? null : CurrentUserId,
            Date = p.Date ?? DateTime.UtcNow,
        }).ToList();
        order.PaymentStatus = order.DeliveryStatus == "cancelado"
            ? "anulada"
            : DerivePaymentStatus(order.TotalAmount, paidAmount);
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(order));
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

    private static string DerivePaymentStatus(decimal total, decimal paid)
    {
        if (paid <= 0) return "pendiente";
        if (paid + 0.01m >= total) return "pagado";
        return "abono";
    }

    private static OrderDto MapToDto(Order o) => new(
        o.Id, o.InvoiceNumber, o.ClientId, o.ClientName, o.ClientPhone, o.ClientCity, o.ClientAddress,
        o.ClientEmail, o.ClientDocumentId, o.ClientNeighborhood, o.ClientPostalCode,
        o.ConsultantId, o.ConsultantName, o.TotalAmount, o.PaymentStatus, o.DeliveryStatus,
        o.Source, o.Notes, o.CreatedAt, o.UpdatedAt,
        o.Items.Select(i => new OrderItemDto(
            i.Id, i.OrderId, i.ProductId, i.ProductSku, i.ProductName, i.UnitPrice, i.Quantity, i.Subtotal
        )).ToList(),
        o.Payments
            .OrderBy(p => p.Date)
            .Select(p => new PaymentDto(p.Id, p.Amount, p.Method, p.Note, p.Date))
            .ToList(),
        o.IdempotencyKey, o.AcceptedHabeasData
    );
}
