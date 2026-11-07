-- =========================================================================
-- MIGRACIÓN 004: MODELO DE DATOS ATÓMICO Y ALTAMENTE DESCRIPTIVO (3NF)
-- Yanbal Prestige — Plataforma Comercial & ERP de Ventas
-- Desarrollado por: Brayan Stid Cortés Lombana (`bscl`)
-- =========================================================================

USE `yanbal_prestige`;

-- 1. Tabla Atómica: Trabajadores / Equipo de la Red (con auto-relación de liderazgo)
CREATE TABLE IF NOT EXISTS `trabajadores` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `email_corporativo` VARCHAR(150) NOT NULL UNIQUE,
    `rol` VARCHAR(30) NOT NULL,
    `tipo_documento` VARCHAR(30) NOT NULL DEFAULT 'CC',
    `numero_documento` VARCHAR(30) NOT NULL UNIQUE,
    `telefono_whatsapp` VARCHAR(50) NOT NULL,
    `zona_territorial` VARCHAR(100) NOT NULL,
    `lider_directa_id` VARCHAR(50) NULL,
    `fecha_vinculacion` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `estado_activo` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_trabajadores_rol` (`rol`),
    INDEX `idx_trabajadores_zona` (`zona_territorial`),
    INDEX `idx_trabajadores_lider` (`lider_directa_id`),
    CONSTRAINT `fk_trabajadores_lider` FOREIGN KEY (`lider_directa_id`) REFERENCES `trabajadores`(`id`) ON DELETE SET NULL,
    CONSTRAINT `chk_trabajadores_rol` CHECK (`rol` IN ('DIRECTORA', 'LIDER_ZONA', 'CONSULTORA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla Atómica: Clientes de la Red
CREATE TABLE IF NOT EXISTS `clientes` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `consultora_asignada_id` VARCHAR(50) NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `telefono_whatsapp` VARCHAR(50) NOT NULL,
    `email` VARCHAR(150) NULL,
    `ciudad_residencia` VARCHAR(100) NOT NULL,
    `departamento` VARCHAR(100) NOT NULL DEFAULT '',
    `direccion_entrega` VARCHAR(200) NOT NULL DEFAULT '',
    `acepto_habeas_data` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_clientes_consultora` (`consultora_asignada_id`),
    INDEX `idx_clientes_telefono` (`telefono_whatsapp`),
    CONSTRAINT `fk_clientes_consultora` FOREIGN KEY (`consultora_asignada_id`) REFERENCES `trabajadores`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla Atómica: Perfil Dermocosmético del Cliente (Historial Clínico 1 a 1)
CREATE TABLE IF NOT EXISTS `cliente_perfil_dermocosmetico` (
    `cliente_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tipo_piel` VARCHAR(50) NOT NULL,
    `fototipo_cutaneo` VARCHAR(50) NULL,
    `categoria_preferida` VARCHAR(100) NOT NULL,
    `sensibilidades_alergias` TEXT NULL,
    `rutina_facial_actual` TEXT NULL,
    `notas_asesoria_consultora` TEXT NULL,
    `fecha_ultima_asesoria` DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT `fk_perfil_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla Atómica: Productos (Catálogo Base)
CREATE TABLE IF NOT EXISTS `productos_catalogo` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `codigo_sku` VARCHAR(50) NOT NULL UNIQUE,
    `nombre_comercial` VARCHAR(200) NOT NULL,
    `categoria` VARCHAR(50) NOT NULL,
    `categoria_etiqueta` VARCHAR(100) NOT NULL,
    `precio_venta_publico` DECIMAL(12,2) NOT NULL,
    `precio_oferta_campana` DECIMAL(12,2) NULL,
    `imagen_portada_url` TEXT NOT NULL,
    `descripcion_comercial` TEXT NOT NULL,
    `distintivo_badge` VARCHAR(50) NULL,
    `estado_disponibilidad` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_productos_cat` (`categoria`),
    INDEX `idx_productos_disp` (`estado_disponibilidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla Atómica: Detalles Dermocosméticos PDP del Producto (1 a 1)
CREATE TABLE IF NOT EXISTS `producto_detalles_dermocosmeticos` (
    `producto_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `titulo_formula_botanica` VARCHAR(100) NOT NULL DEFAULT 'Fórmula Botánica',
    `descripcion_ingredientes_activos` VARCHAR(250) NOT NULL DEFAULT 'Ingredientes activos puros',
    `titulo_garantia_oficial` VARCHAR(100) NOT NULL DEFAULT '100% Original Yanbal',
    `descripcion_garantia` VARCHAR(250) NOT NULL DEFAULT 'Garantía oficial de fábrica',
    `compromiso_marca_titulo` VARCHAR(100) NOT NULL DEFAULT 'Compromiso Yanbal Prestige',
    `compromiso_marca_texto` TEXT NOT NULL,
    `consejo_belleza_consultora` TEXT NOT NULL,
    `modo_uso_pasos_json` TEXT NOT NULL,
    CONSTRAINT `fk_detalles_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos_catalogo`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla Atómica: Facturas Comerciales (Cabecera de Venta)
CREATE TABLE IF NOT EXISTS `facturas_comerciales` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `numero_factura` VARCHAR(50) NOT NULL UNIQUE,
    `cliente_id` VARCHAR(50) NULL,
    `trabajador_vendedor_id` VARCHAR(50) NOT NULL,
    `cliente_nombre_historico` VARCHAR(150) NOT NULL,
    `cliente_telefono_historico` VARCHAR(50) NOT NULL,
    `ciudad_despacho` VARCHAR(100) NOT NULL,
    `direccion_despacho` VARCHAR(200) NOT NULL DEFAULT '',
    `subtotal_bruto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `descuento_total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `monto_total_liquidado` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `estado_pago` VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    `estado_entrega` VARCHAR(30) NOT NULL DEFAULT 'en_preparacion',
    `origen_pedido` VARCHAR(30) NOT NULL DEFAULT 'venta_directa',
    `instrucciones_entrega` TEXT NULL,
    `clave_idempotencia` VARCHAR(100) NULL UNIQUE,
    `consentimiento_habeas_data` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_emision` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_fac_vendedor` (`trabajador_vendedor_id`),
    INDEX `idx_fac_pago` (`estado_pago`),
    INDEX `idx_fac_entrega` (`estado_entrega`),
    INDEX `idx_fac_fecha` (`fecha_emision`),
    CONSTRAINT `fk_fac_vendedor` FOREIGN KEY (`trabajador_vendedor_id`) REFERENCES `trabajadores`(`id`),
    CONSTRAINT `chk_fac_pago` CHECK (`estado_pago` IN ('pendiente', 'abono_parcial', 'pagado', 'anulada')),
    CONSTRAINT `chk_fac_entrega` CHECK (`estado_entrega` IN ('en_preparacion', 'en_camino', 'entregado', 'cancelado')),
    CONSTRAINT `chk_fac_total` CHECK (`monto_total_liquidado` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla Atómica: Líneas de Detalle de Factura (1 a N con CASCADE)
CREATE TABLE IF NOT EXISTS `factura_lineas_detalle` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `factura_id` VARCHAR(50) NOT NULL,
    `producto_id` VARCHAR(50) NOT NULL,
    `codigo_sku_historico` VARCHAR(50) NOT NULL,
    `nombre_producto_historico` VARCHAR(200) NOT NULL,
    `precio_unitario_historico` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `cantidad_unidades` INT NOT NULL DEFAULT 1,
    `subtotal_linea` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    INDEX `idx_lin_factura` (`factura_id`),
    INDEX `idx_lin_producto` (`producto_id`),
    CONSTRAINT `fk_lin_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas_comerciales`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_lin_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos_catalogo`(`id`),
    CONSTRAINT `chk_lin_cant` CHECK (`cantidad_unidades` > 0),
    CONSTRAINT `chk_lin_precio` CHECK (`precio_unitario_historico` >= 0),
    CONSTRAINT `chk_lin_subtotal` CHECK (`subtotal_linea` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Módulos Web de Campaña, Eventos, Tips y Quiénes Somos
CREATE TABLE IF NOT EXISTS `web_campanias` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `codigo_campana` VARCHAR(50) NOT NULL UNIQUE,
    `nombre_campana` VARCHAR(150) NOT NULL,
    `banner_superior_texto` TEXT NOT NULL,
    `banner_superior_activo` TINYINT(1) NOT NULL DEFAULT 1,
    `texto_promocion_principal` VARCHAR(200) NOT NULL,
    `mensaje_bienvenida_whatsapp` TEXT NOT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_cierre` DATE NOT NULL,
    `activa` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_eventos_talleres` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `titulo_taller` VARCHAR(200) NOT NULL,
    `fecha_evento` VARCHAR(100) NOT NULL,
    `hora_evento` VARCHAR(50) NOT NULL,
    `modalidad` VARCHAR(50) NOT NULL,
    `lugar_o_enlace` VARCHAR(250) NOT NULL,
    `flyer_imagen_url` TEXT NOT NULL,
    `descripcion_temario` TEXT NOT NULL,
    `cupos_texto` VARCHAR(100) NOT NULL,
    `estado_vigente` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_tips_dermocosmeticos` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `titulo_consejo` VARCHAR(200) NOT NULL,
    `resumen_editorial` VARCHAR(300) NULL,
    `contenido_completo` LONGTEXT NULL,
    `categoria` VARCHAR(50) NULL,
    `imagen_portada_url` VARCHAR(500) NULL,
    `video_tutorial_url` VARCHAR(500) NULL,
    `autor_nombre` VARCHAR(150) NULL,
    `orden_lectura` INT NOT NULL DEFAULT 0,
    `estado_publicado` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_publicacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tips_pub_ord` (`estado_publicado`, `orden_lectura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `web_institucional_quienes_somos` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `historia_etiqueta` VARCHAR(150) NOT NULL,
    `historia_titulo` VARCHAR(200) NOT NULL,
    `historia_descripcion` TEXT NOT NULL,
    `mision_etiqueta` VARCHAR(150) NOT NULL,
    `mision_titulo` VARCHAR(200) NOT NULL,
    `mision_descripcion` TEXT NOT NULL,
    `contador_consultoras_texto` VARCHAR(100) NOT NULL,
    `asesoria_fisiologica_titulo` VARCHAR(200) NOT NULL,
    `asesoria_fisiologica_desc` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `postulaciones_emprendimiento` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `telefono_whatsapp` VARCHAR(50) NOT NULL,
    `ciudad_residencia` VARCHAR(100) NOT NULL,
    `modalidad_interes` VARCHAR(50) NOT NULL,
    `acepto_habeas_data` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_postulacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
