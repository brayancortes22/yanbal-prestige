-- =====================================================================
-- Yanbal Prestige · Migración 002
-- Módulo Tips & Consejos
-- =====================================================================
-- IMPORTANTE
-- El backend usa `Database.EnsureCreated()`, que NO modifica una base
-- de datos existente. En un servidor con datos, ejecute este script a
-- mano antes de desplegar la versión que incluye `TipsController`.
--
--   mysql -u USUARIO -p yanbal_prestige < database/002_cms_tips.sql
--
-- En una base nueva y vacía no hace falta: EF crea la tabla desde la
-- entidad `Tip`. El script es idempotente, así que repetirlo no rompe
-- nada.
-- =====================================================================

CREATE TABLE IF NOT EXISTS `cms_tips` (
  `id`             varchar(36)  NOT NULL,
  `titulo`         varchar(200) NOT NULL,
  `resumen`        varchar(300) NULL,
  `contenido`      longtext     NULL,
  `categoria`      varchar(50)  NULL,
  `imagen_url`     varchar(500) NULL,
  `video_url`      varchar(500) NULL,
  `autor`          varchar(150) NULL,
  `destacado`      tinyint(1)   NOT NULL DEFAULT 0,
  `orden`          int          NOT NULL DEFAULT 0,
  `activo`         tinyint(1)   NOT NULL DEFAULT 1,
  `creado_en`      datetime(6)  NOT NULL,
  `actualizado_en` datetime(6)  NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_cms_tips_activo_orden` (`activo`, `orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
