<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500 text-3xl">emoji_events</span>
          {{ auth.isAdmin ? 'Catálogo de Logros e Insignias' : 'Mis Logros' }}
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          {{
            auth.isAdmin
              ? 'Configura las medallas pedagógicas e incentivos automáticos otorgados según la experiencia (XP) acumulada.'
              : 'Tus reconocimientos clínicos alcanzados y los próximos retos a conquistar.'
          }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchData"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          title="Actualizar catálogo"
        >
          <span
            class="material-symbols-outlined text-base"
            :class="{ 'animate-spin': loading }"
            >refresh</span
          >
          <span class="hidden sm:inline">Refrescar</span>
        </button>

        <button
          v-if="auth.isAdmin"
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md shadow-amber-500/20"
        >
          <span class="material-symbols-outlined text-lg">military_tech</span>
          Nueva Insignia
        </button>
      </div>
    </div>

    <!-- Summary Banner / KPI Cards -->
    <!-- ADMIN KPIs -->
    <div v-if="auth.isAdmin" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-xl">military_tech</span>
        </div>
        <p class="text-2xl font-black text-gray-800 tracking-tight">{{ adminStats.totalBadges }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Insignias en Catálogo</p>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-xl">workspace_premium</span>
        </div>
        <p class="text-2xl font-black text-gray-800 tracking-tight">{{ adminStats.totalAwarded }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Total Desbloqueos</p>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-xl">flag</span>
        </div>
        <p class="text-2xl font-black text-gray-800 tracking-tight">{{ adminStats.minXp }} XP</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Hito Inicial</p>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
          <span class="material-symbols-outlined text-xl">trophy</span>
        </div>
        <p class="text-2xl font-black text-gray-800 tracking-tight">{{ adminStats.maxXp }} XP</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">Hito Cúspide</p>
      </div>
    </div>

    <!-- STUDENT Banner -->
    <div
      v-else
      class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md shadow-amber-500/10"
    >
      <div class="space-y-2 text-center md:text-left">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-sm">
          <span class="material-symbols-outlined text-sm">military_tech</span>
          Progreso de Gamificación
        </span>
        <h3 class="text-3xl font-black tracking-tight">
          {{ unlockedBadges.length }} / {{ totalCount }} Insignias
        </h3>
        <p class="text-amber-100 text-xs max-w-md">
          Has completado el {{ learnerProgressPct }}% de los hitos clínicos. Sigue sumando XP en casos y minijuegos para conquistar las medallas restantes.
        </p>
      </div>

      <div class="flex items-center gap-4 bg-black/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-auto justify-around">
        <div class="text-center">
          <p class="text-xs text-amber-200 font-medium">XP Actual</p>
          <p class="text-2xl font-black">{{ currentLearnerXp }}</p>
        </div>
        <div class="w-px h-8 bg-white/20"></div>
        <div class="text-center">
          <p class="text-xs text-amber-200 font-medium">Por Conquistar</p>
          <p class="text-2xl font-black">{{ lockedBadges.length }}</p>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:flex-1">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar insignia por nombre o descripción..."
          class="w-full pl-9 pr-8 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          title="Limpiar búsqueda"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select
          v-model="filterTier"
          class="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-amber-500 transition-all"
        >
          <option value="all">Todas las dificultades</option>
          <option value="starter">Iniciación (0 - 100 XP)</option>
          <option value="intermediate">Intermedio (101 - 500 XP)</option>
          <option value="advanced">Avanzado (> 500 XP)</option>
        </select>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- VISTA ADMINISTRADOR: CATÁLOGO COMPLETO CRUD -->
    <!-- ========================================== -->
    <div v-if="auth.isAdmin" class="space-y-4">
      <!-- Loading Skeleton -->
      <div v-if="loading && adminBadges.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-200"></div>
            <div class="space-y-1.5 flex-1">
              <div class="w-32 h-4 bg-gray-200 rounded"></div>
              <div class="w-20 h-3 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div class="w-full h-10 bg-gray-50 rounded-xl"></div>
        </div>
      </div>

      <!-- Real Admin Badges Grid -->
      <div v-else-if="filteredAdminBadges.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="badge in filteredAdminBadges"
          :key="badge.id"
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
        >
          <!-- Top section -->
          <div>
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden select-none">
                  {{ extractSingleEmoji(badge.iconEmoji) }}
                </div>
                <div>
                  <h4 class="text-base font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
                    {{ badge.name }}
                  </h4>
                  <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 mt-1">
                    <span class="material-symbols-outlined text-[13px]">bolt</span>
                    {{ badge.xpRequired }} XP requeridos
                  </span>
                </div>
              </div>

              <!-- Actions menu -->
              <div class="flex items-center gap-1">
                <button
                  @click="openEditModal(badge)"
                  class="p-1.5 text-gray-400 hover:text-[#006688] hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar insignia"
                >
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  @click="openDeleteModal(badge)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar insignia"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-3 leading-relaxed">
              {{ badge.description }}
            </p>
          </div>

          <!-- Bottom Stats -->
          <div class="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span class="inline-flex items-center gap-1 text-gray-600 font-medium">
              <span class="material-symbols-outlined text-sm text-gray-400">group</span>
              {{ badge.unlockedCount }} {{ badge.unlockedCount === 1 ? 'aprendiz' : 'aprendices' }}
            </span>
            <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
              {{ badge.unlockedPct }}% alcanzado
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
          <span class="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
        </div>
        <h4 class="text-base font-bold text-gray-800">No se encontraron insignias</h4>
        <p class="text-xs text-gray-500 mt-1">
          {{ searchQuery || filterTier !== 'all' ? 'Prueba ajustando los filtros de búsqueda.' : 'Aún no se han configurado insignias en el sistema.' }}
        </p>
        <button
          v-if="searchQuery || filterTier !== 'all'"
          @click="resetFilters"
          class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- VISTA APRENDIZ: DESBLOQUEADOS Y POR CONQUISTAR -->
    <!-- ========================================== -->
    <div v-else class="space-y-8">
      <!-- Desbloqueados -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500">check_circle</span>
            Logros Desbloqueados
            <span class="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {{ filteredUnlocked.length }}
            </span>
          </h3>
          <span class="text-xs text-gray-400">Medallas obtenidas en tu carrera</span>
        </div>

        <div v-if="filteredUnlocked.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="logro in filteredUnlocked"
            :key="logro.id"
            class="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border border-amber-200/80 shadow-sm hover:shadow-md transition-all group"
          >
            <div class="w-16 h-16 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-4xl shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden select-none">
              {{ extractSingleEmoji(logro.iconEmoji || logro.emoji) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-gray-800 truncate">{{ logro.name }}</h4>
                <span class="material-symbols-outlined text-amber-500 text-sm">verified</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ logro.description || logro.desc }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  +{{ logro.xpRequired || logro.pts || 0 }} XP
                </span>
                <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[12px]">done</span> Conquistado
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
          <p class="text-sm font-semibold text-gray-600">Aún no has desbloqueado insignias en esta categoría</p>
          <p class="text-xs text-gray-400 mt-1">Completa actividades y juega en el Arcade para ganar tus primeros puntos de XP.</p>
        </div>
      </div>

      <!-- Por Desbloquear -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-gray-400">lock</span>
            Próximos Retos por Desbloquear
            <span class="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {{ filteredLocked.length }}
            </span>
          </h3>
          <span class="text-xs text-gray-400">Suma XP para alcanzarlos</span>
        </div>

        <div v-if="filteredLocked.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="logro in filteredLocked"
            :key="logro.id"
            class="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 opacity-80 hover:opacity-100 hover:border-gray-300 transition-all"
          >
            <div class="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-4xl shrink-0 grayscale overflow-hidden select-none">
              {{ extractSingleEmoji(logro.iconEmoji || logro.emoji) }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-700 truncate">{{ logro.name }}</h4>
              <p class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ logro.description || logro.hint }}</p>
              
              <!-- Progress bar -->
              <div class="mt-2 space-y-1">
                <div class="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                  <span>{{ currentLearnerXp }} / {{ logro.xpRequired || logro.pts }} XP</span>
                  <span>{{ logro.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-1.5 rounded-full bg-[#006688] transition-all duration-500"
                    :style="`width: ${logro.progress || 0}%`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100">
          <span class="material-symbols-outlined text-emerald-500 text-3xl mb-1">celebration</span>
          <p class="text-sm font-bold text-emerald-800">¡Felicidades! Has conquistado todas las insignias disponibles</p>
          <p class="text-xs text-emerald-600 mt-1">Mantente al tanto de nuevos hitos añadidos por tus docentes.</p>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL CREAR / EDITAR INSIGNIA (ADMIN)       -->
    <!-- ========================================== -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">
                {{ isEditing ? 'edit' : 'military_tech' }}
              </span>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-800">
                {{ isEditing ? 'Editar Insignia' : 'Crear Nueva Insignia' }}
              </h3>
              <p class="text-xs text-gray-400">
                {{ isEditing ? 'Actualiza los criterios pedagógicos y meta de XP' : 'Configura un nuevo hito de gamificación por experiencia' }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Nombre de la Insignia -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Nombre de la Insignia <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ej: Auxiliar Destacado, Maestro de Farmacología"
              required
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <!-- Descripción Pedagógica -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Descripción Pedagógica <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Ej: Acumula 250 XP superando retos clínicos y repasando vocabulario técnico."
              required
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            ></textarea>
          </div>

          <!-- XP Requerido -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Experiencia Requerida (XP) <span class="text-red-500">*</span>
              </label>
              <span class="text-xs font-bold text-amber-600">Meta: {{ form.xpRequired || 0 }} XP</span>
            </div>
            <input
              v-model.number="form.xpRequired"
              type="number"
              min="0"
              step="10"
              required
              placeholder="Ej: 250"
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono font-bold"
            />

            <!-- Warning si el XP ya está tomado -->
            <p v-if="duplicateXpBadge" class="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-red-500">warning</span>
              Este hito de XP ya está asignado a "{{ duplicateXpBadge.name }}". Elige un valor único.
            </p>

            <!-- Botones de incremento rápido -->
            <div class="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <button
                type="button"
                v-for="step in [50, 100, 250, 500, 1000, 2500]"
                :key="step"
                @click="form.xpRequired = step"
                :class="[
                  'px-2.5 py-1 text-xs rounded-lg font-semibold transition-all shrink-0',
                  form.xpRequired === step
                    ? 'bg-amber-500 text-white shadow-sm'
                    : isXpTaken(step)
                    ? 'bg-gray-100 text-gray-400 line-through'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
                :title="isXpTaken(step) ? `Ocupado por ${getXpOwner(step)}` : `Asignar ${step} XP`"
              >
                {{ step }} XP
              </button>
            </div>
          </div>

          <!-- Selector de Emoji / Icono -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Icono / Emoji Distintivo <span class="text-red-500">*</span>
              </label>
              <span class="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                1 solo icono permitido
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-inner select-none overflow-hidden">
                {{ extractSingleEmoji(form.iconEmoji) }}
              </div>
              <div class="flex-1 space-y-1.5">
                <!-- Preset Emoji Grid -->
                <div class="grid grid-cols-8 gap-1 p-2 bg-gray-50 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    v-for="emoji in PRESET_EMOJIS"
                    :key="emoji"
                    @click="selectEmoji(emoji)"
                    :class="[
                      'w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all select-none',
                      form.iconEmoji === emoji ? 'bg-white shadow-sm ring-2 ring-amber-500 font-bold scale-105' : ''
                    ]"
                    :title="`Seleccionar ${emoji}`"
                  >
                    {{ emoji }}
                  </button>
                </div>
                <div class="relative">
                  <input
                    :value="form.iconEmoji"
                    @input="onEmojiInput"
                    type="text"
                    maxlength="8"
                    placeholder="Escribe o pega 1 solo emoji..."
                    class="w-full pl-3 pr-10 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:bg-white focus:border-amber-500 font-mono"
                  />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                    {{ form.iconEmoji ? '1/1' : '0/1' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span
                v-if="actionLoading"
                class="material-symbols-outlined text-base animate-spin"
                >progress_activity</span
              >
              <span v-else class="material-symbols-outlined text-base">save</span>
              {{ isEditing ? 'Guardar Cambios' : 'Crear Insignia' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL CONFIRMAR ELIMINACIÓN                -->
    <!-- ========================================== -->
    <div
      v-if="showDeleteModal && badgeToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h3 class="text-lg font-bold text-gray-800">¿Eliminar esta insignia?</h3>
          <p class="text-sm text-gray-500 mt-1">
            Se eliminará permanentemente la insignia <span class="font-bold text-gray-800">{{ badgeToDelete.name }}</span> ({{ badgeToDelete.iconEmoji }}).
          </p>

          <div class="mt-4 p-3 bg-red-50/80 border border-red-100 rounded-xl text-xs text-red-700 text-left space-y-1">
            <div class="flex items-center gap-1.5 font-bold">
              <span class="material-symbols-outlined text-sm">info</span>
              Consecuencias de eliminación:
            </div>
            <p>• La insignia desaparecerá del catálogo para todos los aprendices.</p>
            <p>• Se eliminarán los registros de otorgamiento de los aprendices que la hayan alcanzado.</p>
          </div>

          <div class="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              @click="closeDeleteModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmDeleteBadge"
              :disabled="actionLoading"
              class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span
                v-if="actionLoading"
                class="material-symbols-outlined text-base animate-spin"
                >progress_activity</span
              >
              <span v-else class="material-symbols-outlined text-base">delete_forever</span>
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const loading = ref(false)
const actionLoading = ref(false)

const searchQuery = ref('')
const filterTier = ref('all')

// Admin Badges and Stats
const adminBadges = ref([])
const adminStats = reactive({
  totalBadges: 0,
  totalAwarded: 0,
  totalApprentices: 0,
  minXp: 0,
  maxXp: 0
})

// Learner Badges
const unlockedBadges = ref([])
const lockedBadges = ref([])
const totalCount = ref(0)
const currentLearnerXp = ref(0)

// Modal State
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteModal = ref(false)
const badgeToDelete = ref(null)

const form = reactive({
  id: null,
  name: '',
  description: '',
  xpRequired: 100,
  iconEmoji: '🏆'
})

const PRESET_EMOJIS = [
  '🏆', '🎯', '🔥', '🧠', '⚡', '👩‍⚕️', '💉', '🩺',
  '💊', '🌟', '🎖️', '🥇', '🥈', '🥉', '🧪', '🚑'
]

// Extraer estrictamente 1 solo emoji/grafema
function extractSingleEmoji(str) {
  if (!str) return '🏆'
  const trimmed = String(str).trim()
  if (!trimmed) return '🏆'
  try {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      const segments = Array.from(segmenter.segment(trimmed))
      return segments.length > 0 ? segments[0].segment : '🏆'
    }
  } catch {
    // fallback
  }
  const arr = Array.from(trimmed)
  return arr.length > 0 ? arr[0] : '🏆'
}

function selectEmoji(emoji) {
  form.iconEmoji = extractSingleEmoji(emoji)
}

function onEmojiInput(event) {
  const val = event.target.value
  if (!val) {
    form.iconEmoji = ''
    return
  }
  const single = extractSingleEmoji(val)
  form.iconEmoji = single
  event.target.value = single
}

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

// Fetch badges according to role
async function fetchData() {
  loading.value = true
  const token = getToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    if (auth.isAdmin) {
      const res = await fetch(`${apiBaseUrl}/api/gamification/admin/badges`, { headers })
      if (res.ok) {
        const responseData = await res.json()
        const data = responseData.data || responseData
        adminBadges.value = data.badges || []
        adminStats.totalBadges = data.totalBadges || adminBadges.value.length
        adminStats.totalAwarded = data.totalAwarded || 0
        adminStats.totalApprentices = data.totalApprentices || 0
        adminStats.minXp = data.minXp || 0
        adminStats.maxXp = data.maxXp || 0
      }
    } else {
      const res = await fetch(`${apiBaseUrl}/api/gamification/badges`, { headers })
      if (res.ok) {
        const responseData = await res.json()
        const data = responseData.data || responseData
        unlockedBadges.value = data.unlocked || []
        lockedBadges.value = data.locked || []
        totalCount.value = data.totalBadges || (unlockedBadges.value.length + lockedBadges.value.length)
      }

      // Also get current user XP from profile or user state
      if (auth.user?.xp !== undefined) {
        currentLearnerXp.value = auth.user.xp
      }
    }
  } catch (err) {
    console.error('Error al cargar insignias:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Learner completion percentage
const learnerProgressPct = computed(() => {
  const total = totalCount.value || (unlockedBadges.value.length + lockedBadges.value.length)
  if (total === 0) return 0
  return Math.round((unlockedBadges.value.length / total) * 100)
})

// Filtered Admin Badges
const filteredAdminBadges = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return adminBadges.value.filter((b) => {
    const matchSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)

    let matchTier = true
    if (filterTier.value === 'starter') matchTier = b.xpRequired <= 100
    else if (filterTier.value === 'intermediate') matchTier = b.xpRequired > 100 && b.xpRequired <= 500
    else if (filterTier.value === 'advanced') matchTier = b.xpRequired > 500

    return matchSearch && matchTier
  })
})

// Filtered Learner Badges
const filteredUnlocked = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return unlockedBadges.value.filter((b) => {
    const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.description || b.desc || '').toLowerCase().includes(q)
    let matchTier = true
    const xp = b.xpRequired || b.pts || 0
    if (filterTier.value === 'starter') matchTier = xp <= 100
    else if (filterTier.value === 'intermediate') matchTier = xp > 100 && xp <= 500
    else if (filterTier.value === 'advanced') matchTier = xp > 500
    return matchSearch && matchTier
  })
})

const filteredLocked = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return lockedBadges.value.filter((b) => {
    const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.description || b.hint || '').toLowerCase().includes(q)
    let matchTier = true
    const xp = b.xpRequired || b.pts || 0
    if (filterTier.value === 'starter') matchTier = xp <= 100
    else if (filterTier.value === 'intermediate') matchTier = xp > 100 && xp <= 500
    else if (filterTier.value === 'advanced') matchTier = xp > 500
    return matchSearch && matchTier
  })
})

function resetFilters() {
  searchQuery.value = ''
  filterTier.value = 'all'
}

// ----------------- CRUD MODALS -----------------
function openCreateModal() {
  isEditing.value = false
  form.id = null
  form.name = ''
  form.description = ''
  form.xpRequired = 100
  form.iconEmoji = '🏆'
  showModal.value = true
}

function openEditModal(badge) {
  isEditing.value = true
  form.id = badge.id
  form.name = badge.name
  form.description = badge.description
  form.xpRequired = badge.xpRequired
  form.iconEmoji = badge.iconEmoji || '🏆'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.id = null
}

const duplicateXpBadge = computed(() => {
  if (form.xpRequired === undefined || form.xpRequired === null) return null
  const targetXp = Number(form.xpRequired)
  return adminBadges.value.find((b) => b.xpRequired === targetXp && b.id !== form.id) || null
})

function isXpTaken(step) {
  return adminBadges.value.some((b) => b.xpRequired === step && b.id !== form.id)
}

function getXpOwner(step) {
  const badge = adminBadges.value.find((b) => b.xpRequired === step && b.id !== form.id)
  return badge ? badge.name : ''
}

async function handleSubmit() {
  if (!form.name.trim() || !form.description.trim()) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Por favor ingresa nombre y descripción para la insignia.'
    })
    return
  }

  if (duplicateXpBadge.value) {
    notificationStore.notify({
      type: 'warning',
      title: 'Hito de XP duplicado',
      message: `Ya existe la insignia "${duplicateXpBadge.value.name}" con ${form.xpRequired} XP. Cada insignia debe tener una meta de XP única.`
    })
    return
  }

  actionLoading.value = true
  const token = getToken()
  const url = isEditing.value
    ? `${apiBaseUrl}/api/gamification/admin/badges/${form.id}`
    : `${apiBaseUrl}/api/gamification/admin/badges`
  const method = isEditing.value ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        xpRequired: Number(form.xpRequired),
        iconEmoji: extractSingleEmoji(form.iconEmoji)
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al guardar la insignia.')

    notificationStore.notify({
      type: 'success',
      title: isEditing.value ? 'Insignia actualizada' : 'Insignia creada',
      message: `La medalla "${form.name}" (${form.xpRequired} XP) fue configurada exitosamente.`
    })

    closeModal()
    await fetchData()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo guardar la insignia.'
    })
  } finally {
    actionLoading.value = false
  }
}

function openDeleteModal(badge) {
  badgeToDelete.value = badge
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  badgeToDelete.value = null
}

async function confirmDeleteBadge() {
  if (!badgeToDelete.value) return

  actionLoading.value = true
  const token = getToken()
  const targetId = badgeToDelete.value.id
  const targetName = badgeToDelete.value.name

  try {
    const res = await fetch(`${apiBaseUrl}/api/gamification/admin/badges/${targetId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al eliminar insignia.')

    adminBadges.value = adminBadges.value.filter((b) => b.id !== targetId)

    notificationStore.notify({
      type: 'success',
      title: 'Insignia eliminada',
      message: `La insignia "${targetName}" fue removida del catálogo.`
    })

    closeDeleteModal()
    await fetchData()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error al eliminar',
      message: err.message || 'No se pudo eliminar la insignia.'
    })
  } finally {
    actionLoading.value = false
  }
}
</script>
