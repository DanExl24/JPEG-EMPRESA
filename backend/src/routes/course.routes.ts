import { Router } from 'express'
import { CourseController } from '../controllers/course.controller.js'
import { authenticate } from '../lib/middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const router = Router()

// Catálogo de cursos (opcionalmente autenticado para calcular avance del usuario)
router.get('/', authenticate, CourseController.listCourses)
router.get('/:id', CourseController.getCourseById)

// Progreso por fases de un curso para el aprendiz conectado
router.get('/:id/progress', authenticate, CourseController.getCourseProgress)
router.post('/:id/progress', authenticate, CourseController.saveCourseProgress)

// Gestión de estructura de cursos (Admin e Instructor)
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.createCourse)
router.put('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.updateCourse)
router.delete('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), CourseController.deleteCourse)

export default router
