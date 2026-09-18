import prisma from '../lib/db.js'
import type { Prisma } from '@prisma/client'
import { NotFoundError, BadRequestError } from '../utils/appError.js'
import type { CreateCourseDto, UpdateCourseDto, SaveCourseProgressDto } from '../types/course.types.js'
import { GamificationService } from './gamification.service.js'

export const DEFAULT_COURSES = [
  {
    slug: 'getting-to-know-other-people',
    title: 'Getting to Know Other People',
    description: 'Módulo 1 — Fase Análisis · RAP 1. Aprende a saludar, presentarte, dar información personal y comunicarte con pacientes extranjeros en inglés.',
    category: 'Básico',
    duration: '8h',
    icon: 'medical_services',
    iconColor: '#006688',
    bg: 'bg-teal-50'
  },
  {
    slug: 'work-life-interaction',
    title: 'Work Life Interaction',
    description: 'Módulo 2 — Fase Planeación · RAP 2 y 3. Caso Mr. Thomas: Pasado simple, adjetivos descriptivos, partes del cuerpo, notas de enfermería y entrega de turno (Handover).',
    category: 'Intermedio',
    duration: '12h',
    icon: 'assignment_ind',
    iconColor: '#4f46e5',
    bg: 'bg-indigo-50'
  },
  {
    slug: 'workplace-communication',
    title: 'Workplace Communication',
    description: 'Módulo 3 — Fase Ejecución · RAP 4 y 5. Comunicación con médicos, colegas y visitantes: Presente simple vs. continuo, herramientas médicas, checklist clínico y propuestas de mejora.',
    category: 'Avanzado',
    duration: '14h',
    icon: 'groups',
    iconColor: '#d97706',
    bg: 'bg-amber-50'
  },
  {
    slug: 'professional-practice',
    title: 'Professional Practice',
    description: 'Módulo 4 — Fase Evaluación · RAP 6. ¡Mr. Thomas se va a casa! Instrucciones de alta médica, recomendaciones de cuidado en casa con modales y análisis de listas de verificación.',
    category: 'Profesional',
    duration: '10h',
    icon: 'verified_user',
    iconColor: '#059669',
    bg: 'bg-emerald-50'
  }
]

export class CourseService {
  /**
   * Inicializa los cursos fundamentales en la base de datos si la tabla está vacía
   */
  static async ensureCourses(): Promise<void> {
    try {
      const count = await prisma.course.count()
      if (count === 0) {
        await prisma.course.createMany({
          data: DEFAULT_COURSES,
          skipDuplicates: true
        })
        return
      }

      // Sincronizar si aún existen cursos genéricos anteriores
      const oldCourses = await prisma.course.findMany({
        where: {
          slug: {
            in: [
              'fundamentos-enfermeria',
              'cardiologia-clinica',
              'farmacologia-aplicada',
              'comunicacion-salud',
              'urgencias-emergencias',
              'pediatria-neonatologia'
            ]
          }
        },
        orderBy: { id: 'asc' }
      })

      if (oldCourses.length > 0) {
        for (let i = 0; i < DEFAULT_COURSES.length; i++) {
          const target = DEFAULT_COURSES[i]
          if (oldCourses[i]) {
            await prisma.course.update({
              where: { id: oldCourses[i].id },
              data: target
            })
          }
        }
        for (let j = DEFAULT_COURSES.length; j < oldCourses.length; j++) {
          try {
            await prisma.course.delete({ where: { id: oldCourses[j].id } })
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[CourseService] Could not auto-seed courses:', e)
    }
  }

  /**
   * Enlaza las actividades antiguas (que solo guardaban el título del curso) con su curso real
   */
  static async syncActivityCourseIds(): Promise<void> {
    try {
      const courses = await prisma.course.findMany({ select: { id: true, title: true } })
      if (courses.length === 0) return

      const pending = await prisma.activity.findMany({
        where: { courseId: null },
        select: { id: true, course: true }
      })

      let linked = 0
      for (const activity of pending) {
        const match = courses.find(course => course.title === activity.course)
        if (!match) continue
        await prisma.activity.update({
          where: { id: activity.id },
          data: { courseId: match.id }
        })
        linked++
      }

      if (linked > 0) {
        console.log(`[CourseService] ${linked} actividad(es) enlazada(s) a su curso.`)
      }
    } catch (e) {
      console.warn('[CourseService] Could not link activities to courses:', e)
    }
  }

  /**
   * Obtiene la lista de todos los cursos con el progreso del usuario conectado
   */
  static async listCourses(userId?: number) {
    await this.ensureCourses()

    const courses = await prisma.course.findMany({
      include: {
        program: {
          select: { id: true, name: true }
        },
        _count: {
          select: { progresses: true }
        }
      },
      orderBy: { id: 'asc' }
    })

    const activities = await prisma.activity.findMany({
      select: { course: true }
    })
    const activityCountMap = new Map<string, number>()
    activities.forEach((a: any) => {
      activityCountMap.set(a.course, (activityCountMap.get(a.course) || 0) + 1)
    })

    let progressMap = new Map<number, number>()
    if (userId) {
      const userProgresses = await prisma.courseProgress.findMany({
        where: { userId }
      })
      userProgresses.forEach((p: any) => {
        progressMap.set(p.courseId, p.overallPct)
      })
    }

    return courses.map((c: any) => {
      const studentCount = c._count?.progresses || 0
      const activitiesCount = activityCountMap.get(c.title) || 0

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        duration: c.duration,
        icon: c.icon,
        iconColor: c.iconColor,
        bg: c.bg,
        programId: c.programId || null,
        programName: c.program?.name || null,
        studentsCount: studentCount,
        students: studentCount,
        activitiesCount,
        progress: userId ? (progressMap.get(c.id) || 0) : 0
      }
    })
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

    let slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const existingWithSlug = await prisma.course.findUnique({ where: { slug } })
    if (existingWithSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

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
        programId: data.programId || null,
        ...(data.structure !== undefined ? { structure: data.structure as unknown as Prisma.InputJsonValue } : {})
      }
    })
  }

  /**
   * Actualiza los datos o estructura de un curso
   */
  static async updateCourse(id: number, data: UpdateCourseDto) {
    const existing = await this.getCourseById(id)

    const updated = await prisma.course.update({
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
        ...(data.programId !== undefined ? { programId: data.programId } : {}),
        ...(data.structure !== undefined ? { structure: data.structure as unknown as Prisma.InputJsonValue } : {})
      }
    })

    // Sincronizar título en actividades vinculadas si el título del curso cambió
    if (data.title && data.title.trim() !== existing.title) {
      await prisma.activity.updateMany({
        where: { course: existing.title },
        data: { course: data.title.trim() }
      })
    }

    return updated
  }

  /**
   * Elimina un curso
   */
  static async deleteCourse(id: number) {
    await this.getCourseById(id)
    await prisma.courseProgress.deleteMany({ where: { courseId: id } })
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
