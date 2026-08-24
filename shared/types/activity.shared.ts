/**
 * Tipos de plantillas de actividades pedagógicas
 */
export type ActivityTemplateType =
  | 'match'
  | 'quiz'
  | 'listening'
  | 'pronunciation'
  | 'fillblank'
  | 'sopa'
  | 'crucigrama'

/**
 * Fases pedagógicas del aprendizaje
 */
export type ActivityPhaseType =
  | 'Preparación'
  | 'Absorción'
  | 'Práctica'
  | 'Cierre'

/**
 * Modelo de datos de Actividad
 */
export interface ActivityDto {
  id: number
  title: string
  course: string
  phase: string
  template: ActivityTemplateType | string
  points: number
  attemptsLimit?: string
  successMessage?: string
  hintMessage?: string
  sopaWords?: string | null
  crossword1Clue?: string | null
  crossword1Word?: string | null
  quizQuestion?: string | null
  quizCorrect?: string | null
  quizIncorrect?: string | null
  matchTerm?: string | null
  matchMeaning?: string | null
  listeningPhrase?: string | null
  pronouncePhrase?: string | null
  fillblankSentence?: string | null
  fillblankAnswer?: string | null
  hasStudentSubmissions?: boolean
  learningOutcomeId?: number | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Envío de entrega de una actividad por parte de un aprendiz
 */
export interface ActivitySubmissionDto {
  id: number
  activityId: number
  apprenticeId: number
  passed: boolean
  answers?: string | null
  reviewStatus: 'graded' | 'pending_review' | string
  submittedAt?: string | Date
}

/**
 * Modelo de Vocabulario Clínico
 */
export interface VocabularyDto {
  id: number
  wordEn: string
  wordEs: string
  category: string
  definition: string
  example?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Modelo de Diálogo Clínico
 */
export interface DialogueLineDto {
  speaker: string
  textEn: string
  textEs: string
}

export interface DialogueDto {
  id: number
  title: string
  description?: string | null
  content: string // JSON string de DialogueLineDto[]
  createdAt?: string | Date
  updatedAt?: string | Date
}
