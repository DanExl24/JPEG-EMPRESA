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
  email: process.env.DEFAULT_APPRENTICE_EMAIL || 'aprendiz@nursingacademy.local',
  password: process.env.DEFAULT_APPRENTICE_PASSWORD || 'Aprendiz123*',
  nombre: process.env.DEFAULT_APPRENTICE_FIRST_NAME || 'Laura',
  apellido: process.env.DEFAULT_APPRENTICE_LAST_NAME || 'Gomez',
  rol: 'APRENDIZ',
}

export async function ensureDefaultAuthUser(): Promise<void> {
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

export async function ensureDefaultInstructorUser(): Promise<void> {
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

export async function ensureDefaultApprenticeUser(): Promise<void> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { cedula: { equals: DEFAULT_APPRENTICE.documentNumber, mode: 'insensitive' } },
        { correo: { equals: DEFAULT_APPRENTICE.email, mode: 'insensitive' } }
      ]
    },
  })

  if (existingUser) {
    const isPasswordValid = verifyPassword(DEFAULT_APPRENTICE.password, existingUser.passwordHash)
    const isLocked = Boolean(existingUser.lockedUntil && new Date(existingUser.lockedUntil) > new Date())

    if (!isPasswordValid || isLocked || existingUser.failedAttempts > 0 || existingUser.rol !== DEFAULT_APPRENTICE.rol || !existingUser.correo) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          cedula: DEFAULT_APPRENTICE.documentNumber,
          correo: DEFAULT_APPRENTICE.email,
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
      correo: DEFAULT_APPRENTICE.email,
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
    hasStudentSubmissions: false
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
    hasStudentSubmissions: false
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

export async function ensureDefaultActivities(): Promise<void> {
  const count = await prisma.activity.count()
  if (count === 0) {
    for (const act of DEFAULT_ACTIVITIES) {
      await prisma.activity.create({ data: act })
    }
    console.log('Actividades de prueba sembradas.')
  }

  // Sincronizar columna has_student_submissions con la realidad de activity_submissions
  try {
    await prisma.$executeRaw`
      UPDATE activities
      SET has_student_submissions = false
      WHERE id NOT IN (
        SELECT DISTINCT activity_id FROM activity_submissions
      ) AND has_student_submissions = true;
    `
  } catch (e) {
    console.error('Error sincronizando has_student_submissions:', e)
  }
}

export async function ensureDefaultCurriculum(): Promise<void> {
  const programCount = await prisma.trainingProgram.count()
  if (programCount > 0) return

  const program = await prisma.trainingProgram.create({
    data: { name: 'Programa de Formación en Enfermería' }
  })

  const competency = await prisma.competency.create({
    data: {
      code: 'COMP-230101',
      name: 'Asistencia en Procedimientos Clínicos y Hospitalarios',
      program_id: program.id
    }
  })

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

export async function ensureDefaultVocabulary(): Promise<void> {
  const DEFAULT_VOCABULARY = [
    { wordEn: 'Blood pressure', wordEs: 'Presión arterial', category: 'Signos Vitales', definition: 'Fuerza ejercida por la sangre contra las paredes de los vasos sanguíneos.', example: 'The patient\'s blood pressure is 120/80 mmHg.' },
    { wordEn: 'Heart rate', wordEs: 'Frecuencia cardíaca', category: 'Signos Vitales', definition: 'Número de latidos del corazón por minuto.', example: 'Normal heart rate ranges from 60 to 100 bpm.' },
    { wordEn: 'Respiratory rate', wordEs: 'Frecuencia respiratoria', category: 'Signos Vitales', definition: 'Número de respiraciones que realiza una persona por minuto.', example: 'Count the patient\'s respiratory rate for 60 seconds.' },
    { wordEn: 'Body temperature', wordEs: 'Temperatura corporal', category: 'Signos Vitales', definition: 'Grado de calor del cuerpo humano medido con termómetro.', example: 'Check body temperature every four hours.' },
    { wordEn: 'Oxygen saturation', wordEs: 'Saturación de oxígeno', category: 'Signos Vitales', definition: 'Medida de la cantidad de oxígeno transportado en la sangre.', example: 'Her oxygen saturation is currently at 98%.' },
    { wordEn: 'Stethoscope', wordEs: 'Estetoscopio', category: 'Equipos', definition: 'Instrumento para auscultar sonidos del corazón y pulmones.', example: 'Use the stethoscope to listen to heart sounds.' },
    { wordEn: 'Pulse oximeter', wordEs: 'Pulsioxímetro', category: 'Equipos', definition: 'Dispositivo no invasivo que mide la saturación de oxígeno en sangre.', example: 'Place the pulse oximeter on the index finger.' },
    { wordEn: 'Sphygmomanometer', wordEs: 'Tensiómetro', category: 'Equipos', definition: 'Aparato utilizado para medir la presión sanguínea.', example: 'Inflate the sphygmomanometer cuff slowly.' },
    { wordEn: 'Syringe', wordEs: 'Jeringa', category: 'Equipos', definition: 'Instrumento para aspirar o inyectar fluidos corporales o medicamentos.', example: 'Use a sterile disposable syringe for the injection.' },
    { wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', category: 'Equipos', definition: 'Silla con ruedas para transportar pacientes con movilidad reducida.', example: 'Assist the patient into the wheelchair safely.' },
    { wordEn: 'Intravenous line', wordEs: 'Vía intravenosa', category: 'Procedimientos', definition: 'Acceso directo al torrente sanguíneo a través de una vena.', example: 'Insert an IV line before administering medication.' },
    { wordEn: 'Wound dressing', wordEs: 'Curación de heridas', category: 'Procedimientos', definition: 'Técnica de limpieza y protección de una lesión cutánea.', example: 'Change the wound dressing using sterile technique.' },
    { wordEn: 'Blood draw', wordEs: 'Toma de muestra de sangre', category: 'Procedimientos', definition: 'Extracción de sangre para análisis de laboratorio clínico.', example: 'Perform the blood draw from the median cubital vein.' },
    { wordEn: 'Catheterization', wordEs: 'Cateterismo / Sondaje', category: 'Procedimientos', definition: 'Inserción de una sonda tubular en una cavidad corporal.', example: 'Urinary catheterization requires strict aseptic technique.' },
    { wordEn: 'Medication administration', wordEs: 'Administración de medicamentos', category: 'Procedimientos', definition: 'Entrega de fármacos siguiendo los 5 correctos de enfermería.', example: 'Double-check the dosage before medication administration.' },
    { wordEn: 'Painkiller', wordEs: 'Analgésico', category: 'Farmacología', definition: 'Medicamento que reduce o alivia el dolor en el paciente.', example: 'Administer the prescribed painkiller every 8 hours.' },
    { wordEn: 'Antibiotic', wordEs: 'Antibiótico', category: 'Farmacología', definition: 'Sustancia que destruye o inhibe el crecimiento de bacterias.', example: 'Complete the entire cycle of the antibiotic.' },
    { wordEn: 'Dosage', wordEs: 'Dosis / Posología', category: 'Farmacología', definition: 'Cantidad de medicamento que se administra de una sola vez.', example: 'Verify the correct dosage in the physician order sheet.' },
    { wordEn: 'Handover', wordEs: 'Entrega de turno', category: 'Comunicación', definition: 'Traspaso estructurado de información clínica entre enfermeros.', example: 'During the handover, mention any changes in vital signs.' },
    { wordEn: 'Discharge summary', wordEs: 'Resumen de alta médica', category: 'Comunicación', definition: 'Documento con instrucciones y recomendaciones de egreso del paciente.', example: 'Review the discharge summary with the patient and family.' },
    { wordEn: 'Triage', wordEs: 'Triaje / Clasificación', category: 'Urgencias', definition: 'Proceso de valoración rápida para priorizar la atención médica.', example: 'The nurse performed the initial triage in the emergency room.' },
    { wordEn: 'Shortness of breath', wordEs: 'Dificultad respiratoria (Disnea)', category: 'Síntomas', definition: 'Sensación subjetiva de falta de aire o respiración laboriosa.', example: 'The patient reports shortness of breath when walking.' },
    { wordEn: 'Dizziness', wordEs: 'Mareo / Vértigo', category: 'Síntomas', definition: 'Sensación de inestabilidad o movimiento involuntario de la cabeza.', example: 'Sit the patient down if they complain of dizziness.' },
    { wordEn: 'Swelling', wordEs: 'Hinchazón / Edema', category: 'Síntomas', definition: 'Aumento de volumen por acumulación anormal de líquido en tejidos.', example: 'Observe the lower limbs for any sign of swelling.' }
  ]

  for (const item of DEFAULT_VOCABULARY) {
    const exists = await prisma.vocabulary.findFirst({
      where: { wordEn: { equals: item.wordEn, mode: 'insensitive' } }
    })
    if (!exists) {
      await prisma.vocabulary.create({ data: item })
    }
  }
  console.log('Vocabulario de prueba sembrado y sincronizado.')
}

export async function ensureDefaultDialogues(): Promise<void> {
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

export async function ensureDefaultCourses(): Promise<void> {
  const count = await prisma.course.count()
  if (count > 0) return

  const DEFAULT_COURSES = [
    { slug: 'fundamentos-enfermeria', title: 'Fundamentos de Enfermería', description: 'Conceptos esenciales, protocolos de atención básica y ética del cuidado del paciente.', category: 'Básico', duration: '4 semanas', icon: 'medical_services', iconColor: '#3b82f6', bg: 'bg-blue-50' },
    { slug: 'cardiologia-clinica', title: 'Cardiología Clínica', description: 'Evaluación cardiovascular, lectura básica de ECG y manejo de fármacos antiarrítmicos.', category: 'Especialidad', duration: '6 semanas', icon: 'cardiology', iconColor: '#ef4444', bg: 'bg-red-50' },
    { slug: 'farmacologia-aplicada', title: 'Farmacología Aplicada', description: 'Cálculo de dosis, vías de administración e interacciones farmacológicas frecuentes.', category: 'Farmacia', duration: '5 semanas', icon: 'prescriptions', iconColor: '#10b981', bg: 'bg-emerald-50' },
    { slug: 'comunicacion-salud', title: 'Comunicación en Salud', description: 'Técnicas de comunicación terapéutica, empatía y trato con pacientes y familiares en inglés.', category: 'Habilidades', duration: '3 semanas', icon: 'forum', iconColor: '#8b5cf6', bg: 'bg-purple-50' },
    { slug: 'urgencias-emergencias', title: 'Urgencias y Emergencias', description: 'Soporte vital básico y avanzado, triage estructurado y manejo de situaciones críticas.', category: 'Crítico', duration: '8 semanas', icon: 'emergency', iconColor: '#f59e0b', bg: 'bg-amber-50' },
    { slug: 'pediatria-neonatologia', title: 'Pediatría y Neonatología', description: 'Cuidados especializados en recién nacidos, lactantes y niños en entorno hospitalario.', category: 'Especialidad', duration: '6 semanas', icon: 'child_care', iconColor: '#ec4899', bg: 'bg-pink-50' }
  ]

  await prisma.course.createMany({ data: DEFAULT_COURSES })
  console.log('Cursos clínicos iniciales sembrados con éxito.')
}

export async function ensureDefaultGlossary(): Promise<void> {
  const count = await prisma.glossaryTerm.count()
  if (count > 0) return

  const DEFAULT_GLOSSARY = [
    { term: 'Anamnesis', area: 'Semiología', definition: 'Información recopilada por el profesional de salud mediante preguntas al paciente durante la entrevista clínica.', related: JSON.stringify(['Historia clínica', 'Entrevista', 'Signos']), example: 'Durante la anamnesis, el paciente refirió alergia a la penicilina.' },
    { term: 'Auscultación', area: 'Semiología', definition: 'Método de exploración física que consiste en escuchar los sonidos generados en el interior de los órganos con el estetoscopio.', related: JSON.stringify(['Estetoscopio', 'Soplos', 'Ruidos respiratorios']), example: 'La auscultación pulmonar no reveló ruidos adventicios.' },
    { term: 'Bradicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca inferior a los valores normales de reposo (menor a 60 latidos por minuto en adultos).', related: JSON.stringify(['Frecuencia cardíaca', 'Taquicardia', 'Arritmia']), example: 'El deportista presentó bradicardia sinusal fisiológica de 48 bpm.' },
    { term: 'Cateterismo', area: 'Procedimientos', definition: 'Inserción de un tubo hueco y flexible (catéter) en una cavidad o vaso sanguíneo con fines diagnósticos o terapéuticos.', related: JSON.stringify(['Vía venosa', 'Sonda', 'Acceso vascular']), example: 'Se realizó cateterismo venoso periférico con catéter 18G.' },
    { term: 'Disnea', area: 'Neumología', definition: 'Sensación subjetiva de dificultad respiratoria o falta de aire experimentada por el paciente.', related: JSON.stringify(['Taquipnea', 'Hipoxia', 'Saturación']), example: 'Paciente ingresa con disnea de medianos esfuerzos y tos seca.' },
    { term: 'Edema', area: 'Fisiopatología', definition: 'Acumulación anormal de líquido en los tejidos del cuerpo, causando hinchazón visible en extremidades.', related: JSON.stringify(['Fóvea', 'Retención de líquidos', 'Insuficiencia']), example: 'Se evidencia edema grado II en miembros inferiores con signo de fóvea positivo.' },
    { term: 'Flebitis', area: 'Enfermería Clínica', definition: 'Inflamación de una vena, frecuentemente asociada al uso prolongado de catéteres intravenosos.', related: JSON.stringify(['Vía intravenosa', 'Eritema', 'Infección']), example: 'Se retiró la vía periférica por signos incipientes de flebitis.' },
    { term: 'Hemostasia', area: 'Hematología', definition: 'Conjunto de mecanismos fisiológicos que detienen los procesos hemorrágicos en vasos sanguíneos lesionados.', related: JSON.stringify(['Coagulación', 'Plaquetas', 'Hemorragia']), example: 'Se aplicó compresión directa para favorecer la hemostasia.' },
    { term: 'Hipoxia', area: 'Cuidados Críticos', definition: 'Estado de deficiencia en el suministro o utilización de oxígeno a nivel tisular o celular.', related: JSON.stringify(['Cianosis', 'Disnea', 'Oxigenoterapia']), example: 'La oximetría de pulso al 88% confirmó hipoxia moderada.' },
    { term: 'Taquicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca superior a 100 latidos por minuto en reposo en adultos.', related: JSON.stringify(['Bradicardia', 'Palpitaciones', 'Arritmia']), example: 'El paciente febril presentó taquicardia sinusal de 115 bpm.' },
    { term: 'Triage', area: 'Emergencias', definition: 'Proceso de clasificación clínica de pacientes según la urgencia y gravedad de su condición médica.', related: JSON.stringify(['Prioridad', 'Urgencia', 'Clasificación']), example: 'El triage clasificó al paciente como prioridad II por dolor torácico agudo.' }
  ]

  await prisma.glossaryTerm.createMany({ data: DEFAULT_GLOSSARY })
  console.log('Glosario clínico sembrado con éxito.')
}

