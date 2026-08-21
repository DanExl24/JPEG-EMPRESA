import 'dotenv/config'
import express from 'express'
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Petición: ${req.method} ${req.originalUrl || req.url} | Origin: ${req.headers.origin || '*'}`)

  res.on('finish', () => {
    console.log(`[${timestamp}] Respuesta enviada: ${req.method} ${req.originalUrl || req.url} -> Status ${res.statusCode}`)
  })

  next()
})
app.use(express.json())

// Body logging middleware for debugging login payloads
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log(`[${new Date().toISOString()}] 📦 Payload Body (${req.url}):`, JSON.stringify(req.body || {}))
  }
  next()
})

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/admin/curriculum', curriculumRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/learner', learnerRoutes)
app.use('/api/content', contentRoutes)
app.use('/', testRoutes)

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
