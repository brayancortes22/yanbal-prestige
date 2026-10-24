-- ========================================================
-- Script de Base de Datos: Yanbal Prestige
-- Motor: MySQL 8.0+
-- Proyecto: Monorepo Yanbal Prestige (Equipo Independiente)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `yanbal_prestige` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `yanbal_prestige`;

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS `productos` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `categoria` VARCHAR(50) NOT NULL,
    `categoria_label` VARCHAR(100) NOT NULL,
    `precio` DECIMAL(12,2) NOT NULL,
    `precio_original` DECIMAL(12,2) NULL,
    `imagen_url` TEXT NOT NULL,
    `descripcion` TEXT NOT NULL,
    `badge` VARCHAR(50) NULL,
    `modo_uso_json` TEXT NOT NULL,
    `tip_consultora` TEXT NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_categoria` (`categoria`),
    INDEX `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Eventos
CREATE TABLE IF NOT EXISTS `eventos` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `titulo` VARCHAR(200) NOT NULL,
    `fecha` VARCHAR(100) NOT NULL,
    `hora` VARCHAR(50) NOT NULL,
    `modalidad` VARCHAR(50) NOT NULL,
    `ubicacion` VARCHAR(250) NOT NULL,
    `imagen_url` TEXT NOT NULL,
    `descripcion` TEXT NOT NULL,
    `cupos_texto` VARCHAR(100) NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_eventos_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Prospectos / Únete (Blindada con Ley 1581)
CREATE TABLE IF NOT EXISTS `prospectos_unete` (
    `id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `telefono_whatsapp` VARCHAR(50) NOT NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `rol_interes` VARCHAR(50) NOT NULL,
    `acepto_habeas_data` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEMILLAS INICIALES (Seed Data Real Yanbal)
-- ========================================================

INSERT INTO `productos` (`id`, `codigo`, `nombre`, `categoria`, `categoria_label`, `precio`, `precio_original`, `imagen_url`, `descripcion`, `badge`, `modo_uso_json`, `tip_consultora`, `activo`)
VALUES
('extracto-divino', 'EXT-01', 'Suero Óleo Reparador Extracto Divino', 'rostro', 'Tratamiento Facial', 189000.00, 245000.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', 'Fórmula ultra-concentrada con Cáliz de Uvilla. Nutre profundamente, repara la barrera lipídica y devuelve firmeza al rostro.', 'Top Ventas', '[\"Paso 1: Limpia tu rostro en la mañana y en la noche.\", \"Paso 2: Aplica 2 a 3 gotas en pómulos y frente.\", \"Paso 3: Realiza masajes ascendentes.\"]', 'Aplica antes de tu crema hidratante y nunca olvides tu protector solar de día.', 1),
('total-block-100', 'SOL-01', 'Total Block Ultraprotección SPF 100', 'solar', 'Protección Solar', 94000.00, 125000.00, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', 'Máxima protección clínica contra rayos UVB, UVA, Luz Azul y radiación Infrarroja con Vitamina E.', 'Recomendado Dermatólogos', '[\"Paso 1: Aplica generosamente 20 minutos antes de exponerte al sol.\", \"Paso 2: Reaplica cada 2 horas o después de nadar.\"]', 'La medida ideal para rostro y cuello es la longitud de dos dedos extendidos.', 1),
('ccori-cristal', 'PERF-01', 'Ccori Cristal Parfum', 'perfumes', 'Perfumería Fina', 165000.00, 210000.00, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80', 'Creación de maestros perfumistas franceses. Notas orientales florales intensas con vainilla de Madagascar.', 'Edición Lujo', '[\"Paso 1: Rocía en puntos de pulso: muñecas y cuello.\", \"Paso 2: Mantén el atomizador a 15 cm de distancia.\"]', 'No frotes las muñecas entre sí; el calor altera la evolución de las notas.', 1),
('bb-cream-mattifying', 'MAQ-01', 'BB Cream Matificante SPF 25', 'maquillaje', 'Maquillaje Funcional', 84000.00, NULL, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 'Unifica el tono, hidrata durante 24 horas y controla el brillo indeseado con acabado mate natural.', NULL, '[\"Paso 1: Distribuye con las yemas de los dedos o brocha.\", \"Paso 2: Difumina hacia afuera.\"]', 'Para mayor cobertura en manchas, aplica una segunda capa dando suaves toquecitos.', 1),
('aretes-aurelia', 'JOY-01', 'Aretes Aurelia Baño Oro 24K', 'joyeria', 'Joyería Fina', 109000.00, 140000.00, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80', 'Diseño anatómico hipoalergénico con baño de oro puro de 24 quilates y cristales europeos engastados a mano.', 'Oro 24K', '[\"Paso 1: Colócalos después de perfumarte.\", \"Paso 2: Límpialos con paño seco de microfibra.\"]', 'Guarda cada joya en su empaque individual para evitar rayaduras.', 1)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);
