# Credenciales de Prueba

Estas credenciales son para desarrollo local y corresponden al usuario semilla creado por el backend.

## Usuario disponible

- Nombre: `Administrador General`
- Rol: `admin`
- Email: `admin@nursingacademy.local`
- Password: `Admin12345*`

## Nota

La base de datos guarda el password en formato hasheado dentro de `auth_users.password_hash`, por eso no se puede recuperar desde SQLite en texto plano. Si cambias este usuario o agregas otros de prueba, conviene actualizar este archivo.
