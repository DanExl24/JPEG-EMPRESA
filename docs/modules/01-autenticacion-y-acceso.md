# Módulo 1: Autenticación, Acceso y Bienvenida

Este módulo gestiona la experiencia pública inicial, el control de acceso, la persistencia de sesiones seguras y los flujos de recuperación de cuentas.

---

## 1. Vistas del Módulo

### 1.1 `Home.vue` (`/`)
- **Propósito**: Landing page promocional orientada a la presentación de la propuesta pedagógica gamificada de *NursePlay / Nursing Academy*.
- **Elementos y Funcionalidades**:
  - **Barra de navegación**: Logotipo con isotipo clínico, enlaces de navegación temática (*Cómo funciona, Juegos, Precios, Recursos*) y botón de acción principal para iniciar sesión.
  - **Sección Hero**: Titular principal con énfasis en el aprendizaje lúdico en salud, insignia de "Gamified Learning", ilustración de enfermera y prueba social dinámica (+2,400 estudiantes activos).
  - **Módulos de especialidad**: Cards interactivas que destacan las áreas formativas clave (Cardiología, Farmacología, Comunicación Médica).
  - **Llamadas a la acción (CTA)**: Redirección mediante `router.push('/login')` hacia la pantalla de acceso.

### 1.2 `LoginView.vue` (`/login`)
- **Propósito**: Portal de acceso para usuarios con roles de `ADMIN`, `INSTRUCTOR` o `APRENDIZ`.
- **Elementos y Funcionalidades**:
  - **Doble identificación**: Permite el ingreso tanto con correo electrónico como con número de documento / cédula de identidad.
  - **Validación reactiva en tiempo real**: Comprobación de formato de correo o longitud mínima de documento al perder el foco (`blur`) o enviar el formulario.
  - **Visibilidad de contraseña**: Toggle interactivo para mostrar u ocultar la contraseña.
  - **Mantenimiento de sesión**: Checkbox "Keep me logged in for 30 days" que determina si el almacenamiento se efectúa en `localStorage` o `sessionStorage`.
  - **Manejo de bloqueo temporal (Lockout)**: Si el usuario supera el límite de intentos fallidos, la vista captura el error `423 Locked` y muestra un banner naranja explicativo de bloqueo de cuenta.
  - **Acceso a redes sociales**: Botones de Google y Apple.

### 1.3 `RecoverPassword.vue` (`/recover`)
- **Propósito**: Interfaz para solicitar el restablecimiento de contraseñas olvidadas.
- **Elementos y Funcionalidades**:
  - Panel lateral ilustrado con animación conceptual médica.
  - Formulario de captura de correo electrónico registrado.
  - Pantalla condicional de confirmación de envío exitoso con opción de reenvío ("Resend link").
  - Botón de retorno al inicio de sesión.

---

## 2. Complementariedad e Integración entre Vistas

1. **`Home.vue` ➜ `LoginView.vue`**:
   `Home` actúa como embudo de conversión; cualquier intención de iniciar cursos, probar juegos o ingresar conduce al usuario a `LoginView`.
2. **`LoginView.vue` ➜ `RecoverPassword.vue`**:
   El enlace "¿Forgot password?" conecta al usuario que ha extraviado sus credenciales.
3. **`LoginView.vue` ➜ `DashboardLayout.vue`**:
   Al autenticarse exitosamente, el enrutador redirige inmediatamente a `/dashboard/inicio`, cargando la navegación personalizada según el rol extraído en el token.
4. **Guards de Enrutamiento (`src/router/index.ts`)**:
   - `router.beforeEach` intercepta cada navegación.
   - Si la ruta tiene `meta: { requiresAuth: true }` y el usuario no posee un token activo, lo devuelve a `/login`.
   - Si el usuario ya está autenticado e intenta acceder a `/login` o `/recover`, es redirigido automáticamente a `/dashboard/inicio`.
   - En la primera carga, si existe un token almacenado, ejecuta silenciosamente `auth.checkAuth()` contra el backend para validar que la sesión siga viva.

---

## 3. Flujo de Datos y Estado Global (`useAuthStore`)

El archivo [src/stores/auth.ts](file:///c:/Users/alejo/Downloads/proyectos-dev/JPEG-EMPRESA/src/stores/auth.ts) encapsula el estado reactivo:
- **`user`**: Objeto con `id`, `name`, `email`, `role`, `token`.
- **Getters computados**: `isAuthenticated`, `isAdmin`, `isInstructor`, `isApprentice`, `roleLabel`.
- **Métodos**:
  - `login(credentials)`: Envía petición a `/api/auth/login`.
  - `register(payload)`: Envía petición a `/api/auth/register`.
  - `checkAuth()`: Valida el token con `/api/auth/me`.
  - `clearUser()`: Elimina datos de `localStorage` y `sessionStorage`.

---

## 4. Auditoría Técnica de Backend para este Módulo

| Funcionalidad Frontend | Estado en Frontend | Situación en Backend | Diagnóstico y Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Inicio de Sesión** | Conectado a `/api/auth/login` | Endpoint funcional con hashing `bcrypt`, JWT y conteo de fallos. | ✅ **100% Integrado y operativo**. |
| **Validación de Sesión** | Conectado a `/api/auth/me` | Endpoint funcional protegido con middleware `authenticate`. | ✅ **100% Integrado y operativo**. |
| **Login Social (Google / Apple)** | Botones ejecutan `console.log()` | Sin rutas OAuth2 ni proveedores configurados en Express. | ❌ **Sin backend**. Requiere implementar Passport.js o Firebase/Google OAuth. |
| **Recuperación de Contraseña** | `RecoverPassword.vue` usa `setTimeout(1500)` simulado | **El backend SÍ tiene `/api/auth/recover`**, pero el frontend no lo está invocando. | ⚠️ **Desconexión**. Se debe reemplazar el `setTimeout` por una llamada a `apiFetch('/api/auth/recover')`. |
