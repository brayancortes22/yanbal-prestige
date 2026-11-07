-- =========================================================================
-- MIGRACIÓN 003: MÓDULO DE VENTAS, PEDIDOS Y FACTURACIÓN COMERCIAL
-- Yanbal Prestige — Fase 2: Plataforma Comercial & ERP de Ventas
-- =========================================================================

-- 1. Actualizar tabla de productos con campos editables de PDP
ALTER TABLE `productos`
  ADD COLUMN IF NOT EXISTS `botanical_title` VARCHAR(100) NOT NULL DEFAULT 'Fórmula Botánica',
  ADD COLUMN IF NOT EXISTS `botanical_desc` VARCHAR(200) NOT NULL DEFAULT 'Ingredientes activos puros',
  ADD COLUMN IF NOT EXISTS `warranty_title` VARCHAR(100) NOT NULL DEFAULT '100% Original Yanbal',
  ADD COLUMN IF NOT EXISTS `warranty_desc` VARCHAR(200) NOT NULL DEFAULT 'Garantía oficial de fábrica',
  ADD COLUMN IF NOT EXISTS `commitment_title` VARCHAR(100) NOT NULL DEFAULT 'Compromiso Yanbal Prestige',
  ADD COLUMN IF NOT EXISTS `commitment_text` TEXT NOT NULL;

-- 2. Tabla de Pedidos y Facturas (Órdenes de Venta) con Índices B-Tree y Check Constraints
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` VARCHAR(50) NOT NULL,
  `numero_factura` VARCHAR(50) NOT NULL,
  `cliente_id` VARCHAR(50) NULL,
  `cliente_nombre` VARCHAR(150) NOT NULL,
  `cliente_telefono` VARCHAR(50) NOT NULL,
  `cliente_ciudad` VARCHAR(100) NOT NULL,
  `cliente_direccion` VARCHAR(200) NOT NULL DEFAULT '',
  `consultora_id` VARCHAR(50) NOT NULL,
  `consultora_nombre` VARCHAR(150) NOT NULL,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `estado_pago` VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  `estado_entrega` VARCHAR(30) NOT NULL DEFAULT 'preparacion',
  `origen` VARCHAR(30) NOT NULL DEFAULT 'venta_directa',
  `notas` TEXT NULL,
  `idempotency_key` VARCHAR(100) NULL,
  `accepted_habeas_data` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pedidos_factura` (`numero_factura`),
  UNIQUE KEY `idx_pedidos_idempotency` (`idempotency_key`),
  KEY `idx_pedidos_consultora` (`consultora_id`),
  KEY `idx_pedidos_creado` (`creado_en`),
  KEY `idx_pedidos_estado_pago` (`estado_pago`),
  KEY `idx_pedidos_estado_entrega` (`estado_entrega`),
  CONSTRAINT `chk_pedidos_estado_pago` CHECK (`estado_pago` IN ('pendiente', 'pagado', 'anulado', 'reembolsado')),
  CONSTRAINT `chk_pedidos_estado_entrega` CHECK (`estado_entrega` IN ('preparacion', 'despachado', 'entregado', 'cancelado')),
  CONSTRAINT `chk_pedidos_total_positivo` CHECK (`total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Líneas de Pedido (Items) con Integridad Referencial en Cascada
CREATE TABLE IF NOT EXISTS `pedido_items` (
  `id` VARCHAR(50) NOT NULL,
  `pedido_id` VARCHAR(50) NOT NULL,
  `producto_id` VARCHAR(50) NOT NULL,
  `producto_sku` VARCHAR(50) NOT NULL,
  `producto_nombre` VARCHAR(200) NOT NULL,
  `precio_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cantidad` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_pedido_items_pedido` (`pedido_id`),
  KEY `idx_pedido_items_producto` (`producto_id`),
  CONSTRAINT `fk_pedido_items_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_pedido_items_cantidad` CHECK (`cantidad` > 0),
  CONSTRAINT `chk_pedido_items_precio` CHECK (`precio_unitario` >= 0),
  CONSTRAINT `chk_pedido_items_subtotal` CHECK (`subtotal` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vistas de Compatibilidad Bilingüe (Orders & Order_Items)
CREATE OR REPLACE VIEW `orders` AS SELECT * FROM `pedidos`;
CREATE OR REPLACE VIEW `order_items` AS SELECT * FROM `pedido_items`;
