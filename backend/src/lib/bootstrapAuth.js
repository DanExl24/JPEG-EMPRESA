import prisma from './db.js'
import { hashPassword, verifyPassword } from './password.js'

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
    where: {
      OR: [
        { correo: { equals: DEFAULT_ADMIN.email, mode: 'insensitive' } },
        { cedula: { equals: DEFAULT_ADMIN.cedula, mode: 'insensitive' } }
      ]
    },
  })

  if (existingUser) {
    const isPasswordValid = verifyPassword(DEFAULT_ADMIN.password, existingUser.passwordHash)
    const isLocked = Boolean(existingUser.lockedUntil && new Date(existingUser.lockedUntil) > new Date())

    if (!isPasswordValid || isLocked || existingUser.failedAttempts > 0 || existingUser.rol !== DEFAULT_ADMIN.rol) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          correo: DEFAULT_ADMIN.email,
          cedula: DEFAULT_ADMIN.cedula,
          nombre: DEFAULT_ADMIN.nombre,
          apellido: DEFAULT_ADMIN.apellido,
          passwordHash: hashPassword(DEFAULT_ADMIN.password),
          rol: DEFAULT_ADMIN.rol,
          failedAttempts: 0,
          lockedUntil: null,
        },
      })
      console.log(`Usuario inicial actualizado y restablecido: ${DEFAULT_ADMIN.email}`)
    }
    return
  }

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
    where: {
      OR: [
        { correo: { equals: DEFAULT_INSTRUCTOR.email, mode: 'insensitive' } },
        { cedula: { equals: DEFAULT_INSTRUCTOR.cedula, mode: 'insensitive' } }
      ]
    },
  })

  if (existingUser) {
    const isPasswordValid = verifyPassword(DEFAULT_INSTRUCTOR.password, existingUser.passwordHash)
    const isLocked = Boolean(existingUser.lockedUntil && new Date(existingUser.lockedUntil) > new Date())

    if (!isPasswordValid || isLocked || existingUser.failedAttempts > 0 || existingUser.rol !== DEFAULT_INSTRUCTOR.rol) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          correo: DEFAULT_INSTRUCTOR.email,
          cedula: DEFAULT_INSTRUCTOR.cedula,
          nombre: DEFAULT_INSTRUCTOR.nombre,
          apellido: DEFAULT_INSTRUCTOR.apellido,
          passwordHash: hashPassword(DEFAULT_INSTRUCTOR.password),
          rol: DEFAULT_INSTRUCTOR.rol,
          failedAttempts: 0,
          lockedUntil: null,
        },
      })
      console.log(`Instructor inicial actualizado y restablecido: ${DEFAULT_INSTRUCTOR.email}`)
    }
    return
  }

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
    where: { cedula: { equals: DEFAULT_APPRENTICE.documentNumber, mode: 'insensitive' } },
  })

  if (existingUser) {
    const isPasswordValid = verifyPassword(DEFAULT_APPRENTICE.password, existingUser.passwordHash)
    const isLocked = Boolean(existingUser.lockedUntil && new Date(existingUser.lockedUntil) > new Date())

    if (!isPasswordValid || isLocked || existingUser.failedAttempts > 0 || existingUser.rol !== DEFAULT_APPRENTICE.rol) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          cedula: DEFAULT_APPRENTICE.documentNumber,
          nombre: DEFAULT_APPRENTICE.nombre,
          apellido: DEFAULT_APPRENTICE.apellido,
          passwordHash: hashPassword(DEFAULT_APPRENTICE.password),
          rol: DEFAULT_APPRENTICE.rol,
          failedAttempts: 0,
          lockedUntil: null,
        },
      })
      console.log(`Aprendiz inicial actualizado y restablecido: ${DEFAULT_APPRENTICE.documentNumber}`)
    }
    return
  }

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
    title: 'Greetings and Farewells Match',
    course: 'Fundamentos de Enfermería',
    phase: 'Preparación',
    template: 'match',
    points: 10,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente trabajo! Has emparejado correctamente.',
    matchTerm: 'Good afternoon',
    matchMeaning: 'Buenas tardes',
    hasStudentSubmissions: false
  },
  {
    title: 'Vocabulary Quiz: Personal Info',
    course: 'Fundamentos de Enfermería',
    phase: 'Absorción',
    template: 'quiz',
    points: 10,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Correcto!',
    quizQuestion: 'What is the correct translation of "Last name"?',
    quizCorrect: 'Apellido',
    quizIncorrect: 'Primer nombre',
    hasStudentSubmissions: false
  },
  {
    title: 'Spelling Practice: Medical Assistant',
    course: 'Fundamentos de Enfermería',
    phase: 'Práctica',
    template: 'listening',
    points: 15,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente deletreo!',
    listeningPhrase: 'I am a nurse',
    hasStudentSubmissions: false
  },
  {
    title: 'RAP 1 Practice Challenge',
    course: 'Fundamentos de Enfermería',
    phase: 'Cierre',
    template: 'pronunciation',
    points: 20,
    attemptsLimit: 'Ilimitados',
    successMessage: 'Pronunciación correcta.',
    pronouncePhrase: 'Nice to meet you too',
    hasStudentSubmissions: false
  },
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
  // Clear and re-seed to ensure RAP 1 activities are available
  await prisma.activity.deleteMany()
  for (const act of DEFAULT_ACTIVITIES) {
    await prisma.activity.create({ data: act })
  }
  console.log('Actividades de prueba sembradas.')
}

export async function ensureDefaultCurriculum() {
  const programCount = await prisma.trainingProgram.count()
  if (programCount > 0) return

  // Create default program
  const program = await prisma.trainingProgram.create({
    data: { name: 'Programa de Formación en Enfermería' }
  })

  // Create competency
  const competency = await prisma.competency.create({
    data: {
      code: 'COMP-230101',
      name: 'Asistencia en Procedimientos Clínicos y Hospitalarios',
      program_id: program.id
    }
  })

  // Create RAPs / outcomes
  await prisma.learningOutcome.createMany({
    data: [
      {
        code: 'RAP-01',
        name: 'Administrar medicamentos y tratamientos básicos según prescripción médica.',
        competency_id: competency.id
      },
      {
        code: 'RAP-02',
        name: 'Monitorear y registrar signos vitales del paciente de acuerdo a protocolos clínicos.',
        competency_id: competency.id
      }
    ]
  })
  console.log('Currículum de prueba sembrado.')
}

export async function ensureDefaultVocabulary() {
  const count = await prisma.vocabulary.count()
  if (count > 0) return

  const DEFAULT_VOCABULARY = [
    { wordEn: 'Blood pressure', wordEs: 'Presión arterial', category: 'Signos Vitales', definition: 'Fuerza ejercida por la sangre contra las paredes de los vasos sanguíneos.', example: 'The patient\'s blood pressure is 120/80 mmHg.' },
    { wordEn: 'Heart rate', wordEs: 'Frecuencia cardíaca', category: 'Signos Vitales', definition: 'Número de latidos del corazón por minuto.', example: 'Normal heart rate ranges from 60 to 100 bpm.' },
    { wordEn: 'Stethoscope', wordEs: 'Estetoscopio', category: 'Equipos', definition: 'Instrumento para auscultar sonidos del corazón y pulmones.', example: 'Use the stethoscope to listen to heart sounds.' },
    { wordEn: 'Intravenous line', wordEs: 'Vía intravenosa', category: 'Procedimientos', definition: 'Acceso directo al torrente sanguíneo a través de una vena.', example: 'Insert an IV line before administering medication.' },
  ]

  await prisma.vocabulary.createMany({ data: DEFAULT_VOCABULARY })
  console.log('Vocabulario de prueba sembrado.')
}

export async function ensureDefaultDialogues() {
  const count = await prisma.dialogue.count()
  if (count > 0) return

  const dialogueLines = [
    { speaker: 'Nurse', textEn: 'Hello, I am here to check your blood pressure and heart rate.', textEs: 'Hola, estoy aquí para revisar su presión arterial y frecuencia cardíaca.' },
    { speaker: 'Patient', textEn: 'Okay, nurse. My arm is ready.', textEs: 'Está bien, enfermera. Mi brazo está listo.' },
    { speaker: 'Nurse', textEn: 'Excellent. Your blood pressure is 120/80, which is perfectly normal.', textEs: 'Excelente. Su presión arterial es 120/80, lo cual es perfectamente normal.' }
  ]

  await prisma.dialogue.create({
    data: {
      title: 'Control de Signos Vitales',
      description: 'Conversación estándar entre enfermera y paciente al inicio del turno de control de signos vitales.',
      content: JSON.stringify(dialogueLines)
    }
  })
  console.log('Diálogos de prueba sembrados.')
}


