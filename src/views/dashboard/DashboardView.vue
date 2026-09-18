<template>
  <div class="space-y-6">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span 
            class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            :class="{
              'bg-purple-100 text-purple-700': auth.role === 'admin',
              'bg-blue-100 text-[#006688]': auth.role === 'instructor',
              'bg-teal-100 text-teal-700': auth.role === 'aprendiz',
            }"
          >
            {{ auth.role === 'instructor' ? i18n.t('Docencia y Seguimiento Clínico') : auth.role === 'admin' ? i18n.t('Control Institucional') : i18n.t('Formación en Enfermería') }}
          </span>
          <span class="text-xs text-gray-400">· SENA Nursing Academy</span>
        </div>
        <h2 class="text-2xl font-black text-gray-800">
          {{ i18n.t('Bienvenido') }}, {{ auth.user?.name || (auth.safeUser && auth.safeUser.name) || 'Usuario' }}
        </h2>
        <p class="text-xs sm:text-sm text-gray-500">
          {{ auth.role === 'instructor' 
            ? i18n.t('Monitorea el progreso pedagógico, califica retos de los aprendices y gestiona tus módulos formativos.') 
            : auth.role === 'admin' 
              ? i18n.t('Supervisa métricas globales, usuarios y configuración institucional de la plataforma.') 
              : i18n.t('Aquí tienes un resumen de tu avance de aprendizaje y actividades recientes.') }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          v-if="auth.isInstructor || auth.isAdmin"
          to="/dashboard/cursos"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#006688]/20"
        >
          <span class="material-symbols-outlined text-base">school</span>
          {{ i18n.t('Gestionar Cursos') }}
        </router-link>
        <router-link
          v-if="auth.isInstructor || auth.isAdmin"
          to="/dashboard/actividades"
          class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-base">task</span>
          {{ i18n.t('Bandeja Tareas') }}
        </router-link>
        <router-link
          v-if="auth.isApprentice"
          :to="activeCourse ? `/dashboard/cursos/${activeCourse.id}` : '/dashboard/cursos'"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#006688]/20"
        >
          <span class="material-symbols-outlined text-base">play_arrow</span>
          {{ i18n.t('Continuar Aprendizaje') }}
        </router-link>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- APPRENTICE SPECIFIC DASHBOARD VIEW        -->
    <!-- ========================================== -->
    <template v-if="auth.isApprentice">
      <!-- Apprentice Gamification Hero Banner -->
      <div class="relative overflow-hidden bg-gradient-to-br from-[#006688] via-[#004e69] to-[#002f40] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#006688]/15 border border-[#006688]/30">
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute right-20 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="space-y-3 max-w-xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-teal-200">
              <span class="material-symbols-outlined text-sm">stars</span>
              <span>{{ i18n.t('Mi Nivel y Rango Clínico') }}</span>
            </div>
            <div>
              <h3 class="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <span>{{ i18n.t(levelInfo.levelTitle) }}</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30 uppercase font-black tracking-wider">
                  {{ i18n.t('Nivel') }} {{ levelInfo.level }}
                </span>
              </h3>
              <p class="text-xs sm:text-sm text-teal-100/80 mt-1">
                {{ i18n.t('Avanza en tus cursos y supera retos clínicos para subir de rango y desbloquear nuevas insignias.') }}
              </p>
            </div>

            <!-- XP Progress Bar -->
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-teal-200">{{ levelInfo.currentXp }} / {{ levelInfo.nextLevelXp }} XP</span>
                <span class="text-teal-100/70">{{ levelInfo.progressPct }}%</span>
              </div>
              <div class="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  class="h-full bg-gradient-to-r from-teal-400 to-emerald-300 rounded-full transition-all duration-700 shadow-sm"
                  :style="`width: ${Math.max(5, levelInfo.progressPct)}%`"
                ></div>
              </div>
            </div>
          </div>

          <!-- Right Pill Badges / Rank & XP -->
          <div class="flex items-center gap-4 self-start lg:self-center">
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[110px]">
              <div class="w-10 h-10 mx-auto rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-1">
                <span class="material-symbols-outlined text-2xl">leaderboard</span>
              </div>
              <p class="text-2xl font-black text-white">#{{ levelInfo.rank }}</p>
              <p class="text-[10px] font-bold text-teal-200 uppercase tracking-wider">{{ i18n.t('Mi Ranking') }}</p>
            </div>

            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[110px]">
              <div class="w-10 h-10 mx-auto rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center mb-1">
                <span class="material-symbols-outlined text-2xl">stars</span>
              </div>
              <p class="text-2xl font-black text-white">{{ (levelInfo.level - 1) * 100 + levelInfo.currentXp }}</p>
              <p class="text-[10px] font-bold text-teal-200 uppercase tracking-wider">{{ i18n.t('Puntos XP') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Apprentice KPI Cards Grid (4 focused cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="stat in apprenticeStats" 
          :key="stat.label" 
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gray-500">{{ i18n.t(stat.label) }}</span>
            <div :class="`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" :style="`color: ${stat.iconColor}`">{{ stat.icon }}</span>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">{{ stat.value }}</div>
          <div class="text-[11px] text-gray-400 mt-1 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {{ i18n.t(stat.change) }}
          </div>
        </div>
      </div>

      <!-- Main Apprentice 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column (Span 2): Active Course & Recommended Missions -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Active Course Card -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#006688]/10 text-[#006688] flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">school</span>
                </div>
                <div>
                  <h3 class="text-base font-black text-gray-800">{{ i18n.t('Mi Curso en Curso') }}</h3>
                  <p class="text-xs text-gray-400">{{ i18n.t('Ruta de aprendizaje formativa en enfermería') }}</p>
                </div>
              </div>
              <router-link
                to="/dashboard/cursos"
                class="text-xs font-bold text-[#006688] hover:underline flex items-center gap-1"
              >
                {{ i18n.t('Explorar Cursos') }}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </router-link>
            </div>

            <!-- Course Content if activeCourse exists -->
            <div v-if="activeCourse" class="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-[#006688]/10 text-[#006688] flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-2xl" :style="activeCourse.iconColor ? `color: ${activeCourse.iconColor}` : ''">{{ activeCourse.icon || 'school' }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#006688]/10 text-[#006688]">
                      {{ activeCourse.category || 'Clínico' }}
                    </span>
                    <h4 class="text-base font-black text-gray-800 mt-0.5">{{ activeCourse.title }}</h4>
                  </div>
                </div>

                <router-link
                  :to="`/dashboard/cursos/${activeCourse.id}`"
                  class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-center"
                >
                  <span class="material-symbols-outlined text-base">play_circle</span>
                  {{ i18n.t('Reanudar Módulo') }}
                </router-link>
              </div>

              <!-- 4 Phases Stepper Indicator -->
              <div class="pt-2">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-600">{{ i18n.t('Fase Actual') }}: <span class="text-[#006688] capitalize">{{ getPhaseLabel(activeCourse.currentPhase) }}</span></span>
                  <span class="text-xs font-black text-gray-700">{{ activeCourse.overallPct }}%</span>
                </div>
                <div class="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    class="h-full bg-gradient-to-r from-[#006688] to-teal-500 rounded-full transition-all duration-500"
                    :style="`width: ${Math.max(4, activeCourse.overallPct)}%`"
                  ></div>
                </div>

                <!-- Phase Steps -->
                <div class="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div 
                    v-for="phase in coursePhases" 
                    :key="phase.key"
                    class="p-2 rounded-xl text-[11px] font-bold transition-colors"
                    :class="isPhaseActiveOrDone(phase.key, activeCourse.currentPhase, activeCourse.overallPct)
                      ? 'bg-[#006688]/10 text-[#006688]' 
                      : 'bg-gray-50 text-gray-400'"
                  >
                    <div class="flex items-center justify-center mb-1">
                      <span class="material-symbols-outlined text-base">{{ phase.icon }}</span>
                    </div>
                    <span>{{ phase.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State for course -->
            <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-3">
              <span class="material-symbols-outlined text-4xl text-gray-300 block">school</span>
              <p class="text-xs font-bold text-gray-600">{{ i18n.t('No tienes ningún curso en progreso en este momento.') }}</p>
              <router-link
                to="/dashboard/cursos"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006688] text-white text-xs font-bold rounded-xl hover:bg-[#004e69] transition-all"
              >
                {{ i18n.t('Explorar Cursos') }}
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Recommended Missions & Challenges -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">flag</span>
                </div>
                <div>
                  <h3 class="text-base font-black text-gray-800">{{ i18n.t('Misiones y Retos Recomendados') }}</h3>
                  <p class="text-xs text-gray-400">{{ i18n.t('Supera desafíos pedagógicos y gana puntos XP adicionales') }}</p>
                </div>
              </div>
              <router-link
                to="/dashboard/actividades"
                class="text-xs font-bold text-[#006688] hover:underline flex items-center gap-1"
              >
                {{ i18n.t('Ver todas en Actividades') }}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </router-link>
            </div>

            <div v-if="recommendedActivities.length > 0" class="space-y-3">
              <div 
                v-for="act in recommendedActivities" 
                :key="act.id"
                class="p-4 bg-gray-50/60 hover:bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-xl">assignment</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                        {{ act.phase || 'Reto' }}
                      </span>
                      <span class="text-xs font-black text-purple-600 flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-xs">stars</span>
                        +{{ act.points || 20 }} XP
                      </span>
                    </div>
                    <p class="text-xs sm:text-sm font-bold text-gray-800 mt-1">{{ act.title }}</p>
                    <p class="text-[11px] text-gray-400">{{ act.course || 'Enfermería SENA' }}</p>
                  </div>
                </div>

                <router-link
                  :to="`/dashboard/actividades/${act.id}`"
                  class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 self-start sm:self-center shrink-0"
                >
                  <span class="material-symbols-outlined text-xs">play_arrow</span>
                  {{ i18n.t('Comenzar Reto') }}
                </router-link>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <span class="material-symbols-outlined text-4xl text-gray-300 block">celebration</span>
              <p class="text-xs font-bold text-gray-600">{{ i18n.t('¡Todas las misiones al día!') }}</p>
              <p class="text-[11px] text-gray-400">{{ i18n.t('No tienes retos pendientes por ahora.') }}</p>
            </div>
          </div>

        </div>

        <!-- Right Column (Span 1): Badges & Recent Submissions -->
        <div class="space-y-6">

          <!-- My Badges -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">emoji_events</span>
                </div>
                <h3 class="text-sm font-black text-gray-800">{{ i18n.t('Mis Logros y Medallas Recientes') }}</h3>
              </div>
              <router-link
                to="/dashboard/logros"
                class="text-xs font-bold text-[#006688] hover:underline"
              >
                {{ i18n.t('Ver todas las insignias') }}
              </router-link>
            </div>

            <div v-if="myBadges.length > 0" class="grid grid-cols-2 gap-3">
              <div 
                v-for="b in myBadges" 
                :key="b.key"
                class="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center flex flex-col items-center hover:bg-amber-50/40 transition-colors"
              >
                <div class="text-2xl mb-1">{{ b.iconEmoji || '🏆' }}</div>
                <p class="text-xs font-bold text-gray-800 line-clamp-1">{{ b.name }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ b.awardedAt }}</p>
              </div>
            </div>

            <div v-else class="text-center py-6 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
              <span class="material-symbols-outlined text-3xl text-gray-300 block">military_tech</span>
              <p class="text-xs font-bold text-gray-500">{{ i18n.t('Aún no tienes insignias desbloqueadas') }}</p>
              <p class="text-[10px] text-gray-400">{{ i18n.t('Comienza tus cursos y actividades para ganar tus primeras medallas.') }}</p>
            </div>
          </div>

          <!-- Recent Submissions History -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">fact_check</span>
                </div>
                <h3 class="text-sm font-black text-gray-800">{{ i18n.t('Mis Entregas y Calificaciones') }}</h3>
              </div>
              <router-link
                to="/dashboard/progreso"
                class="text-xs font-bold text-[#006688] hover:underline"
              >
                {{ i18n.t('Ver historial completo') }}
              </router-link>
            </div>

            <div v-if="myRecentSubmissions.length > 0" class="divide-y divide-gray-100">
              <div 
                v-for="sub in myRecentSubmissions" 
                :key="sub.id"
                class="py-3 flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ sub.title }}</p>
                  <p class="text-[10px] text-gray-400">{{ sub.submittedAt }} · {{ sub.points }} XP</p>
                </div>
                <span 
                  :class="`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    sub.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`"
                >
                  {{ sub.passed ? i18n.t('Aprobado') : i18n.t('En Revisión') }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-6 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-1.5">
              <span class="material-symbols-outlined text-3xl text-gray-300 block">pending_actions</span>
              <p class="text-xs font-bold text-gray-500">{{ i18n.t('Sin entregas registradas aún') }}</p>
              <p class="text-[10px] text-gray-400">{{ i18n.t('Tus respuestas a talleres y quizzes se registrarán aquí.') }}</p>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- ========================================== -->
    <!-- INSTRUCTOR & ADMIN DASHBOARD VIEW         -->
    <!-- ========================================== -->
    <template v-else>
      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="stat in visibleStats" 
          :key="stat.label" 
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gray-500">{{ i18n.t(stat.label) }}</span>
            <div :class="`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" :style="`color: ${stat.iconColor}`">{{ stat.icon }}</span>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">{{ stat.value }}</div>
          <div class="text-[11px] text-gray-400 mt-1 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {{ i18n.t(stat.change) }}
          </div>
        </div>
      </div>

      <!-- Instructor Section: Bandeja de Evaluaciones Pendientes -->
      <div v-if="auth.isInstructor || auth.isAdmin" class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">rate_review</span>
            </div>
            <div>
              <h3 class="text-base font-black text-gray-800">{{ i18n.t('Entregas Recientes de Aprendices') }}</h3>
              <p class="text-xs text-gray-400">{{ i18n.t('Talleres, quizzes y ejercicios de pronunciación en espera de retroalimentación.') }}</p>
            </div>
          </div>
          <router-link
            to="/dashboard/actividades"
            class="text-xs font-bold text-[#006688] hover:underline flex items-center gap-1"
          >
            {{ i18n.t('Ver todas en Actividades') }}
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </router-link>
        </div>

        <!-- Reviews Table / List -->
        <div v-if="pendingReviews.length > 0" class="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
          <div 
            v-for="sub in pendingReviews" 
            :key="sub.id"
            class="p-4 bg-gray-50/40 hover:bg-gray-50 flex items-center justify-between gap-4 flex-wrap transition-colors"
          >
            <div class="flex items-center gap-3 min-w-[200px]">
              <div class="w-9 h-9 rounded-full bg-[#006688]/10 text-[#006688] font-bold text-xs flex items-center justify-center shrink-0">
                {{ sub.studentName ? sub.studentName[0] : 'A' }}
              </div>
              <div>
                <p class="text-xs font-bold text-gray-800">{{ sub.studentName }}</p>
                <p class="text-[10px] text-gray-400">{{ sub.studentEmail }}</p>
              </div>
            </div>

            <div class="flex-1 min-w-[200px]">
              <p class="text-xs font-bold text-[#006688]">{{ sub.activityTitle }}</p>
              <p class="text-[10px] text-gray-400">{{ i18n.t('Entregado') }}: {{ sub.submittedAt }} · {{ i18n.t('Puntos') }}: {{ sub.points }} XP</p>
            </div>

            <div class="flex items-center gap-3">
              <span 
                :class="`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  sub.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`"
              >
                {{ sub.passed ? i18n.t('Completado') : i18n.t('Por Calificar') }}
              </span>
              <router-link
                :to="`/dashboard/actividades/${sub.activityId}`"
                class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <span class="material-symbols-outlined text-xs">edit_note</span>
                {{ i18n.t('Evaluar') }}
              </router-link>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
          <span class="material-symbols-outlined text-4xl text-gray-300 block">fact_check</span>
          <p class="text-xs font-bold text-gray-500">{{ i18n.t('¡Bandeja al día!') }}</p>
          <p class="text-[11px] text-gray-400">{{ i18n.t('No hay entregas pendientes de calificación en este momento.') }}</p>
        </div>
      </div>
    </template>

    <!-- Quick Actions (For all roles, localized) -->
    <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-base font-black text-gray-800 mb-4">{{ i18n.t('Accesos Rápidos') }}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <router-link
          v-for="action in quickActions"
          :key="action.path"
          :to="action.path"
          class="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-[#006688]/30 hover:bg-[#006688]/5 transition-all group text-center"
        >
          <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#006688]/10 transition-colors">
            <span class="material-symbols-outlined text-2xl text-[#006688] group-hover:scale-110 transition-transform">{{ action.icon }}</span>
          </div>
          <span class="text-xs font-bold text-gray-700 group-hover:text-[#006688] transition-colors">{{ i18n.t(action.label) }}</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity Feed (Solo para Aprendiz e Instructor; el Administrador tiene su propio panel de supervisión y métricas) -->
    <div v-if="!auth.isAdmin" class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-black text-gray-800">
          {{ auth.isInstructor ? i18n.t('Actividad Reciente del Aula Clínica') : i18n.t('Mi Actividad Reciente') }}
        </h3>
        <span class="text-xs text-gray-400 font-semibold">{{ i18n.t('Eventos en vivo') }}</span>
      </div>

      <div v-if="recentActivity.length > 0" class="space-y-3">
        <div 
          v-for="item in recentActivity" 
          :key="item.id" 
          class="flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50/70 hover:bg-gray-50 transition-colors"
        >
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`">
            <span class="material-symbols-outlined text-lg" :style="`color: ${item.iconColor}`">{{ item.icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm font-bold text-gray-800 truncate">{{ i18n.t(item.title) }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ item.time }}</p>
          </div>
          <span :class="`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${item.badgeBg} ${item.badgeText}`">
            {{ i18n.t(item.badge) }}
          </span>
        </div>
      </div>
      <div v-else class="text-center py-8 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
        <span class="material-symbols-outlined text-4xl text-gray-300 block">history</span>
        <p class="text-xs font-bold text-gray-500">{{ i18n.t('Sin actividad registrada aún') }}</p>
        <p class="text-[11px] text-gray-400">
          {{ auth.isInstructor 
            ? i18n.t('Los eventos de aprendizaje y entregas de tus estudiantes aparecerán aquí en tiempo real.') 
            : i18n.t('Tus logros, avances en cursos y retos completados aparecerán aquí.') 
          }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useI18nStore } from '../../stores/i18n'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const i18n = useI18nStore()
const apiBaseUrl = getApiBaseUrl()

// Course Phases configuration for Apprentice
const coursePhases = computed(() => [
  { key: 'inicio', label: i18n.t('Inicio'), icon: 'flag' },
  { key: 'estudio', label: i18n.t('Estudio'), icon: 'menu_book' },
  { key: 'practica', label: i18n.t('Práctica'), icon: 'quiz' },
  { key: 'evaluacion', label: i18n.t('Evaluación'), icon: 'fact_check' }
])

function getPhaseLabel(phaseKey) {
  const map = {
    inicio: i18n.t('Inicio'),
    estudio: i18n.t('Estudio'),
    practica: i18n.t('Práctica'),
    evaluacion: i18n.t('Evaluación')
  }
  return map[phaseKey] || i18n.t('Inicio')
}

function isPhaseActiveOrDone(phaseKey, currentPhase, overallPct) {
  const order = ['inicio', 'estudio', 'practica', 'evaluacion']
  const targetIdx = order.indexOf(phaseKey)
  const currentIdx = order.indexOf(currentPhase || 'inicio')
  return targetIdx <= currentIdx || (overallPct && overallPct >= (targetIdx + 1) * 25)
}

// Apprentice specific dynamic state
const levelInfo = ref({
  level: 1,
  levelTitle: 'Aprendiz Novato',
  currentXp: 0,
  nextLevelXp: 100,
  progressPct: 0,
  rank: 1
})

const activeCourse = ref(null)
const recommendedActivities = ref([])
const myBadges = ref([])
const myRecentSubmissions = ref([])

// Default stats for Admin
const defaultAdminStats = [
  { label: 'Cursos Activos', value: '...', change: 'Catálogo institucional', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Total Usuarios', value: '...', change: 'Aprendices e instructores', icon: 'group', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Programas SENA', value: '...', change: 'Fichas activas', icon: 'schema', bg: 'bg-teal-50', iconColor: '#14b8a6' },
  { label: 'Banco Actividades', value: '...', change: 'Catálogo pedagógico', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Tasa de Aprobación', value: '...', change: 'Promedio global', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Entregas Registradas', value: '...', change: 'Evaluaciones realizadas', icon: 'fact_check', bg: 'bg-indigo-50', iconColor: '#6366f1' },
  { label: 'Fichas / Cohortes', value: '...', change: 'Grupos en formación', icon: 'domain', bg: 'bg-rose-50', iconColor: '#e11d48' },
  { label: 'Catálogo de Logros', value: '...', change: 'Insignias configuradas', icon: 'emoji_events', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
]

// Default stats for Instructor
const defaultInstructorStats = [
  { label: 'Cursos en Docencia', value: '...', change: 'Cursos activos', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Aprendices a Cargo', value: '...', change: 'Estudiantes en formación', icon: 'group', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Entregas por Calificar', value: '...', change: 'Pendientes de revisión', icon: 'rate_review', bg: 'bg-amber-50', iconColor: '#d97706' },
  { label: 'Tasa de Aprobación', value: '...', change: 'Rendimiento académico', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Banco de Actividades', value: '...', change: 'Módulos pedagógicos', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Fichas / Cohortes', value: '...', change: 'Programas formativos', icon: 'domain', bg: 'bg-rose-50', iconColor: '#e11d48' },
  { label: 'Términos Clínicos', value: '...', change: 'Vocabulario y conceptos', icon: 'translate', bg: 'bg-teal-50', iconColor: '#0d9488' },
  { label: 'Arcade y Retos', value: '...', change: 'Minijuegos lúdicos', icon: 'sports_esports', bg: 'bg-indigo-50', iconColor: '#6366f1' },
]

// Default stats for Apprentice
const defaultAprendizStats = [
  { label: 'Cursos Activos', value: '...', change: 'Disponibles para ti', icon: 'school', bg: 'bg-blue-50', iconColor: '#006688' },
  { label: 'Mi Progreso', value: '...', change: 'Rendimiento en cursos', icon: 'trending_up', bg: 'bg-green-50', iconColor: '#10b981' },
  { label: 'Mis Logros', value: '...', change: 'Insignias desbloqueadas', icon: 'emoji_events', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
  { label: 'Actividades', value: '...', change: 'Retos pedagógicos', icon: 'task', bg: 'bg-orange-50', iconColor: '#f97316' },
  { label: 'Mi Ranking', value: '...', change: 'Cuadro de honor', icon: 'leaderboard', bg: 'bg-red-50', iconColor: '#ef4444' },
  { label: 'Mis Entregas', value: '...', change: 'Tareas completadas', icon: 'fact_check', bg: 'bg-teal-50', iconColor: '#14b8a6' },
  { label: 'Puntos XP', value: '...', change: 'Nivel académico', icon: 'stars', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { label: 'Juegos y Retos', value: 'Activo', change: 'Supera mini-juegos', icon: 'sports_esports', bg: 'bg-indigo-50', iconColor: '#6366f1' },
]

const visibleStats = ref(
  auth.role === 'admin' 
    ? defaultAdminStats 
    : auth.role === 'instructor' 
      ? defaultInstructorStats 
      : defaultAprendizStats
)

const apprenticeStats = computed(() => {
  if (visibleStats.value && visibleStats.value.length >= 4) {
    return visibleStats.value.slice(0, 4)
  }
  return defaultAprendizStats.slice(0, 4)
})

const pendingReviews = ref([])

const quickActions = computed(() => {
  if (auth.isAdmin) {
    return [
      { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
      { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
      { label: 'Currículo SENA', path: '/dashboard/curriculum', icon: 'schema' },
      { label: 'Usuarios', path: '/dashboard/usuarios', icon: 'manage_accounts' },
      { label: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics' },
      { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
      { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
      { label: 'Diálogos', path: '/dashboard/dialogos', icon: 'chat' },
    ]
  }

  if (auth.isInstructor) {
    return [
      { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
      { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
      { label: 'Currículo SENA', path: '/dashboard/curriculum', icon: 'schema' },
      { label: 'Analíticas', path: '/dashboard/analiticas', icon: 'analytics' },
      { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
      { label: 'Diálogos', path: '/dashboard/dialogos', icon: 'chat' },
      { label: 'Arcade Lúdico', path: '/dashboard/juegos', icon: 'sports_esports' },
      { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
    ]
  }

  return [
    { label: 'Cursos', path: '/dashboard/cursos', icon: 'school' },
    { label: 'Actividades', path: '/dashboard/actividades', icon: 'task' },
    { label: 'Mi Progreso', path: '/dashboard/progreso', icon: 'trending_up' },
    { label: 'Ranking', path: '/dashboard/ranking', icon: 'leaderboard' },
    { label: 'Mis Logros', path: '/dashboard/logros', icon: 'emoji_events' },
    { label: 'Juegos', path: '/dashboard/juegos', icon: 'sports_esports' },
    { label: 'Vocabulario', path: '/dashboard/vocabulario', icon: 'translate' },
    { label: 'Glosario', path: '/dashboard/glosario', icon: 'menu_book' },
  ]
})

const recentActivity = ref([])

onMounted(async () => {
  try {
    const rawToken = auth.token || auth.user?.token
    const token = typeof rawToken === 'string' ? rawToken : (rawToken && typeof rawToken === 'object' && 'value' in rawToken ? rawToken.value : '')
    const authToken = token || (() => {
      try {
        const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
        return stored ? JSON.parse(stored)?.token : ''
      } catch {
        return ''
      }
    })()

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    const res = await fetch(`${apiBaseUrl}/api/dashboard/summary`, { headers })
    if (res.ok) {
      const json = await res.json()
      const data = json?.data || json
      if (Array.isArray(data.stats) && data.stats.length > 0) {
        visibleStats.value = data.stats
      }
      if (Array.isArray(data.recentActivity)) {
        recentActivity.value = data.recentActivity
      }
      if (Array.isArray(data.pendingReviews)) {
        pendingReviews.value = data.pendingReviews
      }
      if (data.levelInfo) {
        levelInfo.value = data.levelInfo
      }
      if (data.activeCourse !== undefined) {
        activeCourse.value = data.activeCourse
      }
      if (Array.isArray(data.recommendedActivities)) {
        recommendedActivities.value = data.recommendedActivities
      }
      if (Array.isArray(data.myBadges)) {
        myBadges.value = data.myBadges
      }
      if (Array.isArray(data.myRecentSubmissions)) {
        myRecentSubmissions.value = data.myRecentSubmissions
      }
    }
  } catch (err) {
    console.warn('Could not load dashboard summary from backend, using defaults:', err)
  }
})
</script>
