import prisma from './db.js'
import { hashPassword } from './password.js'

const DEFAULT_ADMIN = {
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@nursingacademy.local',
  password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin12345*',
  nombre: 'Administrador',
  apellido: 'General',
  cedula: 'ADMIN001',
  rol: 'ADMIN',
}

const DEFAULT_INSTRUCTOR = {
  email: process.env.DEFAULT_INSTRUCTOR_EMAIL || 'instructor@nursingacademy.local',
  password: process.env.DEFAULT_INSTRUCTOR_PASSWORD || 'Instructor123*',
  nombre: 'Instructor',
  apellido: 'de Prueba',
  cedula: 'INST001',
  rol: 'INSTRUCTOR',
}

const DEFAULT_APPRENTICE = {
  documentNumber: process.env.DEFAULT_APPRENTICE_DOCUMENT || '1234567890',
  password: process.env.DEFAULT_APPRENTICE_PASSWORD || 'Aprendiz123*',
  nombre: process.env.DEFAULT_APPRENTICE_FIRST_NAME || 'Laura',
  apellido: process.env.DEFAULT_APPRENTICE_LAST_NAME || 'Gomez',
  rol: 'APRENDIZ',
}

export async function ensureDefaultAuthUser() {
  const existingUser = await prisma.user.findFirst({
    where: { correo: DEFAULT_ADMIN.email },
  })

  if (existingUser) return

  await prisma.user.create({
    data: {
      correo: DEFAULT_ADMIN.email,
      cedula: DEFAULT_ADMIN.cedula,
      nombre: DEFAULT_ADMIN.nombre,
      apellido: DEFAULT_ADMIN.apellido,
      passwordHash: hashPassword(DEFAULT_ADMIN.password),
      rol: DEFAULT_ADMIN.rol,
    },
  })

  console.log(`Usuario inicial listo: ${DEFAULT_ADMIN.email}`)
}

export async function ensureDefaultInstructorUser() {
  const existingUser = await prisma.user.findFirst({
    where: { correo: DEFAULT_INSTRUCTOR.email },
  })

  if (existingUser) return

  await prisma.user.create({
    data: {
      correo: DEFAULT_INSTRUCTOR.email,
      cedula: DEFAULT_INSTRUCTOR.cedula,
      nombre: DEFAULT_INSTRUCTOR.nombre,
      apellido: DEFAULT_INSTRUCTOR.apellido,
      passwordHash: hashPassword(DEFAULT_INSTRUCTOR.password),
      rol: DEFAULT_INSTRUCTOR.rol,
    },
  })

  console.log(`Instructor inicial listo: ${DEFAULT_INSTRUCTOR.email}`)
}

export async function ensureDefaultApprenticeUser() {
  const existingUser = await prisma.user.findFirst({
    where: { cedula: DEFAULT_APPRENTICE.documentNumber },
  })

  if (existingUser) return

  await prisma.user.create({
    data: {
      cedula: DEFAULT_APPRENTICE.documentNumber,
      nombre: DEFAULT_APPRENTICE.nombre,
      apellido: DEFAULT_APPRENTICE.apellido,
      passwordHash: hashPassword(DEFAULT_APPRENTICE.password),
      rol: DEFAULT_APPRENTICE.rol,
    },
  })

  console.log(`Aprendiz inicial listo: ${DEFAULT_APPRENTICE.documentNumber}`)
}

const DEFAULT_ACTIVITIES = [
  {
    title: 'Caso Clínico: Insuficiencia Cardíaca',
    course: 'Cuidados Críticos UCI',
    phase: 'Cierre',
    template: 'quiz',
    points: 20,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente! Has respondido correctamente.',
    quizQuestion: '¿Qué mide un esfigmomanómetro?',
    quizCorrect: 'Presión arterial',
    quizIncorrect: 'Ritmo cardíaco',
    hasStudentSubmissions: true
  },
  {
    title: 'Quiz: Farmacología Básica',
    course: 'Farmacología Clínica',
    phase: 'Absorción',
    template: 'quiz',
    points: 15,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente trabajo!',
    quizQuestion: '¿Qué mide un esfigmomanómetro?',
    quizCorrect: 'Presión arterial',
    quizIncorrect: 'Ritmo cardíaco',
    hasStudentSubmissions: true
  },
  {
    title: 'Simulación: RCP Avanzado',
    course: 'Urgencias y Emergencias',
    phase: 'Práctica',
    template: 'pronunciation',
    points: 25,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente! Correcto.',
    pronouncePhrase: 'Check the respiratory rate of the patient',
    hasStudentSubmissions: false
  },
  {
    title: 'Lectura: Psicología del Paciente',
    course: 'Salud Mental y Psiquiatría',
    phase: 'Preparación',
    template: 'match',
    points: 10,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente trabajo!',
    matchTerm: 'Intravenous',
    matchMeaning: 'Administración en vena',
    hasStudentSubmissions: false
  },
  {
    title: 'Evaluación: Cuidados Neonatales',
    course: 'Atención Materno-Infantil',
    phase: 'Cierre',
    template: 'listening',
    points: 30,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente trabajo!',
    listeningPhrase: 'The patient requires immediate attention',
    hasStudentSubmissions: false
  }
]

export async function ensureDefaultActivities() {
  const count = await prisma.activity.count()
  if (count > 0) {
    return
  }

  for (const act of DEFAULT_ACTIVITIES) {
    await prisma.activity.create({
      data: act
    })
  }

  console.log('Actividades de prueba sembradas en la base de datos.')
}

