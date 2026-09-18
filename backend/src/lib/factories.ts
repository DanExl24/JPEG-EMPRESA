import { hashPassword } from './password.js'

/**
 * Factories de datos: construyen objetos listos para `prisma.<model>.create/upsert`.
 * Son funciones puras (no tocan la base de datos) para poder usarse tanto en el
 * seeder de volumen (`seed.ts`) como en pruebas. El RNG está sembrado, así que
 * dos ejecuciones producen los mismos valores y el seeder puede hacer upsert
 * sobre los campos únicos sin duplicar.
 */

// -----------------------------------------------------------------
// RNG determinista + helpers
// -----------------------------------------------------------------
let seed = 20260917
function rand(): number {
  // LCG simple: suficiente para datos de demo, reproducible entre corridas
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

/** Reinicia la semilla para obtener secuencias reproducibles. */
export function resetSeed(value = 20260917): void {
  seed = value
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)] as T
}

export function chance(probability: number): boolean {
  return rand() < probability
}

// -----------------------------------------------------------------
// Catálogos de nombres (contexto colombiano / SENA)
// -----------------------------------------------------------------
const FIRST_NAMES = [
  'Laura', 'Carlos', 'Andrea', 'Santiago', 'Valentina', 'Mateo', 'Camila', 'Sebastián',
  'Daniela', 'Nicolás', 'Sofía', 'Juan', 'Isabella', 'Andrés', 'Mariana', 'Felipe',
  'Gabriela', 'David', 'Paula', 'Emerson',
] as const

const LAST_NAMES = [
  'Gómez', 'Rodríguez', 'Martínez', 'García', 'López', 'Hernández', 'Ramírez', 'Torres',
  'Vargas', 'Castro', 'Ruiz', 'Moreno', 'Jiménez', 'Rojas', 'Muñoz', 'Ortiz',
] as const

export const GAME_KEYS = ['crossword', 'quiz', 'match', 'listening', 'wordsearch'] as const
export const COURSE_PHASES = ['inicio', 'estudio', 'practica', 'evaluacion'] as const

export const DEFAULT_APPRENTICE_PASSWORD = 'Aprendiz123*'
export const DEFAULT_INSTRUCTOR_PASSWORD = 'Instructor123*'

type Overrides<T> = Partial<T>

// -----------------------------------------------------------------
// User factories
// -----------------------------------------------------------------
export interface ApprenticeData {
  nombre: string
  apellido: string
  cedula: string
  correo: string
  passwordHash: string
  rol: string
  xp: number
}

/**
 * Aprendiz de demo. `index` genera cédula/correo deterministas y únicos.
 */
export function buildApprentice(index: number, overrides: Overrides<ApprenticeData> = {}): ApprenticeData {
  return {
    nombre: pick(FIRST_NAMES),
    apellido: pick(LAST_NAMES),
    cedula: String(9000000000 + index),
    correo: `aprendiz.demo${index}@demo.local`,
    passwordHash: hashPassword(DEFAULT_APPRENTICE_PASSWORD),
    rol: 'APRENDIZ',
    xp: randInt(0, 1200),
    ...overrides,
  }
}

export function buildInstructor(index: number, overrides: Overrides<ApprenticeData> = {}): ApprenticeData {
  return {
    nombre: pick(FIRST_NAMES),
    apellido: pick(LAST_NAMES),
    cedula: `INST${String(index).padStart(4, '0')}`,
    correo: `instructor.demo${index}@demo.local`,
    passwordHash: hashPassword(DEFAULT_INSTRUCTOR_PASSWORD),
    rol: 'INSTRUCTOR',
    xp: 0,
    ...overrides,
  }
}

// -----------------------------------------------------------------
// CourseProgress factory
// -----------------------------------------------------------------
export interface CourseProgressData {
  currentPhase: string
  phaseProgress: string
  overallPct: number
  completed: boolean
  completedAt: Date | null
}

export function buildCourseProgress(overrides: Overrides<CourseProgressData> = {}): CourseProgressData {
  const completed = chance(0.4)
  const phaseIndex = completed ? 3 : randInt(0, 3)
  const currentPhase = COURSE_PHASES[phaseIndex] as string

  // Fases anteriores al 100%, la actual parcial (o 100% si completó)
  const progress: Record<string, number> = { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 }
  COURSE_PHASES.forEach((phase, i) => {
    if (i < phaseIndex) progress[phase] = 100
    else if (i === phaseIndex) progress[phase] = completed ? 100 : randInt(10, 90)
  })
  const overallPct = Math.round(
    (progress.inicio! + progress.estudio! + progress.practica! + progress.evaluacion!) / 4
  )

  return {
    currentPhase,
    phaseProgress: JSON.stringify(progress),
    overallPct,
    completed,
    completedAt: completed ? new Date() : null,
    ...overrides,
  }
}

// -----------------------------------------------------------------
// ActivitySubmission factory
// -----------------------------------------------------------------
export interface ActivitySubmissionData {
  passed: boolean
  answers: string
  reviewStatus: string
}

export function buildActivitySubmission(overrides: Overrides<ActivitySubmissionData> = {}): ActivitySubmissionData {
  const passed = chance(0.75)
  return {
    passed,
    answers: JSON.stringify([{ attempt: 1, correct: passed }]),
    reviewStatus: passed ? 'graded' : 'pending',
    ...overrides,
  }
}

// -----------------------------------------------------------------
// GameScore factory
// -----------------------------------------------------------------
export interface GameScoreData {
  gameKey: string
  score: number
  roundsCompleted: number
}

export function buildGameScore(overrides: Overrides<GameScoreData> = {}): GameScoreData {
  return {
    gameKey: pick(GAME_KEYS),
    score: randInt(10, 100),
    roundsCompleted: randInt(1, 4),
    ...overrides,
  }
}

// -----------------------------------------------------------------
// Evaluation factory
// -----------------------------------------------------------------
export interface EvaluationData {
  assessment_judgment: string
}

export function buildEvaluation(overrides: Overrides<EvaluationData> = {}): EvaluationData {
  return {
    assessment_judgment: pick(['pending', 'approved', 'approved', 'rejected']),
    ...overrides,
  }
}
