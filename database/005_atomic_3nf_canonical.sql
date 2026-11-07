-- =========================================================================
-- MIGRACIÓN 005 — ESQUEMA CANÓNICO ATÓMICO EN TERCERA FORMA NORMAL (3FN)
-- Yanbal Prestige — Plataforma comercial, CRM y CMS
-- Autor: Brayan Stid Cortés Lombana (`bscl`)
-- Motor: MySQL 8.0+ / InnoDB / utf8mb4
--
-- QUÉ CORRIGE RESPECTO A 004
--   1. `productos.categoria_label` repetía la etiqueta de la categoría en
--      cada fila (dependencia transitiva categoria -> etiqueta). Ahora la
--      etiqueta vive en `categorias_producto` y `productos` solo guarda la FK.
--   2. Los estados de pago/entrega se validan con CHECK y vocabulario único.
--   3. Los PIN de recuperación se guardan HASHEADOS (PBKDF2), no en claro.
--   4. `pedido_items` calcula subtotal y `pedidos.total` con triggers, de modo
--      que el total nunca puede quedar desincronizado de sus líneas.
--   5. Se agrega `pagos_pedido` para modelar abonos reales (fase 2) y
--      `auditoria_eventos` para trazabilidad de seguridad.
--
-- EXCEPCIONES DOCUMENTADAS (no son violaciones de 3FN)
--   * `pedidos.cliente_*` y `pedidos.consultora_nombre` son instantáneas
--     históricas: una factura no debe cambiar si la clienta edita su ficha.
--   * `pedido_items.producto_sku/nombre/precio_unitario` congelan el precio
--     y el nombre del momento de la venta (integridad tributaria).
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `yanbal_prestige`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `yanbal_prestige`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 1. Catálogo de categorías (tabla de referencia, 3FN)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias_producto` (
    `codigo`  VARCHAR(50)  NOT NULL,
    `etiqueta` VARCHAR(100) NOT NULL,
    `orden`   INT          NOT NULL DEFAULT 0,
    `activa`  TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`codigo`),
    UNIQUE KEY `uk_categorias_etiqueta` (`etiqueta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 2. Productos: la categoría es una FK, no texto duplicado
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
    `id`             VARCHAR(50)  NOT NULL,
    `codigo`         VARCHAR(50)  NOT NULL,
    `nombre`         VARCHAR(200) NOT NULL,
    `categoria`      VARCHAR(50)  NOT NULL,
    `precio`         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `precio_original` DECIMAL(12,2) NULL,
    `imagen_url`     VARCHAR(500) NOT NULL DEFAULT '',
    `media_json`     LONGTEXT     NOT NULL,
    `descripcion`    TEXT         NOT NULL,
    `badge`          VARCHAR(50)  NULL,
    `modo_uso_json`  LONGTEXT     NOT NULL,
    `tip_consultora` TEXT         NOT NULL,
    `botanical_title` VARCHAR(100) NOT NULL DEFAULT 'Fórmula Botánica',
    `botanical_desc`  VARCHAR(250) NOT NULL DEFAULT 'Ingredientes activos puros',
    `warranty_title`  VARCHAR(100) NOT NULL DEFAULT '100% Original Yanbal',
    `warranty_desc`   VARCHAR(250) NOT NULL DEFAULT 'Garantía oficial de fábrica',
    `commitment_title` VARCHAR(100) NOT NULL DEFAULT 'Compromiso Yanbal Prestige',
    `commitment_text` TEXT         NOT NULL,
    `activo`         TINYINT(1)   NOT NULL DEFAULT 1,
    `creado_en`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_productos_codigo` (`codigo`),
    KEY `idx_productos_categoria` (`categoria`),
    KEY `idx_productos_activo` (`activo`),
    KEY `idx_productos_nombre` (`nombre`),
    CONSTRAINT `fk_productos_categoria`
        FOREIGN KEY (`categoria`) REFERENCES `categorias_producto` (`codigo`)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `chk_productos_precio` CHECK (`precio` >= 0),
    CONSTRAINT `chk_productos_original` CHECK (`precio_original` IS NULL OR `precio_original` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. Usuarios de la red (Directora / Consultora / Cliente)
--    EF almacena el enum UserRole como entero: 1, 2, 3.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id`              VARCHAR(50)  NOT NULL,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `correo`          VARCHAR(150) NOT NULL,
    `password_hash`   VARCHAR(255) NOT NULL,
    `rol`             TINYINT      NOT NULL,
    `lider_id`        VARCHAR(50)  NULL,
    `telefono`        VARCHAR(30)  NOT NULL DEFAULT '',
    `documento`       VARCHAR(30)  NOT NULL DEFAULT '',
    `zona`            VARCHAR(100) NOT NULL DEFAULT '',
    `activo`          TINYINT(1)   NOT NULL DEFAULT 1,
    `creado_en`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_usuarios_correo` (`correo`),
    KEY `idx_usuarios_rol` (`rol`),
    KEY `idx_usuarios_activo` (`activo`),
    KEY `idx_usuarios_lider` (`lider_id`),
    -- 1 Directora, 2 Consultora, 3 Cliente, 4 Líder de zona, 5 Asistente.
    CONSTRAINT `chk_usuarios_rol` CHECK (`rol` IN (1, 2, 3, 4, 5)),
    CONSTRAINT `chk_usuarios_correo` CHECK (`correo` LIKE '%@%.%'),
    -- RESTRICT (no SET NULL/CASCADE): MySQL no permite un CHECK sobre una
    -- columna que una acción referencial pueda modificar.
    CONSTRAINT `fk_usuarios_lider`
        FOREIGN KEY (`lider_id`) REFERENCES `usuarios` (`id`)
        ON UPDATE RESTRICT ON DELETE RESTRICT,
    -- Solo una consultora puede tener líder; un líder no reporta a otro líder.
    CONSTRAINT `chk_usuarios_lider_rol` CHECK (`lider_id` IS NULL OR `rol` = 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. Cartera de clientas por consultora (CRM)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes_consultora` (
    `id`                    VARCHAR(50)  NOT NULL,
    `consultora_id`         VARCHAR(50)  NOT NULL,
    `nombre_completo`       VARCHAR(150) NOT NULL,
    `telefono`              VARCHAR(30)  NOT NULL,
    `correo`                VARCHAR(150) NOT NULL DEFAULT '',
    `documento`             VARCHAR(30)  NOT NULL DEFAULT '',
    `direccion`             VARCHAR(200) NOT NULL DEFAULT '',
    `barrio`                VARCHAR(100) NOT NULL DEFAULT '',
    `codigo_postal`         VARCHAR(20)  NOT NULL DEFAULT '',
    `ciudad`                VARCHAR(100) NOT NULL DEFAULT '',
    `tipo_piel`             VARCHAR(50)  NOT NULL DEFAULT 'Mixta',
    `categoria_favorita`    VARCHAR(100) NOT NULL DEFAULT 'Tratamiento Facial',
    `preferencia_fragancia` VARCHAR(100) NULL,
    `preferencia_joyeria`   VARCHAR(100) NULL,
    `notas`                 TEXT         NULL,
    `ultimo_contacto`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `creado_en`             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_clientes_consultora` (`consultora_id`),
    KEY `idx_clientes_telefono` (`telefono`),
    CONSTRAINT `fk_clientes_consultora`
        FOREIGN KEY (`consultora_id`) REFERENCES `usuarios` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. PIN de recuperación: solo el hash, con vigencia y uso único
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pines_restablecimiento` (
    `id`         VARCHAR(50)  NOT NULL,
    `usuario_id` VARCHAR(50)  NOT NULL,
    `pin_codigo` VARCHAR(255) NOT NULL,
    `expira_en`  DATETIME     NOT NULL,
    `usado`      TINYINT(1)   NOT NULL DEFAULT 0,
    `creado_en`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_pines_usuario` (`usuario_id`, `usado`, `expira_en`),
    CONSTRAINT `fk_pines_usuario`
        FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `chk_pines_expiracion` CHECK (`expira_en` > `creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 6. Pedidos / facturas (cabecera)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedidos` (
    `id`                  VARCHAR(50)  NOT NULL,
    `numero_factura`      VARCHAR(50)  NOT NULL,
    `cliente_id`          VARCHAR(50)  NULL,
    `cliente_nombre`      VARCHAR(150) NOT NULL,
    `cliente_telefono`    VARCHAR(30)  NOT NULL,
    `cliente_ciudad`      VARCHAR(100) NOT NULL,
    `cliente_direccion`   VARCHAR(200) NOT NULL DEFAULT '',
    `cliente_correo`      VARCHAR(150) NOT NULL DEFAULT '',
    `cliente_documento`   VARCHAR(30)  NOT NULL DEFAULT '',
    `cliente_barrio`      VARCHAR(100) NOT NULL DEFAULT '',
    `cliente_codigo_postal` VARCHAR(20) NOT NULL DEFAULT '',
    `consultora_id`       VARCHAR(50)  NOT NULL,
    `consultora_nombre`   VARCHAR(150) NOT NULL,
    `total`               DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `estado_pago`         VARCHAR(30)  NOT NULL DEFAULT 'pendiente',
    `estado_entrega`      VARCHAR(30)  NOT NULL DEFAULT 'preparacion',
    `origen`              VARCHAR(30)  NOT NULL DEFAULT 'venta_directa',
    `notas`               TEXT         NULL,
    `idempotency_key`     VARCHAR(100) NULL,
    `accepted_habeas_data` TINYINT(1)  NOT NULL DEFAULT 1,
    `creado_en`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_pedidos_factura` (`numero_factura`),
    UNIQUE KEY `uk_pedidos_idempotencia` (`idempotency_key`),
    KEY `idx_pedidos_consultora` (`consultora_id`),
    KEY `idx_pedidos_fecha` (`creado_en`),
    KEY `idx_pedidos_pago` (`estado_pago`),
    KEY `idx_pedidos_entrega` (`estado_entrega`),
    CONSTRAINT `fk_pedidos_cliente`
        FOREIGN KEY (`cliente_id`) REFERENCES `clientes_consultora` (`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT `fk_pedidos_consultora`
        FOREIGN KEY (`consultora_id`) REFERENCES `usuarios` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `chk_pedidos_total` CHECK (`total` >= 0),
    CONSTRAINT `chk_pedidos_pago`
        CHECK (`estado_pago` IN ('pendiente', 'abono', 'pagado', 'anulada')),
    CONSTRAINT `chk_pedidos_entrega`
        CHECK (`estado_entrega` IN ('preparacion', 'camino', 'entregado', 'cancelado')),
    CONSTRAINT `chk_pedidos_origen`
        CHECK (`origen` IN ('venta_directa', 'web_catalogo'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 7. Líneas de pedido (detalle atómico)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedido_items` (
    `id`                VARCHAR(50)  NOT NULL,
    `pedido_id`         VARCHAR(50)  NOT NULL,
    `producto_id`       VARCHAR(50)  NOT NULL,
    `producto_sku`      VARCHAR(50)  NOT NULL,
    `producto_nombre`   VARCHAR(200) NOT NULL,
    `precio_unitario`   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `cantidad`          INT          NOT NULL DEFAULT 1,
    `subtotal`          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_items_pedido_producto` (`pedido_id`, `producto_id`),
    KEY `idx_items_pedido` (`pedido_id`),
    KEY `idx_items_producto` (`producto_id`),
    CONSTRAINT `fk_items_pedido`
        FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_items_producto`
        FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `chk_items_cantidad` CHECK (`cantidad` BETWEEN 1 AND 99),
    CONSTRAINT `chk_items_precio` CHECK (`precio_unitario` >= 0),
    CONSTRAINT `chk_items_subtotal` CHECK (`subtotal` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 8. Pagos y abonos (extensión fase 2; el pedido sigue siendo la cabecera)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pagos_pedido` (
    `id`              VARCHAR(50)  NOT NULL,
    `pedido_id`       VARCHAR(50)  NOT NULL,
    `monto`           DECIMAL(12,2) NOT NULL,
    `metodo`          VARCHAR(30)  NOT NULL,
    `referencia`      VARCHAR(100) NULL,
    `registrado_por`  VARCHAR(50)  NULL,
    `fecha_pago`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_pagos_pedido` (`pedido_id`),
    CONSTRAINT `fk_pagos_pedido`
        FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_pagos_usuario`
        FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT `chk_pagos_monto`
        CHECK ((`metodo` = 'reembolso' AND `monto` < 0) OR (`metodo` <> 'reembolso' AND `monto` > 0)),
    CONSTRAINT `chk_pagos_metodo`
        CHECK (`metodo` IN ('efectivo', 'transferencia', 'nequi', 'daviplata', 'tarjeta', 'otro', 'reembolso'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 9. Prospectos de "Trabaja con nosotros"
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prospectos_unete` (
    `id`                  VARCHAR(50)  NOT NULL,
    `nombre_completo`     VARCHAR(150) NOT NULL,
    `telefono_whatsapp`   VARCHAR(30)  NOT NULL,
    `ciudad`              VARCHAR(100) NOT NULL,
    `correo`              VARCHAR(150) NOT NULL DEFAULT '',
    `departamento`        VARCHAR(100) NOT NULL DEFAULT '',
    `direccion`           VARCHAR(200) NOT NULL DEFAULT '',
    `experiencia`         VARCHAR(500) NOT NULL DEFAULT '',
    `rol_interes`         VARCHAR(50)  NOT NULL DEFAULT 'consultora',
    `acepto_habeas_data`  TINYINT(1)   NOT NULL DEFAULT 0,
    `fecha_creacion`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_prospectos_telefono` (`telefono_whatsapp`),
    KEY `idx_prospectos_fecha` (`fecha_creacion`),
    CONSTRAINT `chk_prospectos_rol`
        CHECK (`rol_interes` IN ('consultora', 'directora', 'cliente'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 10. CMS: tips, hero, catálogo digital, videos y eventos
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_tips` (
    `id`            VARCHAR(50)  NOT NULL,
    `titulo`        VARCHAR(200) NOT NULL,
    `resumen`       VARCHAR(500) NOT NULL DEFAULT '',
    `contenido`     LONGTEXT     NOT NULL,
    `categoria`     VARCHAR(50)  NOT NULL DEFAULT 'Rutina',
    `imagen_url`    VARCHAR(500) NOT NULL DEFAULT '',
    `video_url`     VARCHAR(500) NULL,
    `autor`         VARCHAR(150) NOT NULL DEFAULT '',
    `destacado`     TINYINT(1)   NOT NULL DEFAULT 0,
    `orden`         INT          NOT NULL DEFAULT 0,
    `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
    `creado_en`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tips_activo_orden` (`activo`, `orden`),
    KEY `idx_tips_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_hero_slides` (
    `id`          VARCHAR(50)  NOT NULL,
    `titulo`      VARCHAR(200) NOT NULL,
    `subtitulo`   VARCHAR(300) NOT NULL DEFAULT '',
    `tag`         VARCHAR(100) NOT NULL DEFAULT '',
    `bg_gradient` VARCHAR(300) NOT NULL DEFAULT '',
    `imagen_url`  VARCHAR(500) NOT NULL DEFAULT '',
    `boton_texto` VARCHAR(100) NOT NULL DEFAULT '',
    `boton_link`  VARCHAR(300) NOT NULL DEFAULT '',
    `orden`       INT          NOT NULL DEFAULT 0,
    `activo`      TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_hero_activo_orden` (`activo`, `orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_catalogo_digital` (
    `id`               VARCHAR(50)  NOT NULL,
    `campana_actual`   VARCHAR(100) NOT NULL DEFAULT '',
    `catalogo_pdf_url` VARCHAR(500) NOT NULL DEFAULT '',
    `cover_imagen_url` VARCHAR(500) NOT NULL DEFAULT '',
    `valido_hasta`     VARCHAR(100) NOT NULL DEFAULT '',
    `activo`           TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_video_tips` (
    `id`            VARCHAR(50)  NOT NULL,
    `titulo`        VARCHAR(200) NOT NULL,
    `duracion`      VARCHAR(20)  NOT NULL DEFAULT '',
    `thumbnail_url` VARCHAR(500) NOT NULL DEFAULT '',
    `video_url`     VARCHAR(500) NOT NULL DEFAULT '',
    `categoria`     VARCHAR(50)  NOT NULL DEFAULT '',
    `orden`         INT          NOT NULL DEFAULT 0,
    `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_videos_activo_orden` (`activo`, `orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `eventos` (
    `id`          VARCHAR(50)  NOT NULL,
    `titulo`      VARCHAR(200) NOT NULL,
    `fecha`       VARCHAR(100) NOT NULL DEFAULT '',
    `hora`        VARCHAR(50)  NOT NULL DEFAULT '',
    `modalidad`   TINYINT      NOT NULL DEFAULT 1,
    `ubicacion`   VARCHAR(300) NOT NULL DEFAULT '',
    `imagen_url`  VARCHAR(500) NOT NULL DEFAULT '',
    `descripcion` TEXT         NOT NULL,
    `cupos_texto` VARCHAR(100) NOT NULL DEFAULT '',
    `activo`      TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `idx_eventos_activo` (`activo`),
    CONSTRAINT `chk_eventos_modalidad` CHECK (`modalidad` IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 11. Auditoría de seguridad (trazabilidad de accesos y cambios)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `auditoria_eventos` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT,
    `actor_id`     VARCHAR(50)  NULL,
    `accion`       VARCHAR(80)  NOT NULL,
    `entidad`      VARCHAR(80)  NOT NULL DEFAULT '',
    `entidad_id`   VARCHAR(50)  NULL,
    `ip`           VARCHAR(45)  NULL,
    `detalle_json` JSON         NULL,
    `creado_en`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_auditoria_actor` (`actor_id`, `creado_en`),
    KEY `idx_auditoria_accion` (`accion`, `creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------
-- 12. Triggers de atomicidad: subtotal y total siempre derivados
-- -------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_items_subtotal_bi`;
DROP TRIGGER IF EXISTS `trg_items_subtotal_bu`;
DROP TRIGGER IF EXISTS `trg_items_total_ai`;
DROP TRIGGER IF EXISTS `trg_items_total_au`;
DROP TRIGGER IF EXISTS `trg_items_total_ad`;

DELIMITER $$

CREATE TRIGGER `trg_items_subtotal_bi`
BEFORE INSERT ON `pedido_items`
FOR EACH ROW
BEGIN
    SET NEW.`subtotal` = ROUND(NEW.`precio_unitario` * NEW.`cantidad`, 2);
END$$

CREATE TRIGGER `trg_items_subtotal_bu`
BEFORE UPDATE ON `pedido_items`
FOR EACH ROW
BEGIN
    SET NEW.`subtotal` = ROUND(NEW.`precio_unitario` * NEW.`cantidad`, 2);
END$$

CREATE TRIGGER `trg_items_total_ai`
AFTER INSERT ON `pedido_items`
FOR EACH ROW
BEGIN
    UPDATE `pedidos`
       SET `total` = (SELECT COALESCE(SUM(`subtotal`), 0) FROM `pedido_items` WHERE `pedido_id` = NEW.`pedido_id`)
     WHERE `id` = NEW.`pedido_id`;
END$$

CREATE TRIGGER `trg_items_total_au`
AFTER UPDATE ON `pedido_items`
FOR EACH ROW
BEGIN
    UPDATE `pedidos`
       SET `total` = (SELECT COALESCE(SUM(`subtotal`), 0) FROM `pedido_items` WHERE `pedido_id` = NEW.`pedido_id`)
     WHERE `id` = NEW.`pedido_id`;
    IF OLD.`pedido_id` <> NEW.`pedido_id` THEN
        UPDATE `pedidos`
           SET `total` = (SELECT COALESCE(SUM(`subtotal`), 0) FROM `pedido_items` WHERE `pedido_id` = OLD.`pedido_id`)
         WHERE `id` = OLD.`pedido_id`;
    END IF;
END$$

CREATE TRIGGER `trg_items_total_ad`
AFTER DELETE ON `pedido_items`
FOR EACH ROW
BEGIN
    UPDATE `pedidos`
       SET `total` = (SELECT COALESCE(SUM(`subtotal`), 0) FROM `pedido_items` WHERE `pedido_id` = OLD.`pedido_id`)
     WHERE `id` = OLD.`pedido_id`;
END$$

DELIMITER ;

-- -------------------------------------------------------------------------
-- 13. Semilla mínima de categorías (los productos los siembra la API)
-- -------------------------------------------------------------------------
INSERT INTO `categorias_producto` (`codigo`, `etiqueta`, `orden`) VALUES
    ('rostro',     'Tratamiento Facial',   1),
    ('solares',    'Protección Solar',     2),
    ('perfumeria', 'Perfumería Fina',      3),
    ('maquillaje', 'Maquillaje Funcional', 4),
    ('joyeria',    'Joyería Fina',         5)
ON DUPLICATE KEY UPDATE `etiqueta` = VALUES(`etiqueta`), `orden` = VALUES(`orden`);
