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
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000

// Fail-safe CORS middleware for cross-origin and subdomain support + Request Logging
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')

  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] 📥 Petición: ${req.method} ${req.originalUrl || req.url} | Origin: ${origin}`)

  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] 🟢 Respondiendo 204 OK a preflight OPTIONS para Origin: ${origin}`)
    return res.status(204).end()
  }

  res.on('finish', () => {
    console.log(`[${timestamp}] 📤 Respuesta enviada: ${req.method} ${req.originalUrl || req.url} -> Status ${res.statusCode}`)
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

app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/admin/curriculum', curriculumRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/learner', learnerRoutes)
app.use('/api/content', contentRoutes)
app.use('/', testRoutes)

const httpServer = http.createServer(app)
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} (0.0.0.0) 🚀`)
})

// Inicialización asíncrona de base de datos y datos semilla en segundo plano
;(async () => {
  try {
    console.log('Conectando a la base de datos...')
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
    console.error('Error al inicializar la base de datos:', error)
  }
})()