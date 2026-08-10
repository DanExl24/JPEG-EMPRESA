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

// Fail-safe CORS middleware for cross-origin and subdomain support
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
})

app.use(express.json())

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
} catch (error) {
  console.error('Error al conectar a la base de datos:', error)
}

await ensureDefaultAuthUser()
await ensureDefaultInstructorUser()
await ensureDefaultApprenticeUser()
await ensureDefaultActivities()
await ensureDefaultCurriculum()
await ensureDefaultVocabulary()
await ensureDefaultDialogues()

const httpServer = http.createServer(app)
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en puerto ${PORT} (0.0.0.0) 🚀`)
})