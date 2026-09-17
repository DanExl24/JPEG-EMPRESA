import prisma from '../lib/db.js'
import { NotFoundError, BadRequestError } from '../utils/appError.js'
import type { CreateCourseDto, UpdateCourseDto, SaveCourseProgressDto } from '../types/course.types.js'
import { GamificationService } from './gamification.service.js'

export class CourseService {
  /**
   * Obtiene la lista de todos los cursos con el progreso del usuario conectado
   */
  static async listCourses(userId?: number) {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { progresses: true }
        }
      },
      orderBy: { id: 'asc' }
    })

    if (!userId) {
      return courses.map((c: any) => ({
        ...c,
        studentsCount: c._count?.progresses || 0,
        progress: 0
      }))
    }

    const userProgresses = await prisma.courseProgress.findMany({
      where: { userId }
    })

    const progressMap = new Map<number, number>()
    userProgresses.forEach((p: any) => {
      progressMap.set(p.courseId, p.overallPct)
    })

    return courses.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      duration: c.duration,
      icon: c.icon,
      iconColor: c.iconColor,
      bg: c.bg,
      studentsCount: c._count?.progresses || 0,
      progress: progressMap.get(c.id) || 0
    }))
  }

  /**
   * Obtiene el detalle de un curso por ID o por slug
   */
  static async getCourseById(id: number) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        program: true
      }
    })

    if (!course) {
      throw new NotFoundError(`Curso con ID ${id} no encontrado.`)
    }

    return course
  }

  /**
   * Crea un nuevo curso clínico (Solo Admin / Instructor)
   */
  static async createCourse(data: CreateCourseDto) {
    if (!data.title || !data.category || !data.duration) {
      throw new BadRequestError('Título, categoría y duración son campos obligatorios.')
    }

    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    return await prisma.course.create({
      data: {
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || '',
        category: data.category.trim(),
        duration: data.duration.trim(),
        icon: data.icon || 'school',
        iconColor: data.iconColor || '#006688',
        bg: data.bg || 'bg-blue-50',
        programId: data.programId || null
      }
    })
  }

  /**
   * Actualiza los datos o estructura de un curso
   */
  static async updateCourse(id: number, data: UpdateCourseDto) {
    await this.getCourseById(id)

    return await prisma.course.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.slug ? { slug: data.slug.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description.trim() } : {}),
        ...(data.category ? { category: data.category.trim() } : {}),
        ...(data.duration ? { duration: data.duration.trim() } : {}),
        ...(data.icon ? { icon: data.icon } : {}),
        ...(data.iconColor ? { iconColor: data.iconColor } : {}),
        ...(data.bg ? { bg: data.bg } : {}),
        ...(data.programId !== undefined ? { programId: data.programId } : {})
      }
    })
  }

  /**
   * Elimina un curso
   */
  static async deleteCourse(id: number) {
    await this.getCourseById(id)
    return await prisma.course.delete({ where: { id } })
  }

  /**
   * Obtiene el progreso del usuario conectado en un curso
   */
  static async getCourseProgress(courseId: number, userId: number) {
    const record = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })

    if (!record) {
      return {
        courseId,
        currentPhase: 'inicio',
        phaseProgress: { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 },
        overallPct: 0,
        completed: false
      }
    }

    let parsedPhases = { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 }
    try {
      parsedPhases = JSON.parse(record.phaseProgress)
    } catch {
      // Ignorar error de parsing y usar default
    }

    return {
      courseId,
      currentPhase: record.currentPhase,
      phaseProgress: parsedPhases,
      overallPct: record.overallPct,
      completed: record.completed,
      completedAt: record.completedAt
    }
  }

  /**
   * Guarda o actualiza el avance de una fase del curso (reemplaza a localStorage)
   */
  static async saveCourseProgress(courseId: number, userId: number, data: SaveCourseProgressDto) {
    await this.getCourseById(courseId)

    const existing = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    })

    let currentPhaseMap: Record<string, number> = { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 }
    if (existing) {
      try {
        currentPhaseMap = JSON.parse(existing.phaseProgress)
      } catch {
        // default
      }
    }

    // Actualizar porcentaje de la fase actual (0 a 100)
    currentPhaseMap[data.phase] = Math.min(100, Math.max(0, data.phasePercentage))

    // Calcular promedio general del módulo
    const phases = ['inicio', 'estudio', 'practica', 'evaluacion']
    const sum = phases.reduce((acc, phase) => acc + (currentPhaseMap[phase] || 0), 0)
    const overallPct = Math.round(sum / phases.length)
    const isCompleted = overallPct === 100

    // Determinar siguiente fase activa
    let nextPhase = data.phase
    if (data.phasePercentage === 100) {
      if (data.phase === 'inicio') nextPhase = 'estudio'
      else if (data.phase === 'estudio') nextPhase = 'practica'
      else if (data.phase === 'practica') nextPhase = 'evaluacion'
    }

    const saved = await prisma.courseProgress.upsert({
      where: {
        userId_courseId: { userId, courseId }
      },
      create: {
        userId,
        courseId,
        currentPhase: nextPhase,
        phaseProgress: JSON.stringify(currentPhaseMap),
        overallPct,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null
      },
      update: {
        currentPhase: nextPhase,
        phaseProgress: JSON.stringify(currentPhaseMap),
        overallPct,
        completed: isCompleted,
        ...(isCompleted && !existing?.completed ? { completedAt: new Date() } : {})
      }
    })

    // Si completó el curso al 100%, otorgar 100 XP
    if (isCompleted && !existing?.completed) {
      await GamificationService.awardXp(userId, 100, `Curso #${courseId} completado`)
    }

    return {
      courseId,
      currentPhase: saved.currentPhase,
      phaseProgress: currentPhaseMap,
      overallPct: saved.overallPct,
      completed: saved.completed
    }
  }
}
