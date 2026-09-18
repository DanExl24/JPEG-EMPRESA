export type ActivityTemplate =
  | 'sopa'
  | 'crucigrama'
  | 'match'
  | 'quiz'
  | 'preguntas'
  | 'listening'
  | 'pronunciation'
  | 'fillblank'

export interface CreateActivityDto {
  title: string
  course: string
  courseId?: number | string | null
  phase: string
  template: ActivityTemplate | string
  points?: number
  attemptsLimit?: string
  successMessage?: string
  hintMessage?: string
  description?: string
  icon?: string
  color?: string
  order?: number
  visible?: boolean
  required?: boolean
  orderItems?: string
  sopaWords?: string
  crossword1Clue?: string
  crossword1Word?: string
  quizQuestion?: string
  quizCorrect?: string
  quizIncorrect?: string
  matchTerm?: string
  matchMeaning?: string
  listeningPhrase?: string
  pronouncePhrase?: string
  fillblankSentence?: string
  fillblankAnswer?: string
  learningOutcomeId?: number | null
}

export interface UpdateActivityDto extends Partial<CreateActivityDto> {}

export interface SubmitActivityDto {
  apprenticeId: number
  answers?: unknown
  passed?: boolean
}

export interface ReviewSubmissionDto {
  reviewStatus: 'graded' | 'pending' | 'rejected'
}
