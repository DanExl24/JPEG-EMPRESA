export interface CreateCourseDto {
  title: string
  slug: string
  description: string
  category: string
  duration: string
  icon?: string
  iconColor?: string
  bg?: string
  programId?: number | null
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export interface SaveCourseProgressDto {
  phase: 'inicio' | 'estudio' | 'practica' | 'evaluacion'
  phasePercentage: number
  score?: number
}

export interface CourseProgressResponse {
  courseId: number
  currentPhase: string
  phaseProgress: Record<string, number>
  overallPct: number
  completed: boolean
  completedAt?: Date | null
}

export interface CourseWithProgressDto {
  id: number
  title: string
  slug: string
  description: string
  category: string
  duration: string
  icon: string
  iconColor: string
  bg: string
  studentsCount: number
  progress: number
}
