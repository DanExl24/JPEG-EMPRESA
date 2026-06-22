import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import testRoutes from './routes/test.routes.js'
import authRoutes from './routes/auth.routes.js'
import activityRoutes from './routes/activity.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { ensureDefaultApprenticeUser, ensureDefaultAuthUser, ensureDefaultInstructorUser, ensureDefaultActivities } from './lib/bootstrapAuth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/', testRoutes)

await ensureDefaultAuthUser()
await ensureDefaultInstructorUser()
await ensureDefaultApprenticeUser()
// await ensureDefaultActivities() // Model 'Activity' does not exist in schema

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000')
})
