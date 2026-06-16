import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import testRoutes from './routes/test.routes.js'
import authRoutes from './routes/auth.routes.js'
<<<<<<< HEAD
import activityRoutes from './routes/activity.routes.js'
import { ensureDefaultApprenticeUser, ensureDefaultAuthUser, ensureDefaultInstructorUser, ensureDefaultActivities } from './lib/bootstrapAuth.js'
=======
import adminRoutes from './routes/admin.routes.js'
import { ensureDefaultApprenticeUser, ensureDefaultAuthUser, ensureDefaultInstructorUser } from './lib/bootstrapAuth.js'
>>>>>>> 23f0fb3dcf6b6af7484f26d3bfef0b1ff66b8694

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
<<<<<<< HEAD
app.use('/api/activities', activityRoutes)
=======
app.use('/api/admin', adminRoutes)
>>>>>>> 23f0fb3dcf6b6af7484f26d3bfef0b1ff66b8694
app.use('/', testRoutes)

await ensureDefaultAuthUser()
await ensureDefaultInstructorUser()
await ensureDefaultApprenticeUser()
await ensureDefaultActivities()

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000')
})
