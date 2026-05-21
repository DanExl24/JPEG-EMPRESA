# Credenciales de Prueba

Estas credenciales son para desarrollo local y corresponden al usuario semilla creado por el backend.

## Administrador disponible

- Nombre: `Administrador General`
- Rol: `admin`
- Email: `admin@nursingacademy.local`
- Password: `Admin12345*`

## Aprendiz disponible

- Nombre: `Laura Gomez`
- Rol: `aprendiz`
- Documento: `1234567890`
- Password: `Aprendiz123*`

## Nota

La base de datos guarda los passwords en formato hasheado dentro de `auth_users.password_hash` y `apprentices.password_hash`, por eso no se pueden recuperar desde SQLite en texto plano. Si cambias estos usuarios o agregas otros de prueba, conviene actualizar este archivo.
