# 📁 Estructura de Carpetas - Backend con Express

## 📂 `/database`

Contiene la configuración y conexión al gestor de base de datos (en este caso, **Supabase**).

Aquí normalmente tendrás:

* Cliente de conexión
* Variables de entorno relacionadas
* Funciones reutilizables para consultas

---

## 📄 `index.js`

Archivo raíz del proyecto.

### Responsabilidades:

* Inicializar el servidor
* Configurar middlewares (`cors`, `express.json`, etc.)
* Registrar rutas (endpoints)

```js
import express from 'express'
import cors from 'cors'
import testRoutes from './routes/test.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

// Registrar rutas
app.use('/api/test', testRoutes)

export default app
```

### 🔎 Explicación:

* `/api/test` → Ruta base del módulo
* `testRoutes` → Router que contiene los endpoints

---

## 📂 `/routes`

Aquí se definen las rutas (endpoints) del servidor.

Cada archivo representa un módulo del sistema.

### 📄 Ejemplo: `test.routes.js`

```js
import { Router } from 'express'
import { getTest } from '../controllers/test.controller.js'

const router = Router()

// GET /api/test
router.get('/', getTest)

export default router
```

### 🔎 Explicación:

* `Router()` → Permite crear rutas modulares
* `router.get('/')` → Endpoint que responde a `/api/test`
* `getTest` → Función importada del controlador

---

## 📂 `/controllers`

Aquí vive la lógica del backend.

Cada controlador representa un módulo o una entidad del sistema.

### 🧠 Ejemplos:

* `student.controller.js`
* `instructor.controller.js`
* `admin.controller.js`
* `user.controller.js`
* `auth.controller.js`

---

### 📄 Ejemplo: `test.controller.js`

```js
export const getTest = (req, res) => {
  res.json({
    message: 'Todo funcionando 🚀',
    timestamp: new Date()
  })
}
```

### 🔎 Explicación:

* `req` → Datos que envía el cliente (frontend)
* `res` → Respuesta del servidor
* `res.json()` → Envía datos en formato JSON

---

## ⚠️ Correcciones y buenas prácticas

* Las **rutas no contienen lógica**, solo conectan endpoints con controladores.
* Los **controladores manejan la lógica**, pero no deberían conectarse directamente a la base de datos (idealmente eso va en `/services`).
* La organización puede ser por:

  * Rol (admin, instructor, student)
  * Entidad (user, product, auth)

---

## 🧩 Flujo de funcionamiento

```
Cliente → Route → Controller → Database → Controller → Response
```

---

## 🚀 Escalabilidad (nivel pro)

Para proyectos más grandes, se recomienda agregar:

* 📂 `/services` → Lógica de negocio y acceso a datos
* 📂 `/middlewares` → Validaciones, autenticación, manejo de errores
* 📂 `/utils` → Funciones reutilizables

---

## 🎯 Conclusión

Esta estructura permite:

* Separación de responsabilidades
* Código más limpio y mantenible
* Escalabilidad para proyectos grandes

Es básicamente pasar de “código que funciona” a “código que aguanta producción sin morir en el intento” 😄
