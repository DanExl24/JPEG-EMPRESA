import { Router } from 'express'
import authRoutes from './auth.routes.js'
import courseRoutes from './course.routes.js'
import activityRoutes from './activity.routes.js'
import contentRoutes from './content.routes.js'
import curriculumRoutes from './curriculum.routes.js'
import gamificationRoutes from './gamification.routes.js'
import adminRoutes from './admin.routes.js'
import analyticsRoutes from './analytics.routes.js'
import testRoutes from './test.routes.js'

const apiRouter = Router()

// Montaje modular de sub-rutas
apiRouter.use('/auth', authRoutes)
apiRouter.use('/courses', courseRoutes)
apiRouter.use('/activities', activityRoutes)
apiRouter.use('/content', contentRoutes)
apiRouter.use('/admin/curriculum', curriculumRoutes)
apiRouter.use('/admin', adminRoutes)
apiRouter.use('/learner', gamificationRoutes)
apiRouter.use('/gamification', gamificationRoutes)
apiRouter.use('/', analyticsRoutes)
apiRouter.use('/test', testRoutes)

export default apiRouter
