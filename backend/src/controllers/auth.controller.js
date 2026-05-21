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

function buildApprenticePayload(apprentice) {
  const nameParts = [
    apprentice.first_name,
    apprentice.middle_name,
    apprentice.last_name,
    apprentice.second_last_name,
  ].filter(Boolean)

  return {
    id: apprentice.id,
    name: nameParts.join(' '),
    email: `Documento ${apprentice.document_number}`,
    role: 'aprendiz',
    documentNumber: apprentice.document_number,
  }
}

export async function login(req, res) {
  const rawIdentifier = req.body?.identifier ?? req.body?.email ?? ''
  const identifier = rawIdentifier.trim()
  const password = req.body?.password ?? ''

  if (!identifier || !password) {
    return res.status(400).json({
      message: 'Usuario y password son obligatorios.',
    })
  }

  const email = identifier.toLowerCase()
  const user = await prisma.authUser.findUnique({
    where: { email },
  })

  if (user && verifyPassword(password, user.passwordHash)) {
    return res.json({
      user: buildAuthPayload(user),
    })
  }

  const apprentice = await prisma.apprentice.findUnique({
    where: { document_number: identifier },
  })

  if (apprentice?.passwordHash && verifyPassword(password, apprentice.passwordHash)) {
    return res.json({
      user: buildApprenticePayload(apprentice),
    })
  }

  return res.status(401).json({
    message: 'Credenciales invalidas.',
  })
}
