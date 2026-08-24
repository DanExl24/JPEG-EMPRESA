import type { ActivityTemplateType } from '../../../shared/types/activity.shared.js'

export interface CreateActivityDto {
  title: string
  course: string
  phase: string
  template: ActivityTemplateType | string
  points?: number
  attemptsLimit?: string
  successMessage?: string
  hintMessage?: string
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

export interface SubmitActivityDto {
  apprenticeId: number
  answers?: unknown
  passed?: boolean
}

export interface ReviewSubmissionDto {
  reviewStatus: string
}

export interface CreateVocabularyDto {
  wordEn: string
  wordEs: string
  category: string
  definition: string
  example?: string
}

export interface CreateDialogueDto {
  title: string
  description?: string
  content: string
}

export interface CreateTrainingProgramDto {
  name: string
}

export interface CreateCompetencyDto {
  code: string
  name: string
  program_id: number
}

export interface CreateLearningOutcomeDto {
  code: string
  competency_id: number
  name: string
}

export interface UpdateEvaluationDto {
  assessment_judgment: string
  instructor_id?: number
}
