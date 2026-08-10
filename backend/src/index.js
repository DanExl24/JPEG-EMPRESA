import 'dotenv/config'
import express from 'express'
import cors from 'cors'
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
import http from 'http'

const app = express()

const PORT = process.env.BACKEND_PORT || 3000

app.use(cors())
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

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000')
})

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean) ?? []

app.use(cors({
  origin: allowedOrigins
}))


// Crear servidor HTTP y adjuntar Socket.io
  const httpServer = http.createServer(app);
 

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT} (0.0.0.0)`);
  });


startServer();