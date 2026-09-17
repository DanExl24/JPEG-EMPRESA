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

    // Dashboard View
    'Bienvenido': 'Welcome',
    'Sesión iniciada como': 'Signed in as',
    'Aquí tienes un resumen de tu actividad reciente.': 'Here is an overview of your recent activity.',
    'Panel de Control del Instructor': 'Instructor Control Panel',
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

    // Users View
    'Gestión de Usuarios': 'User Management',
    'Administrar cuentas, roles y accesos al sistema': 'Manage accounts, roles, and system access',
    'Crear Usuario': 'Create User',
    'Todos los Roles': 'All Roles',
    'Buscar por nombre, cédula o correo...': 'Search by name, ID or email...',
    'Nombre Completo': 'Full Name',
    'Documento': 'Document / ID',
    'Estado': 'Status',
    'Acciones': 'Actions',
    'Activo': 'Active',
    'Inactivo': 'Inactive',
    'Generar Contraseña': 'Generate Password',
    'Editar Usuario': 'Edit User',
    'Eliminar Usuario': 'Delete User',
    '¿Estás seguro de que deseas eliminar a este usuario?': 'Are you sure you want to delete this user?',

    // Ranking & Badges
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

    // Courses & Activities
    'Cursos Disponibles': 'Available Courses',
    'Explora los módulos de formación clínica': 'Explore clinical training modules',
    'Estudiar Curso': 'Study Course',
    'Ver Actividades': 'View Activities',
    'Actividades de Aprendizaje': 'Learning Activities',
    'Entrega de Tarea': 'Submit Assignment',
    'Completada': 'Completed',
    'Pendiente': 'Pending',
    'En Progreso': 'In Progress',
    'Aprobado': 'Passed',
    'No Aprobado': 'Failed',

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
    'Eliminar': 'Delete',
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
    'Fecha': 'Date'
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

    // Dashboard View
    'Bienvenido': 'Bem-vindo',
    'Sesión iniciada como': 'Sessão iniciada como',
    'Aquí tienes un resumen de tu actividad reciente.': 'Aqui está um resumo da sua atividade recente.',
    'Panel de Control del Instructor': 'Painel de Controle do Instrutor',
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
    'Crear Usuario': 'Criar Usuário',
    'Todos los Roles': 'Todas as Funções',
    'Buscar por nombre, cédula o correo...': 'Buscar por nome, documento ou e-mail...',
    'Nombre Completo': 'Nome Completo',
    'Documento': 'Documento',
    'Estado': 'Status',
    'Acciones': 'Ações',
    'Activo': 'Ativo',
    'Inactivo': 'Inativo',
    'Generar Contraseña': 'Gerar Senha',
    'Editar Usuario': 'Editar Usuário',
    'Eliminar Usuario': 'Excluir Usuário',
    '¿Estás seguro de que deseas eliminar a este usuario?': 'Tem certeza de que deseja excluir este usuário?',

    // Ranking & Badges
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

    // Courses & Activities
    'Cursos Disponibles': 'Cursos Disponíveis',
    'Explora los módulos de formación clínica': 'Explore os módulos de formação clínica',
    'Estudiar Curso': 'Estudar Curso',
    'Ver Actividades': 'Ver Atividades',
    'Actividades de Aprendizaje': 'Atividades de Aprendizagem',
    'Entrega de Tarea': 'Entregar Tarefa',
    'Completada': 'Concluída',
    'Pendiente': 'Pendente',
    'En Progreso': 'Em Progresso',
    'Aprobado': 'Aprovado',
    'No Aprobado': 'Reprovado',

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
    'Eliminar': 'Excluir',
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
    'Fecha': 'Data'
  }
}

// Pre-sorted phrases by length descending to match longest matches first
const SORTED_PHRASES: Record<'en' | 'pt', Array<{ es: string; target: string }>> = {
  en: Object.entries(PHRASE_DICTIONARY.en)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([es, target]) => ({ es, target })),
  pt: Object.entries(PHRASE_DICTIONARY.pt)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([es, target]) => ({ es, target }))
}

function translateText(text: string, targetLocale: SupportedLocale): string {
  if (targetLocale === 'es' || !text) return text
  const trimmed = text.trim()
  if (!trimmed) return text

  // 1. Direct exact match
  const exact = PHRASE_DICTIONARY[targetLocale][trimmed]
  if (exact) {
    return text.replace(trimmed, exact)
  }

  // 2. Sequential phrase replacement
  let result = text
  const phrases = SORTED_PHRASES[targetLocale]
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
    // If exact phrase matches in active locale dictionary
    if (locale.value !== 'es' && PHRASE_DICTIONARY[locale.value]?.[pathOrPhrase]) {
      let result = PHRASE_DICTIONARY[locale.value][pathOrPhrase]
      if (params) {
        result = Object.entries(params).reduce((str, [pKey, pVal]) => str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal)), result)
      }
      return result
    }

    // Fallback: lookup dot-notation path
    const target = PHRASE_DICTIONARY[locale.value as 'en' | 'pt']?.[pathOrPhrase]
    if (target) return target

    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal)), pathOrPhrase)
    }

    return pathOrPhrase
  }

  // ================= DOM AUTO-TRANSLATION ENGINE =================
  function translateNode(node: Node, targetLocale: SupportedLocale) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parentTag = (node.parentElement?.tagName || '').toLowerCase()
      if (['script', 'style', 'code', 'pre', 'textarea'].includes(parentTag)) return
      if (node.parentElement?.closest('[data-no-translate]')) return

      const currentText = node.textContent || ''
      if (!currentText.trim()) return

      if ((node as any).__origText === undefined) {
        (node as any).__origText = currentText
      }

      const orig = (node as any).__origText
      if (targetLocale === 'es') {
        if (node.textContent !== orig) {
          node.textContent = orig
        }
      } else {
        const translated = translateText(orig, targetLocale)
        if (node.textContent !== translated) {
          node.textContent = translated
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (['script', 'style', 'code', 'pre'].includes(tag)) return
      if (el.closest && el.closest('[data-no-translate]')) return

      // Translate placeholders
      if (el instanceof HTMLInputElement && el.placeholder) {
        if ((el as any).__origPlaceholder === undefined) {
          (el as any).__origPlaceholder = el.placeholder
        }
        const orig = (el as any).__origPlaceholder
        el.placeholder = targetLocale === 'es' ? orig : translateText(orig, targetLocale)
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
      if (locale.value === 'es') return // In default Spanish, no dynamic translation needed

      let shouldTranslate = false
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldTranslate = true
          break
        }
      }

      if (shouldTranslate) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          translateDOM()
        }, 60)
      }
    })

    observer.observe(target, {
      childList: true,
      subtree: true
    })
  }

  // Initialize observer on startup
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      startDOMObserver()
      if (locale.value !== 'es') {
        translateDOM()
      }
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
