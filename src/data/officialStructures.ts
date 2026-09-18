import content from './officialContent.json'

export interface OfficialItem {
  defaultKey: string
  type: string
  title: string
  description?: string
  icon?: string
  color?: string
  required?: boolean
  visible?: boolean
  payload: Record<string, string>
}

type PhaseKey = 'inicio' | 'estudio' | 'practica' | 'evaluacion'
type OfficialStructure = Record<PhaseKey, OfficialItem[]>

const M1_VOCABULARY = ([] as string[])
  .concat((content.M1_ALPHABET as any[]).map(entry => entry[0]))
  .concat((content.M1_NUMBERS as any[]).map(entry => entry[0]))
  .concat((content.M1_GREETINGS as any[]).map(entry => entry[0]))
  .concat((content.M1_CONTACT as any[]).map(entry => entry[0]))

function grammarLines(rows: any[]): string {
  return rows
    .map(row => `${row.subject || ''} | ${row.verb || row.modal || ''} | ${row.complement || row.action || ''}`)
    .join('\n')
}

function chatLines(messages: any[]): string {
  return messages
    .map(message => `${message.speaker || 'Narrador'}: ${message.english || ''} = ${message.spanish || ''}`)
    .join('\n')
}

function examLines(questions: any[]): string {
  return questions
    .map(question => {
      const options = Array.isArray(question.options) ? question.options : []
      const incorrect = options.find(option => option !== question.correct) || ''
      return `${question.question || ''} | ${question.correct || ''} | ${incorrect}`
    })
    .join('\n')
}

function vocabularyWords(list: any[]): string {
  return list.map(entry => (Array.isArray(entry) ? entry[0] : entry.word)).join(', ')
}

const WARMUPS: Record<string, string> = {
  'getting-to-know-other-people': 'Morning = Good morning\nAfternoon = Good afternoon\nNight = Good evening',
  'work-life-interaction': 'Morning Shift (07:00 AM) = Good morning, Nurse\nAfternoon Shift (03:00 PM) = Good afternoon, Team\nNight Shift (11:00 PM) = Good evening, Shift',
  'workplace-communication': 'Check vital signs & blood pressure = Patient in bed (Paciente)\nExplain current procedure politely = Visitor / Family (Familia)\nPropose checklist improvements = Nurse Manager / Doctor (Supervisor)',
  'professional-practice': 'Vital signs stable = Pulse & BP Normal (Check)\nPain resolved = Pain Scale < 2/10 (Check)\nReady for discharge = Medical Orders Signed (Check)'
}

const OBJECTIVES: Record<string, string> = {
  'getting-to-know-other-people': [
    'Saludar y despedirte correctamente en inglés (formal e informal)',
    'Presentarte e introducir a otras personas',
    'Dar y solicitar datos básicos (nombre, edad, nacionalidad)',
    'Deletrear nombres y apellidos (spelling)',
    'Utilizar números (teléfono, edad)',
    'Construir oraciones básicas (Subject + Verb + Complement)',
    'Aplicar estas expresiones con pacientes extranjeros'
  ].join('\n'),
  'work-life-interaction': [
    'Describir el estado físico de los pacientes y lesiones comunes',
    'Detallar el entorno hospitalario (habitaciones, camillas, sala de espera)',
    'Identificar partes del cuerpo humano y anatomía básica',
    'Usar el Pasado Simple para relatar antecedentes clínicos',
    'Usar Adjetivos Descriptivos para el estado actual',
    'Realizar una Entrega de Turno (Shift Handover) en inglés'
  ].join('\n'),
  'workplace-communication': [
    'Explicar procedimientos clínicos de rutina (Present Simple)',
    'Comunicar acciones en progreso en el momento (Present Continuous)',
    'Interactuar cortésmente con familiares y visitantes de pacientes',
    'Proponer mejoras en el flujo de trabajo laboral (We should..., Let\'s...)',
    'Vocabulario técnico de herramientas médicas diarias',
    'Manejar listas de verificación clínica (Nursing Checklist)'
  ].join('\n'),
  'professional-practice': [
    'Dar instrucciones y órdenes de alta médica (Discharge Orders)',
    'Usar verbos modales para consejos de salud (You must, You should)',
    'Reportar estados y resultados finales (Vitals stable, Pain resolved)',
    'Vocabulario ocupacional (Prescription, Painkiller, Follow-up)',
    'Evaluar y cerrar listas de verificación (Nursing Checklist)'
  ].join('\n')
}

const VOICE_TARGETS: Record<string, string> = {
  'getting-to-know-other-people': 'Hello. My name is Laura. I am a nurse at this hospital. Nice to meet you.',
  'work-life-interaction': 'Mr. Thomas fell at the hotel and injured his arm. He is in room 204 and his vital signs are stable.',
  'workplace-communication': 'Excuse me, I am checking Mr. Thomas blood pressure right now.',
  'professional-practice': 'You must take your painkiller every 8 hours with water and rest your arm for 3 days.'
}

export const OFFICIAL_STRUCTURES: Record<string, OfficialStructure> = {
  'getting-to-know-other-people': {
    inicio: [
      { defaultKey: 'm1-video', type: 'video', title: 'Video de bienvenida', icon: 'movie', required: false, payload: { text: 'En este video descubrirás por qué saber presentarte, saludar y pedir información personal en inglés es esencial para tu práctica profesional como enfermero(a).' } },
      { defaultKey: 'm1-objectives', type: 'objectives', title: '¿Qué aprenderás?', icon: 'checklist', required: false, payload: { lines: OBJECTIVES['getting-to-know-other-people'] } },
      { defaultKey: 'm1-warmup', type: 'warmup_drag', title: 'Warm-Up: Greetings', description: 'Arrastra cada tarjeta del día hacia su saludo en inglés', icon: 'sports_esports', payload: { lines: WARMUPS['getting-to-know-other-people'] } }
    ],
    estudio: [
      { defaultKey: 'm1-grammar', type: 'grammar', title: '2.1 Píldora de Gramática', description: 'Persona + Acción + Detalle', icon: 'table_chart', payload: { lines: grammarLines(content.m1GrammarRows as any[]) } },
      { defaultKey: 'm1-vocabulary', type: 'vocabulary', title: '2.2 Laboratorio de Vocabulario', description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: M1_VOCABULARY.join(', ') } },
      { defaultKey: 'm1-chat', type: 'chat', title: '2.3 Conversación: Clinic Chat', description: 'Sarah y David se conocen por primera vez', icon: 'chat', payload: { lines: chatLines(content.m1ChatMessages as any[]) } }
    ],
    practica: [
      { defaultKey: 'm1-profile', type: 'profile', title: 'Perfil personal', description: 'Preséntate con tus datos', icon: 'badge', payload: { target: VOICE_TARGETS['getting-to-know-other-people'] } },
      { defaultKey: 'm1-voice', type: 'voice', title: 'Práctica de voz', icon: 'mic', payload: { target: VOICE_TARGETS['getting-to-know-other-people'] } }
    ],
    evaluacion: [
      { defaultKey: 'm1-exam', type: 'preguntas', title: 'Examen final del módulo', icon: 'quiz', payload: { lines: examLines(content.m1ExamQuestions as any[]) } }
    ]
  },
  'work-life-interaction': {
    inicio: [
      { defaultKey: 'm2-video', type: 'video', title: 'Caso Clínico: Mr. Thomas', icon: 'movie', required: false, payload: { text: 'Acompaña a Mr. Thomas en su hospitalización y aprende a describir su estado físico y el entorno hospitalario en inglés.' } },
      { defaultKey: 'm2-objectives', type: 'objectives', title: '¿Qué aprenderás?', icon: 'checklist', required: false, payload: { lines: OBJECTIVES['work-life-interaction'] } },
      { defaultKey: 'm2-warmup', type: 'warmup_drag', title: 'Warm-Up: Hospital Shifts & Handover', description: 'Arrastra cada turno hacia su saludo de relevo', icon: 'sports_esports', payload: { lines: WARMUPS['work-life-interaction'] } }
    ],
    estudio: [
      { defaultKey: 'm2-grammar', type: 'grammar', title: 'Pasado Simple vs. Adjetivos Descriptivos', icon: 'menu_book', payload: { lines: grammarLines([...(content.m2PastExamples as any[]), ...(content.m2PresentExamples as any[])]) } },
      { defaultKey: 'm2-vocabulary', type: 'vocabulary', title: 'Anatomía y Entorno Hospitalario', description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: vocabularyWords(content.m2VocabList as any[]) } },
      { defaultKey: 'm2-chat', type: 'chat', title: 'Storybook: Entrega de Turno', icon: 'chat', payload: { lines: chatLines(content.m2Dialogue as any[]) } }
    ],
    practica: [
      { defaultKey: 'm2-spelling', type: 'spelling', title: 'Notas de enfermería', description: 'Escucha y repite el vocabulario del reporte', icon: 'spellcheck', payload: { csv: 'fracture, yesterday, waiting room, bandage, swollen' } },
      { defaultKey: 'm2-voice', type: 'voice', title: 'Entrega de turno (Handover)', icon: 'mic', payload: { target: VOICE_TARGETS['work-life-interaction'] } }
    ],
    evaluacion: [
      { defaultKey: 'm2-exam', type: 'preguntas', title: 'Examen final del módulo', icon: 'quiz', payload: { lines: examLines(content.m2ExamQuestions as any[]) } }
    ]
  },
  'workplace-communication': {
    inicio: [
      { defaultKey: 'm3-video', type: 'video', title: 'Video: Tu turno ha comenzado', icon: 'movie', required: false, payload: { text: 'En este módulo aprenderás a comunicarte con médicos, colegas y familiares de pacientes en el entorno hospitalario.' } },
      { defaultKey: 'm3-objectives', type: 'objectives', title: '¿Qué aprenderás?', icon: 'checklist', required: false, payload: { lines: OBJECTIVES['workplace-communication'] } },
      { defaultKey: 'm3-warmup', type: 'warmup_drag', title: 'Warm-Up: Acciones & Roles', description: 'Arrastra cada acción hacia su destinatario', icon: 'sports_esports', payload: { lines: WARMUPS['workplace-communication'] } }
    ],
    estudio: [
      { defaultKey: 'm3-grammar', type: 'grammar', title: 'Presente Simple vs. Presente Continuo', icon: 'menu_book', payload: { lines: grammarLines([...(content.m3RoutineExamples as any[]), ...(content.m3ContinuousExamples as any[])]) } },
      { defaultKey: 'm3-vocabulary', type: 'vocabulary', title: 'Herramientas médicas', description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: vocabularyWords(content.m3VocabList as any[]) } },
      { defaultKey: 'm3-chat', type: 'chat', title: 'Diálogo con visitantes', icon: 'chat', payload: { lines: chatLines(content.m3Dialogue as any[]) } }
    ],
    practica: [
      { defaultKey: 'm3-fillblank', type: 'fillblank', title: 'Nursing Checklist', icon: 'edit_note', payload: { answer: 'checklist' } },
      { defaultKey: 'm3-voice', type: 'voice', title: 'Evidencia oral', icon: 'mic', payload: { target: VOICE_TARGETS['workplace-communication'] } }
    ],
    evaluacion: [
      { defaultKey: 'm3-exam', type: 'preguntas', title: 'Examen final del módulo', icon: 'quiz', payload: { lines: examLines(content.m3ExamQuestions as any[]) } }
    ]
  },
  'professional-practice': {
    inicio: [
      { defaultKey: 'm4-video', type: 'video', title: 'Video: ¡Mr. Thomas se va a casa!', icon: 'movie', required: false, payload: { text: 'Aprende a dar instrucciones de alta médica, recomendaciones de cuidado en casa y a evaluar los resultados del cuidado.' } },
      { defaultKey: 'm4-objectives', type: 'objectives', title: '¿Qué aprenderás?', icon: 'checklist', required: false, payload: { lines: OBJECTIVES['professional-practice'] } },
      { defaultKey: 'm4-warmup', type: 'warmup_drag', title: 'Warm-Up: Discharge States', description: 'Arrastra cada estado hacia el criterio de verificación', icon: 'sports_esports', payload: { lines: WARMUPS['professional-practice'] } }
    ],
    estudio: [
      { defaultKey: 'm4-grammar', type: 'grammar', title: 'Verbos modales y resultados', icon: 'menu_book', payload: { lines: grammarLines([...(content.m4AdviceExamples as any[]), ...(content.m4ResultsExamples as any[])]) } },
      { defaultKey: 'm4-vocabulary', type: 'vocabulary', title: 'Vocabulario de egreso', description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: vocabularyWords(content.m4VocabList as any[]) } },
      { defaultKey: 'm4-chat', type: 'chat', title: 'Diálogo de alta médica', icon: 'chat', payload: { lines: chatLines(content.m4Dialogue as any[]) } }
    ],
    practica: [
      { defaultKey: 'm4-fillblank', type: 'fillblank', title: 'Discharge Summary', icon: 'edit_note', payload: { answer: 'prescription' } },
      { defaultKey: 'm4-voice', type: 'voice', title: 'Recomendaciones de alta', icon: 'mic', payload: { target: VOICE_TARGETS['professional-practice'] } }
    ],
    evaluacion: [
      { defaultKey: 'm4-exam', type: 'preguntas', title: 'Examen final del módulo', icon: 'quiz', payload: { lines: examLines(content.m4ExamQuestions as any[]) } }
    ]
  }
}

export function getOfficialStructure(slug: string | null | undefined): OfficialStructure | null {
  if (!slug) return null
  return OFFICIAL_STRUCTURES[slug] || null
}

export function findOfficialDefault(slug: string | null | undefined, defaultKey: string | null | undefined): OfficialItem | null {
  if (!slug || !defaultKey) return null
  const structure = OFFICIAL_STRUCTURES[slug]
  if (!structure) return null
  for (const phase of ['inicio', 'estudio', 'practica', 'evaluacion'] as PhaseKey[]) {
    const found = structure[phase].find(item => item.defaultKey === defaultKey)
    if (found) return found
  }
  return null
}
