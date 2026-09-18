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
  let program = await prisma.trainingProgram.findFirst()
  if (!program) {
    program = await prisma.trainingProgram.create({
      data: { name: 'Programa de Formación en Enfermería' }
    })
  }

  let competency = await prisma.competency.findFirst({
    where: { program_id: program.id }
  })
  if (!competency) {
    competency = await prisma.competency.create({
      data: {
        code: 'COMP-230101',
        name: 'Comunicación en Salud y Asistencia en Procedimientos Clínicos',
        program_id: program.id
      }
    })
  }

  const OFFICIAL_RAPS = [
    {
      code: 'RAP-01',
      name: 'Intercambiar información personal y social básica en el contexto de atención en salud (Módulo 1 · Fase Análisis)'
    },
    {
      code: 'RAP-02',
      name: 'Describir el estado físico del paciente y el entorno hospitalario en inglés técnico (Módulo 2 · Fase Planeación)'
    },
    {
      code: 'RAP-03',
      name: 'Relatar antecedentes clínicos y realizar entregas de turno estructuradas en pasado simple (Módulo 2 · Fase Planeación)'
    },
    {
      code: 'RAP-04',
      name: 'Explicar procedimientos clínicos rutinarios e interactuar en tiempo presente en el área hospitalaria (Módulo 3 · Fase Ejecución)'
    },
    {
      code: 'RAP-05',
      name: 'Proponer mejoras laborales al supervisor y gestionar listas de verificación clínicas (Módulo 3 · Fase Ejecución)'
    },
    {
      code: 'RAP-06',
      name: 'Brindar recomendaciones médicas de egreso y evaluar resultados de listas de verificación (Módulo 4 · Fase Evaluación)'
    }
  ]

  for (const rap of OFFICIAL_RAPS) {
    const existing = await prisma.learningOutcome.findFirst({
      where: { code: rap.code }
    })
    if (existing) {
      await prisma.learningOutcome.update({
        where: { id: existing.id },
        data: { name: rap.name }
      })
    } else {
      await prisma.learningOutcome.create({
        data: {
          code: rap.code,
          name: rap.name,
          competency_id: competency.id
        }
      })
    }
  }
  console.log('Currículum oficial con los 6 RAPs sincronizado con éxito.')
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
  console.log('Vocabulario clínico de prueba sembrado.')
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
  const DEFAULT_COURSES = [
    {
      slug: 'getting-to-know-other-people',
      title: 'Getting to Know Other People',
      description: 'Módulo 1 — Fase Análisis · RAP 1. Aprende a saludar, presentarte, dar información personal y comunicarte con pacientes extranjeros en inglés.',
      category: 'Básico',
      duration: '8h',
      icon: 'medical_services',
      iconColor: '#006688',
      bg: 'bg-teal-50',
      raps: JSON.stringify(['RAP-01'])
    },
    {
      slug: 'work-life-interaction',
      title: 'Work Life Interaction',
      description: 'Módulo 2 — Fase Planeación · RAP 2 y 3. Caso Mr. Thomas: Pasado simple, adjetivos descriptivos, partes del cuerpo, notas de enfermería y entrega de turno (Handover).',
      category: 'Intermedio',
      duration: '12h',
      icon: 'assignment_ind',
      iconColor: '#4f46e5',
      bg: 'bg-indigo-50',
      raps: JSON.stringify(['RAP-02', 'RAP-03'])
    },
    {
      slug: 'workplace-communication',
      title: 'Workplace Communication',
      description: 'Módulo 3 — Fase Ejecución · RAP 4 y 5. Comunicación con médicos, colegas y visitantes: Presente simple vs. continuo, herramientas médicas, checklist clínico y propuestas de mejora.',
      category: 'Avanzado',
      duration: '14h',
      icon: 'groups',
      iconColor: '#d97706',
      bg: 'bg-amber-50',
      raps: JSON.stringify(['RAP-04', 'RAP-05'])
    },
    {
      slug: 'professional-practice',
      title: 'Professional Practice',
      description: 'Módulo 4 — Fase Evaluación · RAP 6. ¡Mr. Thomas se va a casa! Instrucciones de alta médica, recomendaciones de cuidado en casa con modales y análisis de listas de verificación.',
      category: 'Profesional',
      duration: '10h',
      icon: 'verified_user',
      iconColor: '#059669',
      bg: 'bg-emerald-50',
      raps: JSON.stringify(['RAP-06'])
    }
  ]

  const count = await prisma.course.count()
  if (count === 0) {
    await prisma.course.createMany({ data: DEFAULT_COURSES })
    console.log('Cursos clínicos iniciales (4 módulos de Miro) sembrados con éxito.')
    return
  }

  // Sincronizar los 4 cursos oficiales para asegurar que tengan sus RAPs actualizados
  for (const target of DEFAULT_COURSES) {
    const existing = await prisma.course.findUnique({ where: { slug: target.slug } })
    if (existing) {
      await prisma.course.update({
        where: { id: existing.id },
        data: target
      })
    }
  }

  // Si existen los cursos genéricos antiguos, actualizarlos a los 4 módulos oficiales de Miro
  const oldCourses = await prisma.course.findMany({
    where: {
      slug: {
        in: [
          'fundamentos-enfermeria',
          'cardiologia-clinica',
          'farmacologia-aplicada',
          'comunicacion-salud',
          'urgencias-emergencias',
          'pediatria-neonatologia'
        ]
      }
    },
    orderBy: { id: 'asc' }
  })

  if (oldCourses.length > 0) {
    for (let i = 0; i < DEFAULT_COURSES.length; i++) {
      const target = DEFAULT_COURSES[i]
      if (oldCourses[i]) {
        await prisma.course.update({
          where: { id: oldCourses[i].id },
          data: target
        })
      } else {
        await prisma.course.upsert({
          where: { slug: target.slug },
          update: target,
          create: target
        })
      }
    }
    // Eliminar los cursos sobrantes genéricos (5 y 6) si no tienen progreso
    for (let j = DEFAULT_COURSES.length; j < oldCourses.length; j++) {
      const surplus = oldCourses[j]
      try {
        await prisma.course.delete({ where: { id: surplus.id } })
      } catch {
        // Ignorar si tiene restricciones
      }
    }
    console.log('Cursos sincronizados exitosamente con la estructura oficial de 4 módulos.')
  }
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

export const DEFAULT_ARCADE_GAMES = [
  {
    key: 'warmup_drag_match',
    name: 'Warm-up Drag Match',
    subtitle: 'Calentamiento Clínico Interactivo',
    description: 'Asocia iconos clínicos y saludos médicos arrastrándolos a sus expresiones en inglés correspondientes.',
    template: 'warmup_drag_match',
    icon: 'pan_tool',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    difficulty: 'Fácil',
    pts: 100,
    duration: '3 min',
    active: true,
    config: {
      rounds: [
        {
          id: 1,
          theme: 'Saludos Diarios y Horas del Día (Daily Greetings)',
          items: [
            { id: 'r1-1', label: 'Sol de Mañana', icon: 'wb_sunny', color: 'text-amber-500', match: 'Good morning' },
            { id: 'r1-2', label: 'Sol de Tarde', icon: 'light_mode', color: 'text-orange-500', match: 'Good afternoon' },
            { id: 'r1-3', label: 'Luna y Estrellas', icon: 'bedtime', color: 'text-indigo-400', match: 'Good evening' }
          ]
        },
        {
          id: 2,
          theme: 'Presentaciones y Recepción en Clínica (Introductions)',
          items: [
            { id: 'r2-1', label: 'Tarjeta del Enfermero', icon: 'badge', color: 'text-blue-500', match: 'I am your nurse' },
            { id: 'r2-2', label: 'Apretón de Manos', icon: 'handshake', color: 'text-teal-500', match: 'Nice to meet you' },
            { id: 'r2-3', label: 'Signo de Ayuda', icon: 'help', color: 'text-purple-500', match: 'How can I help you?' }
          ]
        },
        {
          id: 3,
          theme: 'Reporte de Síntomas del Paciente (Symptoms)',
          items: [
            { id: 'r3-1', label: 'Termómetro Elevado', icon: 'thermostat', color: 'text-red-500', match: 'High fever' },
            { id: 'r3-2', label: 'Rayo de Dolor', icon: 'bolt', color: 'text-yellow-500', match: 'Acute pain' },
            { id: 'r3-3', label: 'Espiral de Mareo', icon: 'cyclone', color: 'text-indigo-500', match: 'Dizziness' }
          ]
        },
        {
          id: 4,
          theme: 'Material y Herramientas Clínicas (Clinical Equipment)',
          items: [
            { id: 'r4-1', label: 'Estetoscopio', icon: 'stethoscope', color: 'text-[#006688]', match: 'Stethoscope' },
            { id: 'r4-2', label: 'Jeringa', icon: 'medication', color: 'text-emerald-500', match: 'Syringe' },
            { id: 'r4-3', label: 'Venda Médica', icon: 'healing', color: 'text-pink-500', match: 'Bandage' }
          ]
        }
      ]
    }
  },
  {
    key: 'trivia_medica',
    name: 'Trivia Médica Contrarreloj',
    subtitle: 'Desafío Rápido de Vocabulario y Síntomas',
    description: 'Preguntas de opción múltiple generadas en vivo desde el vocabulario de enfermería para poner a prueba tu velocidad.',
    template: 'trivia_medica',
    icon: 'quiz',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    difficulty: 'Medio',
    pts: 100,
    duration: '5 min',
    active: true,
    config: {
      questions: [
        {
          id: 1,
          question: '¿Cuál es el significado clínico en español de "Blood pressure"?',
          correctAnswer: 'Presión arterial',
          options: ['Presión arterial', 'Frecuencia cardíaca', 'Temperatura corporal', 'Frecuencia respiratoria'],
          category: 'Signos Vitales',
          hint: 'Fuerza ejercida por la sangre contra las paredes arteriales.'
        },
        {
          id: 2,
          question: '¿Cuál es el término en inglés para "Estetoscopio"?',
          correctAnswer: 'Stethoscope',
          options: ['Stethoscope', 'Sphygmomanometer', 'Pulse oximeter', 'Syringe'],
          category: 'Equipos',
          hint: 'Instrumento para auscultar sonidos cardíacos y pulmonares.'
        },
        {
          id: 3,
          question: '¿Cuál es el significado en español de "Heart rate"?',
          correctAnswer: 'Frecuencia cardíaca',
          options: ['Frecuencia cardíaca', 'Presión venosa', 'Saturación de oxígeno', 'Frecuencia respiratoria'],
          category: 'Signos Vitales',
          hint: 'Número de latidos del corazón por minuto.'
        },
        {
          id: 4,
          question: '¿Cuál es el término en inglés para "Tensiómetro"?',
          correctAnswer: 'Sphygmomanometer',
          options: ['Sphygmomanometer', 'Stethoscope', 'Thermometer', 'Wheelchair'],
          category: 'Equipos',
          hint: 'Aparato utilizado para medir la presión sanguínea.'
        },
        {
          id: 5,
          question: '¿Cuál es el significado de "Oxygen saturation"?',
          correctAnswer: 'Saturación de oxígeno',
          options: ['Saturación de oxígeno', 'Capacidad pulmonar', 'Tasa respiratoria', 'Monitoreo de pulso'],
          category: 'Signos Vitales',
          hint: 'Medida de la cantidad de oxígeno en sangre.'
        }
      ]
    }
  },
  {
    key: 'drug_match',
    name: 'Pares Clínicos / Speed Match',
    subtitle: 'Emparejamiento de Términos y Definiciones',
    description: 'Encuentra las parejas correspondientes entre términos en inglés y su traducción clínica antes de que expire el tiempo.',
    template: 'drug_match',
    icon: 'medication',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    difficulty: 'Medio',
    pts: 80,
    duration: '4 min',
    active: true,
    config: {
      pairs: [
        { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial', category: 'Signos' },
        { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio', category: 'Equipos' },
        { id: 3, wordEn: 'Heart rate', wordEs: 'Frecuencia cardíaca', category: 'Signos' },
        { id: 4, wordEn: 'Syringe', wordEs: 'Jeringa', category: 'Equipos' },
        { id: 5, wordEn: 'Painkiller', wordEs: 'Analgésico', category: 'Farmacología' },
        { id: 6, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', category: 'Movilidad' }
      ]
    }
  },
  {
    key: 'listening_challenge',
    name: 'Desafío de Escucha Fonética',
    subtitle: 'Audio y Transcripción Clínica',
    description: 'Escucha la pronunciación en inglés de términos médicos y selecciona o transcribe la palabra correcta.',
    template: 'listening_challenge',
    icon: 'hearing',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    difficulty: 'Difícil',
    pts: 80,
    duration: '4 min',
    active: true,
    config: {
      items: [
        { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial', options: ['Blood pressure', 'Heart rate', 'Body temperature', 'Respiratory rate'] },
        { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio', options: ['Stethoscope', 'Sphygmomanometer', 'Pulse oximeter', 'Wheelchair'] },
        { id: 3, wordEn: 'Pulse oximeter', wordEs: 'Pulsioxímetro', options: ['Pulse oximeter', 'Thermometer', 'Stethoscope', 'Syringe'] },
        { id: 4, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', options: ['Wheelchair', 'Ambulance', 'Emergency bed', 'Crutches'] }
      ]
    }
  }
]

export async function ensureDefaultArcadeGames(): Promise<void> {
  const count = await (prisma as any).arcadeGame.count()
  if (count > 0) return

  for (const game of DEFAULT_ARCADE_GAMES) {
    await (prisma as any).arcadeGame.create({ data: game })
  }
  console.log('Juegos del Arcade clínico inicializados en base de datos con éxito.')
}


