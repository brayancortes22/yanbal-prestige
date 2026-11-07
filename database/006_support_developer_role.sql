-- 006_support_developer_role.sql
-- Permite el rol 6 (Developer / soporte técnico) en `usuarios`.
-- La cuenta se siembra desde SUPPORT_EMAIL y SUPPORT_PASSWORD; no se crea
-- desde la interfaz ni se guarda su contraseña en el repositorio.

ALTER TABLE `usuarios` DROP CHECK `chk_usuarios_rol`;
ALTER TABLE `usuarios`
  ADD CONSTRAINT `chk_usuarios_rol` CHECK (`rol` IN (1, 2, 3, 4, 5, 6));
