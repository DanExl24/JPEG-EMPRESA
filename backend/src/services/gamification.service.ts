import prisma from '../lib/db.js'
import type { RecordGameScoreDto, LeaderboardEntryDto } from '../types/gamification.types.js'
import { DEFAULT_ARCADE_GAMES } from '../lib/bootstrapAuth.js'
import { NotFoundError, BadRequestError, ConflictError } from '../utils/appError.js'

export const BADGE_CATALOG = [
  { key: 'primer_paso',       name: 'Primer Paso',        description: 'Completaste tu primera actividad',    iconEmoji: '🎯', xpRequired: 1   },
  { key: 'estudiante_activo', name: 'Estudiante Activo',   description: 'Acumulaste 50 XP',                   iconEmoji: '🔥', xpRequired: 50  },
  { key: 'quiz_master',       name: 'Quiz Master',         description: 'Acumulaste 100 XP',                  iconEmoji: '🧠', xpRequired: 100 },
  { key: 'dedicado',          name: 'Dedicado',            description: 'Acumulaste 250 XP',                  iconEmoji: '⚡', xpRequired: 250 },
  { key: 'enfermero_pro',     name: 'Enfermero Pro',       description: 'Acumulaste 500 XP',                  iconEmoji: '👩‍⚕️', xpRequired: 500 },
  { key: 'experto_clinico',   name: 'Experto Clínico',     description: 'Acumulaste 1000 XP',                 iconEmoji: '🏆', xpRequired: 1000 },
]

export function extractSingleEmoji(str?: string): string {
  if (!str) return '🏆'
  const trimmed = str.trim()
  if (!trimmed) return '🏆'
  try {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    const segments = Array.from(segmenter.segment(trimmed))
    return segments.length > 0 ? segments[0].segment : '🏆'
  } catch {
    const arr = Array.from(trimmed)
    return arr.length > 0 ? arr[0] : '🏆'
  }
}

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
    const allBadges = await prisma.badge.findMany({
      orderBy: { xpRequired: 'asc' }
    })
    const earned = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true }
    })
    const earnedKeys = new Set(earned.map((b: { badgeKey: string }) => b.badgeKey))

    const toAward = allBadges.filter(b => currentXp >= b.xpRequired && !earnedKeys.has(b.key))
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
        iconEmoji: extractSingleEmoji(b.iconEmoji),
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
   * Lista todas las insignias con métricas para el panel de administración
   */
  static async listBadgesAdmin() {
    await this.ensureBadges()
    const badges = await prisma.badge.findMany({
      orderBy: { xpRequired: 'asc' },
      include: {
        _count: {
          select: { userBadges: true }
        }
      }
    })

    const totalApprentices = await prisma.user.count({ where: { rol: 'APRENDIZ' } })
    const totalAwarded = badges.reduce((acc, b) => acc + b._count.userBadges, 0)

    return {
      totalBadges: badges.length,
      totalAwarded,
      totalApprentices,
      minXp: badges.length > 0 ? badges[0].xpRequired : 0,
      maxXp: badges.length > 0 ? badges[badges.length - 1].xpRequired : 0,
      badges: badges.map(b => ({
        id: b.id,
        key: b.key,
        name: b.name,
        description: b.description,
        iconEmoji: extractSingleEmoji(b.iconEmoji),
        xpRequired: b.xpRequired,
        unlockedCount: b._count.userBadges,
        unlockedPct: totalApprentices > 0 ? Math.round((b._count.userBadges / totalApprentices) * 100) : 0
      }))
    }
  }

  /**
   * Crea una nueva insignia en el catálogo
   */
  static async createBadge(data: {
    name: string
    description: string
    iconEmoji?: string
    xpRequired: number
    key?: string
  }) {
    const { name, description, iconEmoji, xpRequired } = data
    if (!name || !name.trim()) throw new BadRequestError('El nombre de la insignia es obligatorio.')
    if (!description || !description.trim()) throw new BadRequestError('La descripción pedagógica es obligatoria.')
    if (xpRequired === undefined || xpRequired === null || Number(xpRequired) < 0) {
      throw new BadRequestError('El XP requerido debe ser un número mayor o igual a 0.')
    }

    const targetXp = Number(xpRequired)

    // Validar que no exista otra insignia con la misma meta de XP
    const existingWithSameXp = await prisma.badge.findFirst({
      where: { xpRequired: targetXp }
    })
    if (existingWithSameXp) {
      throw new ConflictError(`Ya existe la insignia "${existingWithSameXp.name}" configurada para la misma meta de ${targetXp} XP. Cada insignia debe tener un hito de XP único.`)
    }

    // Validar nombre duplicado
    const existingWithName = await prisma.badge.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } }
    })
    if (existingWithName) {
      throw new ConflictError(`Ya existe una insignia registrada con el nombre "${existingWithName.name}".`)
    }

    // Generar slug key único
    let baseKey = (data.key || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    if (!baseKey) baseKey = `badge_${Date.now()}`

    let key = baseKey
    let counter = 1
    while (await prisma.badge.findUnique({ where: { key } })) {
      key = `${baseKey}_${counter++}`
    }

    const singleEmoji = extractSingleEmoji(iconEmoji)

    const newBadge = await prisma.badge.create({
      data: {
        key,
        name: name.trim(),
        description: description.trim(),
        iconEmoji: singleEmoji,
        xpRequired: targetXp
      }
    })

    // Retro-asignar automáticamente la insignia a todos los aprendices que ya superan el XP requerido
    const eligibleUsers = await prisma.user.findMany({
      where: {
        rol: 'APRENDIZ',
        xp: { gte: targetXp }
      },
      select: { id: true }
    })

    if (eligibleUsers.length > 0) {
      await prisma.userBadge.createMany({
        data: eligibleUsers.map(u => ({ userId: u.id, badgeKey: key })),
        skipDuplicates: true
      })
    }

    return newBadge
  }

  /**
   * Actualiza una insignia existente
   */
  static async updateBadge(id: number, data: {
    name?: string
    description?: string
    iconEmoji?: string
    xpRequired?: number
  }) {
    const existing = await prisma.badge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Insignia #${id} no encontrada.`)

    // Validar si el nuevo XP ya está ocupado por otra insignia
    if (data.xpRequired !== undefined) {
      const targetXp = Number(data.xpRequired)
      const existingWithSameXp = await prisma.badge.findFirst({
        where: {
          xpRequired: targetXp,
          NOT: { id }
        }
      })
      if (existingWithSameXp) {
        throw new ConflictError(`Ya existe la insignia "${existingWithSameXp.name}" configurada para la misma meta de ${targetXp} XP. Cada insignia debe tener un hito de XP único.`)
      }
    }

    // Validar si el nuevo nombre ya está ocupado por otra insignia
    if (data.name) {
      const existingWithName = await prisma.badge.findFirst({
        where: {
          name: { equals: data.name.trim(), mode: 'insensitive' },
          NOT: { id }
        }
      })
      if (existingWithName) {
        throw new ConflictError(`Ya existe una insignia registrada con el nombre "${existingWithName.name}".`)
      }
    }

    const updated = await prisma.badge.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description ? { description: data.description.trim() } : {}),
        ...(data.iconEmoji ? { iconEmoji: extractSingleEmoji(data.iconEmoji) } : {}),
        ...(data.xpRequired !== undefined ? { xpRequired: Number(data.xpRequired) } : {})
      }
    })

    // Si se redujo el XP requerido, retro-asignar a aprendices que ahora califican
    if (data.xpRequired !== undefined) {
      const eligibleUsers = await prisma.user.findMany({
        where: {
          rol: 'APRENDIZ',
          xp: { gte: Number(data.xpRequired) }
        },
        select: { id: true }
      })

      if (eligibleUsers.length > 0) {
        await prisma.userBadge.createMany({
          data: eligibleUsers.map(u => ({ userId: u.id, badgeKey: existing.key })),
          skipDuplicates: true
        })
      }
    }

    return updated
  }

  /**
   * Elimina una insignia del catálogo
   */
  static async deleteBadge(id: number) {
    const existing = await prisma.badge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Insignia #${id} no encontrada.`)

    await prisma.userBadge.deleteMany({ where: { badgeKey: existing.key } })
    return await prisma.badge.delete({ where: { id } })
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

    // Asegurar juegos en BD con fallback resiliente
    let allGames: any[] = DEFAULT_ARCADE_GAMES
    try {
      const gameCount = await (prisma as any).arcadeGame.count()
      if (gameCount === 0) {
        for (const g of DEFAULT_ARCADE_GAMES) {
          await (prisma as any).arcadeGame.create({ data: g })
        }
      }
      allGames = await (prisma as any).arcadeGame.findMany({
        orderBy: { id: 'asc' }
      })
    } catch (e) {
      console.warn('Tabla arcade_games no disponible aún, usando catálogo por defecto:', e)
    }

    // Desglose de partidas por cada minijuego del Arcade
    const gamesWithStats = await Promise.all(
      allGames.map(async (game: any) => {
        let plays = 0
        let totalXp = 0
        try {
          plays = await prisma.gameScore.count({
            where: { gameKey: game.key }
          })
          const xpSum = await prisma.gameScore.aggregate({
            where: { gameKey: game.key },
            _sum: { score: true }
          })
          totalXp = xpSum._sum.score || 0
        } catch {
          // Ignorar si falla lectura de scores
        }
        return {
          ...game,
          playsCount: plays,
          totalXp
        }
      })
    )

    // Juego más popular
    const sortedByPlays = [...gamesWithStats].sort((a, b) => b.playsCount - a.playsCount)
    const mostPopular = sortedByPlays[0]?.playsCount > 0 ? sortedByPlays[0].name : 'Warm-up Drag Match'

    return {
      stats: {
        totalPlays,
        totalXpAwarded,
        activePlayersCount: uniquePlayers.length,
        totalArcadeGames: allGames.length,
        mostPopularGame: mostPopular
      },
      games: gamesWithStats,
      recentScores
    }
  }

  /**
   * Genera el banco de contenido dinámico para los minijuegos del Arcade
   * consumiendo vocabulario clínico y glosario desde la base de datos
   */
  static async getArcadeContent() {
    // Juegos activos desde la BD con fallback seguro
    let activeGames: any[] = DEFAULT_ARCADE_GAMES
    try {
      const dbGames = await (prisma as any).arcadeGame.findMany({
        where: { active: true },
        orderBy: { id: 'asc' }
      })
      if (dbGames && dbGames.length > 0) {
        activeGames = dbGames
      }
    } catch (e) {
      console.warn('Tabla arcade_games no disponible aún en getArcadeContent, usando fallback:', e)
    }

    // 1. Obtener vocabulario de la BD
    const vocabularyList = await prisma.vocabulary.findMany({
      take: 50,
      orderBy: { id: 'asc' }
    })

    // 2. Obtener glosario
    const glossaryList = await prisma.glossaryTerm.findMany({
      take: 30,
      orderBy: { id: 'asc' }
    })

    // Mezclar aleatoriamente una lista (Fisher-Yates)
    const shuffle = <T>(array: T[]): T[] => {
      const arr = [...array]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
      }
      return arr
    }

    const shuffledVocab = shuffle(vocabularyList)

    // ── Trivia Médica: 10 preguntas dinámicas ──
    const triviaQuestions = shuffledVocab.slice(0, 10).map((item, idx) => {
      const distractors = shuffledVocab
        .filter(v => v.id !== item.id)
        .slice(0, 3)

      const isEnglishToSpanish = idx % 2 === 0

      let question = ''
      let correctAnswer = ''
      let incorrectAnswers: string[] = []

      if (isEnglishToSpanish) {
        question = `¿Cuál es el significado clínico en español de "${item.wordEn}"?`
        correctAnswer = item.wordEs
        incorrectAnswers = distractors.map(d => d.wordEs)
      } else {
        question = `¿Cuál es el término en inglés para "${item.wordEs}"?`
        correctAnswer = item.wordEn
        incorrectAnswers = distractors.map(d => d.wordEn)
      }

      while (incorrectAnswers.length < 3) {
        incorrectAnswers.push(`Opción médica ${incorrectAnswers.length + 1}`)
      }

      const options = shuffle([correctAnswer, ...incorrectAnswers.slice(0, 3)])

      return {
        id: item.id || idx + 1,
        question,
        correctAnswer,
        options,
        category: item.category,
        hint: item.definition || item.example || 'Recuerda los términos de enfermería clínica.',
        example: item.example
      }
    })

    // ── Pares Clínicos (Speed Match): 6 u 8 pares para el tablero ──
    const matchPairs = shuffledVocab.slice(0, 6).map(item => ({
      id: item.id,
      wordEn: item.wordEn,
      wordEs: item.wordEs,
      category: item.category,
      definition: item.definition
    }))

    // ── Desafío de Escucha Fonética: 8 términos ──
    const listeningTerms = shuffledVocab.slice(0, 8).map(item => {
      const distractors = shuffledVocab
        .filter(v => v.id !== item.id)
        .slice(0, 3)
        .map(d => d.wordEn)

      const options = shuffle([item.wordEn, ...distractors])

      return {
        id: item.id,
        wordEn: item.wordEn,
        wordEs: item.wordEs,
        definition: item.definition,
        example: item.example,
        options
      }
    })

    return {
      catalog: activeGames.length > 0 ? activeGames : DEFAULT_ARCADE_GAMES,
      trivia: triviaQuestions,
      pairs: matchPairs,
      listening: listeningTerms
    }
  }

  /**
   * Operaciones CRUD sobre los Juegos del Arcade (Admin / Instructor)
   */
  static async createArcadeGame(data: any) {
    const rawKey = (data.name || 'game').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)
    const key = `${rawKey}_${Date.now().toString().slice(-4)}`

    return (prisma as any).arcadeGame.create({
      data: {
        key,
        name: data.name.trim(),
        subtitle: data.subtitle?.trim() || null,
        description: data.description?.trim() || 'Práctica lúdica de enfermería clínica.',
        template: data.template || 'trivia_medica',
        icon: data.icon || 'sports_esports',
        color: data.color || 'text-blue-500',
        bg: data.bg || 'bg-blue-50',
        difficulty: data.difficulty || 'Medio',
        pts: Number(data.pts) || 100,
        duration: data.duration || '5 min',
        active: data.active !== undefined ? Boolean(data.active) : true,
        config: data.config ? data.config : null
      }
    })
  }

  static async updateArcadeGame(id: number, data: any) {
    return (prisma as any).arcadeGame.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle?.trim() || null }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.template && { template: data.template }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.bg && { bg: data.bg }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.pts !== undefined && { pts: Number(data.pts) }),
        ...(data.duration && { duration: data.duration }),
        ...(data.active !== undefined && { active: Boolean(data.active) }),
        ...(data.config !== undefined && { config: data.config })
      }
    })
  }

  static async deleteArcadeGame(id: number) {
    return (prisma as any).arcadeGame.delete({
      where: { id }
    })
  }

  static async toggleArcadeGame(id: number) {
    let existing = await (prisma as any).arcadeGame.findUnique({ where: { id } })
    if (!existing) {
      // Si la BD aún no tenía ese ID específico, intentar enlazar con catálogo por defecto
      const fallbackGame = DEFAULT_ARCADE_GAMES[id - 1] || DEFAULT_ARCADE_GAMES.find((g: any) => g.id === id)
      if (fallbackGame) {
        const { id: _, ...gameData } = fallbackGame as any
        existing = await (prisma as any).arcadeGame.upsert({
          where: { key: fallbackGame.key },
          update: {},
          create: gameData
        })
      }
    }
    if (!existing) throw new Error('Juego no encontrado')

    return (prisma as any).arcadeGame.update({
      where: { id: existing.id },
      data: { active: !existing.active }
    })
  }
}

export const ARCADE_GAMES = [
  {
    key: 'warmup_drag_match',
    name: 'Warm-up Drag Match',
    subtitle: 'Calentamiento Clínico Interactivo',
    desc: 'Asocia iconos clínicos y saludos médicos arrastrándolos a sus expresiones en inglés correspondientes.',
    icon: 'pan_tool',
    color: 'text-blue-500',
    colorHex: '#3b82f6',
    bg: 'bg-blue-50',
    difficulty: 'Fácil',
    pts: 100,
    duration: '3 min',
    active: true
  },
  {
    key: 'trivia_medica',
    name: 'Trivia Médica Contrarreloj',
    subtitle: 'Desafío Rápido de Vocabulario y Síntomas',
    desc: 'Preguntas de opción múltiple generadas en vivo desde el vocabulario de enfermería para poner a prueba tu velocidad.',
    icon: 'quiz',
    color: 'text-emerald-500',
    colorHex: '#10b981',
    bg: 'bg-emerald-50',
    difficulty: 'Medio',
    pts: 100,
    duration: '5 min',
    active: true
  },
  {
    key: 'drug_match',
    name: 'Pares Clínicos / Speed Match',
    subtitle: 'Emparejamiento de Términos y Definiciones',
    desc: 'Encuentra las parejas correspondientes entre términos en inglés y su traducción clínica antes de que expire el tiempo.',
    icon: 'medication',
    color: 'text-orange-500',
    colorHex: '#f97316',
    bg: 'bg-orange-50',
    difficulty: 'Medio',
    pts: 80,
    duration: '4 min',
    active: true
  },
  {
    key: 'listening_challenge',
    name: 'Desafío de Escucha Fonética',
    subtitle: 'Audio y Transcripción Clínica',
    desc: 'Escucha la pronunciación en inglés de términos médicos y selecciona o transcribe la palabra correcta.',
    icon: 'hearing',
    color: 'text-purple-500',
    colorHex: '#8b5cf6',
    bg: 'bg-purple-50',
    difficulty: 'Difícil',
    pts: 80,
    duration: '4 min',
    active: true
  }
]
