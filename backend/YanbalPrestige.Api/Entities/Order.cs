using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("pedidos")]
public class Order
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("numero_factura")]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Column("cliente_id")]
    [MaxLength(50)]
    public string? ClientId { get; set; }

    [Column("cliente_nombre")]
    [MaxLength(150)]
    public string ClientName { get; set; } = string.Empty;

    [Column("cliente_telefono")]
    [MaxLength(50)]
    public string ClientPhone { get; set; } = string.Empty;

    [Column("cliente_ciudad")]
    [MaxLength(100)]
    public string ClientCity { get; set; } = string.Empty;

    [Column("cliente_direccion")]
    [MaxLength(200)]
    public string ClientAddress { get; set; } = string.Empty;

    [Column("cliente_correo")]
    [MaxLength(150)]
    public string ClientEmail { get; set; } = string.Empty;

    [Column("cliente_documento")]
    [MaxLength(30)]
    public string ClientDocumentId { get; set; } = string.Empty;

    [Column("cliente_barrio")]
    [MaxLength(100)]
    public string ClientNeighborhood { get; set; } = string.Empty;

    [Column("cliente_codigo_postal")]
    [MaxLength(20)]
    public string ClientPostalCode { get; set; } = string.Empty;

    [Column("consultora_id")]
    [MaxLength(50)]
    public string ConsultantId { get; set; } = string.Empty;

    [Column("consultora_nombre")]
    [MaxLength(150)]
    public string ConsultantName { get; set; } = string.Empty;

    [Column("total", TypeName = "decimal(12,2)")]
    public decimal TotalAmount { get; set; }

    [Column("estado_pago")]
    [MaxLength(30)]
    public string PaymentStatus { get; set; } = "pendiente";

    [Column("estado_entrega")]
    [MaxLength(30)]
    public string DeliveryStatus { get; set; } = "preparacion";

    [Column("origen")]
    [MaxLength(30)]
    public string Source { get; set; } = "venta_directa";

    [Column("notas")]
    public string? Notes { get; set; }

    [Column("idempotency_key")]
    [MaxLength(100)]
    public string? IdempotencyKey { get; set; }

    [Column("accepted_habeas_data")]
    public bool AcceptedHabeasData { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();

    public List<OrderPayment> Payments { get; set; } = new();
}
