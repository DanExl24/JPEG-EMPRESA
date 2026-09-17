export interface BadgeDto {
  id: number
  key: string
  name: string
  description: string
  iconEmoji: string
  xpRequired: number
  unlocked?: boolean
  unlockedAt?: Date | null
  progress?: number
}

export interface AwardXpDto {
  userId: number
  amount: number
  reason?: string
}

export interface RecordGameScoreDto {
  gameKey: string
  score: number
  roundsCompleted?: number
}

export interface LeaderboardEntryDto {
  rank: number
  id: number
  name: string
  initials: string
  points: number
  activitiesPassed: number
  isMe?: boolean
}

export interface LearnerProgressSummaryDto {
  overallPct: number
  totalActivities: number
  totalPassed: number
  xp: number
  courses: Array<{
    name: string
    total: number
    passed: number
    pct: number
    totalPoints: number
    earnedPoints: number
  }>
}
