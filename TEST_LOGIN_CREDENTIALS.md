# Credenciales de Prueba

Estas credenciales son para desarrollo local y corresponden a los usuarios semilla creados automáticamente por el backend al iniciar.

## 1. Administrador disponible

- **Nombre:** `Administrador General`
- **Rol:** `admin`
- **Identificador (Email):** `admin@nursingacademy.local`
- **Contraseña:** `Admin12345*`

## 2. Instructor disponible

- **Nombre:** `Instructor de Prueba`
- **Rol:** `instructor`
- **Identificador (Email):** `instructor@nursingacademy.local`
- **Contraseña:** `Instructor123*`

## 3. Aprendiz disponible

- **Nombre:** `Laura Gomez`
- **Rol:** `aprendiz`
- **Identificador (Documento):** `1234567890` (o Correo: `aprendiz@nursingacademy.local`)
- **Contraseña:** `Aprendiz123*`

---

## Notas Importantes

1. **Campos de Validación e Inicio de Sesión:**
   - Para el rol de **Aprendiz**, puede ingresar tanto con su número de documento (`1234567890`) como con su correo (`aprendiz@nursingacademy.local`).
   - Para los roles de **Administrador** e **Instructor**, el identificador principal es su correo electrónico, aunque el sistema también acepta sus códigos de cédula (`ADMIN001` e `INST001`).
   - Las contraseñas cumplen con las políticas de seguridad del formulario (mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial del grupo `@#$%&*`).

2. **Seguridad y Persistencia:**
   - La base de datos guarda las contraseñas con hash seguro (bcrypt/argon/hash) dentro de la tabla `users` (`password_hash`) en **PostgreSQL**.
   - Cada vez que el backend se inicializa, el módulo `bootstrapAuth.ts` verifica automáticamente la existencia de estos 3 usuarios de prueba. Si fueron bloqueados por intentos fallidos o su contraseña fue alterada, son restaurados automáticamente para asegurar el acceso.
