import { Router } from 'express'
import { CourseController } from '../controllers/course.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Catálogo de cursos (público con cálculo opcional de progreso si hay sesión)
router.get('/', optionalAuthenticate, CourseController.listCourses)
router.get('/:id', optionalAuthenticate, CourseController.getCourseById)

// POS-TEST GLOBAL Integrador de toda la ruta formativa
router.post('/post-test/submit', authenticate, CourseController.submitPostTest)
router.get('/post-test/result', authenticate, CourseController.getPostTestResult)

// Progreso por fases de un curso para el aprendiz conectado
router.get('/:id/progress', authenticate, CourseController.getCourseProgress)
router.post('/:id/progress', authenticate, CourseController.saveCourseProgress)

// Gestión de estructura de cursos (Admin e Instructor)
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.createCourse)
router.put('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.updateCourse)
router.delete('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.deleteCourse)

export default router
