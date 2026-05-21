import prisma from '../lib/db.js'
import { verifyPassword } from '../lib/password.js'

function buildAuthPayload(user) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role,
  }
}

export async function login(req, res) {
  const email = req.body?.email?.trim().toLowerCase()
  const password = req.body?.password ?? ''

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y password son obligatorios.',
    })
  }

  const user = await prisma.authUser.findUnique({
    where: { email },
  })

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      message: 'Credenciales invalidas.',
    })
  }

  return res.json({
    user: buildAuthPayload(user),
  })
}
