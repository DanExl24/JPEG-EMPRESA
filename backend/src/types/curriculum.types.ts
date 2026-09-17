export interface CreateTrainingProgramDto {
  name: string
}

export interface UpdateTrainingProgramDto {
  name: string
}

export interface CreateCompetencyDto {
  code: string
  name: string
  program_id: number
}

export interface UpdateCompetencyDto {
  code?: string
  name?: string
  program_id?: number
}

export interface CreateLearningOutcomeDto {
  code: string
  competency_id: number
  name: string
}

export interface UpdateLearningOutcomeDto {
  code?: string
  competency_id?: number
  name?: string
}

export interface UpdateEvaluationDto {
  assessment_judgment: string
  instructor_id?: number
}
