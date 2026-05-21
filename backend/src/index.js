import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import testRoutes from './routes/test.routes.js'
import authRoutes from './routes/auth.routes.js'
import { ensureDefaultApprenticeUser, ensureDefaultAuthUser } from './lib/bootstrapAuth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/', testRoutes)

await ensureDefaultAuthUser()
await ensureDefaultApprenticeUser()

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000')
})
