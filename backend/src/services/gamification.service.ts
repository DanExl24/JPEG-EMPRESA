import prisma from '../lib/db.js'
import type { RecordGameScoreDto, LeaderboardEntryDto } from '../types/gamification.types.js'

export const BADGE_CATALOG = [
  { key: 'primer_paso',       name: 'Primer Paso',        description: 'Completaste tu primera actividad',    iconEmoji: '🎯', xpRequired: 1   },
  { key: 'estudiante_activo', name: 'Estudiante Activo',   description: 'Acumulaste 50 XP',                   iconEmoji: '🔥', xpRequired: 50  },
  { key: 'quiz_master',       name: 'Quiz Master',         description: 'Acumulaste 100 XP',                  iconEmoji: '🧠', xpRequired: 100 },
  { key: 'dedicado',          name: 'Dedicado',            description: 'Acumulaste 250 XP',                  iconEmoji: '⚡', xpRequired: 250 },
  { key: 'enfermero_pro',     name: 'Enfermero Pro',       description: 'Acumulaste 500 XP',                  iconEmoji: '👩‍⚕️', xpRequired: 500 },
  { key: 'experto_clinico',   name: 'Experto Clínico',     description: 'Acumulaste 1000 XP',                 iconEmoji: '🏆', xpRequired: 1000 },
]

export class GamificationService {
  /**
   * Asegura que el catálogo de insignias exista en la base de datos
   */
  static async ensureBadges(): Promise<void> {
    const count = await prisma.badge.count()
    if (count === 0) {
      await prisma.badge.createMany({ data: BADGE_CATALOG, skipDuplicates: true })
    }
  }

  /**
   * Otorga XP al usuario y evalúa si desbloquea nuevas insignias
   */
  static async awardXp(userId: number, xpAmount: number, reason?: string): Promise<number> {
    if (!userId || xpAmount <= 0) return 0

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpAmount } },
      select: { xp: true }
    })

    if (reason) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'XP_AWARDED',
          title: `Ganaste +${xpAmount} XP: ${reason}`,
          badge: 'XP'
        }
      })
    }

    await this.checkAndAwardBadges(userId, updated.xp)
    return updated.xp
  }

  /**
   * Evalúa y asigna insignias según el XP actual
   */
  static async checkAndAwardBadges(userId: number, currentXp: number) {
    await this.ensureBadges()
    const earned = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true }
    })
    const earnedKeys = new Set(earned.map((b: { badgeKey: string }) => b.badgeKey))

    const toAward = BADGE_CATALOG.filter(b => currentXp >= b.xpRequired && !earnedKeys.has(b.key))
    if (toAward.length > 0) {
      await prisma.userBadge.createMany({
        data: toAward.map(b => ({ userId, badgeKey: b.key })),
        skipDuplicates: true
      })

      for (const badge of toAward) {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'BADGE_UNLOCKED',
            title: `¡Desbloqueaste el logro "${badge.name}"!`,
            badge: badge.iconEmoji
          }
        })
      }
    }
    return toAward
  }

  /**
   * Obtiene la lista completa de insignias (desbloqueadas y bloqueadas con porcentaje de avance)
   */
  static async getBadges(userId: number) {
    await this.ensureBadges()

    const allBadges = await prisma.badge.findMany({
      orderBy: { xpRequired: 'asc' }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true }
    })
    const currentXp = user?.xp || 0

    const earned = await prisma.userBadge.findMany({
      where: { userId }
    })
    const earnedMap = new Map(earned.map((e: any) => [e.badgeKey, e.awardedAt]))

    const unlocked = []
    const locked = []

    for (const b of allBadges) {
      const isUnlocked = earnedMap.has(b.key)
      const awardedAt = earnedMap.get(b.key) || null
      const progress = b.xpRequired > 0 ? Math.min(100, Math.round((currentXp / b.xpRequired) * 100)) : 100

      const item = {
        id: b.id,
        key: b.key,
        name: b.name,
        description: b.description,
        iconEmoji: b.iconEmoji,
        xpRequired: b.xpRequired,
        unlocked: isUnlocked,
        unlockedAt: awardedAt,
        progress
      }

      if (isUnlocked) {
        unlocked.push(item)
      } else {
        locked.push(item)
      }
    }

    return {
      totalBadges: allBadges.length,
      unlockedCount: unlocked.length,
      completionRate: allBadges.length > 0 ? Math.round((unlocked.length / allBadges.length) * 100) : 0,
      unlocked,
      locked
    }
  }

  /**
   * Registra los resultados de una partida de mini-juego (JuegosView) y otorga XP
   */
  static async recordGameScore(userId: number, data: RecordGameScoreDto) {
    const score = data.score || 100

    const record = await prisma.gameScore.create({
      data: {
        userId,
        gameKey: data.gameKey,
        score,
        roundsCompleted: data.roundsCompleted || 4
      }
    })

    // Sumar XP real al usuario
    const newXp = await this.awardXp(userId, score, `Partida superada en "${data.gameKey}"`)

    return {
      success: true,
      gameScoreId: record.id,
      scoreAwarded: score,
      currentTotalXp: newXp
    }
  }

  /**
   * Obtiene el resumen de progreso del aprendiz por cursos y total
   */
  static async getProgress(userId: number) {
    const allActivities = await prisma.activity.findMany({
      select: { id: true, course: true, points: true }
    })

    const mySubmissions = await prisma.activitySubmission.findMany({
      where: { apprenticeId: userId },
      select: { activityId: true, passed: true, reviewStatus: true }
    })

    const submissionMap = Object.fromEntries(mySubmissions.map((s: any) => [s.activityId, s]))

    // Agrupar por curso
    const courseMap: Record<string, { total: number; passed: number; totalPoints: number; earnedPoints: number }> = {}
    for (const act of allActivities) {
      if (!courseMap[act.course]) {
        courseMap[act.course] = { total: 0, passed: 0, totalPoints: 0, earnedPoints: 0 }
      }
      courseMap[act.course].total++
      courseMap[act.course].totalPoints += act.points

      const sub = submissionMap[act.id]
      if (sub?.passed) {
        courseMap[act.course].passed++
        courseMap[act.course].earnedPoints += act.points
      }
    }

    const courses = Object.entries(courseMap).map(([name, data]) => ({
      name,
      total: data.total,
      passed: data.passed,
      pct: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
      totalPoints: data.totalPoints,
      earnedPoints: data.earnedPoints
    }))

    const totalActivities = allActivities.length
    const totalPassed = mySubmissions.filter((s: any) => s.passed).length
    const overallPct = totalActivities > 0 ? Math.round((totalPassed / totalActivities) * 100) : 0

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })

    return {
      overallPct,
      totalActivities,
      totalPassed,
      xp: user?.xp || 0,
      courses
    }
  }

  /**
   * Genera el Leaderboard Top 10 ordenado por XP
   */
  static async getLeaderboard(currentUserId?: number): Promise<LeaderboardEntryDto[]> {
    const users = await prisma.user.findMany({
      where: { rol: 'APRENDIZ' },
      select: { id: true, nombre: true, apellido: true, xp: true },
      orderBy: { xp: 'desc' },
      take: 10
    })

    const result = await Promise.all(
      users.map(async (u: any, idx: number) => {
        const passed = await prisma.activitySubmission.count({
          where: { apprenticeId: u.id, passed: true }
        })
        return {
          rank: idx + 1,
          id: u.id,
          name: `${u.nombre} ${u.apellido}`,
          initials: `${u.nombre[0] || ''}${u.apellido[0] || ''}`.toUpperCase(),
          points: u.xp,
          activitiesPassed: passed,
          isMe: currentUserId ? u.id === currentUserId : false
        }
      })
    )

    return result
  }

  /**
   * Resumen administrativo de juegos, métricas y partidas de aprendices para el Admin / Instructor
   */
  static async getAdminGamesOverview() {
    const totalPlays = await prisma.gameScore.count()

    const scoreSum = await prisma.gameScore.aggregate({
      _sum: { score: true }
    })
    const totalXpAwarded = scoreSum._sum.score || 0

    const uniquePlayers = await prisma.gameScore.groupBy({
      by: ['userId']
    })

    const recentScores = await prisma.gameScore.findMany({
      take: 25,
      orderBy: { playedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cedula: true,
            correo: true,
            xp: true
          }
        }
      }
    })

    const gameActivities = await prisma.activity.findMany({
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { id: 'asc' }
    })

    return {
      stats: {
        totalPlays,
        totalXpAwarded,
        activePlayersCount: uniquePlayers.length,
        gamifiedActivitiesCount: gameActivities.length
      },
      recentScores,
      gameActivities: gameActivities.map((a: any) => ({
        ...a,
        playsCount: a._count?.submissions || 0
      }))
    }
  }
}
