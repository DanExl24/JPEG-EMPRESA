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

export interface AnalyticsSummaryDto {
  kpis: KpiCardDto[]
  monthlyEnrollments: MonthlyMetricDto[]
  completionRates: CourseCompletionMetricDto[]
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
}
