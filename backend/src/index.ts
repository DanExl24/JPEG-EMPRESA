import 'dotenv/config'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import http from 'http'
import testRoutes from './routes/test.routes.js'
import authRoutes from './routes/auth.routes.js'
import activityRoutes from './routes/activity.routes.js'
import adminRoutes from './routes/admin.routes.js'
import learnerRoutes from './routes/learner.routes.js'
import curriculumRoutes from './routes/curriculum.routes.js'
import contentRoutes from './routes/content.routes.js'
import {
  ensureDefaultApprenticeUser,
  ensureDefaultAuthUser,
  ensureDefaultInstructorUser,
  ensureDefaultActivities,
  ensureDefaultCurriculum,
  ensureDefaultVocabulary,
  ensureDefaultDialogues
} from './lib/bootstrapAuth.js'
import prisma from './lib/db.js'

const app = express()
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3000)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean) ?? []

// 1. Logging preliminar antes de cualquier middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  console.log(`\n========================================`)
  console.log(`[${timestamp}] 🚀 INCOMING REQUEST: ${req.method} ${req.originalUrl || req.url}`)
  console.log(`📍 IP: ${req.ip || req.socket.remoteAddress} | Host: ${req.headers.host} | Origin: ${req.headers.origin || 'N/A'}`)
  console.log(`📋 Content-Type: ${req.headers['content-type'] || 'N/A'}`)

  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] 🏁 FINISHED: ${req.method} ${req.originalUrl || req.url} -> HTTP ${res.statusCode}`)
    console.log(`========================================\n`)
  })

  next()
})

// 2. CORS
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    console.warn(`[CORS] ⚠️ Origin no permitido por lista blanca: "${origin}". Permitidos:`, allowedOrigins)
    // En producción/desarrollo permitimos la conexión para evitar bloqueos innecesarios pero registramos la advertencia
    callback(null, true)
  },
  credentials: true
}))

// 3. Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 4. Log del payload procesado
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log(`📦 [Body Parser]:`, JSON.stringify(req.body || {}, null, 2))
  }
  next()
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() })
})

// 5. Rutas API
app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/admin/curriculum', curriculumRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/learner', learnerRoutes)
app.use('/api/content', contentRoutes)
app.use('/', testRoutes)

// 6. Manejador global de errores
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`💥 [Unhandled Error in ${req.method} ${req.url}]:`, err)
  res.status(500).json({
    message: 'Error interno en el servidor.',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  })
})

console.log('Conectando a la base de datos...')
try {
  await prisma.$queryRaw`SELECT 1`
  console.log('¡Conectado a la base de datos con éxito! 🚀')
  await ensureDefaultAuthUser()
  await ensureDefaultInstructorUser()
  await ensureDefaultApprenticeUser()
  await ensureDefaultActivities()
  await ensureDefaultCurriculum()
  await ensureDefaultVocabulary()
  await ensureDefaultDialogues()
} catch (error) {
  console.error('Error al conectar a la base de datos o inicializar datos:', error)
}

const httpServer = http.createServer(app)
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} (0.0.0.0)`)
})
