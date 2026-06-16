# Documentación de Historias de Usuario

## HU01: Inicio de Sesión

**Estado:** En curso | **Prioridad:** Medium

### Historia de Usuario
**Como:** usuario del sistema (instructor, aprendiz o administrador)
**Quiero:** contar con un mecanismo de inicio de sesión mediante credenciales
**Para:** poder acceder a las diferentes funcionalidades del sistema sin necesidad de seleccionar previamente mi rol, permitiendo que el sistema identifique automáticamente mi perfil

### Criterios de Aceptación
- El sistema permite el envío del formulario cuando:
- El *documento de identidad* cumple con el formato definido por el sistema (numérico y longitud válida según tipo de documento).
- La *contraseña* cumple con:
- Mínimo 10 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (@, #, $, %, &, *)
- El sistema valida que el documento de identidad y la contraseña ingresados coincidan con un registro existente en la base de datos.
- El sistema identifica automáticamente el rol del usuario (instructor, aprendiz o administrador) sin necesidad de selección manual.
- Tras un inicio de sesión exitoso, el sistema redirige al usuario según su rol:
- **Aprendiz:** Panel o dashboard de aprendiz.
- **Instructor:** Panel o dashboard de instructor.
- **Administrador:** Panel de administración.
- El sistema impide el envío del formulario si:
- El documento de identidad no cumple con el formato requerido.
- La contraseña no cumple con las reglas establecidas.
- Si las credenciales son incorrectas o no existen:
- El sistema muestra un mensaje genérico:
- **"Credenciales inválidas"**
- No se debe indicar si el error corresponde al documento de identidad o a la contraseña.
- El sistema debe bloquear la cuenta durante *2 horas* tras *5 intentos consecutivos fallidos* de inicio de sesión.
- Si la cuenta está bloqueada:
- El sistema muestra un mensaje indicando que la cuenta se encuentra temporalmente bloqueada.
- No permite nuevos intentos hasta que finalice el tiempo de bloqueo.
- Debe existir un enlace visible de **"Olvidé mi contraseña"**:
- Redirige al flujo de recuperación de contraseña.
- Si el usuario intenta acceder con una cuenta inexistente:
- Se muestra el mismo mensaje genérico de error **"Credenciales inválidas"**.

---
