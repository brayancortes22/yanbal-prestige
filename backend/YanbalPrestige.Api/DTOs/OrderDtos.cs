using System.ComponentModel.DataAnnotations;

namespace YanbalPrestige.Api.DTOs;

public record OrderDto(
    string Id,
    string InvoiceNumber,
    string? ClientId,
    string ClientName,
    string ClientPhone,
    string ClientCity,
    string ClientAddress,
    string ConsultantId,
    string ConsultantName,
    decimal TotalAmount,
    string PaymentStatus,
    string DeliveryStatus,
    string Source,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<OrderItemDto> Items,
    string? IdempotencyKey = null,
    bool AcceptedHabeasData = true
);

public record OrderItemDto(
    string Id,
    string OrderId,
    string ProductId,
    string ProductSku,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);

public record CreateOrderDto(
    [Required, MaxLength(150)] string ClientName,
    [Required, MaxLength(30), RegularExpression(@"^[0-9+\s()-]{7,30}$", ErrorMessage = "Teléfono no válido.")] string ClientPhone,
    [Required, MaxLength(100)] string ClientCity,
    [MaxLength(200)] string ClientAddress,
    [MaxLength(50)] string? ClientId,
    [Required, MaxLength(50)] string ConsultantId,
    [Required, MaxLength(150)] string ConsultantName,
    [MaxLength(100)] string? IdempotencyKey,
    [MaxLength(30)] string? Source,
    [MaxLength(1000)] string? Notes,
    [Required, MinLength(1, ErrorMessage = "La orden debe contener al menos un producto."), MaxLength(50)]
    List<CreateOrderItemDto> Items,
    bool AcceptedHabeasData = false,
    string? TrapField = null
);

public record CreateOrderItemDto(
    [Required, MaxLength(50)] string ProductId,
    [Required, MaxLength(50)] string ProductSku,
    [Required, MaxLength(200)] string ProductName,
    [Range(0, 9999999.99)] decimal UnitPrice,
    [Range(1, 99, ErrorMessage = "La cantidad por referencia debe estar entre 1 y 99.")] int Quantity
);

public record UpdateOrderStatusDto(
    [MaxLength(30)] string? PaymentStatus,
    [MaxLength(30)] string? DeliveryStatus,
    string? Notes
);

public record AssignConsultantDto(
    [Required, MaxLength(50)] string ConsultantId,
    [Required, MaxLength(150)] string ConsultantName
);

public record OrderFilterDto(
    string? ConsultantId = null,
    string? PaymentStatus = null,
    string? DeliveryStatus = null,
    string? Query = null,
    int Page = 1,
    int PageSize = 20
);
