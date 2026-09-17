<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── ADMIN / INSTRUCTOR GAMIFICATION MANAGEMENT PORTAL ── -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <template v-if="auth.isAdmin || auth.isInstructor">
      
      <!-- If Admin wants to test-play the Warm-up game -->
      <div v-if="activeGame === 'drag_match'" class="space-y-6 animate-fade-in">
        <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <button @click="quitGame" class="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-gray-800 text-lg">Modo Prueba Docente: Warm-up Drag Match</h3>
                <span class="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Vista Previa</span>
              </div>
              <p class="text-xs text-gray-500">Sesión de Calentamiento de Comunicación Médica (Ronda {{ currentRoundIndex + 1 }} de 4)</p>
            </div>
          </div>
          <button @click="quitGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer">
            Volver a Gestión de Juegos
          </button>
        </div>

        <!-- Reusable Drag Match Engine -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div v-if="!gameFinished" class="space-y-6">
            <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-700">Tema de la Ronda</span>
                <p class="text-sm font-bold text-gray-800">{{ currentRound.theme }}</p>
              </div>
              <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-black text-[#006688]">
                <span class="material-symbols-outlined text-sm">emoji_events</span>
                +100 XP
              </div>
            </div>

            <!-- Target Drop Slots (Expressions) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                v-for="target in currentRoundTargets" 
                :key="target.id"
                :class="`border-2 border-dashed rounded-2xl p-5 text-center min-h-[140px] flex flex-col items-center justify-center transition-all ${
                  target.filledWith 
                    ? 'border-green-400 bg-green-50/60' 
                    : 'border-gray-200 bg-gray-50/50 hover:border-[#006688]/40'
                }`"
              >
                <div v-if="target.filledWith" class="space-y-2 animate-zoom-in">
                  <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                    <span class="material-symbols-outlined text-xl">check</span>
                  </div>
                  <p class="text-xs font-black text-gray-800">{{ target.filledWith.label }}</p>
                  <p class="text-xs font-bold text-green-700 bg-white px-2 py-0.5 rounded-full border border-green-200 inline-block">{{ target.match }}</p>
                </div>
                <div v-else class="space-y-1 text-gray-400">
                  <span class="material-symbols-outlined text-2xl opacity-40">input</span>
                  <p class="text-xs font-bold text-gray-700">"{{ target.match }}"</p>
                  <p class="text-[10px] text-gray-400">Suelta la tarjeta aquí</p>
                </div>
              </div>
            </div>

            <!-- Draggable Cards Pool -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Tarjetas Disponibles</span>
              <div class="flex flex-wrap gap-4 min-h-[90px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div 
                  v-for="card in currentRoundCards" 
                  :key="card.id"
                  v-show="!card.matched"
                  @pointerdown="startDrag($event, card)"
                  :style="`transform: translate(${card.x}px, ${card.y}px);`"
                  :class="`draggable-card select-none cursor-grab active:cursor-grabbing bg-white border border-gray-200 shadow-sm hover:shadow-md px-4 py-3 rounded-2xl flex items-center gap-3 transition-shadow ${card.isResetting ? 'card-reset' : ''}`"
                >
                  <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span :class="`material-symbols-outlined text-lg ${card.color}`">{{ card.icon }}</span>
                  </div>
                  <div class="text-left">
                    <p class="text-xs font-black text-gray-800 leading-none">{{ card.label }}</p>
                    <span class="text-[10px] text-gray-400 font-semibold">Arrastrar</span>
                  </div>
                </div>
                <p v-if="isRoundCompleted" class="text-xs font-bold text-green-600 flex items-center gap-1 my-auto">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  ¡Excelente! Ronda completada.
                </p>
              </div>
            </div>

            <div class="flex justify-between items-center border-t border-gray-100 pt-4">
              <span class="text-xs text-gray-400">Arrastra cada elemento al cuadro con su término correspondiente.</span>
              <button 
                @click="nextRound" 
                :disabled="!isRoundCompleted"
                :class="`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ${
                  isRoundCompleted 
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`"
              >
                {{ currentRoundIndex === 3 ? 'Finalizar Demostración' : 'Siguiente Ronda' }}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Victory Preview -->
          <div v-else class="text-center space-y-5 py-8 animate-fade-in max-w-md mx-auto">
            <div class="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg mx-auto text-white">
              <span class="material-symbols-outlined text-4xl">emoji_events</span>
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-black text-gray-800">¡Prueba de Juego Superada!</h3>
              <p class="text-xs text-gray-600">Has probado las 4 rondas de calentamiento clínico con éxito.</p>
            </div>
            <div class="flex gap-2 justify-center pt-2">
              <button @click="resetGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">
                Probar de Nuevo
              </button>
              <button @click="quitGame" class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl cursor-pointer">
                Volver al Panel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Admin Gaming Dashboard Screen -->
      <div v-else class="space-y-6 animate-fade-in">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-[#006688] to-[#00a8cc] rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-6 flex-wrap">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">Gestión Docente</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black">Centro de Juegos y Gamificación</h2>
            <p class="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Supervisa las dinámicas interactivas de enfermería, audita partidas jugadas por los estudiantes y crea nuevos retos lúdicos por cursos y fases pedagógicas.
            </p>
            <div class="flex items-center gap-3 pt-2 flex-wrap">
              <button 
                @click="openCreateModal"
                class="px-5 py-2.5 bg-white text-[#006688] hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                Crear Dinámica de Juego
              </button>
              <button 
                @click="startGame('drag_match')"
                class="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">play_arrow</span>
                Probar Calentamiento
              </button>
            </div>
          </div>

          <div class="hidden lg:flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 border border-white/20">
            <span class="material-symbols-outlined text-7xl text-white/80">sports_esports</span>
          </div>
        </div>

        <!-- Real-time Admin KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-blue-50 text-[#006688] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">sports_esports</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold">Dinámicas Activas</p>
              <p class="text-lg font-black text-gray-800">{{ adminStats.gamifiedActivitiesCount }}</p>
            </div>
          </div>

          <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">videogame_asset</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold">Partidas Jugadas</p>
              <p class="text-lg font-black text-gray-800">{{ adminStats.totalPlays }}</p>
            </div>
          </div>

          <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">stars</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold">XP Ganado en Retos</p>
              <p class="text-lg font-black text-gray-800">{{ adminStats.totalXpAwarded }} XP</p>
            </div>
          </div>

          <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-semibold">Alumnos Participantes</p>
              <p class="text-lg font-black text-gray-800">{{ adminStats.activePlayersCount }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-gray-200 gap-6 text-xs shrink-0">
          <button 
            @click="adminTab = 'dynamics'"
            type="button"
            :class="`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'dynamics'
                ? 'border-[#006688] text-[#006688]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`"
          >
            <span class="material-symbols-outlined text-base">dashboard_customize</span>
            Dinámicas y Retos ({{ filteredGameActivities.length }})
          </button>

          <button 
            @click="adminTab = 'scores'"
            type="button"
            :class="`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'scores'
                ? 'border-[#006688] text-[#006688]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`"
          >
            <span class="material-symbols-outlined text-base">history_edu</span>
            Historial de Partidas ({{ recentScores.length }})
          </button>

          <button 
            @click="adminTab = 'templates'"
            type="button"
            :class="`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'templates'
                ? 'border-[#006688] text-[#006688]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`"
          >
            <span class="material-symbols-outlined text-base">category</span>
            Plantillas Lúdicas Disponibles (7)
          </button>
        </div>

        <!-- TAB 1: DYNAMICS LIST -->
        <div v-if="adminTab === 'dynamics'" class="space-y-4">
          <!-- Filter pills by template -->
          <div class="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-gray-100">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-gray-400 mr-1">Filtrar:</span>
              <button 
                v-for="tpl in templateFilters" 
                :key="tpl.value"
                @click="selectedTemplateFilter = tpl.value"
                :class="`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTemplateFilter === tpl.value ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`"
              >
                {{ tpl.label }}
              </button>
            </div>
            <button 
              @click="loadAdminData" 
              class="text-xs text-gray-500 hover:text-[#006688] flex items-center gap-1 font-bold cursor-pointer"
              title="Actualizar datos"
            >
              <span class="material-symbols-outlined text-sm">refresh</span>
              Actualizar
            </button>
          </div>

          <!-- Activities Grid -->
          <div v-if="filteredGameActivities.length === 0" class="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400 space-y-2">
            <span class="material-symbols-outlined text-4xl text-gray-300">videogame_asset_off</span>
            <p class="text-sm font-bold text-gray-600">No hay dinámicas registradas</p>
            <p class="text-xs text-gray-400">Aún no se han configurado actividades de juego para este filtro.</p>
            <button @click="openCreateModal" class="mt-2 px-4 py-2 bg-[#006688] text-white rounded-xl text-xs font-bold cursor-pointer inline-block">
              Crear Dinámica Ahora
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="act in filteredGameActivities" 
              :key="act.id"
              class="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
            >
              <div class="space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span :class="`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getTemplateMeta(act.template).bg} ${getTemplateMeta(act.template).text}`">
                      <span class="material-symbols-outlined text-base">{{ getTemplateMeta(act.template).icon }}</span>
                    </span>
                    <div>
                      <span class="text-[9px] uppercase font-black tracking-wider text-gray-400 block">{{ getTemplateMeta(act.template).label }}</span>
                      <h4 class="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#006688] transition-colors">{{ act.title }}</h4>
                    </div>
                  </div>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    +{{ act.points }} XP
                  </span>
                </div>

                <p class="text-xs text-gray-500 line-clamp-2">
                  Curso: <span class="font-bold text-gray-700">{{ act.course }}</span> · Fase: <span class="font-semibold text-gray-700">{{ act.phase }}</span>
                </p>

                <div class="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs text-emerald-600">done_all</span>
                    {{ act.playsCount }} entregas registradas
                  </span>
                  <span class="text-[10px] text-gray-400">ID: {{ act.id }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button 
                  @click="openPreviewModal(act)"
                  class="px-2.5 py-1.5 border border-gray-200 hover:border-[#006688] text-gray-600 hover:text-[#006688] rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Ver configuración didáctica"
                >
                  <span class="material-symbols-outlined text-xs">visibility</span>
                  Previsualizar
                </button>
                <button 
                  @click="deleteGameActivity(act.id, act.title)"
                  class="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Eliminar actividad"
                >
                  <span class="material-symbols-outlined text-xs block">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: RECENT GAMES LEADERBOARD AUDIT -->
        <div v-if="adminTab === 'scores'" class="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span class="text-xs font-black text-gray-700 uppercase tracking-wider">Historial de Partidas Jugadas por Aprendices</span>
            <span class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ recentScores.length }} registros recientes</span>
          </div>

          <div v-if="recentScores.length === 0" class="p-12 text-center text-gray-400 text-xs font-semibold">
            Aún no hay partidas de mini-juegos registradas por estudiantes en la base de datos.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th class="p-3.5">Aprendiz</th>
                  <th class="p-3.5">Cédula</th>
                  <th class="p-3.5">Dinámica Jugada</th>
                  <th class="p-3.5 text-center">Rondas</th>
                  <th class="p-3.5 text-center">Puntaje (+XP)</th>
                  <th class="p-3.5 text-right">Fecha de Partida</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 font-medium text-gray-700">
                <tr v-for="sc in recentScores" :key="sc.id" class="hover:bg-gray-50 transition-colors">
                  <td class="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-full bg-[#006688]/10 text-[#006688] font-black text-xs flex items-center justify-center">
                      {{ (sc.user?.nombre?.[0] || 'A').toUpperCase() }}
                    </span>
                    {{ sc.user?.nombre }} {{ sc.user?.apellido }}
                  </td>
                  <td class="p-3.5 text-gray-500">{{ sc.user?.cedula || 'N/A' }}</td>
                  <td class="p-3.5">
                    <span class="bg-blue-50 text-[#006688] px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {{ sc.gameKey }}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">{{ sc.roundsCompleted }} rondas</td>
                  <td class="p-3.5 text-center font-black text-emerald-700">+{{ sc.score }} XP</td>
                  <td class="p-3.5 text-right text-gray-400">{{ formatDate(sc.playedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: GAME ENGINES CATALOG -->
        <div v-if="adminTab === 'templates'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div 
            v-for="tpl in gameEngines" 
            :key="tpl.id"
            class="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#006688]/30 transition-all"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div :class="`w-12 h-12 rounded-2xl flex items-center justify-center ${tpl.bg} ${tpl.color}`">
                  <span class="material-symbols-outlined text-2xl">{{ tpl.icon }}</span>
                </div>
                <div>
                  <h4 class="font-bold text-gray-800 text-sm">{{ tpl.title }}</h4>
                  <span class="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">{{ tpl.category }}</span>
                </div>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">{{ tpl.description }}</p>
            </div>
            
            <div class="border-t border-gray-50 pt-3 flex justify-between items-center">
              <span class="text-[10px] text-gray-400 font-semibold">Fase recomendada: {{ tpl.phase }}</span>
              <button 
                @click="openCreateModalWithTemplate(tpl.templateKey)"
                class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-xs">add</span>
                Crear
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ── MODAL: CREAR NUEVA DINÁMICA LÚDICA ── -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
        <div class="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-slide-up border border-gray-100 flex flex-col my-8 max-h-[90vh]">
          
          <div class="bg-[#006688] text-white p-5 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl">sports_esports</span>
              <h3 class="text-sm font-black">Crear Nueva Dinámica de Juego</h3>
            </div>
            <button @click="showCreateModal = false" class="text-white hover:text-cyan-200 transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="saveGameActivity" class="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
            
            <div class="space-y-1">
              <label class="text-gray-500">Mecánica / Plantilla de Juego</label>
              <select v-model="newGameForm.template" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688]">
                <option value="sopa">Sopa de Letras (Reconocimiento visual)</option>
                <option value="crucigrama">Crucigrama Clínico (Pistas y definiciones)</option>
                <option value="match">Conectar Significado / Parejas</option>
                <option value="fillblank">Completar Oración (Fill in the blank)</option>
                <option value="quiz">Trivia / Quiz Clínico</option>
                <option value="listening">Reto de Escucha (Audio)</option>
                <option value="pronunciation">Reto de Pronunciación (Voz)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-gray-500">Título de la Dinámica</label>
              <input type="text" v-model="newGameForm.title" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688]" placeholder="Ej. Crucigrama de Signos Vitales" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-gray-500">Curso Asociado</label>
                <select v-model="newGameForm.course" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688]">
                  <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-gray-500">Fase Pedagógica</label>
                <select v-model="newGameForm.phase" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688]">
                  <option value="Preparación">Fase 1: Preparación (Warm-up)</option>
                  <option value="Absorción">Fase 2: Absorción (Estudio)</option>
                  <option value="Práctica">Fase 3: Práctica Activa</option>
                  <option value="Cierre">Fase 4: Cierre / Evaluación</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-gray-500">Puntos XP Otorgados</label>
              <input type="number" v-model="newGameForm.points" min="5" max="200" required class="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
            </div>

            <!-- Specific Dynamic Fields based on template -->
            <div v-if="newGameForm.template === 'sopa'" class="space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label class="text-gray-500">Palabras a Buscar (separadas por comas)</label>
              <input type="text" v-model="newGameForm.sopaWords" placeholder="Ej. pulse, heart, blood, syringe, doctor" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              <p class="text-[10px] text-gray-400">El sistema generará la cuadrícula aleatoriamente para el estudiante.</p>
            </div>

            <div v-if="newGameForm.template === 'crucigrama'" class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="space-y-1">
                <label class="text-gray-500">Pista / Definición</label>
                <input type="text" v-model="newGameForm.crossword1Clue" placeholder="Ej. Instrument for listening to heart sounds" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
              <div class="space-y-1">
                <label class="text-gray-500">Palabra Respuesta en Inglés</label>
                <input type="text" v-model="newGameForm.crossword1Word" placeholder="Ej. STETHOSCOPE" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
            </div>

            <div v-if="newGameForm.template === 'match'" class="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="space-y-1">
                <label class="text-gray-500">Término en Inglés</label>
                <input type="text" v-model="newGameForm.matchTerm" placeholder="Ej. Blood pressure" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
              <div class="space-y-1">
                <label class="text-gray-500">Significado en Español</label>
                <input type="text" v-model="newGameForm.matchMeaning" placeholder="Ej. Presión arterial" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
            </div>

            <div v-if="newGameForm.template === 'fillblank'" class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="space-y-1">
                <label class="text-gray-500">Oración con espacio (usa [blank])</label>
                <input type="text" v-model="newGameForm.fillblankSentence" placeholder="Ej. The nurse checks the patient's [blank]." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
              <div class="space-y-1">
                <label class="text-gray-500">Palabra Correcta</label>
                <input type="text" v-model="newGameForm.fillblankAnswer" placeholder="Ej. temperature" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
            </div>

            <div v-if="newGameForm.template === 'listening'" class="space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label class="text-gray-500">Frase de Audio en Inglés</label>
              <input type="text" v-model="newGameForm.listeningPhrase" placeholder="Ej. The patient is stable and resting comfortably." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
            </div>

            <div v-if="newGameForm.template === 'pronunciation'" class="space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label class="text-gray-500">Frase para Pronunciar en Voz Alta</label>
              <input type="text" v-model="newGameForm.pronouncePhrase" placeholder="Ej. Administer two milligrams intravenously." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
            </div>

            <div v-if="newGameForm.template === 'quiz'" class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="space-y-1">
                <label class="text-gray-500">Pregunta de Trivia</label>
                <input type="text" v-model="newGameForm.quizQuestion" placeholder="Ej. ¿Cuál es el rango normal de frecuencia cardíaca en reposo?" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#006688]" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-green-700">Respuesta Correcta</label>
                  <input type="text" v-model="newGameForm.quizCorrect" placeholder="Ej. 60 - 100 bpm" class="w-full px-3 py-2 bg-white border border-green-300 rounded-xl outline-none focus:border-green-600" />
                </div>
                <div class="space-y-1">
                  <label class="text-red-700">Opción Incorrecta</label>
                  <input type="text" v-model="newGameForm.quizIncorrect" placeholder="Ej. 120 - 160 bpm" class="w-full px-3 py-2 bg-white border border-red-200 rounded-xl outline-none focus:border-red-500" />
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-3 border-t border-gray-100">
              <button 
                type="submit" 
                :disabled="savingGame"
                class="flex-1 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl font-bold transition-all disabled:opacity-60 cursor-pointer"
              >
                {{ savingGame ? 'Guardando...' : 'Guardar y Publicar Dinámica' }}
              </button>
              <button 
                type="button" 
                @click="showCreateModal = false" 
                class="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>

        </div>
      </div>

      <!-- ── MODAL: PREVISUALIZAR DINÁMICA ── -->
      <div v-if="previewingActivity" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up border border-gray-100">
          <div class="bg-[#006688] text-white p-5 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">preview</span>
              <h3 class="text-sm font-black">Vista Previa de Dinámica</h3>
            </div>
            <button @click="previewingActivity = null" class="text-white hover:text-cyan-200 transition-colors cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="p-6 space-y-4 text-xs">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Título</span>
              <h4 class="text-base font-bold text-gray-800">{{ previewingActivity.title }}</h4>
            </div>

            <div class="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-semibold">
              <div>
                <p class="text-[10px] text-gray-400">Curso</p>
                <p class="text-gray-700">{{ previewingActivity.course }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Fase Pedagógica</p>
                <p class="text-gray-700">{{ previewingActivity.phase }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Mecánica / Plantilla</p>
                <p class="capitalize text-[#006688]">{{ previewingActivity.template }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400">Recompensa</p>
                <p class="text-amber-700 font-black">+{{ previewingActivity.points }} XP</p>
              </div>
            </div>

            <!-- Content preview -->
            <div class="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
              <span class="text-[10px] font-black uppercase tracking-wide text-blue-800">Contenido Didáctico</span>
              
              <div v-if="previewingActivity.sopaWords" class="space-y-1">
                <p class="text-[10px] text-gray-500">Palabras ocultas:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.sopaWords }}</p>
              </div>

              <div v-if="previewingActivity.crossword1Clue" class="space-y-1">
                <p class="text-[10px] text-gray-500">Pista:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.crossword1Clue }}</p>
                <p class="text-[10px] text-gray-500 mt-1">Palabra:</p>
                <p class="font-bold text-emerald-700 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.crossword1Word }}</p>
              </div>

              <div v-if="previewingActivity.matchTerm" class="space-y-1">
                <p class="text-[10px] text-gray-500">Pareja a conectar:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.matchTerm }} ➔ {{ previewingActivity.matchMeaning }}</p>
              </div>

              <div v-if="previewingActivity.quizQuestion" class="space-y-1">
                <p class="text-[10px] text-gray-500">Pregunta de Quiz:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.quizQuestion }}</p>
                <p class="text-[10px] text-green-700 mt-1 font-bold">Opción Correcta: {{ previewingActivity.quizCorrect }}</p>
              </div>

              <div v-if="previewingActivity.listeningPhrase" class="space-y-1">
                <p class="text-[10px] text-gray-500">Frase de Audio:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.listeningPhrase }}</p>
              </div>

              <div v-if="previewingActivity.pronouncePhrase" class="space-y-1">
                <p class="text-[10px] text-gray-500">Frase de Pronunciación:</p>
                <p class="font-bold text-gray-800 bg-white p-2 rounded-lg border border-blue-100">{{ previewingActivity.pronouncePhrase }}</p>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button @click="previewingActivity = null" class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── APPRENTICE PLAYABLE VIEW ── -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <!-- Grid Screen: Games Hub -->
      <div v-if="!activeGame" class="space-y-6 animate-fade-in">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Juegos Educativos</h2>
          <p class="text-gray-500 mt-1">Aprende jugando con dinámicas interactivas y gamificadas para calentar motores.</p>
        </div>

        <!-- Featured Game: Warm-up Drag Match -->
        <div class="bg-gradient-to-r from-[#006688] to-indigo-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div class="space-y-3">
            <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">Nuevo Calentamiento</span>
            <h3 class="text-2xl sm:text-3xl font-black">Warm-up Drag Match (Calentamiento)</h3>
            <p class="text-cyan-100 text-sm max-w-lg leading-relaxed">
              Asocia las imágenes clínicas y los iconos de comunicación diaria con sus expresiones en inglés correspondientes en este juego de arrastrar y soltar.
            </p>
            <div class="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">sports_esports</span> 4 Rondas Rápidas</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">emoji_events</span> +100 Puntos</span>
            </div>
            <button 
              @click="startGame('drag_match')"
              class="mt-4 px-6 py-3 bg-white text-[#006688] font-black rounded-xl text-xs hover:bg-cyan-50 transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              Comenzar Calentamiento
              <span class="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </div>
          <span class="material-symbols-outlined text-9xl opacity-20 hidden md:block">pan_tool</span>
        </div>

        <!-- Games Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div 
            v-for="game in games" 
            :key="game.id" 
            @click="startGame(game.key)"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div :class="`h-28 flex items-center justify-center ${game.bg}`">
                <span class="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform" :style="`color:${game.iconColor}`">{{ game.icon }}</span>
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                  <span :class="`text-xs font-bold px-2 py-1 rounded-full ${game.diffBg} ${game.diffText}`">{{ game.difficulty }}</span>
                  <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <span class="material-symbols-outlined text-sm">emoji_events</span>
                    +{{ game.pts }} pts
                  </span>
                </div>
                <h4 class="font-bold text-gray-800 mb-1">{{ game.name }}</h4>
                <p class="text-xs text-gray-500 leading-relaxed">{{ game.desc }}</p>
              </div>
            </div>
            <div class="px-5 pb-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
              <div class="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <span class="material-symbols-outlined text-sm">timer</span>
                {{ game.duration }}
              </div>
              <button class="px-4 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                Jugar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Play Screen for Apprentice: Warm-up Drag Match -->
      <div v-else-if="activeGame === 'drag_match'" class="space-y-6 animate-fade-in">
        <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <button @click="quitGame" class="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <div>
              <h3 class="font-black text-gray-800 text-lg">Warm-up Drag Match</h3>
              <p class="text-xs text-gray-500">Sesión de Calentamiento de Comunicación Médica</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-400">Ronda {{ currentRoundIndex + 1 }} de 4</span>
            <div class="w-24 bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full bg-green-500 transition-all duration-300" :style="`width: ${((currentRoundIndex + 1) / 4) * 100}%`"></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
          <div v-if="!gameFinished" class="space-y-8">
            <div class="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-700">Tema de la Ronda</span>
                <p class="text-sm font-bold text-gray-800">{{ currentRound.theme }}</p>
              </div>
              <span class="material-symbols-outlined text-blue-500 text-2xl">auto_stories</span>
            </div>

            <!-- Target Slots -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                v-for="target in currentRoundTargets" 
                :key="target.id"
                :class="`border-2 border-dashed rounded-2xl p-5 text-center min-h-[150px] flex flex-col items-center justify-center transition-all ${
                  target.filledWith 
                    ? 'border-green-400 bg-green-50/60' 
                    : 'border-gray-200 bg-gray-50/50 hover:border-[#006688]/40'
                }`"
              >
                <div v-if="target.filledWith" class="space-y-2 animate-zoom-in">
                  <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                    <span class="material-symbols-outlined text-xl">check</span>
                  </div>
                  <p class="text-xs font-black text-gray-800">{{ target.filledWith.label }}</p>
                  <p class="text-xs font-bold text-green-700 bg-white px-2.5 py-0.5 rounded-full border border-green-200 inline-block">{{ target.match }}</p>
                </div>
                <div v-else class="space-y-1 text-gray-400">
                  <span class="material-symbols-outlined text-2xl opacity-40">input</span>
                  <p class="text-xs font-bold text-gray-700">"{{ target.match }}"</p>
                  <p class="text-[10px] text-gray-400">Suelta la tarjeta aquí</p>
                </div>
              </div>
            </div>

            <!-- Draggable Cards Pool -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Tarjetas Disponibles</span>
              <div class="flex flex-wrap gap-4 min-h-[90px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div 
                  v-for="card in currentRoundCards" 
                  :key="card.id"
                  v-show="!card.matched"
                  @pointerdown="startDrag($event, card)"
                  :style="`transform: translate(${card.x}px, ${card.y}px);`"
                  :class="`draggable-card select-none cursor-grab active:cursor-grabbing bg-white border border-gray-200 shadow-sm hover:shadow-md px-4 py-3 rounded-2xl flex items-center gap-3 transition-shadow ${card.isResetting ? 'card-reset' : ''}`"
                >
                  <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span :class="`material-symbols-outlined text-lg ${card.color}`">{{ card.icon }}</span>
                  </div>
                  <div class="text-left">
                    <p class="text-xs font-black text-gray-800 leading-none">{{ card.label }}</p>
                    <span class="text-[10px] text-gray-400 font-semibold">Arrastrar</span>
                  </div>
                </div>
                <p v-if="isRoundCompleted" class="text-xs font-bold text-green-600 flex items-center gap-1 my-auto">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  ¡Excelente! Ronda completada.
                </p>
              </div>
            </div>

            <div class="flex justify-between items-center border-t border-gray-50 pt-4 mt-4">
              <span class="text-xs text-gray-400 font-medium">Arrastra y empareja las 3 tarjetas para avanzar.</span>
              <button 
                @click="nextRound" 
                :disabled="!isRoundCompleted"
                :class="`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                  isRoundCompleted 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`"
              >
                {{ currentRoundIndex === 3 ? 'Finalizar Calentamiento' : 'Siguiente Ronda' }}
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Victory screen -->
          <div v-else class="text-center space-y-6 py-8 animate-fade-in max-w-md mx-auto">
            <div class="flex justify-center">
              <div class="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg relative border-4 border-white animate-bounce">
                <span class="material-symbols-outlined text-white text-5xl">emoji_events</span>
              </div>
            </div>
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-gray-800">¡Calentamiento Completado!</h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Has emparejado con éxito todas las imágenes con sus términos de saludos y comunicación clínica en inglés técnico.
              </p>
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 inline-block mt-2 font-bold text-amber-700 text-sm">
                🏆 Recompensa: +100 puntos de Experiencia
              </div>
            </div>
            <div class="flex gap-2 justify-center pt-2">
              <button @click="resetGame" class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer">
                Jugar de Nuevo
              </button>
              <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer">
                Volver al Centro de Juegos
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder screen for mock games -->
      <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6 animate-fade-in max-w-md mx-auto">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">construction</span>
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-black text-gray-800">Módulo en Desarrollo</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            El juego "{{ selectedGameName }}" está siendo optimizado para integrarse con la base de datos de los aprendices. Por ahora, juega el mini-juego de calentamiento de arrastrar y soltar.
          </p>
        </div>
        <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer">
          Ir a Calentamiento
        </button>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

// ─────────────────────────────────────────────────────────────
// ADMIN & INSTRUCTOR MANAGEMENT STATE
// ─────────────────────────────────────────────────────────────
const adminTab = ref('dynamics') // 'dynamics', 'scores', 'templates'
const adminLoading = ref(false)
const selectedTemplateFilter = ref('all')

const adminStats = ref({
  totalPlays: 0,
  totalXpAwarded: 0,
  activePlayersCount: 0,
  gamifiedActivitiesCount: 0
})

const recentScores = ref([])
const gameActivities = ref([])
const courseOptions = ref(['Fundamentos de Enfermería', 'Farmacología Clínica', 'Cuidados Críticos UCI', 'Urgencias y Emergencias'])

// Create dynamic modal state
const showCreateModal = ref(false)
const savingGame = ref(false)
const newGameForm = ref({
  template: 'sopa',
  title: '',
  course: 'Fundamentos de Enfermería',
  phase: 'Preparación',
  points: 10,
  sopaWords: '',
  crossword1Clue: '',
  crossword1Word: '',
  quizQuestion: '',
  quizCorrect: '',
  quizIncorrect: '',
  matchTerm: '',
  matchMeaning: '',
  listeningPhrase: '',
  pronouncePhrase: '',
  fillblankSentence: '',
  fillblankAnswer: ''
})

// Preview modal state
const previewingActivity = ref(null)

const templateFilters = [
  { value: 'all', label: 'Todas las Dinámicas' },
  { value: 'sopa', label: 'Sopas de Letras' },
  { value: 'crucigrama', label: 'Crucigramas' },
  { value: 'match', label: 'Conectar Parejas' },
  { value: 'fillblank', label: 'Completar Texto' },
  { value: 'quiz', label: 'Quizzes / Trivia' },
  { value: 'listening', label: 'Audio Listening' },
  { value: 'pronunciation', label: 'Pronunciación Voz' },
]

const filteredGameActivities = computed(() => {
  if (selectedTemplateFilter.value === 'all') return gameActivities.value
  if (selectedTemplateFilter.value === 'quiz') {
    return gameActivities.value.filter(a => a.template === 'quiz' || a.template === 'preguntas')
  }
  return gameActivities.value.filter(a => a.template === selectedTemplateFilter.value)
})

const gameEngines = [
  { id: 1, templateKey: 'sopa', title: 'Sopa de Letras Médica', category: 'Vocabulario', phase: 'Preparación', bg: 'bg-teal-50', color: 'text-teal-700', icon: 'grid_on', description: 'Permite al aprendiz rastrear y reconocer visualmente términos clínicos en cuadrículas interactivas.' },
  { id: 2, templateKey: 'crucigrama', title: 'Crucigrama Clínico', category: 'Terminología', phase: 'Práctica', bg: 'bg-indigo-50', color: 'text-indigo-700', icon: 'border_inner', description: 'Crucigramas ortogonales con pistas anatómicas y farmacológicas para reforzar definiciones médicas.' },
  { id: 3, templateKey: 'match', title: 'Conectar Parejas / Drag Match', category: 'Asociación', phase: 'Preparación', bg: 'bg-purple-50', color: 'text-purple-700', icon: 'compare_arrows', description: 'Empareja términos en inglés con su traducción o icono clínico mediante arrastre interactivo.' },
  { id: 4, templateKey: 'fillblank', title: 'Completar la Oración', category: 'Gramática', phase: 'Práctica', bg: 'bg-blue-50', color: 'text-blue-700', icon: 'edit_note', description: 'Ejercicios de rellenar el espacio en blanco con fármacos o verbos en historias clínicas.' },
  { id: 5, templateKey: 'listening', title: 'Discriminación Auditiva', category: 'Escucha', phase: 'Absorción', bg: 'bg-pink-50', color: 'text-pink-700', icon: 'volume_up', description: 'Audio hablado en inglés médico con verificación de comprensión y vocabulario.' },
  { id: 6, templateKey: 'pronunciation', title: 'Práctica de Pronunciación', category: 'Fluidez', phase: 'Práctica', bg: 'bg-red-50', color: 'text-red-700', icon: 'mic', description: 'Reconocimiento de voz asistido para evaluar la entonación y claridad al hablar con pacientes.' },
  { id: 7, templateKey: 'quiz', title: 'Trivia y Desafíos Rápidos', category: 'Evaluación', phase: 'Cierre', bg: 'bg-green-50', color: 'text-green-700', icon: 'quiz', description: 'Preguntas tipo test de opción múltiple cronometradas con suma de puntos de experiencia.' },
]

function getTemplateMeta(tpl) {
  const map = {
    sopa: { label: 'Sopa de Letras', icon: 'grid_on', bg: 'bg-teal-50', text: 'text-teal-700' },
    crucigrama: { label: 'Crucigrama', icon: 'border_inner', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    match: { label: 'Conectar Parejas', icon: 'compare_arrows', bg: 'bg-purple-50', text: 'text-purple-700' },
    fillblank: { label: 'Completar Texto', icon: 'edit_note', bg: 'bg-blue-50', text: 'text-blue-700' },
    quiz: { label: 'Quiz / Trivia', icon: 'quiz', bg: 'bg-green-50', text: 'text-green-700' },
    preguntas: { label: 'Opción Múltiple', icon: 'list_alt', bg: 'bg-green-50', text: 'text-green-700' },
    listening: { label: 'Audio Escucha', icon: 'volume_up', bg: 'bg-pink-50', text: 'text-pink-700' },
    pronunciation: { label: 'Pronunciación', icon: 'mic', bg: 'bg-red-50', text: 'text-red-700' },
  }
  return map[tpl] || { label: 'Reto Lúdico', icon: 'sports_esports', bg: 'bg-gray-100', text: 'text-gray-700' }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function getToken() {
  if (auth.token) return auth.token
  if (auth.user?.token) return auth.user.token
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function loadAdminData() {
  if (!auth.isAdmin && !auth.isInstructor) return
  adminLoading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/gamification/admin/games-overview`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      const payload = data.data || data
      adminStats.value = payload.stats || { totalPlays: 0, totalXpAwarded: 0, activePlayersCount: 0, gamifiedActivitiesCount: 0 }
      recentScores.value = payload.recentScores || []
      gameActivities.value = payload.gameActivities || []
    }
  } catch (err) {
    console.error('Error al cargar métricas de juegos:', err)
  } finally {
    adminLoading.value = false
  }
}

async function fetchCourseOptions() {
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.data || [])
      if (list.length > 0) {
        courseOptions.value = list.map(c => c.title || c.name).filter(Boolean)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

function openCreateModal() {
  newGameForm.value = {
    template: 'sopa',
    title: '',
    course: courseOptions.value[0] || 'Fundamentos de Enfermería',
    phase: 'Preparación',
    points: 10,
    sopaWords: 'pulse, heart, blood, syringe, doctor',
    crossword1Clue: '',
    crossword1Word: '',
    quizQuestion: '',
    quizCorrect: '',
    quizIncorrect: '',
    matchTerm: '',
    matchMeaning: '',
    listeningPhrase: '',
    pronouncePhrase: '',
    fillblankSentence: '',
    fillblankAnswer: ''
  }
  showCreateModal.value = true
}

function openCreateModalWithTemplate(templateKey) {
  openCreateModal()
  newGameForm.value.template = templateKey
}

function openPreviewModal(activity) {
  previewingActivity.value = activity
}

async function saveGameActivity() {
  if (!newGameForm.value.title.trim() || !newGameForm.value.course) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos Requeridos',
      message: 'Ingresa un título y selecciona el curso para la dinámica.'
    })
    return
  }

  savingGame.value = true
  const token = getToken()
  try {
    const payload = {
      title: newGameForm.value.title.trim(),
      course: newGameForm.value.course,
      phase: newGameForm.value.phase,
      template: newGameForm.value.template,
      points: parseInt(newGameForm.value.points) || 10,
      attemptsLimit: 'Ilimitados',
      successMessage: '¡Excelente! Has superado el reto.',
      hintMessage: '',
      sopaWords: newGameForm.value.sopaWords,
      crossword1Clue: newGameForm.value.crossword1Clue,
      crossword1Word: newGameForm.value.crossword1Word,
      quizQuestion: newGameForm.value.quizQuestion,
      quizCorrect: newGameForm.value.quizCorrect,
      quizIncorrect: newGameForm.value.quizIncorrect,
      matchTerm: newGameForm.value.matchTerm,
      matchMeaning: newGameForm.value.matchMeaning,
      listeningPhrase: newGameForm.value.listeningPhrase,
      pronouncePhrase: newGameForm.value.pronouncePhrase,
      fillblankSentence: newGameForm.value.fillblankSentence,
      fillblankAnswer: newGameForm.value.fillblankAnswer
    }

    const res = await fetch(`${apiBaseUrl}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo crear la dinámica.')
    }

    notificationStore.notify({
      type: 'success',
      title: 'Dinámica Creada',
      message: 'La actividad lúdica ha sido configurada exitosamente.'
    })
    showCreateModal.value = false
    await loadAdminData()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo guardar la dinámica.'
    })
  } finally {
    savingGame.value = false
  }
}

async function deleteGameActivity(id, title) {
  if (!confirm(`¿Estás seguro de que deseas eliminar la dinámica "${title}"?`)) return
  const token = getToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/activities/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) throw new Error('Error al eliminar la actividad.')
    notificationStore.notify({
      type: 'success',
      title: 'Eliminada',
      message: 'La dinámica fue eliminada correctamente.'
    })
    await loadAdminData()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo eliminar la actividad.'
    })
  }
}

// ─────────────────────────────────────────────────────────────
// APPRENTICE PLAYABLE MINI-GAMES STATE (HU06)
// ─────────────────────────────────────────────────────────────
const games = [
  { id: 1, key: 'drag_match', name: 'Warm-up Drag Match', desc: 'Asocia iconos clínicos y de saludos con sus expresiones en inglés.', icon: 'pan_tool', bg: 'bg-blue-50', iconColor: '#3b82f6', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 100, duration: '3 min' },
  { id: 2, key: 'trivia', name: 'Trivia Médica', desc: 'Preguntas rápidas de conocimiento clínico y farmacológico.', icon: 'quiz', bg: 'bg-emerald-50', iconColor: '#10b981', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 50, duration: '5 min' },
  { id: 3, key: 'anatomy', name: 'Anatomy Explorer', desc: 'Identifica estructuras anatómicas en modelos interactivos.', icon: 'biotech', bg: 'bg-red-50', iconColor: '#ef4444', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 80, duration: '10 min' },
  { id: 4, key: 'drug_match', name: 'Drug Match', desc: 'Empareja medicamentos con sus indicaciones y efectos.', icon: 'medication', bg: 'bg-orange-50', iconColor: '#f97316', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 70, duration: '7 min' },
  { id: 5, key: 'emergency', name: 'Caso de Emergencia', desc: 'Toma decisiones clínicas en simulaciones de emergencia.', icon: 'emergency', bg: 'bg-purple-50', iconColor: '#8b5cf6', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 150, duration: '15 min' },
  { id: 6, key: 'diagnosis', name: 'Diagnóstico Rápido', desc: 'Identifica diagnósticos a partir de síntomas presentados.', icon: 'stethoscope', bg: 'bg-pink-50', iconColor: '#ec4899', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 120, duration: '12 min' },
]

const activeGame = ref(null)
const selectedGameName = ref('')
const currentRoundIndex = ref(0)
const gameFinished = ref(false)

const rounds = [
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

const currentRoundCards = ref([])
const currentRoundTargets = ref([])

const currentRound = computed(() => rounds[currentRoundIndex.value])
const isRoundCompleted = computed(() => currentRoundCards.value.length > 0 && currentRoundCards.value.every(c => c.matched))

const activeDragCard = ref(null)
let initialPointerX = 0
let initialPointerY = 0
let initialCardX = 0
let initialCardY = 0

function startGame(gameKey) {
  if (gameKey === 'drag_match') {
    activeGame.value = 'drag_match'
    currentRoundIndex.value = 0
    gameFinished.value = false
    initRound(0)
  } else {
    activeGame.value = 'mock'
    const found = games.find(g => g.key === gameKey)
    selectedGameName.value = found ? found.name : 'Juego'
  }
}

function quitGame() {
  activeGame.value = null
  selectedGameName.value = ''
  currentRoundIndex.value = 0
  gameFinished.value = false
}

function resetGame() {
  currentRoundIndex.value = 0
  gameFinished.value = false
  initRound(0)
}

function initRound(index) {
  const r = rounds[index]
  const shuffledCards = [...r.items].sort(() => Math.random() - 0.5).map(item => ({
    ...item,
    x: 0,
    y: 0,
    isResetting: false,
    matched: false
  }))
  currentRoundCards.value = shuffledCards

  const shuffledTargets = [...r.items].sort(() => Math.random() - 0.5).map(item => ({
    id: item.id,
    match: item.match,
    filledWith: null
  }))
  currentRoundTargets.value = shuffledTargets
}

function startDrag(e, card) {
  if (card.matched) return
  activeDragCard.value = card
  initialPointerX = e.clientX
  initialPointerY = e.clientY
  initialCardX = card.x
  initialCardY = card.y

  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', endDrag)
}

function onDrag(e) {
  if (!activeDragCard.value) return
  const dx = e.clientX - initialPointerX
  const dy = e.clientY - initialPointerY
  activeDragCard.value.x = initialCardX + dx
  activeDragCard.value.y = initialCardY + dy
}

function endDrag(e) {
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', endDrag)

  if (!activeDragCard.value) return
  const card = activeDragCard.value
  activeDragCard.value = null

  const dropTargets = document.querySelectorAll('.border-dashed')
  let matchedTarget = null

  dropTargets.forEach((targetEl, idx) => {
    const rect = targetEl.getBoundingClientRect()
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      matchedTarget = currentRoundTargets.value[idx]
    }
  })

  if (matchedTarget && !matchedTarget.filledWith && matchedTarget.match === card.match) {
    matchedTarget.filledWith = card
    card.matched = true
  } else {
    slideBack(card)
  }
}

async function nextRound() {
  if (currentRoundIndex.value < rounds.length - 1) {
    currentRoundIndex.value++
    initRound(currentRoundIndex.value)
  } else {
    gameFinished.value = true
    try {
      const token = getToken()
      await fetch(`${apiBaseUrl}/api/gamification/games/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          gameKey: 'warmup_drag_match',
          score: 100,
          roundsCompleted: 4
        })
      })
    } catch (e) {
      console.error('Error saving score:', e)
    }
  }
}

function slideBack(card) {
  card.isResetting = true
  card.x = 0
  card.y = 0
  setTimeout(() => {
    card.isResetting = false
  }, 300)
}

onMounted(() => {
  if (auth.isAdmin || auth.isInstructor) {
    loadAdminData()
    fetchCourseOptions()
  }
})
</script>

<style scoped>
.draggable-card {
  user-select: none;
}
.card-reset {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-zoom-in {
  animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes zoomIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.backdrop-blur-xs {
  backdrop-filter: blur(2px);
}
</style>
