import prisma from '../lib/db.js'
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
    bg: 'bg-teal-50',
    raps: JSON.stringify(['RAP-01'])
  },
  {
    slug: 'work-life-interaction',
    title: 'Work Life Interaction',
    description: 'Módulo 2 — Fase Planeación · RAP 2 y 3. Caso Mr. Thomas: Pasado simple, adjetivos descriptivos, partes del cuerpo, notas de enfermería y entrega de turno (Handover).',
    category: 'Intermedio',
    duration: '12h',
    icon: 'assignment_ind',
    iconColor: '#4f46e5',
    bg: 'bg-indigo-50',
    raps: JSON.stringify(['RAP-02', 'RAP-03'])
  },
  {
    slug: 'workplace-communication',
    title: 'Workplace Communication',
    description: 'Módulo 3 — Fase Ejecución · RAP 4 y 5. Comunicación con médicos, colegas y visitantes: Presente simple vs. continuo, herramientas médicas, checklist clínico y propuestas de mejora.',
    category: 'Avanzado',
    duration: '14h',
    icon: 'groups',
    iconColor: '#d97706',
    bg: 'bg-amber-50',
    raps: JSON.stringify(['RAP-04', 'RAP-05'])
  },
  {
    slug: 'professional-practice',
    title: 'Professional Practice',
    description: 'Módulo 4 — Fase Evaluación · RAP 6. ¡Mr. Thomas se va a casa! Instrucciones de alta médica, recomendaciones de cuidado en casa con modales y análisis de listas de verificación.',
    category: 'Profesional',
    duration: '10h',
    icon: 'verified_user',
    iconColor: '#059669',
    bg: 'bg-emerald-50',
    raps: JSON.stringify(['RAP-06'])
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

      // Asegurar que los 4 cursos oficiales tengan sus RAPs asignados si están vacíos
      for (const def of DEFAULT_COURSES) {
        const found = await prisma.course.findUnique({ where: { slug: def.slug } })
        if (found && (!found.raps || found.raps === '[]')) {
          await prisma.course.update({
            where: { id: found.id },
            data: { raps: def.raps }
          })
        }
      }
    } catch (e) {
      console.warn('[CourseService] Could not auto-seed courses:', e)
    }
  }

  /**
   * Obtiene la lista de todos los cursos con el progreso del usuario conectado y estado de bloqueo secuencial
   */
  static async listCourses(userId?: number, userRole?: string) {
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

    const isPrivileged = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'
    let previousCourse: any = null
    let previousProgress = 100

    return courses.map((c: any, index: number) => {
      const studentCount = c._count?.progresses || 0
      const activitiesCount = activityCountMap.get(c.title) || 0
      const currentProgress = userId ? (progressMap.get(c.id) || 0) : 0

      let isLocked = false
      let prerequisiteTitle: string | null = null
      let prerequisiteId: number | null = null

      // Bloqueo secuencial: Para aprendices, el módulo N requiere que el módulo N-1 esté al 100%
      if (!isPrivileged && index > 0) {
        if (previousProgress < 100) {
          isLocked = true
          prerequisiteTitle = previousCourse ? previousCourse.title : null
          prerequisiteId = previousCourse ? previousCourse.id : null
        }
      }

      previousCourse = c
      previousProgress = currentProgress

      let rapsList: string[] = []
      if (c.raps) {
        try {
          rapsList = Array.isArray(c.raps) ? c.raps : JSON.parse(c.raps)
        } catch {
          rapsList = []
        }
      }

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
        progress: currentProgress,
        raps: rapsList,
        isLocked,
        prerequisiteTitle,
        prerequisiteId
      }
    })
  }

  /**
   * Obtiene el detalle de un curso por ID con estado de prerrequisito y RAPs
   */
  static async getCourseById(id: number, userId?: number, userRole?: string) {
    const allCourses = await prisma.course.findMany({
      orderBy: { id: 'asc' },
      include: {
        program: true
      }
    })

    const courseIndex = allCourses.findIndex(c => c.id === id)
    if (courseIndex === -1) {
      throw new NotFoundError(`Curso con ID ${id} no encontrado.`)
    }

    const course = allCourses[courseIndex]
    const isPrivileged = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'

    let isLocked = false
    let prerequisiteTitle: string | null = null
    let prerequisiteId: number | null = null

    if (!isPrivileged && courseIndex > 0) {
      const prevCourse = allCourses[courseIndex - 1]
      let prevProgress = 0
      if (userId) {
        const p = await prisma.courseProgress.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: prevCourse.id
            }
          }
        })
        prevProgress = p ? p.overallPct : 0
      }

      if (prevProgress < 100) {
        isLocked = true
        prerequisiteTitle = prevCourse.title
        prerequisiteId = prevCourse.id
      }
    }

    let rapsList: string[] = []
    if (course.raps) {
      try {
        rapsList = Array.isArray(course.raps) ? course.raps : JSON.parse(course.raps)
      } catch {
        rapsList = []
      }
    }

    return {
      ...course,
      raps: rapsList,
      isLocked,
      prerequisiteTitle,
      prerequisiteId
    }
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

    const rapsValue = data.raps
      ? (typeof data.raps === 'string' ? data.raps : JSON.stringify(data.raps))
      : '[]'

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
        raps: rapsValue
      }
    })
  }

  /**
   * Actualiza los datos o estructura de un curso
   */
  static async updateCourse(id: number, data: UpdateCourseDto) {
    const existing = await this.getCourseById(id)

    const rapsValue = data.raps !== undefined
      ? (typeof data.raps === 'string' ? data.raps : JSON.stringify(data.raps))
      : undefined

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
        ...(rapsValue !== undefined ? { raps: rapsValue } : {})
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

  /**
   * Guarda la entrega del POS-TEST GLOBAL, otorgando XP e insignia de graduación
   */
  static async savePostTestResult(userId: number, data: {
    finalScore: number
    preTestBaseline?: number
    answers?: Record<string, any>
    moduleBreakdown?: {
      m1: number
      m2: number
      m3: number
      m4: number
    }
  }) {
    if (!userId) throw new BadRequestError('Usuario no autenticado.')

    const finalScore = Math.max(0, Math.min(100, Math.round(data.finalScore || 0)))
    const preTestBaseline = Math.max(0, Math.min(100, Math.round(data.preTestBaseline !== undefined ? data.preTestBaseline : 35)))
    const delta = Math.max(0, finalScore - preTestBaseline)

    // Buscar curso 4 o curso de evaluación
    const m4Course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: 'professional-practice' },
          { id: 4 }
        ]
      }
    })

    const courseId = m4Course?.id || 4

    // Actualizar progreso en curso 4 con datos del post-test
    const existing = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    let phaseMap: any = { inicio: 100, estudio: 100, practica: 100, evaluacion: 100 }
    if (existing?.phaseProgress) {
      try {
        phaseMap = JSON.parse(existing.phaseProgress)
      } catch {}
    }

    phaseMap.postTest = {
      score: finalScore,
      preTestBaseline,
      delta,
      moduleBreakdown: data.moduleBreakdown || { m1: 100, m2: 100, m3: 100, m4: 100 },
      completedAt: new Date().toISOString()
    }

    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        currentPhase: 'evaluacion',
        phaseProgress: JSON.stringify(phaseMap),
        overallPct: 100,
        completed: true,
        completedAt: new Date()
      },
      update: {
        phaseProgress: JSON.stringify(phaseMap),
        overallPct: 100,
        completed: true,
        completedAt: new Date()
      }
    })

    // Otorgar 150 XP de culminación de ruta formativa
    await GamificationService.awardXp(userId, 150, 'Culminación exitosa del POS-TEST GLOBAL de enfermería')

    // Otorgar insignia oficial post_test_master ("Graduado Bilingüe")
    await GamificationService.awardBadgeExplicit(userId, 'post_test_master')

    // Obtener datos del usuario para el certificado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, apellido: true, cedula: true, correo: true }
    })

    const certificateData = {
      studentName: `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Aprendiz SENA',
      documentId: user?.cedula || 'N/A',
      programTitle: 'Ruta Formativa de Inglés Técnico Aplicado a la Enfermería Hospitalaria',
      totalHours: '44 Horas Académicas',
      modulesCount: 4,
      rapsCompleted: 'RAP 1 al RAP 6',
      preTestBaseline,
      finalScore,
      growthDelta: `+${delta}%`,
      awardedBadge: 'Graduado Bilingüe',
      completionDate: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificateCode: `SENA-NURS-${userId}-${Date.now().toString(36).toUpperCase()}`
    }

    return {
      success: true,
      finalScore,
      preTestBaseline,
      delta,
      certificateData
    }
  }

  /**
   * Consulta el resultado previo del POS-TEST GLOBAL
   */
  static async getPostTestResult(userId: number) {
    if (!userId) throw new BadRequestError('Usuario no autenticado.')

    const m4Course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: 'professional-practice' },
          { id: 4 }
        ]
      }
    })

    const courseId = m4Course?.id || 4
    const progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } }
    })

    if (!progress?.phaseProgress) return null

    try {
      const parsed = JSON.parse(progress.phaseProgress)
      if (parsed.postTest) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { nombre: true, apellido: true, cedula: true }
        })
        return {
          ...parsed.postTest,
          certificateData: {
            studentName: `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Aprendiz SENA',
            documentId: user?.cedula || 'N/A',
            programTitle: 'Ruta Formativa de Inglés Técnico Aplicado a la Enfermería Hospitalaria',
            totalHours: '44 Horas Académicas',
            modulesCount: 4,
            rapsCompleted: 'RAP 1 al RAP 6',
            preTestBaseline: parsed.postTest.preTestBaseline || 35,
            finalScore: parsed.postTest.score || 90,
            growthDelta: `+${parsed.postTest.delta || 55}%`,
            awardedBadge: 'Graduado Bilingüe',
            completionDate: parsed.postTest.completedAt 
              ? new Date(parsed.postTest.completedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
              : new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
            certificateCode: `SENA-NURS-${userId}-VERIFIED`
          }
        }
      }
    } catch {
      return null
    }

    return null
  }
}
