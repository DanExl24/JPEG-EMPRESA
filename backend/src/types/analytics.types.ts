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
  levelInfo?: {
    level: number
    levelTitle: string
    currentXp: number
    nextLevelXp: number
    progressPct: number
    rank: number
  }
  activeCourse?: {
    id: number
    slug: string
    title: string
    category: string
    currentPhase: string
    overallPct: number
    icon?: string
    iconColor?: string
  }
  recommendedActivities?: Array<{
    id: number
    title: string
    course: string
    phase: string
    template: string
    points: number
  }>
  myRecentSubmissions?: Array<{
    id: number
    activityId: number
    title: string
    passed: boolean
    points: number
    submittedAt: string
  }>
  myBadges?: Array<{
    key: string
    name: string
    iconEmoji: string
    awardedAt: string
  }>
  adminChartData?: AdminChartDataDto
}

export interface AdminChartItemWeeklyDto {
  day: string
  shortDay: string
  date: string
  submissions: number
  passed: number
  rate: number
  isPeak?: boolean
}

export interface AdminChartItemModuleDto {
  id: number
  title: string
  category: string
  enrolled: number
  completed: number
  rate: number
  avgScore: number
  status: 'Óptimo' | 'Satisfactorio' | 'En Seguimiento'
}

export interface AdminChartItemRapDto {
  code: string
  title: string
  masteryPct: number
  evaluatedCount: number
  status: 'Sobresaliente' | 'Competente' | 'En Refuerzo'
}

export interface AdminChartDataDto {
  summary: {
    weeklySubmissions: number
    weeklyGrowth: number
    avgPassRate: number
    peakDay: string
    activeLearnersCount: number
  }
  weeklyActivity: AdminChartItemWeeklyDto[]
  moduleProgress: AdminChartItemModuleDto[]
  rapMastery: AdminChartItemRapDto[]
}
