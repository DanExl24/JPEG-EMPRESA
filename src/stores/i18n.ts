import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiBaseUrl } from '../lib/api'

export type SupportedLocale = 'es' | 'en' | 'pt'

export interface LanguageOption {
  code: SupportedLocale
  name: string
  nativeName: string
  flag: string
  tag: string
  desc: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español (Latinoamérica)',
    flag: '🇨🇴',
    tag: 'Predeterminado',
    desc: 'Sistema educativo SENA y terminología clínica en español.'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US / UK)',
    flag: '🇺🇸',
    tag: 'International',
    desc: 'Medical & Clinical Nursing English for healthcare professionals.'
  },
  {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    tag: 'Regional',
    desc: 'Terminologia de saúde, enfermagem e cuidados clínicos.'
  }
]

const STORAGE_KEY = 'nursed.language'

// ================= DICCIONARIO ESTRUCTURADO POR RUTAS (DOT NOTATION) =================
const MESSAGES: Record<SupportedLocale, Record<string, any>> = {
  es: {
    common: {
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      saved: 'Guardado correctamente',
      cancel: 'Cancelar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      edit: 'Editar',
      active: 'Activo',
      inactive: 'Inactivo',
      yes: 'Sí',
      no: 'No',
      actions: 'Acciones',
      loading: 'Cargando...',
      error: 'Error al procesar la solicitud',
      success: 'Operación exitosa',
      search: 'Buscar...',
      filter: 'Filtrar'
    },
    nav: {
      dashboard: 'Dashboard',
      courses: 'Cursos',
      activities: 'Actividades',
      curriculum: 'Gestión Curricular',
      vocabulary: 'Vocabulario',
      glossary: 'Glosario',
      dialogues: 'Diálogos Clínicos',
      games: 'Juegos',
      users: 'Usuarios',
      analytics: 'Analíticas',
      badges: 'Catálogo de Logros',
      progress: 'Mi Progreso',
      ranking: 'Ranking',
      profile: 'Mi Perfil',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      groups: {
        academic: 'Gestión Académica',
        institutional: 'Gestión Institucional',
        teaching: 'Docencia y Cursos',
        tracking: 'Seguimiento',
        learning: 'Aprendizaje',
        community: 'Comunidad',
        account: 'Cuenta',
        system: 'Sistema'
      }
    },
    roles: {
      admin: 'Administrador',
      instructor: 'Instructor',
      aprendiz: 'Aprendiz',
      superadmin: 'Superadministrador',
      clinicalTeam: 'Equipo Docente'
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Personaliza tu experiencia, idioma y notificaciones en la plataforma.',
      tabs: {
        language: 'Idioma y Región',
        notifications: 'Notificaciones',
        security: 'Seguridad y Acceso',
        platform: 'Plataforma'
      },
      language: {
        title: 'Idioma de la Plataforma',
        subtitle: 'Selecciona el idioma principal de navegación e interactividad.',
        current: 'Idioma activo actualmente:',
        bannerTitle: 'Sincronización Multilingüe Activa',
        bannerDesc: 'Al cambiar el idioma, las interfaces de navegación, menús y actividades se adaptarán automáticamente a tu preferencia.',
        savedSuccess: 'Idioma actualizado exitosamente'
      },
      notifications: {
        title: 'Preferencias de Notificación',
        subtitle: 'Configura las alertas y mensajes que deseas recibir.',
        email: 'Notificaciones por Correo',
        emailDesc: 'Recibe resúmenes de actividades, cursos y eventos institucionales.',
        activityAlerts: 'Alertas de Actividades y Logros',
        activityAlertsDesc: 'Avisos inmediatos al desbloquear insignias o recibir calificaciones.',
        rankingAlerts: 'Alertas de Ranking',
        rankingAlertsDesc: 'Notificar cambios significativos en el cuadro de honor estudiantil.',
        savedSuccess: 'Preferencias de notificación actualizadas.'
      },
      security: {
        title: 'Seguridad y Credenciales',
        subtitle: 'Gestiona la protección de tu cuenta y claves de acceso.',
        changePassword: 'Cambiar Contraseña',
        changePasswordDesc: 'Actualiza periódicamente tu clave para mantener tu cuenta protegida.',
        currentPassword: 'Contraseña Actual',
        newPassword: 'Nueva Contraseña',
        confirmPassword: 'Confirmar Nueva Contraseña',
        passwordRequirements: 'Mínimo 8 caracteres, al menos 1 letra mayúscula y 1 carácter especial (@#$%&*!._-).',
        btnSubmit: 'Actualizar Contraseña',
        successMessage: 'Tu contraseña fue modificada correctamente.'
      },
      platform: {
        title: 'Configuración de la Plataforma',
        subtitle: 'Parámetros institucionales exclusivos para Administradores.',
        registration: 'Registro Abierto',
        registrationDesc: 'Permitir que nuevos aprendices se registren libremente en la plataforma.',
        gamification: 'Gamificación Activa',
        gamificationDesc: 'Habilitar puntos XP, cuadros de clasificación (ranking) e insignias.',
        maintenance: 'Modo Mantenimiento',
        maintenanceDesc: 'Limitar el acceso exclusivamente al personal administrativo para soporte.'
      }
    }
  },

  en: {
    common: {
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Saved successfully',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      edit: 'Edit',
      active: 'Active',
      inactive: 'Inactive',
      yes: 'Yes',
      no: 'No',
      actions: 'Actions',
      loading: 'Loading...',
      error: 'Error processing request',
      success: 'Operation successful',
      search: 'Search...',
      filter: 'Filter'
    },
    nav: {
      dashboard: 'Dashboard',
      courses: 'Courses',
      activities: 'Activities',
      curriculum: 'Curriculum Management',
      vocabulary: 'Vocabulary',
      glossary: 'Glossary',
      dialogues: 'Clinical Dialogues',
      games: 'Games',
      users: 'Users',
      analytics: 'Analytics',
      badges: 'Badges Catalog',
      progress: 'My Progress',
      ranking: 'Leaderboard',
      profile: 'My Profile',
      settings: 'Settings',
      logout: 'Log Out',
      groups: {
        academic: 'Academic Management',
        institutional: 'Institutional Management',
        teaching: 'Teaching & Courses',
        tracking: 'Monitoring',
        learning: 'Learning',
        community: 'Community',
        account: 'Account',
        system: 'System'
      }
    },
    roles: {
      admin: 'Administrator',
      instructor: 'Instructor',
      aprendiz: 'Apprentice',
      superadmin: 'Superadministrator',
      clinicalTeam: 'Teaching Faculty'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your experience, language, and notifications across the platform.',
      tabs: {
        language: 'Language & Region',
        notifications: 'Notifications',
        security: 'Security & Access',
        platform: 'Platform'
      },
      language: {
        title: 'Platform Language',
        subtitle: 'Select your preferred language for navigation and interactivity.',
        current: 'Currently active language:',
        bannerTitle: 'Active Multilingual Sync',
        bannerDesc: 'When switching languages, navigation interfaces, menus, and learning activities automatically adapt to your preference.',
        savedSuccess: 'Language updated successfully'
      },
      notifications: {
        title: 'Notification Preferences',
        subtitle: 'Configure alerts and communications you wish to receive.',
        email: 'Email Notifications',
        emailDesc: 'Receive summaries of activities, courses, and institutional updates.',
        activityAlerts: 'Activity & Achievement Alerts',
        activityAlertsDesc: 'Instant alerts upon unlocking badges or receiving activity grades.',
        rankingAlerts: 'Leaderboard Alerts',
        rankingAlertsDesc: 'Notify me of significant rank position changes on the leaderboard.',
        savedSuccess: 'Notification preferences updated.'
      },
      security: {
        title: 'Security & Credentials',
        subtitle: 'Manage your account protection and access credentials.',
        changePassword: 'Change Password',
        changePasswordDesc: 'Regularly update your password to keep your account safe.',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        passwordRequirements: 'Minimum 8 characters, at least 1 uppercase letter and 1 special symbol (@#$%&*!._-).',
        btnSubmit: 'Update Password',
        successMessage: 'Your password was modified successfully.'
      },
      platform: {
        title: 'Platform Configuration',
        subtitle: 'Institutional parameters exclusively for Administrators.',
        registration: 'Open Registration',
        registrationDesc: 'Allow new learners to register freely on the platform.',
        gamification: 'Gamification Active',
        gamificationDesc: 'Enable XP points, leaderboard rankings, and achievement badges.',
        maintenance: 'Maintenance Mode',
        maintenanceDesc: 'Restrict system access exclusively to administrative staff for maintenance.'
      }
    }
  },

  pt: {
    common: {
      save: 'Salvar Alterações',
      saving: 'Salvando...',
      saved: 'Salvo com sucesso',
      cancel: 'Cancelar',
      close: 'Fechar',
      confirm: 'Confirmar',
      edit: 'Editar',
      active: 'Ativo',
      inactive: 'Inativo',
      yes: 'Sim',
      no: 'Não',
      actions: 'Ações',
      loading: 'Carregando...',
      error: 'Erro ao processar solicitação',
      success: 'Operação bem-sucedida',
      search: 'Buscar...',
      filter: 'Filtrar'
    },
    nav: {
      dashboard: 'Painel Principal',
      courses: 'Cursos',
      activities: 'Atividades',
      curriculum: 'Gestão Curricular',
      vocabulary: 'Vocabulário',
      glossary: 'Glossário',
      dialogues: 'Diálogos Clínicos',
      games: 'Jogos',
      users: 'Usuários',
      analytics: 'Analíticas',
      badges: 'Catálogo de Conquistas',
      progress: 'Meu Progresso',
      ranking: 'Classificação',
      profile: 'Meu Perfil',
      settings: 'Configurações',
      logout: 'Sair da Conta',
      groups: {
        academic: 'Gestão Acadêmica',
        institutional: 'Gestão Institucional',
        teaching: 'Docência e Cursos',
        tracking: 'Acompanhamento',
        learning: 'Aprendizagem',
        community: 'Comunidade',
        account: 'Conta',
        system: 'Sistema'
      }
    },
    roles: {
      admin: 'Administrador',
      instructor: 'Instrutor',
      aprendiz: 'Aprendiz',
      superadmin: 'Superadministrador',
      clinicalTeam: 'Equipe Docente'
    },
    settings: {
      title: 'Configurações',
      subtitle: 'Personalize sua experiência, idioma e notificações na plataforma.',
      tabs: {
        language: 'Idioma e Região',
        notifications: 'Notificações',
        security: 'Segurança e Acesso',
        platform: 'Plataforma'
      },
      language: {
        title: 'Idioma da Plataforma',
        subtitle: 'Selecione o idioma principal de navegação e interatividade.',
        current: 'Idioma ativo no momento:',
        bannerTitle: 'Sincronização Multilíngue Ativa',
        bannerDesc: 'Ao alternar o idioma, as interfaces de navegação, menus e atividades adaptar-se-ão automaticamente à sua escolha.',
        savedSuccess: 'Idioma atualizado com sucesso'
      },
      notifications: {
        title: 'Preferências de Notificação',
        subtitle: 'Configure alertas e comunicações que deseja receber.',
        email: 'Notificações por E-mail',
        emailDesc: 'Receba resumos de atividades, cursos e atualizações institucionais.',
        activityAlerts: 'Alertas de Atividades e Conquistas',
        activityAlertsDesc: 'Avisos imediatos ao desbloquear medalhas ou receber notas.',
        rankingAlerts: 'Alertas de Classificação',
        rankingAlertsDesc: 'Notificar mudanças de posição na tabela de honra estudantil.',
        savedSuccess: 'Preferências de notificação atualizadas.'
      },
      security: {
        title: 'Segurança e Acesso',
        subtitle: 'Gerencie a proteção da sua conta e credenciais de acesso.',
        changePassword: 'Alterar Senha',
        changePasswordDesc: 'Atualize periodicamente sua senha para manter sua conta protegida.',
        currentPassword: 'Senha Atual',
        newPassword: 'Nova Senha',
        confirmPassword: 'Confirmar Nova Senha',
        passwordRequirements: 'Mínimo de 8 caracteres, com pelo menos 1 maiúscula e 1 caractere especial (@#$%&*!._-).',
        btnSubmit: 'Atualizar Senha',
        successMessage: 'Sua senha foi alterada com sucesso.'
      },
      platform: {
        title: 'Configuração da Plataforma',
        subtitle: 'Parâmetros institucionais exclusivos para Administradores.',
        registration: 'Registro Aberto',
        registrationDesc: 'Permitir que novos estudantes registrem-se livremente na plataforma.',
        gamification: 'Gamificação Ativa',
        gamificationDesc: 'Habilitar pontos XP, classificação (ranking) e medalhas de conquista.',
        maintenance: 'Modo Manutenção',
        maintenanceDesc: 'Restringir acesso exclusivamente à equipe administrativa para manutenção.'
      }
    }
  }
}

// ================= DICCIONARIO COMPLETO DE TRADUCCIÓN GLOBAL =================
const PHRASE_DICTIONARY: Record<'en' | 'pt', Record<string, string>> = {
  en: {
    // Layout & Navigation
    'Dashboard': 'Dashboard',
    'Cursos': 'Courses',
    'Actividades': 'Activities',
    'Gestión Curricular': 'Curriculum Management',
    'Vocabulario': 'Vocabulary',
    'Glosario': 'Glossary',
    'Diálogos Clínicos': 'Clinical Dialogues',
    'Diálogos': 'Dialogues',
    'Juegos': 'Games',
    'Usuarios': 'Users',
    'Analíticas': 'Analytics',
    'Catálogo de Logros': 'Badges Catalog',
    'Mi Progreso': 'My Progress',
    'Progreso': 'Progress',
    'Ranking': 'Leaderboard',
    'Mi Perfil': 'My Profile',
    'Perfil': 'Profile',
    'Configuración': 'Settings',
    'Cerrar sesión': 'Log Out',
    'Gestión Académica': 'Academic Management',
    'Gestión Institucional': 'Institutional Management',
    'Docencia y Cursos': 'Teaching & Courses',
    'Seguimiento': 'Monitoring',
    'Aprendizaje': 'Learning',
    'Comunidad': 'Community',
    'Cuenta': 'Account',
    'Sistema': 'System',

    // Roles & Badges
    'Administrador': 'Administrator',
    'Instructor': 'Instructor',
    'Aprendiz': 'Apprentice',
    'Superadministrador': 'Superadministrator',
    'Control Maestro': 'Master Control',
    'Equipo Docente': 'Teaching Faculty',
    'Docente / Tutor': 'Faculty / Tutor',
    'Docente e Instructor Clínico': 'Clinical Faculty & Instructor',
    'Administración Total y Curricular': 'Total & Curriculum Administration',

    // Cursos View (CursosView.vue & EstudiarCursoView.vue)
    'Gestiona todos los cursos y estandariza los módulos de aprendizaje.': 'Manage all courses and standardize learning modules.',
    'Explora y continúa tu aprendizaje.': 'Explore and continue your learning.',
    'Nuevo Curso': 'New Course',
    'Crear Nuevo Curso': 'Create New Course',
    'Editar Curso y Módulos': 'Edit Course and Modules',
    'Estructura Pedagógica Obligatoria': 'Mandatory Pedagogical Structure',
    'Título del Curso': 'Course Title',
    'Categoría': 'Category',
    'Duración': 'Duration',
    'Descripción del Curso': 'Course Description',
    'Programa de Formación': 'Training Program',
    'Guardar Módulo': 'Save Module',
    'actividades pedagógicas': 'learning activities',
    'actividad pedagógica': 'learning activity',
    'estudiantes': 'students',
    'estudiante': 'student',
    'Continuar': 'Continue',
    'Editar': 'Edit',
    'Eliminar': 'Delete',
    'Básico': 'Basic',
    'Especialidad': 'Specialty',
    'Farmacia': 'Pharmacy',
    'semanas': 'weeks',
    'semana': 'week',
    'Todos': 'All',
    'Todas': 'All',
    'En Progreso': 'In Progress',
    'Completados': 'Completed',
    'Completadas': 'Completed',
    'Completada': 'Completed',
    'Nuevos': 'New',
    'Volver a Cursos': 'Back to Courses',
    'Progreso del Módulo': 'Module Progress',
    'Editar este curso': 'Edit this course',
    'Eliminar este curso': 'Delete this course',
    '¿Estás seguro de que deseas eliminar este curso?': 'Are you sure you want to delete this course?',

    // Course titles and descriptions
    'Fundamentos de Enfermería': 'Nursing Fundamentals',
    'Conceptos esenciales, protocolos de atención básica y ética del cuidado del paciente.': 'Essential concepts, basic care protocols, and patient care ethics.',
    'Cardiología Clínica': 'Clinical Cardiology',
    'Evaluación cardiovascular, lectura básica de ECG y manejo de fármacos antiarrítmicos.': 'Cardiovascular evaluation, basic ECG interpretation, and antiarrhythmic drug management.',
    'Farmacología Aplicada': 'Applied Pharmacology',
    'Cálculo de dosis, vías de administración e interacciones farmacológicas frecuentes.': 'Dosage calculation, routes of administration, and frequent drug interactions.',
    'Pediatría y Neonatología': 'Pediatrics & Neonatology',
    'Cuidados intensivos pediátricos, signos vitales y escalas de dolor en neonatos.': 'Pediatric intensive care, vital signs, and neonatal pain scales.',
    'Urgencias y Triage': 'Emergency & Triage',
    'Protocolo START, estabilización rápida y manejo de trauma prehospitalario.': 'START protocol, rapid stabilization, and pre-hospital trauma management.',
    'Salud Mental y Psiquiatría': 'Mental Health & Psychiatry',
    'Contención verbal, desescalada de crisis y protocolos de seguridad en psiquiatría.': 'Verbal de-escalation, crisis containment, and psychiatric safety protocols.',

    // Vocabulario View (VocabularioView.vue)
    'Vocabulario de Enfermería': 'Nursing Vocabulary',
    'Términos clave en inglés y español para la práctica clínica': 'Key terms in English and Spanish for clinical practice',
    'Agregar Término': 'Add Term',
    'Nuevo Término': 'New Term',
    'Editar Término': 'Edit Term',
    'Guardar Término': 'Save Term',
    'Buscar término...': 'Search term...',
    'Cargando vocabulario...': 'Loading vocabulary...',
    'Comunicación': 'Communication',
    'Equipos': 'Equipment',
    'Farmacología': 'Pharmacology',
    'Procedimientos': 'Procedures',
    'Signos Vitales': 'Vital Signs',
    'Síntomas': 'Symptoms',
    'Urgencias': 'Emergencies',
    'Anatomía': 'Anatomy',
    'General': 'General',
    'Toma de muestra de sangre': 'Blood sample collection',
    'Presión arterial': 'Blood pressure',
    'Temperatura corporal': 'Body temperature',
    'Cateterismo / Sondaje': 'Catheterization / Probing',
    'Resumen de alta médica': 'Discharge summary',
    'Antibiótico': 'Antibiotic',
    'Extracción de sangre para análisis de laboratorio clínico.': 'Blood extraction for clinical laboratory analysis.',
    'Fuerza ejercida por la sangre contra las paredes de los vasos sanguíneos.': 'Force exerted by circulating blood against the walls of blood vessels.',
    'Grado de calor del cuerpo humano medido con termómetro.': 'Degree of heat of the human body measured with a thermometer.',
    'Inserción de una sonda tubular en una cavidad corporal.': 'Insertion of a tubular catheter into a body cavity.',
    'Documento con instrucciones y recomendaciones de egreso del paciente.': 'Document with discharge instructions and recommendations for the patient.',
    'Sustancia que destruye o inhibe el crecimiento de bacterias.': 'Substance that destroys or inhibits bacterial growth.',
    'Escuchar pronunciación en inglés': 'Listen to English pronunciation',
    'Escuchar ejemplo en inglés': 'Listen to English example',
    'Editar este término': 'Edit this term',
    'Eliminar este término': 'Delete this term',
    'Término en Inglés': 'English Term',
    'Término en Español': 'Spanish Term',
    'Definición en Español': 'Definition in Spanish',
    'Ejemplo de Uso en Inglés': 'Usage Example in English',

    // Glosario View (GlosarioView.vue)
    'Glosario Clínico': 'Clinical Glossary',
    'Definiciones detalladas de conceptos clínicos y médicos': 'Detailed definitions of clinical and medical concepts',
    'Buscar concepto...': 'Search concept...',

    // Diálogos Clínicos (DialogosView.vue)
    'Escucha y practica conversaciones estándar de enfermería en inglés técnico.': 'Listen and practice standard nursing conversations in technical English.',
    'Crear Diálogo': 'Create Dialogue',
    'Cargando diálogos...': 'Loading dialogues...',

    // Gestión Curricular (CurriculumView.vue)
    'Administra programas de formación, competencias y resultados de aprendizaje (RAPs).': 'Manage training programs, competencies, and learning outcomes (RAPs).',
    'Programas de Formación': 'Training Programs',
    'Competencias': 'Competencies',
    'Resultados de Aprendizaje': 'Learning Outcomes',
    'Nuevo Programa': 'New Program',
    'Nueva Competencia': 'New Competency',
    'Nuevo RAP': 'New RAP',
    'Cargando datos curriculares...': 'Loading curriculum data...',
    'Código': 'Code',
    'Denominación': 'Title / Denomination',
    'Versión': 'Version',

    // Actividades View (ActividadesView.vue & ActividadDetalleView.vue)
    'Actividades Educativas': 'Educational Activities',
    'Crea, configura y edita actividades basadas en plantillas interactivas.': 'Create, configure, and edit activities based on interactive templates.',
    'Tus tareas y actividades pendientes.': 'Your pending tasks and activities.',
    'Nueva Actividad': 'New Activity',
    'Todas las Fases': 'All Phases',
    'Preparación': 'Preparation',
    'Absorción': 'Absorption',
    'Práctica': 'Practice',
    'Cierre': 'Closing',
    'Pendientes': 'Pending',
    'Pendiente': 'Pending',
    'En Calificación': 'Under Grading',
    'Calificadas': 'Graded',
    'Fase: ': 'Phase: ',
    'Fase:': 'Phase:',
    'Buscar actividad...': 'Search activity...',
    'Ver Detalle': 'View Details',
    'Realizar Actividad': 'Start Activity',
    'Fecha Límite': 'Due Date',
    'Sin fecha límite': 'No due date',
    'Intentos permitidos': 'Allowed attempts',
    'Ilimitados': 'Unlimited',
    'Obligatorio': 'Mandatory',
    'Opcional': 'Optional',
    'Fase 1: Preparación (Warm-up)': 'Phase 1: Warm-up',
    'Fase 2: Absorción (Teoría y Vocabulario)': 'Phase 2: Absorption (Theory & Vocabulary)',
    'Fase 3: Práctica Activa (Ejercicios y Voz)': 'Phase 3: Active Practice (Exercises & Voice)',
    'Fase 4: Evaluación Final (Examen)': 'Phase 4: Final Evaluation (Exam)',
    'Mensaje/Texto de Bienvenida': 'Welcome Message/Text',
    'Palabras desordenadas para el Calentamiento': 'Scrambled Words for Warm-up',
    'Explicación Gramatical': 'Grammar Explanation',
    'Vocabulario Técnico de Escucha': 'Technical Listening Vocabulary',
    'Texto para Rellenar Blanco': 'Fill-in-the-blank Text',
    'Oración de Grabación de Voz': 'Voice Recording Sentence',

    // Dashboard View
    'Bienvenido': 'Welcome',
    'Sesión iniciada como': 'Signed in as',
    'Aquí tienes un resumen de tu actividad reciente.': 'Here is an overview of your recent activity.',
    'Panel de Control del Instructor': 'Instructor Control Panel',
    'Docencia y Seguimiento Clínico': 'Teaching & Clinical Monitoring',
    'Control Institucional': 'Institutional Control',
    'Formación en Enfermería': 'Nursing Training',
    'Monitorea el progreso pedagógico, califica retos de los aprendices y gestiona tus módulos formativos.': 'Monitor pedagogical progress, grade apprentice challenges, and manage your training modules.',
    'Supervisa métricas globales, usuarios y configuración institucional de la plataforma.': 'Supervise global metrics, users, and institutional platform settings.',
    'Aquí tienes un resumen de tu avance de aprendizaje y actividades recientes.': 'Here is a summary of your learning progress and recent activities.',
    'Gestionar Cursos': 'Manage Courses',
    'Bandeja Tareas': 'Submissions Tray',
    'Cursos en Docencia': 'Teaching Courses',
    'Aprendices a Cargo': 'Assigned Learners',
    'Entregas por Calificar': 'Submissions to Grade',
    'Términos Clínicos': 'Clinical Terms',
    'Arcade y Retos': 'Arcade & Challenges',
    'Entregas Recientes de Aprendices': 'Recent Apprentice Submissions',
    'Talleres, quizzes y ejercicios de pronunciación en espera de retroalimentación.': 'Workshops, quizzes, and pronunciation exercises awaiting feedback.',
    'Ver todas en Actividades': 'View all in Activities',
    'Por Calificar': 'To Grade',
    'Evaluar': 'Grade / Evaluate',
    '¡Bandeja al día!': 'Tray up to date!',
    'No hay entregas pendientes de calificación en este momento.': 'No submissions pending grading at this time.',
    'Actividad Reciente del Aula Clínica': 'Recent Clinical Classroom Activity',
    'Eventos en vivo': 'Live events',
    'Cursos Activos': 'Active Courses',
    'Total Usuarios': 'Total Users',
    'Programas SENA': 'SENA Programs',
    'Banco Actividades': 'Activities Bank',
    'Tasa de Aprobación': 'Approval Rate',
    'Entregas Registradas': 'Registered Submissions',
    'Fichas / Cohortes': 'Cohorts / Groups',
    'Mis Logros': 'My Badges',
    'Mi Ranking': 'My Ranking',
    'Mis Entregas': 'My Submissions',
    'Puntos XP': 'XP Points',
    'Juegos y Retos': 'Games & Challenges',
    'Accesos Rápidos': 'Quick Actions',
    'Actividad Reciente': 'Recent Activity',

    // Profile View
    'Consulta y actualiza tu información personal, credenciales de acceso y logros en la plataforma.': 'View and update your personal information, credentials, and achievements.',
    'Información Personal': 'Personal Information',
    'Tus datos identificatorios dentro de la institución': 'Your identification data within the institution',
    'Cuenta activa': 'Active Account',
    'Modo edición activo': 'Edit Mode Active',
    'Nombres': 'First Name',
    'Apellidos': 'Last Name',
    'Correo Electrónico': 'Email Address',
    'Documento de Identidad': 'Identity Document',
    'Rol de Usuario': 'User Role',
    'Privilegios del Sistema': 'System Privileges',
    'Editar Datos': 'Edit Data',
    'Cancelar Edición': 'Cancel Edit',
    'Guardar Cambios': 'Save Changes',
    'Cambiar Contraseña': 'Change Password',
    'Resumen de Aprendizaje': 'Learning Summary',
    'Resumen Administrativo': 'Administrative Summary',
    'Resumen Docente': 'Teaching Summary',
    'Control y auditoría global': 'Global control and audit',
    'Supervisión de Cursos': 'Course Supervision',
    'Módulos, actividades y usuarios': 'Modules, activities, and users',
    'Revisión y retroalimentación': 'Review and feedback',
    'Catálogo de Gamificación': 'Gamification Catalog',
    'Administración de insignias y XP': 'Badges and XP administration',
    'Visualización de logros activos': 'Active badges overview',
    'Cuadro de Honor (Ranking)': 'Leaderboard (Ranking)',
    'Plan Curricular': 'Curriculum Plan',
    'Puntos de experiencia acumulados': 'Accumulated experience points',
    'Actividades aprobadas': 'Approved activities',
    'Insignias conquistadas': 'Badges earned',
    'Aún no tienes insignias': 'You do not have any badges yet',
    'Suma XP superando retos clínicos para desbloquearlas.': 'Earn XP by completing clinical challenges to unlock them.',
    'No hay eventos registrados recientemente.': 'No events recorded recently.',
    'Miembro desde': 'Member since',
    'Ver todos': 'View all',
    'Institucional': 'Institutional',
    'Verificado': 'Verified',
    'Tareas evaluadas': 'Evaluated tasks',

    // Users View (UsuariosView.vue)
    'Gestión de Usuarios': 'User Management',
    'Administrar cuentas, roles y accesos al sistema': 'Manage accounts, roles, and system access',
    'Administra los accesos, roles, credenciales y estado de todos los miembros de la plataforma.': 'Manage access, roles, credentials, and status of all platform members.',
    'Crear Usuario': 'Create User',
    'Nuevo Usuario': 'New User',
    'Refrescar': 'Refresh',
    'Todos los Roles': 'All Roles',
    'Administradores': 'Administrators',
    'Instructores': 'Instructors',
    'Aprendices': 'Learners',
    'Buscar usuario por nombre, correo o documento...': 'Search user by name, email or ID...',
    'Buscar por nombre, cédula o correo...': 'Search by name, ID or email...',
    'Nombre Completo': 'Full Name',
    'Documento': 'Document / ID',
    'Estado': 'Status',
    'Acciones': 'Actions',
    'Activo': 'Active',
    'Inactivo': 'Inactive',
    'Activos': 'Active',
    'Inactivos': 'Inactive',
    'Generar Contraseña': 'Generate Password',
    'Editar Usuario': 'Edit User',
    'Eliminar Usuario': 'Delete User',
    'Restablecer Contraseña': 'Reset Password',
    'Reenviar Credenciales': 'Resend Credentials',
    '¿Estás seguro de que deseas eliminar a este usuario?': 'Are you sure you want to delete this user?',

    // Games View (JuegosView.vue)
    'Arcade Lúdico & Gamificación': 'Arcade Games & Gamification',
    'Centro de Control Docente': 'Teaching Control Center',
    'Gestiona el catálogo de minijuegos del arcade, activa/pausa mecánicas, supervisa estadísticas reales y audita partidas de los aprendices.': 'Manage arcade games catalog, enable/pause mechanics, monitor real statistics, and audit learner game sessions.',
    'Crear Juego': 'Create Game',
    'Volver al Arcade': 'Back to Arcade',
    'Modo Prueba Docente': 'Instructor Test Mode',
    'Partida Oficial': 'Official Game',
    'Salir al Panel': 'Exit to Dashboard',
    'Premio:': 'Reward:',
    'Siguiente Ronda': 'Next Round',
    'Finalizar Calentamiento': 'Finish Warm-up',
    '¡Calentamiento Superado!': 'Warm-up Completed!',
    'Jugar de Nuevo': 'Play Again',

    // Leaderboard, Progress & Analytics
    'Tabla de líderes. ¡Completa actividades y sube posiciones!': 'Leaderboard. Complete activities and climb ranks!',
    'Top 3 Líderes': 'Top 3 Leaders',
    'Tabla General — Top 10': 'General Table — Top 10',
    'Ordenado por XP total': 'Sorted by total XP',
    'Aún no hay aprendices con actividades completadas.': 'No learners with completed activities yet.',
    'Insignias y Reconocimientos': 'Badges & Recognitions',
    'Crear Insignia': 'Create Badge',
    'Editar Insignia': 'Edit Badge',
    'Eliminar Insignia': 'Delete Badge',
    'XP Requerido': 'XP Required',
    'Bloqueado': 'Locked',
    'Desbloqueado': 'Unlocked',
    'Progreso General': 'Overall Progress',
    'Progreso por Curso': 'Progress by Course',
    'Calculando tu progreso...': 'Calculating your progress...',
    'Visualiza tu avance real en actividades y cursos.': 'View your real progress across activities and courses.',
    'Matriculaciones por Mes': 'Enrollments per Month',
    'Métricas globales de la plataforma.': 'Global platform metrics.',
    'Analítica de tus cursos y estudiantes.': 'Analytics for your courses and students.',
    'Exportar': 'Export',
    'vs mes anterior': 'vs previous month',

    // Settings View
    'Personaliza tu experiencia, idioma y notificaciones en la plataforma.': 'Customize your experience, language, and notifications across the platform.',
    'Idioma y Región': 'Language & Region',
    'Notificaciones': 'Notifications',
    'Seguridad y Acceso': 'Security & Access',
    'Plataforma': 'Platform',
    'Idioma de la Plataforma': 'Platform Language',
    'Selecciona el idioma principal de navegación e interactividad.': 'Select your preferred language for navigation and interactivity.',
    'Idioma activo actualmente:': 'Currently active language:',
    'Sincronización Multilingüe Activa': 'Active Multilingual Sync',
    'Al cambiar el idioma, las interfaces de navegación, menús y actividades se adaptarán automáticamente a tu preferencia.': 'When switching languages, navigation interfaces, menus, and learning activities automatically adapt to your preference.',
    'Preferencias de Notificación': 'Notification Preferences',
    'Configura las alertas y mensajes que deseas recibir.': 'Configure alerts and communications you wish to receive.',
    'Notificaciones por Correo': 'Email Notifications',
    'Recibe resúmenes de actividades, cursos y eventos institucionales.': 'Receive summaries of activities, courses, and institutional updates.',
    'Alertas de Actividades y Logros': 'Activity & Achievement Alerts',
    'Avisos inmediatos al desbloquear insignias o recibir calificaciones.': 'Instant alerts upon unlocking badges or receiving activity grades.',
    'Alertas de Ranking': 'Leaderboard Alerts',
    'Notificar cambios significativos en el cuadro de honor estudiantil.': 'Notify me of significant rank position changes on the leaderboard.',
    'Seguridad y Credenciales': 'Security & Credentials',
    'Gestiona la protección de tu cuenta y claves de acceso.': 'Manage your account protection and access credentials.',
    'Actualiza periódicamente tu clave para mantener tu cuenta protegida.': 'Regularly update your password to keep your account safe.',
    'Contraseña Actual': 'Current Password',
    'Nueva Contraseña': 'New Password',
    'Confirmar Nueva Contraseña': 'Confirm New Password',
    'Actualizar Contraseña': 'Update Password',
    'Registro Abierto': 'Open Registration',
    'Permitir que nuevos aprendices se registren libremente en la plataforma.': 'Allow new learners to register freely on the platform.',
    'Gamificación Activa': 'Gamification Active',
    'Habilitar puntos XP, cuadros de clasificación (ranking) e insignias.': 'Enable XP points, leaderboard rankings, and achievement badges.',
    'Modo Mantenimiento': 'Maintenance Mode',
    'Limitar el acceso exclusivamente al personal administrativo para soporte.': 'Restrict system access exclusively to administrative staff for maintenance.',

    // Common Actions
    'Cancelar': 'Cancel',
    'Guardar': 'Save',
    'Confirmar': 'Confirm',
    'Cargando...': 'Loading...',
    'Cerrar': 'Close',
    'Volver': 'Back',
    'Siguiente': 'Next',
    'Anterior': 'Previous',
    'Buscar': 'Search',
    'Filtrar': 'Filter',
    'Ver': 'View',
    'Detalles': 'Details',
    'Puntos': 'Points',
    'Fecha': 'Date',
    'Reintentar': 'Retry',

    // Analytics View
    'Métricas institucionales y globales de la plataforma.': 'Global institutional platform metrics.',
    'Analítica pedagógica de tus cursos y aprendices a cargo.': 'Pedagogical analytics of your courses and apprentices.',
    'Exportar Informe': 'Export Report',
    'Descargando reporte en formato CSV...': 'Downloading report in CSV format...',
    'Usuarios Registrados': 'Registered Users',
    'Aprendices Evaluados': 'Assessed Apprentices',
    'Por Calificar / En Riesgo': 'To Grade / At Risk',
    'Retos Disponibles': 'Available Challenges',
    'Tasa Finalización': 'Completion Rate',
    'Entregas Totales': 'Total Submissions',
    'Crecimiento de Nuevos Registros por Mes': 'New Registrations Growth by Month',
    'Entregas y Evaluaciones por Mes': 'Submissions and Evaluations by Month',
    'Tasa de Finalización por Curso': 'Completion Rate by Course',
    'Tasa de Finalización por Curso Clínico': 'Completion Rate by Clinical Course',
    'Rendimiento por Actividad / Reto': 'Performance by Activity / Challenge',
    'Curso': 'Course',
    'Matriculados': 'Enrolled',
    'Completos': 'Completed',
    'Tasa': 'Rate',
    'Distribución por Programas SENA': 'Distribution by SENA Programs',
    'Programa Formativo': 'Training Program',
    'Aprendices Matriculados': 'Enrolled Apprentices',
    'Actividad Formativa': 'Learning Activity',
    'Entregas': 'Submissions',
    'Aprobadas': 'Passed',
    'Tasa de Éxito': 'Success Rate',
    'Aprendices en Seguimiento y Alerta Temprana': 'Apprentices in Monitoring & Early Warning',
    'Correo Institucional': 'Institutional Email',
    'Entregas Realizadas': 'Completed Submissions',
    'Reprobadas': 'Failed',
    'Rendimiento': 'Performance',
    'Última Actividad': 'Last Activity',
    'Riesgo Alto': 'High Risk',
    'Al Día': 'On Track',
    'Sin aprendices en estado de alerta actualmente.': 'No apprentices currently at risk.',
    'Evaluando': 'Evaluating'
  },

  pt: {
    // Layout & Navigation
    'Dashboard': 'Painel Principal',
    'Cursos': 'Cursos',
    'Actividades': 'Atividades',
    'Gestión Curricular': 'Gestão Curricular',
    'Vocabulario': 'Vocabulário',
    'Glosario': 'Glossário',
    'Diálogos Clínicos': 'Diálogos Clínicos',
    'Diálogos': 'Diálogos',
    'Juegos': 'Jogos',
    'Usuarios': 'Usuários',
    'Analíticas': 'Analíticas',
    'Catálogo de Logros': 'Catálogo de Conquistas',
    'Mi Progreso': 'Meu Progresso',
    'Progreso': 'Progresso',
    'Ranking': 'Classificação',
    'Mi Perfil': 'Meu Perfil',
    'Perfil': 'Perfil',
    'Configuración': 'Configurações',
    'Cerrar sesión': 'Sair da Conta',
    'Gestión Académica': 'Gestão Acadêmica',
    'Gestión Institucional': 'Gestão Institucional',
    'Docencia y Cursos': 'Docência e Cursos',
    'Seguimiento': 'Acompanhamento',
    'Aprendizaje': 'Aprendizagem',
    'Comunidad': 'Comunidade',
    'Cuenta': 'Conta',
    'Sistema': 'Sistema',

    // Roles & Badges
    'Administrador': 'Administrador',
    'Instructor': 'Instrutor',
    'Aprendiz': 'Aprendiz',
    'Superadministrador': 'Superadministrador',
    'Control Maestro': 'Controle Mestre',
    'Equipo Docente': 'Equipe Docente',
    'Docente / Tutor': 'Docente / Tutor',
    'Docente e Instructor Clínico': 'Docente e Instrutor Clínico',
    'Administración Total y Curricular': 'Administração Total e Curricular',

    // Cursos View
    'Gestiona todos los cursos y estandariza los módulos de aprendizaje.': 'Gerencie todos os cursos e padronize os módulos de aprendizagem.',
    'Explora y continúa tu aprendizaje.': 'Explore e continue sua aprendizagem.',
    'Nuevo Curso': 'Novo Curso',
    'Crear Nuevo Curso': 'Criar Novo Curso',
    'Editar Curso y Módulos': 'Editar Curso e Módulos',
    'Estructura Pedagógica Obligatoria': 'Estrutura Pedagógica Obrigatória',
    'Título del Curso': 'Título do Curso',
    'Categoría': 'Categoria',
    'Duración': 'Duração',
    'Descripción del Curso': 'Descrição do Curso',
    'Programa de Formación': 'Programa de Formação',
    'Guardar Módulo': 'Salvar Módulo',
    'actividades pedagógicas': 'atividades pedagógicas',
    'actividad pedagógica': 'atividade pedagógica',
    'estudiantes': 'estudantes',
    'estudiante': 'estudante',
    'Continuar': 'Continuar',
    'Editar': 'Editar',
    'Eliminar': 'Excluir',
    'Básico': 'Básico',
    'Especialidad': 'Especialidade',
    'Farmacia': 'Farmácia',
    'semanas': 'semanas',
    'semana': 'semana',
    'Todos': 'Todos',
    'Todas': 'Todas',
    'En Progreso': 'Em Progresso',
    'Completados': 'Concluídos',
    'Completadas': 'Concluídas',
    'Completada': 'Concluída',
    'Nuevos': 'Novos',
    'Volver a Cursos': 'Voltar aos Cursos',
    'Progreso del Módulo': 'Progresso do Módulo',
    'Editar este curso': 'Editar este curso',
    'Eliminar este curso': 'Excluir este curso',
    '¿Estás seguro de que deseas eliminar este curso?': 'Tem certeza de que deseja excluir este curso?',

    // Course titles and descriptions
    'Fundamentos de Enfermería': 'Fundamentos de Enfermagem',
    'Conceptos esenciales, protocolos de atención básica y ética del cuidado del paciente.': 'Conceitos essenciais, protocolos de cuidados básicos e ética no atendimento ao paciente.',
    'Cardiología Clínica': 'Cardiologia Clínica',
    'Evaluación cardiovascular, lectura básica de ECG y manejo de fármacos antiarrítmicos.': 'Avaliação cardiovascular, leitura básica de ECG e manejo de medicamentos antiarrítmicos.',
    'Farmacología Aplicada': 'Farmacologia Aplicada',
    'Cálculo de dosis, vías de administración e interacciones farmacológicas frecuentes.': 'Cálculo de dosagem, vias de administração e interações medicamentosas frequentes.',
    'Pediatría y Neonatología': 'Pediatria e Neonatologia',
    'Cuidados intensivos pediátricos, signos vitales y escalas de dolor en neonatos.': 'Cuidados intensivos pediátricos, sinais vitais e escalas de dor em neonatos.',
    'Urgencias y Triage': 'Urgência e Triagem',
    'Protocolo START, estabilización rápida y manejo de trauma prehospitalario.': 'Protocolo START, estabilização rápida e manejo de trauma pré-hospitalar.',
    'Salud Mental y Psiquiatría': 'Saúde Mental e Psiquiatria',
    'Contención verbal, desescalada de crisis y protocolos de seguridad en psiquiatría.': 'Contenção verbal, desescalada de crises e protocolos de segurança em psiquiatria.',

    // Vocabulario View
    'Vocabulario de Enfermería': 'Vocabulário de Enfermagem',
    'Términos clave en inglés y español para la práctica clínica': 'Termos-chave em inglês e espanhol para a prática clínica',
    'Agregar Término': 'Adicionar Termo',
    'Nuevo Término': 'Novo Termo',
    'Editar Término': 'Editar Termo',
    'Guardar Término': 'Salvar Termo',
    'Buscar término...': 'Buscar termo...',
    'Cargando vocabulario...': 'Carregando vocabulário...',
    'Comunicación': 'Comunicação',
    'Equipos': 'Equipamentos',
    'Farmacología': 'Farmacologia',
    'Procedimientos': 'Procedimentos',
    'Signos Vitales': 'Sinais Vitais',
    'Síntomas': 'Sintomas',
    'Urgencias': 'Urgências',
    'Anatomía': 'Anatomia',
    'General': 'Geral',
    'Toma de muestra de sangre': 'Coleta de amostra de sangue',
    'Presión arterial': 'Pressão arterial',
    'Temperatura corporal': 'Temperatura corporal',
    'Cateterismo / Sondaje': 'Cateterismo / Sondagem',
    'Resumen de alta médica': 'Resumo de alta médica',
    'Antibiótico': 'Antibiótico',
    'Extracción de sangre para análisis de laboratorio clínico.': 'Coleta de sangue para análise de laboratório clínico.',
    'Fuerza ejercida por la sangre contra las paredes de los vasos sanguíneos.': 'Força exercida pelo sangue contra as paredes dos vasos sanguíneos.',
    'Grado de calor del cuerpo humano medido con termómetro.': 'Grau de calor do corpo humano medido com termômetro.',
    'Inserción de una sonda tubular en una cavidad corporal.': 'Inserção de uma sonda tubular em uma cavidade corporal.',
    'Documento con instrucciones y recomendaciones de egreso del paciente.': 'Documento com instruções e recomendações de alta do paciente.',
    'Sustancia que destruye o inhibe el crecimiento de bacterias.': 'Substância que destrói ou inibe o crescimento de bactérias.',
    'Escuchar pronunciación en inglés': 'Ouvir pronúncia em inglês',
    'Escuchar ejemplo en inglés': 'Ouvir exemplo em inglês',
    'Editar este término': 'Editar este termo',
    'Eliminar este término': 'Excluir este termo',
    'Término en Inglés': 'Termo em Inglês',
    'Término en Español': 'Termo em Espanhol',
    'Definición en Español': 'Definição em Espanhol',
    'Ejemplo de Uso en Inglés': 'Exemplo de Uso em Inglês',

    // Glosario View
    'Glosario Clínico': 'Glossário Clínico',
    'Definiciones detalladas de conceptos clínicos y médicos': 'Definições detalhadas de conceitos clínicos e médicos',
    'Buscar concepto...': 'Buscar conceito...',

    // Diálogos Clínicos
    'Escucha y practica conversaciones estándar de enfermería en inglés técnico.': 'Ouça e pratique conversas padrão de enfermagem em inglês técnico.',
    'Crear Diálogo': 'Criar Diálogo',
    'Cargando diálogos...': 'Carregando diálogos...',

    // Gestión Curricular
    'Administra programas de formación, competencias y resultados de aprendizaje (RAPs).': 'Gerencie programas de formação, competências e resultados de aprendizagem (RAPs).',
    'Programas de Formación': 'Programas de Formação',
    'Competencias': 'Competências',
    'Resultados de Aprendizaje': 'Resultados de Aprendizagem',
    'Nuevo Programa': 'Novo Programa',
    'Nueva Competencia': 'Nova Competência',
    'Nuevo RAP': 'Novo RAP',
    'Cargando datos curriculares...': 'Carregando dados curriculares...',
    'Código': 'Código',
    'Denominación': 'Denominação',
    'Versión': 'Versão',

    // Actividades View
    'Actividades Educativas': 'Atividades Educativas',
    'Crea, configura y edita actividades basadas en plantillas interactivas.': 'Crie, configure e edite atividades baseadas em modelos interativos.',
    'Tus tareas y actividades pendientes.': 'Suas tarefas e atividades pendentes.',
    'Nueva Actividad': 'Nova Atividade',
    'Todas las Fases': 'Todas as Fases',
    'Preparación': 'Preparação',
    'Absorción': 'Absorção',
    'Práctica': 'Prática',
    'Cierre': 'Encerramento',
    'Pendientes': 'Pendentes',
    'Pendiente': 'Pendente',
    'En Calificación': 'Em Avaliação',
    'Calificadas': 'Avaliadas',
    'Fase: ': 'Fase: ',
    'Fase:': 'Fase:',
    'Buscar actividad...': 'Buscar atividade...',
    'Ver Detalle': 'Ver Detalhes',
    'Realizar Actividad': 'Realizar Atividade',
    'Fecha Límite': 'Data Limite',
    'Sin fecha límite': 'Sem data limite',
    'Intentos permitidos': 'Tentativas permitidas',
    'Ilimitados': 'Ilimitadas',
    'Obligatorio': 'Obrigatório',
    'Opcional': 'Opcional',
    'Fase 1: Preparación (Warm-up)': 'Fase 1: Preparação (Warm-up)',
    'Fase 2: Absorción (Teoría y Vocabulario)': 'Fase 2: Absorção (Teoria e Vocabulário)',
    'Fase 3: Práctica Activa (Ejercicios y Voz)': 'Fase 3: Prática Ativa (Exercícios e Voz)',
    'Fase 4: Evaluación Final (Examen)': 'Fase 4: Avaliação Final (Exame)',
    'Mensaje/Texto de Bienvenida': 'Mensagem/Texto de Boas-vindas',
    'Palabras desordenadas para el Calentamiento': 'Palavras desordenadas para o Aquecimento',
    'Explicación Gramatical': 'Explicação Gramatical',
    'Vocabulario Técnico de Escucha': 'Vocabulário Técnico de Escuta',
    'Texto para Rellenar Blanco': 'Texto para Preencher Espaço',
    'Oración de Grabación de Voz': 'Frase de Gravação de Voz',

    // Dashboard View
    'Bienvenido': 'Bem-vindo',
    'Sesión iniciada como': 'Sessão iniciada como',
    'Aquí tienes un resumen de tu actividad reciente.': 'Aqui está um resumo da sua atividade recente.',
    'Panel de Control del Instructor': 'Painel de Controle do Instrutor',
    'Docencia y Seguimiento Clínico': 'Docência e Acompanhamento Clínico',
    'Control Institucional': 'Controle Institucional',
    'Formación en Enfermería': 'Formação em Enfermagem',
    'Monitorea el progreso pedagógico, califica retos de los aprendices y gestiona tus módulos formativos.': 'Monitore o progresso pedagógico, avalie desafios dos aprendizes e gerencie seus módulos formativos.',
    'Supervisa métricas globales, usuarios y configuración institucional de la plataforma.': 'Supervisione métricas globais, usuários e configurações institucionais da plataforma.',
    'Aquí tienes un resumen de tu avance de aprendizaje y actividades recientes.': 'Aqui está um resumo do seu progresso de aprendizagem e atividades recentes.',
    'Gestionar Cursos': 'Gerenciar Cursos',
    'Bandeja Tareas': 'Bandeja de Tarefas',
    'Cursos en Docencia': 'Cursos em Docência',
    'Aprendices a Cargo': 'Aprendizes sob Supervisão',
    'Entregas por Calificar': 'Entregas para Avaliar',
    'Términos Clínicos': 'Termos Clínicos',
    'Arcade y Retos': 'Arcade e Desafios',
    'Entregas Recientes de Aprendices': 'Entregas Recentes dos Aprendizes',
    'Talleres, quizzes y ejercicios de pronunciación en espera de retroalimentación.': 'Workshops, questionários e exercícios de pronúncia aguardando avaliação.',
    'Ver todas en Actividades': 'Ver todas em Atividades',
    'Por Calificar': 'Por Avaliar',
    'Evaluar': 'Avaliar',
    '¡Bandeja al día!': 'Bandeja em dia!',
    'No hay entregas pendientes de calificación en este momento.': 'Nenhuma entrega pendente de avaliação no momento.',
    'Actividad Reciente del Aula Clínica': 'Atividade Recente da Sala Clínica',
    'Eventos en vivo': 'Eventos ao vivo',
    'Cursos Activos': 'Cursos Ativos',
    'Total Usuarios': 'Total de Usuários',
    'Programas SENA': 'Programas SENA',
    'Banco Actividades': 'Banco de Atividades',
    'Tasa de Aprobación': 'Taxa de Aprovação',
    'Entregas Registradas': 'Entregas Registradas',
    'Fichas / Cohortes': 'Turmas / Coortes',
    'Mis Logros': 'Minhas Conquistas',
    'Mi Ranking': 'Minha Classificação',
    'Mis Entregas': 'Minhas Entregas',
    'Puntos XP': 'Pontos XP',
    'Juegos y Retos': 'Jogos e Desafios',
    'Accesos Rápidos': 'Ações Rápidas',
    'Actividad Reciente': 'Atividade Recente',

    // Profile View
    'Consulta y actualiza tu información personal, credenciales de acceso y logros en la plataforma.': 'Consulte e atualize suas informações pessoais, credenciais e conquistas.',
    'Información Personal': 'Informações Pessoais',
    'Tus datos identificatorios dentro de la institución': 'Seus dados de identificação na instituição',
    'Cuenta activa': 'Conta Ativa',
    'Modo edición activo': 'Modo de Edição Ativo',
    'Nombres': 'Primeiro Nome',
    'Apellidos': 'Sobrenome',
    'Correo Electrónico': 'E-mail',
    'Documento de Identidad': 'Documento de Identidade',
    'Rol de Usuario': 'Função do Usuário',
    'Privilegios del Sistema': 'Privilégios do Sistema',
    'Editar Datos': 'Editar Dados',
    'Cancelar Edición': 'Cancelar Edição',
    'Guardar Cambios': 'Salvar Alterações',
    'Cambiar Contraseña': 'Alterar Senha',
    'Resumen de Aprendizaje': 'Resumo de Aprendizagem',
    'Resumen Administrativo': 'Resumo Administrativo',
    'Resumen Docente': 'Resumo Docente',
    'Control y auditoría global': 'Controle e auditoria global',
    'Supervisión de Cursos': 'Supervisão de Cursos',
    'Módulos, actividades y usuarios': 'Módulos, atividades e usuários',
    'Revisión y retroalimentación': 'Revisão e feedback',
    'Catálogo de Gamificación': 'Catálogo de Gamificação',
    'Administración de insignias y XP': 'Administração de medalhas e XP',
    'Visualización de logros activos': 'Visualização de conquistas ativas',
    'Cuadro de Honor (Ranking)': 'Quadro de Honra (Classificação)',
    'Plan Curricular': 'Plano Curricular',
    'Puntos de experiencia acumulados': 'Pontos de experiência acumulados',
    'Actividades aprobadas': 'Atividades aprovadas',
    'Insignias conquistadas': 'Medalhas conquistadas',
    'Aún no tienes insignias': 'Você ainda não possui medalhas',
    'Suma XP superando retos clínicos para desbloquearlas.': 'Ganhe XP completando desafios clínicos para desbloqueá-las.',
    'No hay eventos registrados recientemente.': 'Nenhum evento registrado recentemente.',
    'Miembro desde': 'Membro desde',
    'Ver todos': 'Ver todos',
    'Institucional': 'Institucional',
    'Verificado': 'Verificado',
    'Tareas evaluadas': 'Tarefas avaliadas',

    // Users View
    'Gestión de Usuarios': 'Gestão de Usuários',
    'Administrar cuentas, roles y accesos al sistema': 'Gerenciar contas, funções e acessos ao sistema',
    'Administra los accesos, roles, credenciales y estado de todos los miembros de la plataforma.': 'Gerencie acessos, funções, credenciais e status de todos os membros da plataforma.',
    'Crear Usuario': 'Criar Usuário',
    'Nuevo Usuario': 'Novo Usuário',
    'Refrescar': 'Atualizar',
    'Todos los Roles': 'Todas as Funções',
    'Administradores': 'Administradores',
    'Instructores': 'Instrutores',
    'Aprendices': 'Aprendizes',
    'Buscar usuario por nombre, correo o documento...': 'Buscar usuário por nome, e-mail ou documento...',
    'Buscar por nombre, cédula o correo...': 'Buscar por nome, documento ou e-mail...',
    'Nombre Completo': 'Nome Completo',
    'Documento': 'Documento',
    'Estado': 'Status',
    'Acciones': 'Ações',
    'Activo': 'Ativo',
    'Inactivo': 'Inativo',
    'Activos': 'Ativos',
    'Inactivos': 'Inativos',
    'Generar Contraseña': 'Gerar Senha',
    'Editar Usuario': 'Editar Usuário',
    'Eliminar Usuario': 'Excluir Usuário',
    'Restablecer Contraseña': 'Redefinir Senha',
    'Reenviar Credenciales': 'Reenviar Credenciais',
    '¿Estás seguro de que deseas eliminar a este usuario?': 'Tem certeza de que deseja excluir este usuário?',

    // Games View
    'Arcade Lúdico & Gamificación': 'Jogos Arcade & Gamificação',
    'Centro de Control Docente': 'Centro de Controle Docente',
    'Gestiona el catálogo de minijuegos del arcade, activa/pausa mecánicas, supervisa estadísticas reales y audita partidas de los aprendices.': 'Gerencie o catálogo de jogos do arcade, ative/pause mecânicas, monitore estatísticas reais e audite sessões dos aprendizes.',
    'Crear Juego': 'Criar Jogo',
    'Volver al Arcade': 'Voltar ao Arcade',
    'Modo Prueba Docente': 'Modo de Teste do Instrutor',
    'Partida Oficial': 'Partida Oficial',
    'Salir al Panel': 'Sair para o Painel',
    'Premio:': 'Prêmio:',
    'Siguiente Ronda': 'Próxima Rodada',
    'Finalizar Calentamiento': 'Finalizar Aquecimento',
    '¡Calentamiento Superado!': 'Aquecimento Concluído!',
    'Jugar de Nuevo': 'Jogar Novamente',

    // Leaderboard, Progress & Analytics
    'Tabla de líderes. ¡Completa actividades y sube posiciones!': 'Tabela de líderes. Complete atividades e suba posições!',
    'Top 3 Líderes': 'Top 3 Líderes',
    'Tabla General — Top 10': 'Tabela Geral — Top 10',
    'Ordenado por XP total': 'Ordenado por XP total',
    'Aún no hay aprendices con actividades completadas.': 'Ainda não há estudantes com atividades concluídas.',
    'Insignias y Reconocimientos': 'Medalhas e Reconhecimentos',
    'Crear Insignia': 'Criar Medalha',
    'Editar Insignia': 'Editar Medalha',
    'Eliminar Insignia': 'Excluir Medalha',
    'XP Requerido': 'XP Necessário',
    'Bloqueado': 'Bloqueado',
    'Desbloqueado': 'Desbloqueado',
    'Progreso General': 'Progresso Geral',
    'Progreso por Curso': 'Progresso por Curso',
    'Calculando tu progreso...': 'Calculando seu progresso...',
    'Visualiza tu avance real en actividades y cursos.': 'Veja seu progresso real em atividades e cursos.',
    'Matriculaciones por Mes': 'Matrículas por Mês',
    'Métricas globales de la plataforma.': 'Métricas globais da plataforma.',
    'Analítica de tus cursos y estudiantes.': 'Análise de seus cursos e estudantes.',
    'Exportar': 'Exportar',
    'vs mes anterior': 'vs mês anterior',

    // Settings View
    'Personaliza tu experiencia, idioma y notificaciones en la plataforma.': 'Personalize sua experiência, idioma e notificações na plataforma.',
    'Idioma y Región': 'Idioma e Região',
    'Notificaciones': 'Notificações',
    'Seguridad y Acceso': 'Segurança e Acesso',
    'Plataforma': 'Plataforma',
    'Idioma de la Plataforma': 'Idioma da Plataforma',
    'Selecciona el idioma principal de navegación e interactividad.': 'Selecione o idioma principal de navegação e interatividade.',
    'Idioma activo actualmente:': 'Idioma ativo no momento:',
    'Sincronización Multilingüe Activa': 'Sincronização Multilíngue Ativa',
    'Al cambiar el idioma, las interfaces de navegación, menús y actividades se adaptarán automáticamente a tu preferencia.': 'Ao alternar o idioma, as interfaces de navegação, menus e atividades adaptar-se-ão automaticamente à sua escolha.',
    'Preferencias de Notificación': 'Preferências de Notificação',
    'Configura las alertas y mensajes que deseas recibir.': 'Configure alertas e comunicações que deseja receber.',
    'Notificaciones por Correo': 'Notificações por E-mail',
    'Recibe resúmenes de actividades, cursos y eventos institucionales.': 'Receba resumos de atividades, cursos e atualizações institucionais.',
    'Alertas de Actividades y Logros': 'Alertas de Atividades e Conquistas',
    'Avisos inmediatos al desbloquear insignias o recibir calificaciones.': 'Avisos imediatos ao desbloquear medalhas ou receber notas.',
    'Alertas de Ranking': 'Alertas de Classificação',
    'Notificar cambios significativos en el cuadro de honor estudiantil.': 'Notificar mudanças de posição na tabela de honra estudantil.',
    'Seguridad y Credenciales': 'Segurança e Credenciais',
    'Gestiona la protección de tu cuenta y claves de acceso.': 'Gerencie a proteção da sua conta e credenciais de acesso.',
    'Actualiza periódicamente tu clave para mantener tu cuenta protegida.': 'Atualize periodicamente sua senha para manter sua conta protegida.',
    'Contraseña Actual': 'Senha Atual',
    'Nueva Contraseña': 'Nova Senha',
    'Confirmar Nueva Contraseña': 'Confirmar Nova Senha',
    'Actualizar Contraseña': 'Atualizar Senha',
    'Registro Abierto': 'Registro Aberto',
    'Permitir que nuevos aprendices se registren libremente en la plataforma.': 'Permitir que novos estudantes registrem-se livremente na plataforma.',
    'Gamificación Activa': 'Gamificação Ativa',
    'Habilitar puntos XP, cuadros de clasificación (ranking) e insignias.': 'Habilitar pontos XP, classificação (ranking) e medalhas de conquista.',
    'Modo Mantenimiento': 'Modo Manutenção',
    'Limitar el acceso exclusivamente al personal administrativo para soporte.': 'Restringir acesso exclusivamente à equipe administrativa para manutenção.',

    // Common Actions
    'Cancelar': 'Cancelar',
    'Guardar': 'Salvar',
    'Confirmar': 'Confirmar',
    'Cargando...': 'Carregando...',
    'Cerrar': 'Fechar',
    'Volver': 'Voltar',
    'Siguiente': 'Próximo',
    'Anterior': 'Anterior',
    'Buscar': 'Buscar',
    'Filtrar': 'Filtrar',
    'Ver': 'Ver',
    'Detalles': 'Detalhes',
    'Puntos': 'Pontos',
    'Fecha': 'Data',
    'Reintentar': 'Tentar Novamente',

    // Analytics View
    'Métricas institucionales y globales de la plataforma.': 'Métricas institucionais e globais da plataforma.',
    'Analítica pedagógica de tus cursos y aprendices a cargo.': 'Analítica pedagógica dos seus cursos e aprendizes.',
    'Exportar Informe': 'Exportar Relatório',
    'Descargando reporte en formato CSV...': 'Baixando relatório em formato CSV...',
    'Usuarios Registrados': 'Usuários Registrados',
    'Aprendices Evaluados': 'Aprendizes Avaliados',
    'Por Calificar / En Riesgo': 'Para Avaliar / Em Risco',
    'Retos Disponibles': 'Desafios Disponíveis',
    'Tasa Finalización': 'Taxa de Conclusão',
    'Entregas Totales': 'Total de Entregas',
    'Crecimiento de Nuevos Registros por Mes': 'Crescimento de Novos Registros por Mês',
    'Entregas y Evaluaciones por Mes': 'Entregas e Avaliações por Mês',
    'Tasa de Finalización por Curso': 'Taxa de Conclusão por Curso',
    'Tasa de Finalización por Curso Clínico': 'Taxa de Conclusão por Curso Clínico',
    'Rendimiento por Actividad / Reto': 'Desempenho por Atividade / Desafio',
    'Curso': 'Curso',
    'Matriculados': 'Matriculados',
    'Completos': 'Concluídos',
    'Tasa': 'Taxa',
    'Distribución por Programas SENA': 'Distribuição por Programas SENA',
    'Programa Formativo': 'Programa Formativo',
    'Aprendices Matriculados': 'Aprendizes Matriculados',
    'Actividad Formativa': 'Atividade Formativa',
    'Entregas': 'Entregas',
    'Aprobadas': 'Aprovadas',
    'Tasa de Éxito': 'Taxa de Sucesso',
    'Aprendices en Seguimiento y Alerta Temprana': 'Aprendizes em Acompanhamento e Alerta Precoce',
    'Correo Institucional': 'E-mail Institucional',
    'Entregas Realizadas': 'Entregas Realizadas',
    'Reprobadas': 'Reprovadas',
    'Rendimiento': 'Desempenho',
    'Última Actividad': 'Última Atividade',
    'Riesgo Alto': 'Alto Risco',
    'Al Día': 'Em Dia',
    'Sin aprendices en estado de alerta actualmente.': 'Nenhum aprendiz em estado de alerta atualmente.',
    'Evaluando': 'Avaliando'
  }
}

// Pre-sorted phrases by length descending to match longest phrases first (avoids sub-word collision)
const SORTED_PHRASES: Record<'en' | 'pt', Array<{ es: string; target: string }>> = {
  en: Object.entries(PHRASE_DICTIONARY.en)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([es, target]) => ({ es, target })),
  pt: Object.entries(PHRASE_DICTIONARY.pt)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([es, target]) => ({ es, target }))
}

function getFromMessages(loc: SupportedLocale, path: string): string | undefined {
  if (!MESSAGES[loc]) return undefined
  const parts = path.split('.')
  let curr: any = MESSAGES[loc]
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part]
    } else {
      return undefined
    }
  }
  return typeof curr === 'string' ? curr : undefined
}

function translateText(text: string, targetLocale: SupportedLocale): string {
  if (targetLocale === 'es' || !text) return text
  const trimmed = text.trim()
  if (!trimmed) return text

  // 0. Dot notation lookup
  const dotVal = getFromMessages(targetLocale, trimmed)
  if (dotVal) {
    return text.replace(trimmed, dotVal)
  }

  // 1. Direct exact match in dictionary
  const exact = PHRASE_DICTIONARY[targetLocale]?.[trimmed]
  if (exact) {
    return text.replace(trimmed, exact)
  }

  // 2. Case-insensitive exact match
  const lowerTrimmed = trimmed.toLowerCase()
  const matchEntry = Object.entries(PHRASE_DICTIONARY[targetLocale] || {}).find(
    ([k]) => k.toLowerCase() === lowerTrimmed
  )
  if (matchEntry) {
    return text.replace(trimmed, matchEntry[1])
  }

  // 3. Multi-phrase replacement with sorted phrases (longest matches first)
  let result = text
  const phrases = SORTED_PHRASES[targetLocale] || []
  for (const { es, target } of phrases) {
    if (result.includes(es)) {
      result = result.split(es).join(target)
    }
  }

  return result
}

function getStoredLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['es', 'en', 'pt'].includes(stored)) {
      return stored as SupportedLocale
    }
  } catch {}
  return 'es'
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<SupportedLocale>(getStoredLocale())
  const apiBaseUrl = getApiBaseUrl()
  let observer: MutationObserver | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const currentLanguageOption = computed(() => {
    return LANGUAGE_OPTIONS.find(opt => opt.code === locale.value) || LANGUAGE_OPTIONS[0]
  })

  function getToken(): string | null {
    try {
      const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
      return stored ? JSON.parse(stored)?.token : null
    } catch {
      return null
    }
  }

  function setLocale(newLocale: SupportedLocale, persistToBackend = true): void {
    if (!['es', 'en', 'pt'].includes(newLocale)) return
    locale.value = newLocale

    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
      document.documentElement.lang = newLocale
    } catch (err) {
      console.warn('Could not persist language to localStorage:', err)
    }

    // Apply translation to all rendered views immediately
    translateDOM()

    if (persistToBackend) {
      syncPreferenceToBackend(newLocale)
    }
  }

  async function syncPreferenceToBackend(newLocale: SupportedLocale): Promise<void> {
    const token = getToken()
    if (!token) return

    try {
      await fetch(`${apiBaseUrl}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ language: newLocale })
      })
    } catch (err) {
      console.warn('Failed to sync language preference to backend:', err)
    }
  }

  function t(pathOrPhrase: string, params?: Record<string, string | number>): string {
    if (!pathOrPhrase) return ''

    // 1. Try dot notation in current locale
    let val = getFromMessages(locale.value, pathOrPhrase)

    // 2. If not found in current locale dot notation, try phrase dictionary in current locale
    if (!val && locale.value !== 'es') {
      val = PHRASE_DICTIONARY[locale.value]?.[pathOrPhrase]
    }

    // 3. Fallback to dot notation in Spanish
    if (!val) {
      val = getFromMessages('es', pathOrPhrase)
    }

    // 4. Fallback to raw string
    if (!val) {
      val = pathOrPhrase
    }

    if (params) {
      val = Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }, val)
    }

    return val
  }

  // ================= DOM AUTO-TRANSLATION ENGINE =================
  function translateNode(node: Node, targetLocale: SupportedLocale) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parentTag = (node.parentElement?.tagName || '').toLowerCase()
      if (['script', 'style', 'code', 'pre', 'textarea'].includes(parentTag)) return
      if (node.parentElement?.closest('[data-no-translate]')) return

      // Do NOT translate icon ligatures
      if (
        node.parentElement?.classList?.contains('material-symbols-outlined') ||
        node.parentElement?.classList?.contains('material-icons')
      ) {
        return
      }

      const currentText = node.textContent || ''
      if (!currentText.trim()) return

      // Track original text cleanly across Vue mutations
      const lastTranslated = (node as any).__lastTranslated
      if (lastTranslated === undefined || currentText !== lastTranslated) {
        (node as any).__origText = currentText
      }

      const orig = (node as any).__origText
      if (!orig) return

      let target = orig
      if (targetLocale === 'es') {
        const dotVal = getFromMessages('es', orig.trim())
        target = dotVal ? orig.replace(orig.trim(), dotVal) : orig
      } else {
        target = translateText(orig, targetLocale)
      }

      if (node.textContent !== target) {
        node.textContent = target
        ;(node as any).__lastTranslated = target
      } else {
        ;(node as any).__lastTranslated = currentText
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (['script', 'style', 'code', 'pre'].includes(tag)) return
      if (el.closest && el.closest('[data-no-translate]')) return

      // Translate placeholders
      if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.placeholder) {
        const lastPh = (el as any).__lastPlaceholder
        if (lastPh === undefined || el.placeholder !== lastPh) {
          (el as any).__origPlaceholder = el.placeholder
        }
        const orig = (el as any).__origPlaceholder
        if (orig) {
          const target = targetLocale === 'es' ? orig : translateText(orig, targetLocale)
          if (el.placeholder !== target) {
            el.placeholder = target
            ;(el as any).__lastPlaceholder = target
          } else {
            ;(el as any).__lastPlaceholder = el.placeholder
          }
        }
      }

      // Translate titles / tooltips
      if (el.title) {
        const lastTitle = (el as any).__lastTitle
        if (lastTitle === undefined || el.title !== lastTitle) {
          (el as any).__origTitle = el.title
        }
        const orig = (el as any).__origTitle
        if (orig) {
          const target = targetLocale === 'es' ? orig : translateText(orig, targetLocale)
          if (el.title !== target) {
            el.title = target
            ;(el as any).__lastTitle = target
          } else {
            ;(el as any).__lastTitle = el.title
          }
        }
      }

      // Translate element children
      for (let child = el.firstChild; child; child = child.nextSibling) {
        translateNode(child, targetLocale)
      }
    }
  }

  function translateDOM(root?: HTMLElement) {
    if (typeof document === 'undefined') return
    const container = root || document.querySelector('#app') || document.body
    if (!container) return

    // Pause observer while mutating to prevent recursion loops
    if (observer) {
      observer.disconnect()
    }

    translateNode(container, locale.value)

    // Re-attach observer
    startDOMObserver()
  }

  function startDOMObserver() {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return
    if (observer) observer.disconnect()

    const target = document.querySelector('#app') || document.body
    if (!target) return

    observer = new MutationObserver((mutations) => {
      let shouldTranslate = false
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldTranslate = true
          break
        } else if (m.type === 'characterData') {
          shouldTranslate = true
          break
        }
      }

      if (shouldTranslate) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          translateDOM()
        }, 50)
      }
    })

    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  // Initialize observer on startup
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      startDOMObserver()
      translateDOM()
    }, 100)
  }

  return {
    locale,
    currentLanguageOption,
    languages: LANGUAGE_OPTIONS,
    setLocale,
    t,
    translateDOM,
    startDOMObserver
  }
})

