import prisma from './db.js'
import { hashPassword } from './password.js'

const DEFAULT_ADMIN = {
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@nursingacademy.local',
  password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin12345*',
  fullName: process.env.DEFAULT_ADMIN_NAME || 'Administrador General',
  role: process.env.DEFAULT_ADMIN_ROLE || 'admin',
}

const DEFAULT_INSTRUCTOR = {
  email: process.env.DEFAULT_INSTRUCTOR_EMAIL || 'instructor@nursingacademy.local',
  password: process.env.DEFAULT_INSTRUCTOR_PASSWORD || 'Instructor123*',
  fullName: process.env.DEFAULT_INSTRUCTOR_NAME || 'Instructor de Prueba',
  role: process.env.DEFAULT_INSTRUCTOR_ROLE || 'instructor',
}

const DEFAULT_APPRENTICE = {
  documentType: process.env.DEFAULT_APPRENTICE_DOCUMENT_TYPE || 'CC',
  documentNumber: process.env.DEFAULT_APPRENTICE_DOCUMENT || '1234567890',
  password: process.env.DEFAULT_APPRENTICE_PASSWORD || 'Aprendiz123*',
  firstName: process.env.DEFAULT_APPRENTICE_FIRST_NAME || 'Laura',
  middleName: process.env.DEFAULT_APPRENTICE_MIDDLE_NAME || null,
  lastName: process.env.DEFAULT_APPRENTICE_LAST_NAME || 'Gomez',
  secondLastName: process.env.DEFAULT_APPRENTICE_SECOND_LAST_NAME || null,
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

export async function ensureDefaultInstructorUser() {
  const existingUser = await prisma.authUser.findFirst({
    where: { email: DEFAULT_INSTRUCTOR.email },
  })

  if (existingUser) {
    return
  }

  await prisma.authUser.create({
    data: {
      email: DEFAULT_INSTRUCTOR.email,
      passwordHash: hashPassword(DEFAULT_INSTRUCTOR.password),
      fullName: DEFAULT_INSTRUCTOR.fullName,
      role: DEFAULT_INSTRUCTOR.role,
    },
  })

  console.log(`Instructor inicial listo: ${DEFAULT_INSTRUCTOR.email}`)
}

export async function ensureDefaultApprenticeUser() {
  const existingApprentice = await prisma.apprentice.findUnique({
    where: { document_number: DEFAULT_APPRENTICE.documentNumber },
  })

  const passwordHash = hashPassword(DEFAULT_APPRENTICE.password)

  if (existingApprentice) {
    if (!existingApprentice.passwordHash) {
      await prisma.apprentice.update({
        where: { id: existingApprentice.id },
        data: { passwordHash },
      })
    }

    return
  }

  await prisma.apprentice.create({
    data: {
      document_type: DEFAULT_APPRENTICE.documentType,
      document_number: DEFAULT_APPRENTICE.documentNumber,
      passwordHash,
      first_name: DEFAULT_APPRENTICE.firstName,
      middle_name: DEFAULT_APPRENTICE.middleName,
      last_name: DEFAULT_APPRENTICE.lastName,
      second_last_name: DEFAULT_APPRENTICE.secondLastName,
    },
  })

  console.log(`Aprendiz inicial listo: ${DEFAULT_APPRENTICE.documentNumber}`)
}
