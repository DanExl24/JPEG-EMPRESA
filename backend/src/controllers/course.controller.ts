import type { Request, Response, NextFunction } from 'express'
import { CourseService } from '../services/course.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { BadRequestError } from '../utils/appError.js'

export class CourseController {
  static async listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id ? Number(req.user.id) : undefined
      const courses = await CourseService.listCourses(userId)
      res.json(courses)
    } catch (error) {
      next(error)
    }
  }

  static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id)
      if (isNaN(courseId)) throw new BadRequestError('ID de curso inválido.')

      const course = await CourseService.getCourseById(courseId)
      ApiResponse.success(res, course)
    } catch (error) {
      next(error)
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await CourseService.createCourse(req.body)
      ApiResponse.created(res, course, 'Curso creado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id)
      if (isNaN(courseId)) throw new BadRequestError('ID de curso inválido.')

      const updated = await CourseService.updateCourse(courseId, req.body)
      ApiResponse.success(res, updated, 'Curso actualizado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id)
      if (isNaN(courseId)) throw new BadRequestError('ID de curso inválido.')

      await CourseService.deleteCourse(courseId)
      ApiResponse.success(res, { id: courseId }, 'Curso eliminado exitosamente.')
    } catch (error) {
      next(error)
    }
  }

  static async getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id)
      const userId = Number(req.user?.id)
      if (isNaN(courseId)) throw new BadRequestError('ID de curso inválido.')

      const progress = await CourseService.getCourseProgress(courseId, userId)
      ApiResponse.success(res, progress)
    } catch (error) {
      next(error)
    }
  }

  static async saveCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = Number(req.params.id)
      const userId = Number(req.user?.id)
      if (isNaN(courseId)) throw new BadRequestError('ID de curso inválido.')

      const result = await CourseService.saveCourseProgress(courseId, userId, req.body)
      ApiResponse.success(res, result, 'Progreso de curso guardado exitosamente.')
    } catch (error) {
      next(error)
    }
  }
}
