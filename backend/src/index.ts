import 'dotenv/config'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import http from 'http'
import apiRouter from './routes/index.js'
import testRoutes from './routes/test.routes.js'
import {
  ensureDefaultApprenticeUser,
  ensureDefaultAuthUser,
  ensureDefaultInstructorUser,
  ensureDefaultActivities,
  cleanupLegacySeedActivities,
  ensureDefaultCurriculum,
  ensureDefaultVocabulary,
  ensureDefaultDialogues,
  ensureDefaultCourses,
  ensureDefaultGlossary,
  ensureDefaultArcadeGames
} from './lib/bootstrapAuth.js'
import { GamificationService } from './services/gamification.service.js'
import { CourseService } from './services/course.service.js'
import { globalErrorHandler } from './middlewares/error.middleware.js'
import { seedVolume } from './lib/seedVolume.js'
import prisma from './lib/db.js'

const app = express()
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3000)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean) ?? []

// 1. Logging preliminar de peticiones
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
    callback(null, true)
  },
  credentials: true
}))

// 3. Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 4. Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() })
})

// 5. Rutas API Modulares (SRP & DRY)
app.use('/api', apiRouter)
app.use('/', apiRouter)
app.use('/', testRoutes)

// 6. Manejador Global de Errores (DRY)
app.use(globalErrorHandler)

// 7. Inicialización de Base de Datos y Datos Semilla
console.log('Conectando a la base de datos...')
try {
  await prisma.$queryRaw`SELECT 1`
  console.log('¡Conectado a la base de datos con éxito! 🚀')
  await ensureDefaultAuthUser()
  await ensureDefaultInstructorUser()
  await ensureDefaultApprenticeUser()
  await ensureDefaultActivities()
  await cleanupLegacySeedActivities()
  await ensureDefaultCurriculum()
  await ensureDefaultVocabulary()
  await ensureDefaultDialogues()
  await ensureDefaultCourses()
  await CourseService.syncActivityCourseIds()
  await ensureDefaultGlossary()
  await ensureDefaultArcadeGames()
  await GamificationService.ensureBadges()
  // Datos de demo opcionales (aprendices, envíos, progreso...). Solo con SEED_DEMO=true.
  if (process.env.SEED_DEMO === 'true') {
    console.log('SEED_DEMO=true → sembrando datos de demostración...')
    await seedVolume()
  }
  console.log('Todos los datos iniciales y catálogos fueron inicializados exitosamente.')
} catch (error) {
  console.error('Error al conectar a la base de datos o inicializar datos:', error)
}

const httpServer = http.createServer(app)
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} (0.0.0.0)`)
})
