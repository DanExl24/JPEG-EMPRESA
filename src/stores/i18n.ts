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

const messages: Record<SupportedLocale, Record<string, any>> = {
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
    },
    dashboard: {
      welcome: 'Bienvenido',
      loggedInAs: 'Sesión iniciada como',
      summary: 'Aquí tienes un resumen de tu actividad reciente.',
      quickActions: 'Accesos Rápidos',
      recentActivity: 'Actividad Reciente'
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
      clinicalTeam: 'Faculty / Teaching Staff'
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
    },
    dashboard: {
      welcome: 'Welcome',
      loggedInAs: 'Signed in as',
      summary: 'Here is an overview of your recent activity.',
      quickActions: 'Quick Actions',
      recentActivity: 'Recent Activity'
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
    },
    dashboard: {
      welcome: 'Bem-vindo',
      loggedInAs: 'Sessão iniciada como',
      summary: 'Aqui está um resumo da sua atividade recente.',
      quickActions: 'Ações Rápidas',
      recentActivity: 'Atividade Recente'
    }
  }
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

  function t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.')
    let current: any = messages[locale.value]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        current = null
        break
      }
    }

    // Fallback to Spanish if translation not found in active locale
    if (current === null || current === undefined) {
      let fallback: any = messages['es']
      for (const key of keys) {
        if (fallback && typeof fallback === 'object' && key in fallback) {
          fallback = fallback[key]
        } else {
          fallback = null
          break
        }
      }
      current = fallback ?? path
    }

    if (typeof current !== 'string') {
      return path
    }

    // Interpolate params: e.g. "Hello, {name}!"
    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }, current)
    }

    return current
  }

  return {
    locale,
    currentLanguageOption,
    languages: LANGUAGE_OPTIONS,
    setLocale,
    t
  }
})
