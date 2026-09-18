export interface KpiCardDto {
  label: string
  value: string | number
  trend?: number
  change?: string
}

export interface MonthlyMetricDto {
  month: string
  count: number
}

export interface CourseCompletionMetricDto {
  course: string
  enrolled: number
  completed: number
  rate: number
}

export interface AtRiskLearnerDto {
  id: number
  name: string
  email: string
  failedCount: number
  totalSubmissions: number
  successRate: number
  lastActivity: string
  status: 'Riesgo Alto' | 'Seguimiento' | 'Al Día'
}

export interface ProgramDistributionDto {
  program: string
  cohortsCount: number
  apprenticesCount: number
}

export interface AnalyticsSummaryDto {
  role?: 'ADMIN' | 'INSTRUCTOR'
  kpis: KpiCardDto[]
  chartTitle?: string
  monthlyEnrollments?: MonthlyMetricDto[]
  completionRates?: CourseCompletionMetricDto[]
  monthData?: MonthlyMetricDto[]
  tableTitle?: string
  tableData?: CourseCompletionMetricDto[]
  atRiskLearners?: AtRiskLearnerDto[]
  programDistribution?: ProgramDistributionDto[]
}

export interface DashboardSummaryDto {
  stats: Array<{
    label: string
    value: string
    change: string
    icon: string
    bg: string
    iconColor: string
  }>
  recentActivity: Array<{
    id: number
    title: string
    time: string
    icon: string
    bg: string
    iconColor: string
    badge: string
    badgeBg: string
    badgeText: string
  }>
  pendingReviews?: Array<{
    id: number
    activityId: number
    activityTitle: string
    studentName: string
    studentEmail: string
    passed: boolean
    points: number
    submittedAt: string
  }>
}
