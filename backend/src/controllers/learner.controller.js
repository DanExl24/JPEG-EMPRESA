import prisma from '../lib/db.js'

// Badges catálogo — se otorgan automáticamente al alcanzar XP o eventos
const BADGE_CATALOG = [
  { key: 'primer_paso',       name: 'Primer Paso',        description: 'Completaste tu primera actividad',    iconEmoji: '🎯', xpRequired: 1   },
  { key: 'estudiante_activo', name: 'Estudiante Activo',   description: 'Acumulaste 50 XP',                   iconEmoji: '🔥', xpRequired: 50  },
  { key: 'quiz_master',       name: 'Quiz Master',         description: 'Acumulaste 100 XP',                  iconEmoji: '🧠', xpRequired: 100 },
  { key: 'dedicado',          name: 'Dedicado',            description: 'Acumulaste 250 XP',                  iconEmoji: '⚡', xpRequired: 250 },
  { key: 'enfermero_pro',     name: 'Enfermero Pro',       description: 'Acumulaste 500 XP',                  iconEmoji: '👩‍⚕️', xpRequired: 500 },
  { key: 'experto_clinico',   name: 'Experto Clínico',     description: 'Acumulaste 1000 XP',                 iconEmoji: '🏆', xpRequired: 1000 },
]

// Seed badges table if empty
async function ensureBadges() {
  const count = await prisma.badge.count()
  if (count === 0) {
    await prisma.badge.createMany({ data: BADGE_CATALOG, skipDuplicates: true })
  }
}

// Award badges based on current XP
async function checkAndAwardBadges(userId, currentXp) {
  await ensureBadges()
  const earned = await prisma.userBadge.findMany({ where: { userId }, select: { badgeKey: true } })
  const earnedKeys = new Set(earned.map(b => b.badgeKey))

  const toAward = BADGE_CATALOG.filter(b => currentXp >= b.xpRequired && !earnedKeys.has(b.key))
  if (toAward.length > 0) {
    await prisma.userBadge.createMany({
      data: toAward.map(b => ({ userId, badgeKey: b.key })),
      skipDuplicates: true
    })
  }
  return toAward
}

// GET /api/learner/profile
export async function getProfile(req, res) {
  try {
    const userId = req.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, apellido: true, cedula: true, correo: true, rol: true, xp: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'asc' }
    })

    const submissions = await prisma.activitySubmission.count({ where: { apprenticeId: userId } })
    const passed = await prisma.activitySubmission.count({ where: { apprenticeId: userId, passed: true } })

    return res.json({
      ...user,
      badges: badges.map(ub => ub.badge),
      stats: { totalSubmissions: submissions, passedSubmissions: passed }
    })
  } catch (err) {
    console.error('Error getProfile:', err)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// PUT /api/learner/profile
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id
    const { nombre, apellido } = req.body
    if (!nombre || !apellido) {
      return res.status(400).json({ message: 'Nombre y apellido son requeridos.' })
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { nombre: nombre.trim(), apellido: apellido.trim() },
      select: { id: true, nombre: true, apellido: true, cedula: true, correo: true, rol: true, xp: true }
    })
    return res.json(updated)
  } catch (err) {
    console.error('Error updateProfile:', err)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// GET /api/learner/progress
export async function getProgress(req, res) {
  try {
    const userId = req.user.id

    const allActivities = await prisma.activity.findMany({
      select: { id: true, course: true, points: true }
    })

    const mySubmissions = await prisma.activitySubmission.findMany({
      where: { apprenticeId: userId },
      select: { activityId: true, passed: true, reviewStatus: true }
    })

    const submissionMap = Object.fromEntries(mySubmissions.map(s => [s.activityId, s]))

    // Group by course
    const courseMap = {}
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
    const totalPassed = mySubmissions.filter(s => s.passed).length
    const overallPct = totalActivities > 0 ? Math.round((totalPassed / totalActivities) * 100) : 0

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })

    return res.json({ overallPct, totalActivities, totalPassed, xp: user?.xp || 0, courses })
  } catch (err) {
    console.error('Error getProgress:', err)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// GET /api/learner/leaderboard
export async function getLeaderboard(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { rol: 'APRENDIZ' },
      select: { id: true, nombre: true, apellido: true, xp: true },
      orderBy: { xp: 'desc' },
      take: 10
    })

    const result = await Promise.all(users.map(async (u, idx) => {
      const passed = await prisma.activitySubmission.count({ where: { apprenticeId: u.id, passed: true } })
      return {
        rank: idx + 1,
        id: u.id,
        name: `${u.nombre} ${u.apellido}`,
        initials: `${u.nombre[0] || ''}${u.apellido[0] || ''}`.toUpperCase(),
        points: u.xp,
        activitiesPassed: passed,
      }
    }))

    return res.json(result)
  } catch (err) {
    console.error('Error getLeaderboard:', err)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

// POST /api/learner/award-xp  (interno, usado por activity controller)
export async function awardXp(userId, xpAmount) {
  if (!userId || !xpAmount || xpAmount <= 0) return null
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpAmount } },
    select: { xp: true }
  })
  await checkAndAwardBadges(userId, updated.xp)
  return updated.xp
}
