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
- **Identificador (Documento):** `1234567890`
- **Contraseña:** `Aprendiz123*`

---

## Notas Importantes

1. **Campos de Validación:**
   - Para el rol de **Aprendiz**, el identificador es su número de documento (debe ser numérico de 7 a 12 dígitos).
   - Para los roles de **Administrador** e **Instructor**, el identificador es su correo electrónico.
   - Las contraseñas cumplen con las políticas de seguridad del formulario (mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial del grupo `@#$%&*`).

2. **Seguridad:**
   - La base de datos guarda los passwords en formato hasheado dentro de `auth_users.password_hash` y `apprentices.password_hash`, por lo que no se pueden ver en texto plano directamente desde la base de datos SQLite. Si cambias o agregas otros usuarios de prueba en el código de semillas, asegúrate de mantener este archivo actualizado.
