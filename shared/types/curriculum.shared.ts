/**
 * Modelo de Programa de Formación
 */
export interface TrainingProgramDto {
  id: number
  name: string
}

/**
 * Modelo de Competencia
 */
export interface CompetencyDto {
  id: number
  code: string
  name: string
  program_id: number
}

/**
 * Modelo de Resultado de Aprendizaje (RAP)
 */
export interface LearningOutcomeDto {
  id: number
  code: string
  competency_id: number
  name: string
}

/**
 * Modelo de Evaluación
 */
export interface EvaluationDto {
  id: number
  assessment_judgment: 'pending' | 'approved' | 'failed' | string
  apprentice_id: number
  learning_outcome_id: number
  updated_by?: number | null
}
