import prisma from './db.js'
import { GamificationService } from '../services/gamification.service.js'
import {
  resetSeed,
  randInt,
  pick,
  chance,
  buildApprentice,
  buildCourseProgress,
  buildActivitySubmission,
  buildGameScore,
  buildEvaluation,
} from './factories.js'

const DEMO_APPRENTICES = 12
const DEMO_EMAIL_DOMAIN = '@demo.local'

/** Crea o reutiliza una ficha (cohorte) de demo bajo el primer programa. */
async function ensureDemoCohort(): Promise<number | null> {
  const program = await prisma.trainingProgram.findFirst()
  if (!program) return null
  const cohort = await prisma.cohort.upsert({
    where: { cohort_number: 'FICHA-2026-01' },
    update: {},
    create: { cohort_number: 'FICHA-2026-01', program_id: program.id },
  })
  return cohort.id
}

/** Toma `n` elementos distintos al azar de un arreglo (sin mutarlo). */
function pickSample<T>(items: T[], n: number): T[] {
  const pool = [...items]
  const out: T[] = []
  const count = Math.min(n, pool.length)
  for (let i = 0; i < count; i++) {
    const idx = randInt(0, pool.length - 1)
    out.push(pool.splice(idx, 1)[0] as T)
  }
  return out
}

/**
 * Datos de volumen: aprendices + matrículas, progreso, envíos, puntajes e insignias.
 * Idempotente: si ya hay aprendices de demo, no hace nada. Requiere que el catálogo
 * base (programa, cursos, actividades) ya exista.
 */
export async function seedVolume(): Promise<void> {
  const alreadySeeded = await prisma.user.count({
    where: { correo: { endsWith: DEMO_EMAIL_DOMAIN } },
  })
  if (alreadySeeded > 0) {
    console.log(`✓ Datos de demo ya presentes (${alreadySeeded} aprendices). Se omite el volumen.`)
    return
  }

  resetSeed()

  const cohortId = await ensureDemoCohort()
  const instructor = await prisma.user.findFirst({ where: { rol: 'INSTRUCTOR' } })
  const courses = await prisma.course.findMany({ select: { id: true } })
  const activities = await prisma.activity.findMany({ select: { id: true } })
  const outcomes = await prisma.learningOutcome.findMany({ select: { id: true } })

  let progressCount = 0
  let submissionCount = 0
  let gameScoreCount = 0
  let evaluationCount = 0

  for (let i = 1; i <= DEMO_APPRENTICES; i++) {
    const data = buildApprentice(i)
    const apprentice = await prisma.user.upsert({
      where: { cedula: data.cedula },
      update: {},
      create: data,
    })

    // Matrícula
    if (cohortId) {
      const existing = await prisma.enrollment.findFirst({
        where: { apprentice_id: apprentice.id, cohort_id: cohortId },
      })
      if (!existing) {
        await prisma.enrollment.create({
          data: { apprentice_id: apprentice.id, cohort_id: cohortId, status: 'active' },
        })
      }
    }

    // Progreso en 1–3 cursos
    const courseSample = pickSample(courses, randInt(1, Math.min(3, courses.length)))
    for (const course of courseSample) {
      await prisma.courseProgress.upsert({
        where: { userId_courseId: { userId: apprentice.id, courseId: course.id } },
        update: {},
        create: { userId: apprentice.id, courseId: course.id, ...buildCourseProgress() },
      })
      progressCount++
    }

    // Envíos de actividades
    const activitySample = pickSample(activities, randInt(2, Math.min(5, activities.length)))
    for (const activity of activitySample) {
      await prisma.activitySubmission.upsert({
        where: { activityId_apprenticeId: { activityId: activity.id, apprenticeId: apprentice.id } },
        update: {},
        create: { activityId: activity.id, apprenticeId: apprentice.id, ...buildActivitySubmission() },
      })
      submissionCount++
    }

    // Puntajes de minijuegos
    const games = randInt(1, 3)
    for (let g = 0; g < games; g++) {
      await prisma.gameScore.create({ data: { userId: apprentice.id, ...buildGameScore() } })
      gameScoreCount++
    }

    // Evaluación de un RAP (opcional)
    if (outcomes.length > 0 && chance(0.7)) {
      const outcome = pick(outcomes)
      await prisma.evaluation.create({
        data: {
          apprentice_id: apprentice.id,
          learning_outcome_id: outcome.id,
          updated_by: instructor?.id ?? null,
          ...buildEvaluation(),
        },
      })
      evaluationCount++
    }

    // Insignias por XP (reutiliza la lógica real de gamificación)
    await GamificationService.checkAndAwardBadges(apprentice.id, data.xp)
  }

  console.log(
    `✓ Volumen sembrado: ${DEMO_APPRENTICES} aprendices, ${progressCount} progresos, ` +
    `${submissionCount} envíos, ${gameScoreCount} puntajes, ${evaluationCount} evaluaciones.`
  )
}
