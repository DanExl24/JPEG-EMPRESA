import prisma from './db.js'
import { hashPassword } from './password.js'

const DEFAULT_ADMIN = {
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@nursingacademy.local',
  password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin12345*',
  fullName: process.env.DEFAULT_ADMIN_NAME || 'Administrador General',
  role: process.env.DEFAULT_ADMIN_ROLE || 'admin',
}

export async function ensureDefaultAuthUser() {
  const existingUser = await prisma.authUser.findFirst({
    where: { email: DEFAULT_ADMIN.email },
  })

  if (existingUser) {
    return
  }

  await prisma.authUser.create({
    data: {
      email: DEFAULT_ADMIN.email,
      passwordHash: hashPassword(DEFAULT_ADMIN.password),
      fullName: DEFAULT_ADMIN.fullName,
      role: DEFAULT_ADMIN.role,
    },
  })

  console.log(`Usuario inicial listo: ${DEFAULT_ADMIN.email}`)
}
