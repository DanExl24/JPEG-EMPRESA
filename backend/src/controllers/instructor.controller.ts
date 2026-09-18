import type { Request, Response, NextFunction } from 'express'
import prisma from '../lib/db.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { UnauthorizedError } from '../utils/appError.js'

/**
 * Obtiene las fichas asignadas al instructor con el desglose de aprendices,
 * actividades resueltas, módulos completados, XP individual y XP global de la ficha.
 */
export async function getInstructorCohorts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id ? Number(req.user.id) : null
    const userRole = (req.user?.role || '').toUpperCase()

    if (!userId) {
      throw new UnauthorizedError('No autenticado.')
    }

    // Si es ADMIN puede ver todas o filtrar por instructorId; si es INSTRUCTOR solo ve sus fichas
    const isInstructor = userRole === 'INSTRUCTOR'
    const where: any = {}
    if (isInstructor) {
      where.instructors = { some: { id: userId } }
    } else if (req.query.instructorId) {
      where.instructors = { some: { id: Number(req.query.instructorId) } }
    }

    const cohorts = await prisma.cohort.findMany({
      where,
      orderBy: { cohort_number: 'asc' },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            courses: {
              select: { id: true, title: true }
            }
          }
        },
        instructors: {
          select: { id: true, nombre: true, apellido: true, correo: true }
        },
        enrollments: {
          include: {
            apprentice: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                cedula: true,
                rol: true,
                xp: true,
                createdAt: true,
                courseProgresses: {
                  select: {
                    courseId: true,
                    overallPct: true,
                    completed: true,
                    course: {
                      select: { id: true, title: true, slug: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Obtener todas las actividades resueltas por los aprendices de estas fichas
    const allApprenticeIds = (cohorts as any[]).flatMap((c: any) =>
      (c.enrollments || [])
        .filter((enr: any) => enr.apprentice && enr.apprentice.rol === 'APRENDIZ')
        .map((enr: any) => enr.apprentice.id)
    )

    const passedCountsMap = new Map<number, number>()
    if (allApprenticeIds.length > 0) {
      const passedSubmissions = await prisma.activitySubmission.findMany({
        where: {
          apprenticeId: { in: allApprenticeIds },
          passed: true
        },
        select: {
          apprenticeId: true,
          activityId: true
        }
      })

      for (const sub of passedSubmissions) {
        passedCountsMap.set(sub.apprenticeId, (passedCountsMap.get(sub.apprenticeId) || 0) + 1)
      }
    }

    const result = (cohorts as any[]).map((cohort: any) => {
      let globalXp = 0
      let totalActivitiesPassed = 0
      let totalModulesCompleted = 0

      const programCoursesCount = cohort.program?.courses?.length || 0

      const apprentices = (cohort.enrollments || [])
        .filter((enr: any) => enr.apprentice && enr.apprentice.rol === 'APRENDIZ')
        .map((enr: any) => {
          const a = enr.apprentice
          const apprenticeXp = a.xp || 0
          globalXp += apprenticeXp

          const passedActivities = passedCountsMap.get(a.id) || 0
          totalActivitiesPassed += passedActivities

          const completedCourses = (a.courseProgresses || [])
            .filter((cp: any) => cp.completed || cp.overallPct === 100)
            .map((cp: any) => ({
              id: cp.courseId,
              title: cp.course?.title || `Módulo #${cp.courseId}`
            }))

          const inProgressCourses = (a.courseProgresses || [])
            .filter((cp: any) => !cp.completed && cp.overallPct > 0 && cp.overallPct < 100)
            .map((cp: any) => ({
              id: cp.courseId,
              title: cp.course?.title || `Módulo #${cp.courseId}`,
              progress: cp.overallPct
            }))

          totalModulesCompleted += completedCourses.length

          return {
            id: a.id,
            nombre: a.nombre,
            apellido: a.apellido,
            fullName: `${a.nombre} ${a.apellido}`.trim(),
            correo: a.correo || 'Sin correo',
            cedula: a.cedula || 'Sin documento',
            xp: apprenticeXp,
            activitiesPassedCount: passedActivities,
            completedModulesCount: completedCourses.length,
            completedModules: completedCourses,
            inProgressModulesCount: inProgressCourses.length,
            inProgressModules: inProgressCourses,
            progressPercentage: programCoursesCount > 0
              ? Math.round((completedCourses.length / programCoursesCount) * 100)
              : 0
          }
        })

      // Ordenar por defecto por mayor XP
      apprentices.sort((a: any, b: any) => b.xp - a.xp)

      const totalApprentices = apprentices.length
      const averageXp = totalApprentices > 0 ? Math.round(globalXp / totalApprentices) : 0

      return {
        id: cohort.id,
        cohort_number: cohort.cohort_number,
        programId: cohort.program_id,
        programName: cohort.program?.name || 'Sin Programa Registrado',
        programCoursesCount,
        instructors: cohort.instructors,
        totalApprentices,
        globalXp,
        averageXp,
        totalActivitiesPassed,
        totalModulesCompleted,
        apprentices
      }
    })

    ApiResponse.success(res, result)
  } catch (error) {
    next(error)
  }
}
