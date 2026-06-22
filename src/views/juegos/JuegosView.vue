<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">

    <!-- ══════════════════════════════════════════
         INSTRUCTOR: PANEL DE GESTIÓN DE JUEGOS
    ══════════════════════════════════════════ -->
    <template v-if="auth.isInstructor || auth.isAdmin">

      <!-- Header -->
      <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Gestión de Juegos Educativos</h2>
          <p class="text-gray-500 mt-1 text-sm">Crea y configura juegos interactivos que verán los aprendices en su panel.</p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-base">add</span>
          Nuevo Juego
        </button>
      </div>

      <!-- Stats pills -->
      <div class="flex flex-wrap gap-3">
        <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#006688]/10 text-[#006688]">
          <span class="material-symbols-outlined text-base">sports_esports</span>
          {{ instructorGames.length }} Juegos Creados
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
          <span class="material-symbols-outlined text-base">published_with_changes</span>
          {{ instructorGames.filter(g => g.published).length }} Publicados
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
          <span class="material-symbols-outlined text-base">edit_note</span>
          {{ instructorGames.filter(g => !g.published).length }} Borradores
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="instructorGames.length === 0" class="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-4xl text-gray-300">sports_esports</span>
        </div>
        <div>
          <p class="font-bold text-gray-500">Aún no has creado ningún juego</p>
          <p class="text-xs text-gray-400 mt-1">Haz clic en "Nuevo Juego" para comenzar</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006688] text-white rounded-xl text-sm font-bold shadow hover:bg-[#004e69] transition-colors"
        >
          <span class="material-symbols-outlined text-base">add</span>
          Crear primer juego
        </button>
      </div>

      <!-- Games Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="game in instructorGames"
          :key="game.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
        >
          <!-- Color header -->
          <div :class="`h-24 flex items-center justify-center relative ${GAME_TYPES[game.type]?.bg ?? 'bg-gray-50'}`">
            <span class="material-symbols-outlined text-5xl opacity-80" :style="`color: ${GAME_TYPES[game.type]?.color ?? '#9ca3af'}`">
              {{ GAME_TYPES[game.type]?.icon ?? 'sports_esports' }}
            </span>
            <span
              :class="`absolute top-2 right-2 text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full ${
                game.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`"
            >
              {{ game.published ? 'Publicado' : 'Borrador' }}
            </span>
          </div>

          <!-- Content -->
          <div class="p-5 flex-1 space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {{ GAME_TYPES[game.type]?.label ?? game.type }}
              </span>
              <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold ml-auto">
                <span class="material-symbols-outlined text-sm">emoji_events</span>
                +{{ game.points }} pts
              </span>
            </div>
            <h4 class="font-black text-gray-800">{{ game.title }}</h4>
            <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ game.description }}</p>
            <div class="flex items-center gap-3 text-[10px] text-gray-400 font-medium pt-1">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">timer</span>
                {{ game.duration }} min
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">signal_cellular_alt</span>
                {{ DIFFICULTY_LABELS[game.difficulty] ?? game.difficulty }}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">calendar_today</span>
                {{ game.createdAt }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-5 pb-4 flex items-center gap-2 border-t border-gray-50 pt-3">
            <button
              @click="previewGame(game)"
              class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
            >
              <span class="material-symbols-outlined text-xs">visibility</span>
              Preview
            </button>
            <button
              @click="openEditModal(game)"
              class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:border-[#006688] hover:text-[#006688] transition-all"
            >
              <span class="material-symbols-outlined text-xs">edit</span>
              Editar
            </button>
            <button
              @click="togglePublish(game)"
              :class="`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ml-auto ${
                game.published
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`"
            >
              <span class="material-symbols-outlined text-xs">{{ game.published ? 'unpublished' : 'published_with_changes' }}</span>
              {{ game.published ? 'Despublicar' : 'Publicar' }}
            </button>
            <button
              @click="deleteGame(game.id)"
              class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
            >
              <span class="material-symbols-outlined text-xs">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── CREATE / EDIT MODAL ── -->
      <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[92vh] animate-slide-up overflow-hidden">

          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-[#006688] to-[#008aad] text-white p-6 flex justify-between items-center shrink-0">
            <div class="space-y-0.5">
              <h3 class="text-lg font-black">{{ editingGame ? 'Editar Juego' : 'Diseñar Nuevo Juego' }}</h3>
              <p class="text-white/70 text-xs">Configura el juego que verán los aprendices en su panel</p>
            </div>
            <button @click="closeModal" class="text-white hover:text-cyan-200 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Tab bar -->
          <div class="bg-gray-50 border-b border-gray-100 p-2 flex gap-1 shrink-0">
            <button
              @click="modalTab = 'config'"
              :class="`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${modalTab === 'config' ? 'bg-white text-[#006688] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
            >
              <span class="material-symbols-outlined text-sm align-middle mr-1">tune</span>
              Configuración
            </button>
            <button
              @click="modalTab = 'preview'"
              :class="`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${modalTab === 'preview' ? 'bg-white text-[#006688] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
            >
              <span class="material-symbols-outlined text-sm align-middle mr-1">visibility</span>
              Vista Previa
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-6">

            <!-- TAB CONFIG -->
            <div v-if="modalTab === 'config'" class="space-y-6 animate-fade-in">

              <!-- Section 1: Info General -->
              <div class="space-y-4">
                <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-1.5 h-3.5 bg-[#006688] rounded-full inline-block"></span>
                  1. Información General
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1 md:col-span-2">
                    <label class="text-xs font-bold text-gray-500">Título del Juego *</label>
                    <input
                      v-model="form.title"
                      type="text"
                      placeholder="Ej. Trivia de Farmacología Avanzada"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688] transition-colors"
                    />
                  </div>
                  <div class="space-y-1 md:col-span-2">
                    <label class="text-xs font-bold text-gray-500">Descripción</label>
                    <textarea
                      v-model="form.description"
                      rows="2"
                      placeholder="Describe brevemente en qué consiste el juego..."
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688] resize-none transition-colors"
                    ></textarea>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500">Curso Asociado</label>
                    <select v-model="form.course" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688]">
                      <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500">Dificultad</label>
                    <select v-model="form.difficulty" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688]">
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500">Puntos a otorgar</label>
                    <input v-model.number="form.points" type="number" min="10" max="500"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688]" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-gray-500">Duración estimada (min)</label>
                    <input v-model.number="form.duration" type="number" min="1" max="60"
                      class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688]" />
                  </div>
                </div>
              </div>

              <!-- Section 2: Tipo -->
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-1.5 h-3.5 bg-[#006688] rounded-full inline-block"></span>
                  2. Tipo de Juego
                </h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    v-for="(meta, key) in GAME_TYPES"
                    :key="key"
                    @click="form.type = key; resetTypeFields()"
                    type="button"
                    :class="`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all text-center ${
                      form.type === key
                        ? 'border-[#006688] bg-[#006688]/5 text-[#006688]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`"
                  >
                    <span class="material-symbols-outlined text-3xl">{{ meta.icon }}</span>
                    <span class="text-[10px] font-black leading-tight">{{ meta.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Section 3: Contenido dinámico -->
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="w-1.5 h-3.5 bg-[#006688] rounded-full inline-block"></span>
                  3. Contenido del Juego
                </h4>
                <div class="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-5">

                  <!-- DRAG MATCH -->
                  <div v-if="form.type === 'drag_match'" class="space-y-4">
                    <p class="text-xs text-gray-500 font-semibold">Define las rondas de emparejamiento. Cada ronda tiene 3 pares (etiqueta, icono, texto destino).</p>
                    <div v-for="(round, ri) in form.dragRounds" :key="ri" class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-black text-[#006688]">Ronda {{ ri + 1 }}</span>
                        <button v-if="form.dragRounds.length > 1" @click="form.dragRounds.splice(ri, 1)" type="button" class="text-red-400 hover:text-red-600">
                          <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <input v-model="round.theme" type="text" placeholder="Tema de la ronda (ej. Saludos Clínicos)"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                      <div class="space-y-2">
                        <div v-for="(pair, pi) in round.pairs" :key="pi" class="grid grid-cols-3 gap-2 items-center">
                          <input v-model="pair.label" type="text" placeholder="Etiqueta" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                          <input v-model="pair.icon" type="text" placeholder="Icono material" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold font-mono focus:outline-none" />
                          <input v-model="pair.match" type="text" placeholder="Texto destino (en)" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                        <p class="text-[9px] text-gray-400 font-medium">Columnas: Etiqueta | Icono Material | Texto destino</p>
                      </div>
                    </div>
                    <button @click="addDragRound" type="button"
                      class="flex items-center gap-1 px-3 py-2 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-xs rounded-xl transition-all">
                      <span class="material-symbols-outlined text-sm">add</span>
                      Agregar Ronda
                    </button>
                  </div>

                  <!-- TRIVIA -->
                  <div v-else-if="form.type === 'trivia'" class="space-y-4">
                    <p class="text-xs text-gray-500 font-semibold">Agrega preguntas de trivia médica con opciones de respuesta.</p>
                    <div v-for="(q, qi) in form.triviaQuestions" :key="qi" class="bg-white rounded-xl border border-gray-200 p-4 space-y-3 relative">
                      <button v-if="form.triviaQuestions.length > 1" @click="form.triviaQuestions.splice(qi, 1)" type="button"
                        class="absolute top-3 right-3 text-red-400 hover:text-red-600">
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                      <div class="space-y-1">
                        <label class="text-[10px] font-black text-gray-400">Pregunta {{ qi + 1 }}</label>
                        <input v-model="q.question" type="text" placeholder="¿Cuál es la dosis estándar de paracetamol?"
                          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div class="space-y-1">
                          <label class="text-[10px] font-black text-green-600">✓ Respuesta Correcta</label>
                          <input v-model="q.correct" type="text"
                            class="w-full px-2 py-1.5 border border-green-200 bg-green-50/30 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                        <div v-for="(opt, oi) in q.wrong" :key="oi" class="space-y-1">
                          <label class="text-[10px] font-black text-red-500">✗ Opción incorrecta {{ oi + 1 }}</label>
                          <input v-model="q.wrong[oi]" type="text"
                            class="w-full px-2 py-1.5 border border-red-200 bg-red-50/20 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-black text-gray-400">Explicación (se muestra al responder)</label>
                        <input v-model="q.explanation" type="text" placeholder="La dosis estándar es 500mg cada 8h..."
                          class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                      </div>
                    </div>
                    <button @click="form.triviaQuestions.push({ question: '', correct: '', wrong: ['', ''], explanation: '' })" type="button"
                      class="flex items-center gap-1 px-3 py-2 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-xs rounded-xl transition-all">
                      <span class="material-symbols-outlined text-sm">add</span>
                      Agregar Pregunta
                    </button>
                  </div>

                  <!-- EMERGENCY / DIAGNOSIS -->
                  <div v-else-if="form.type === 'emergency' || form.type === 'diagnosis'" class="space-y-4">
                    <p class="text-xs text-gray-500 font-semibold">
                      {{ form.type === 'emergency' ? 'Define el caso clínico y las decisiones posibles.' : 'Define los síntomas y los posibles diagnósticos.' }}
                    </p>
                    <div class="space-y-3">
                      <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">{{ form.type === 'emergency' ? 'Descripción del caso' : 'Síntomas presentados' }}</label>
                        <textarea v-model="form.scenario.description" rows="3"
                          :placeholder="form.type === 'emergency'
                            ? 'Ej. Paciente de 45 años con dolor precordial irradiado al brazo izquierdo...'
                            : 'Ej. Fiebre de 39°C, tos productiva, crepitantes en base derecha...'"
                          class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688] resize-none"></textarea>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label class="text-[10px] font-black text-green-600">✓ {{ form.type === 'emergency' ? 'Acción correcta' : 'Diagnóstico correcto' }}</label>
                          <input v-model="form.scenario.correct" type="text"
                            :placeholder="form.type === 'emergency' ? 'Ej. Activar código infarto' : 'Ej. Neumonía bacteriana'"
                            class="w-full px-3 py-2 border border-green-200 bg-green-50/20 rounded-xl text-xs font-semibold focus:outline-none" />
                        </div>
                        <div v-for="(opt, oi) in form.scenario.wrong" :key="oi" class="space-y-1">
                          <label class="text-[10px] font-black text-red-500">✗ Opción {{ oi + 1 }}</label>
                          <input v-model="form.scenario.wrong[oi]" type="text"
                            :placeholder="form.type === 'emergency' ? 'Opción incorrecta' : 'Diagnóstico erróneo'"
                            class="w-full px-3 py-2 border border-red-200 bg-red-50/20 rounded-xl text-xs font-semibold focus:outline-none" />
                        </div>
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-black text-gray-400">Retroalimentación al responder correctamente</label>
                        <input v-model="form.scenario.explanation" type="text"
                          placeholder="Ej. Correcto. El IAM requiere activación inmediata del equipo..."
                          class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-center py-8 text-gray-400">
                    <span class="material-symbols-outlined text-3xl block mb-2">tune</span>
                    <p class="text-xs font-semibold">Selecciona un tipo de juego para configurarlo</p>
                  </div>

                </div>
              </div>

            </div><!-- end tab config -->

            <!-- TAB PREVIEW -->
            <div v-else class="space-y-4 animate-fade-in">
              <div class="bg-[#006688]/5 border border-[#006688]/20 rounded-2xl p-3 text-xs flex items-center gap-2 text-[#006688]">
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span class="font-semibold">Así verá el aprendiz este juego en su panel de Juegos Educativos.</span>
              </div>

              <!-- Preview card -->
              <div class="max-w-xs mx-auto">
                <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
                  <div :class="`h-28 flex items-center justify-center ${GAME_TYPES[form.type]?.bg ?? 'bg-gray-50'}`">
                    <span class="material-symbols-outlined text-5xl" :style="`color: ${GAME_TYPES[form.type]?.color ?? '#9ca3af'}`">
                      {{ GAME_TYPES[form.type]?.icon ?? 'sports_esports' }}
                    </span>
                  </div>
                  <div class="p-5 space-y-2">
                    <div class="flex items-center justify-between">
                      <span :class="`text-xs font-bold px-2 py-1 rounded-full ${DIFFICULTY_BADGE[form.difficulty]}`">{{ DIFFICULTY_LABELS[form.difficulty] }}</span>
                      <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                        <span class="material-symbols-outlined text-sm">emoji_events</span>
                        +{{ form.points }} pts
                      </span>
                    </div>
                    <h4 class="font-bold text-gray-800">{{ form.title || 'Título del juego' }}</h4>
                    <p class="text-xs text-gray-500 leading-relaxed">{{ form.description || 'Descripción del juego...' }}</p>
                    <div class="flex items-center gap-2 text-[10px] text-gray-400 pt-1">
                      <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">timer</span>{{ form.duration }} min</span>
                      <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">school</span>{{ form.course || 'Sin curso' }}</span>
                    </div>
                  </div>
                  <div class="px-5 pb-4 border-t border-gray-50 pt-3 flex justify-end">
                    <button class="px-4 py-1.5 bg-[#006688] text-white text-xs font-bold rounded-xl">Jugar</button>
                  </div>
                </div>
              </div>

              <!-- Trivia content preview -->
              <div v-if="form.type === 'trivia' && form.triviaQuestions.length" class="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Vista previa de preguntas</p>
                <div v-for="(q, qi) in form.triviaQuestions.slice(0, 2)" :key="qi" class="space-y-2">
                  <p class="text-sm font-bold text-gray-800">{{ qi + 1 }}. {{ q.question || '(pregunta vacía)' }}</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div class="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">✓ {{ q.correct || '—' }}</div>
                    <div v-for="(w, wi) in q.wrong" :key="wi" class="px-3 py-2 bg-red-50/40 border border-red-100 rounded-lg text-xs font-semibold text-gray-500">✗ {{ w || '—' }}</div>
                  </div>
                </div>
                <p v-if="form.triviaQuestions.length > 2" class="text-xs text-gray-400 text-center">… y {{ form.triviaQuestions.length - 2 }} pregunta(s) más</p>
              </div>

              <!-- Emergency/Diagnosis preview -->
              <div v-if="(form.type === 'emergency' || form.type === 'diagnosis') && form.scenario.description"
                class="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Vista previa del caso</p>
                <p class="text-sm font-semibold text-gray-700 leading-relaxed">{{ form.scenario.description }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div class="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-700">✓ {{ form.scenario.correct || '—' }}</div>
                  <div v-for="(w, wi) in form.scenario.wrong" :key="wi" class="px-3 py-2 bg-red-50/40 border border-red-100 rounded-lg text-xs font-semibold text-gray-500">✗ {{ w || '—' }}</div>
                </div>
              </div>

              <!-- Drag match preview -->
              <div v-if="form.type === 'drag_match'" class="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Vista previa de rondas</p>
                <div v-for="(round, ri) in form.dragRounds.slice(0, 2)" :key="ri" class="space-y-1">
                  <p class="text-xs font-black text-[#006688]">Ronda {{ ri + 1 }}: {{ round.theme || '(sin tema)' }}</p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(pair, pi) in round.pairs" :key="pi"
                      class="text-[10px] font-semibold bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-gray-600 flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs">{{ pair.icon || 'star' }}</span>
                      {{ pair.label || '—' }} → {{ pair.match || '—' }}
                    </span>
                  </div>
                </div>
              </div>

            </div><!-- end tab preview -->
          </div><!-- end modal body -->

          <!-- Modal Footer -->
          <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-2 shrink-0">
            <label class="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
              <input type="checkbox" v-model="form.publishNow" class="rounded text-[#006688]" />
              Publicar al guardar
            </label>
            <div class="flex gap-2">
              <button @click="closeModal"
                class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all">
                Cancelar
              </button>
              <button
                @click="saveGame"
                :disabled="!form.title.trim()"
                :class="`px-5 py-2 text-white font-bold text-xs rounded-xl shadow transition-all ${
                  form.title.trim() ? 'bg-[#006688] hover:bg-[#004e69]' : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`"
              >
                {{ editingGame ? 'Guardar Cambios' : 'Crear Juego' }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- ── PREVIEW QUICK MODAL ── -->
      <div v-if="previewingGame" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        @click.self="previewingGame = null">
        <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
          <div :class="`h-36 flex items-center justify-center relative ${GAME_TYPES[previewingGame.type]?.bg ?? 'bg-gray-100'}`">
            <span class="material-symbols-outlined text-7xl opacity-60" :style="`color: ${GAME_TYPES[previewingGame.type]?.color ?? '#9ca3af'}`">
              {{ GAME_TYPES[previewingGame.type]?.icon ?? 'sports_esports' }}
            </span>
            <button @click="previewingGame = null"
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div class="p-6 space-y-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="`text-xs font-bold px-2 py-1 rounded-full ${DIFFICULTY_BADGE[previewingGame.difficulty]}`">{{ DIFFICULTY_LABELS[previewingGame.difficulty] }}</span>
              <span class="text-[10px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{{ GAME_TYPES[previewingGame.type]?.label }}</span>
              <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold ml-auto">
                <span class="material-symbols-outlined text-sm">emoji_events</span>
                +{{ previewingGame.points }} pts
              </span>
            </div>
            <h3 class="text-xl font-black text-gray-800">{{ previewingGame.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ previewingGame.description }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400 font-medium pt-1">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">timer</span>{{ previewingGame.duration }} min</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">school</span>{{ previewingGame.course }}</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">calendar_today</span>{{ previewingGame.createdAt }}</span>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-2">
            <button @click="openEditModal(previewingGame); previewingGame = null"
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Editar
            </button>
            <button @click="togglePublish(previewingGame)"
              :class="`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                previewingGame.published ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#006688] text-white hover:bg-[#004e69]'
              }`">
              {{ previewingGame.published ? 'Despublicar' : 'Publicar' }}
            </button>
          </div>
        </div>
      </div>

    </template>

    <!-- ══════════════════════════════════════════
         APPRENTICE: PLAYABLE GAMES HUB (unchanged)
    ══════════════════════════════════════════ -->
    <template v-else>

      <div v-if="!activeGame" class="space-y-6 animate-fade-in">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Juegos Educativos</h2>
          <p class="text-gray-500 mt-1">Aprende jugando con dinámicas interactivas y gamificadas para calentar motores.</p>
        </div>

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
            <button @click="startGame('drag_match')"
              class="mt-4 px-6 py-3 bg-white text-[#006688] font-black rounded-xl text-xs hover:bg-cyan-50 transition-all shadow-sm active:scale-95 flex items-center gap-1">
              Comenzar Calentamiento
              <span class="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </div>
          <span class="material-symbols-outlined text-9xl opacity-20 hidden md:block">pan_tool</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="game in games" :key="game.id" @click="startGame(game.key)"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between">
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
              <button class="px-4 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-colors">Jugar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- DRAG MATCH PLAY SCREEN -->
      <div v-else-if="activeGame === 'drag_match'" class="space-y-6 animate-fade-in">
        <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <button @click="quitGame" class="flex items-center justify-center p-2 rounded-xl border hover:bg-gray-50 text-gray-600 transition-all">
              <span class="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <div>
              <h3 class="font-black text-gray-800 text-lg">Warm-up Drag Match</h3>
              <p class="text-xs text-gray-500">Sesión de Calentamiento de Comunicación Médica</p>
            </div>
          </div>
          <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
            <span>Ronda {{ currentRoundIndex + 1 }} de 4</span>
            <div class="flex gap-1 ml-2">
              <span v-for="rIndex in 4" :key="rIndex"
                :class="`w-3 h-3 rounded-full ${rIndex <= currentRoundIndex ? 'bg-[#006688]' : 'bg-gray-200'}`"></span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8 min-h-[450px] flex flex-col justify-between">
          <div v-if="!gameFinished" class="space-y-8">
            <div class="border-b border-gray-100 pb-4 text-center sm:text-left">
              <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Tema de la Ronda</h4>
              <h3 class="text-lg font-black text-[#006688] mt-1">{{ currentRound.theme }}</h3>
            </div>
            <div class="space-y-3">
              <p class="text-xs text-gray-500 font-bold text-center">Arrastra las imágenes hacia su texto correspondiente:</p>
              <div class="flex justify-center flex-wrap gap-4 min-h-[120px] items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
                <div v-for="card in currentRoundCards" :key="card.id" v-show="!card.matched" :id="card.id"
                  :class="['draggable-card bg-white border-2 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center gap-2 cursor-grab select-none z-20 touch-none w-28 h-28 transition-transform hover:scale-105 active:cursor-grabbing', card.isResetting ? 'card-reset' : '']"
                  :style="`transform: translate(${card.x}px, ${card.y}px)`"
                  @pointerdown="startDrag($event, card)" @pointermove="onDrag($event)" @pointerup="endDrag($event, card)">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <span :class="['material-symbols-outlined text-3xl', card.color]">{{ card.icon }}</span>
                  </div>
                  <span class="text-[10px] font-black text-gray-700 truncate w-full text-center">{{ card.label }}</span>
                </div>
                <span v-if="currentRoundCards.every(c => c.matched)" class="text-green-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                  <span class="material-symbols-outlined">check_circle</span>
                  ¡Excelente! Todas las imágenes emparejadas.
                </span>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div v-for="target in currentRoundTargets" :key="target.match" :data-match="target.match"
                class="drop-target border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] bg-gray-50/50 transition-all text-center relative"
                :class="[target.matchedCard ? 'border-green-500 bg-green-50/20' : 'hover:border-[#006688]/30', activeDragCard ? 'border-[#006688]/20 bg-cyan-50/10' : '']">
                <div v-if="!target.matchedCard" class="space-y-1">
                  <span class="text-[9px] font-black uppercase tracking-wider text-[#006688] bg-[#006688]/5 px-2 py-0.5 rounded-full">Soltar aquí</span>
                  <p class="text-base font-black text-gray-800 mt-2">"{{ target.match }}"</p>
                </div>
                <div v-else class="animate-zoom-in flex flex-col items-center gap-2">
                  <span :class="['material-symbols-outlined text-4xl', target.matchedCard.color]">{{ target.matchedCard.icon }}</span>
                  <p class="text-xs font-bold text-gray-700">{{ target.matchedCard.label }}</p>
                  <div class="flex items-center gap-1 text-xs font-black text-green-700 bg-green-100/50 px-2 py-0.5 rounded-full border border-green-200">
                    <span class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
                    {{ target.match }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center space-y-6 py-8 animate-fade-in max-w-md mx-auto">
            <div class="flex justify-center">
              <div class="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
                <span class="material-symbols-outlined text-white text-5xl">emoji_events</span>
              </div>
            </div>
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-gray-800">¡Calentamiento Completado!</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Has emparejado con éxito todas las imágenes con sus términos de saludos y comunicación clínica en inglés técnico.</p>
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 inline-block mt-2 font-bold text-amber-700 text-sm">🏆 Recompensa: +100 puntos de Experiencia</div>
            </div>
            <div class="flex gap-2 justify-center pt-2">
              <button @click="resetGame" class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-sm">Jugar de Nuevo</button>
              <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl shadow">Volver al Centro de Juegos</button>
            </div>
          </div>

          <div v-if="!gameFinished" class="flex justify-between items-center border-t border-gray-50 pt-4 mt-4">
            <span class="text-xs text-gray-400 font-medium">Arrastra y empareja las 3 tarjetas para avanzar.</span>
            <button @click="nextRound" :disabled="!isRoundCompleted"
              :class="`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ${
                isRoundCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`">
              {{ currentRoundIndex === 3 ? 'Finalizar Calentamiento' : 'Siguiente Ronda' }}
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PLACEHOLDER FOR OTHER GAMES -->
      <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6 animate-fade-in max-w-md mx-auto">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">construction</span>
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-black text-gray-800">Módulo en Desarrollo</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            El juego "{{ selectedGameName }}" está siendo optimizado. Por ahora, juega el mini-juego de calentamiento.
          </p>
        </div>
        <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl shadow-sm">Ir a Calentamiento</button>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

// ── Constants ────────────────────────────────────────────────
const GAME_TYPES = {
  drag_match: { label: 'Drag & Match',       icon: 'pan_tool',    bg: 'bg-blue-50',    color: '#3b82f6' },
  trivia:     { label: 'Trivia Médica',       icon: 'quiz',        bg: 'bg-emerald-50', color: '#10b981' },
  emergency:  { label: 'Caso de Emergencia',  icon: 'emergency',   bg: 'bg-purple-50',  color: '#8b5cf6' },
  diagnosis:  { label: 'Diagnóstico Rápido',  icon: 'stethoscope', bg: 'bg-pink-50',    color: '#ec4899' },
}
const DIFFICULTY_LABELS = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' }
const DIFFICULTY_BADGE  = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }

const courseOptions = [
  'Fundamentos de Enfermería', 'Farmacología Clínica', 'Cuidados Críticos UCI',
  'Salud Mental y Psiquiatría', 'Atención Materno-Infantil', 'Urgencias y Emergencias',
]

// ── Instructor state ─────────────────────────────────────────
const instructorGames = ref([])
let nextId = 1

const showModal     = ref(false)
const editingGame   = ref(null)
const previewingGame = ref(null)
const modalTab      = ref('config')

function defaultForm() {
  return {
    title: '', description: '',
    course: 'Fundamentos de Enfermería',
    type: 'trivia', difficulty: 'easy',
    points: 50, duration: 5, publishNow: false,
    dragRounds: [{
      theme: '',
      pairs: [
        { label: '', icon: 'wb_sunny', match: '' },
        { label: '', icon: 'bedtime',  match: '' },
        { label: '', icon: 'badge',    match: '' },
      ]
    }],
    triviaQuestions: [{ question: '', correct: '', wrong: ['', ''], explanation: '' }],
    scenario: { description: '', correct: '', wrong: ['', ''], explanation: '' },
  }
}

const form = ref(defaultForm())

function resetTypeFields() {
  form.value.dragRounds = [{ theme: '', pairs: [{ label: '', icon: 'wb_sunny', match: '' }, { label: '', icon: 'bedtime', match: '' }, { label: '', icon: 'badge', match: '' }] }]
  form.value.triviaQuestions = [{ question: '', correct: '', wrong: ['', ''], explanation: '' }]
  form.value.scenario = { description: '', correct: '', wrong: ['', ''], explanation: '' }
}

function addDragRound() {
  form.value.dragRounds.push({
    theme: '',
    pairs: [{ label: '', icon: 'wb_sunny', match: '' }, { label: '', icon: 'bedtime', match: '' }, { label: '', icon: 'badge', match: '' }]
  })
}

function openCreateModal() {
  editingGame.value = null
  form.value = defaultForm()
  modalTab.value = 'config'
  showModal.value = true
}

function openEditModal(game) {
  editingGame.value = game
  form.value = {
    title: game.title, description: game.description, course: game.course,
    type: game.type, difficulty: game.difficulty, points: game.points,
    duration: game.duration, publishNow: game.published,
    dragRounds: JSON.parse(JSON.stringify(game.dragRounds ?? defaultForm().dragRounds)),
    triviaQuestions: JSON.parse(JSON.stringify(game.triviaQuestions ?? defaultForm().triviaQuestions)),
    scenario: JSON.parse(JSON.stringify(game.scenario ?? defaultForm().scenario)),
  }
  modalTab.value = 'config'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingGame.value = null
}

function saveGame() {
  if (!form.value.title.trim()) return
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  if (editingGame.value) {
    const idx = instructorGames.value.findIndex(g => g.id === editingGame.value.id)
    if (idx !== -1) {
      instructorGames.value[idx] = {
        ...instructorGames.value[idx],
        title: form.value.title, description: form.value.description, course: form.value.course,
        type: form.value.type, difficulty: form.value.difficulty, points: form.value.points,
        duration: form.value.duration, published: form.value.publishNow,
        dragRounds: JSON.parse(JSON.stringify(form.value.dragRounds)),
        triviaQuestions: JSON.parse(JSON.stringify(form.value.triviaQuestions)),
        scenario: JSON.parse(JSON.stringify(form.value.scenario)),
      }
    }
  } else {
    instructorGames.value.push({
      id: nextId++,
      title: form.value.title, description: form.value.description, course: form.value.course,
      type: form.value.type, difficulty: form.value.difficulty, points: form.value.points,
      duration: form.value.duration, published: form.value.publishNow,
      createdAt: today,
      dragRounds: JSON.parse(JSON.stringify(form.value.dragRounds)),
      triviaQuestions: JSON.parse(JSON.stringify(form.value.triviaQuestions)),
      scenario: JSON.parse(JSON.stringify(form.value.scenario)),
    })
  }
  closeModal()
}

function togglePublish(game) {
  game.published = !game.published
  if (previewingGame.value?.id === game.id) previewingGame.value = { ...game }
}

function deleteGame(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este juego?')) return
  instructorGames.value = instructorGames.value.filter(g => g.id !== id)
}

function previewGame(game) { previewingGame.value = game }

// ── Apprentice / Drag-match state ────────────────────────────
const games = [
  { id: 1, key: 'drag_match', name: 'Warm-up Drag Match',  desc: 'Asocia iconos clínicos con sus expresiones en inglés.',        icon: 'pan_tool',    bg: 'bg-blue-50',    iconColor: '#3b82f6', difficulty: 'Fácil',  diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 100, duration: '3 min' },
  { id: 2, key: 'trivia',     name: 'Trivia Médica',        desc: 'Preguntas rápidas de conocimiento clínico y farmacológico.',   icon: 'quiz',        bg: 'bg-emerald-50', iconColor: '#10b981', difficulty: 'Fácil',  diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 50,  duration: '5 min' },
  { id: 3, key: 'anatomy',    name: 'Anatomy Explorer',     desc: 'Identifica estructuras anatómicas en modelos interactivos.',   icon: 'biotech',     bg: 'bg-red-50',     iconColor: '#ef4444', difficulty: 'Medio',  diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 80,  duration: '10 min' },
  { id: 4, key: 'drug_match', name: 'Drug Match',           desc: 'Empareja medicamentos con sus indicaciones y efectos.',        icon: 'medication',  bg: 'bg-orange-50',  iconColor: '#f97316', difficulty: 'Medio',  diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 70,  duration: '7 min' },
  { id: 5, key: 'emergency',  name: 'Caso de Emergencia',   desc: 'Toma decisiones clínicas en simulaciones de emergencia.',     icon: 'emergency',   bg: 'bg-purple-50',  iconColor: '#8b5cf6', difficulty: 'Difícil', diffBg: 'bg-red-100',   diffText: 'text-red-700',   pts: 150, duration: '15 min' },
  { id: 6, key: 'diagnosis',  name: 'Diagnóstico Rápido',   desc: 'Identifica diagnósticos a partir de síntomas presentados.',   icon: 'stethoscope', bg: 'bg-pink-50',    iconColor: '#ec4899', difficulty: 'Difícil', diffBg: 'bg-red-100',   diffText: 'text-red-700',   pts: 120, duration: '12 min' },
]

const activeGame        = ref(null)
const selectedGameName  = ref('')
const currentRoundIndex = ref(0)
const gameFinished      = ref(false)
const currentRoundCards  = ref([])
const currentRoundTargets = ref([])
const activeDragCard    = ref(null)
let initialPointerX = 0, initialPointerY = 0, initialCardX = 0, initialCardY = 0

const rounds = [
  { id: 1, theme: 'Saludos Diarios y Horas del Día (Daily Greetings)',       items: [{ id: 'r1-1', label: 'Sol de Mañana',       icon: 'wb_sunny',    color: 'text-amber-500',  match: 'Good morning'    }, { id: 'r1-2', label: 'Sol de Tarde',         icon: 'light_mode',  color: 'text-orange-500', match: 'Good afternoon' }, { id: 'r1-3', label: 'Luna y Estrellas',    icon: 'bedtime',     color: 'text-indigo-400', match: 'Good evening'  }] },
  { id: 2, theme: 'Presentaciones y Recepción en Clínica (Introductions)',   items: [{ id: 'r2-1', label: 'Tarjeta del Enfermero', icon: 'badge',       color: 'text-blue-500',   match: 'I am your nurse' }, { id: 'r2-2', label: 'Apretón de Manos',     icon: 'handshake',   color: 'text-teal-500',   match: 'Nice to meet you' }, { id: 'r2-3', label: 'Signo de Ayuda',      icon: 'help',        color: 'text-purple-500', match: 'How can I help you?' }] },
  { id: 3, theme: 'Reporte de Síntomas del Paciente (Symptoms)',             items: [{ id: 'r3-1', label: 'Termómetro Elevado',  icon: 'thermostat',  color: 'text-red-500',    match: 'High fever'      }, { id: 'r3-2', label: 'Rayo de Dolor',        icon: 'bolt',        color: 'text-yellow-500', match: 'Acute pain'    }, { id: 'r3-3', label: 'Espiral de Mareo',    icon: 'cyclone',     color: 'text-indigo-500', match: 'Dizziness'     }] },
  { id: 4, theme: 'Material y Herramientas Clínicas (Clinical Equipment)',   items: [{ id: 'r4-1', label: 'Estetoscopio',         icon: 'stethoscope', color: 'text-[#006688]',  match: 'Stethoscope'     }, { id: 'r4-2', label: 'Jeringa',              icon: 'medication',  color: 'text-emerald-500',match: 'Syringe'       }, { id: 'r4-3', label: 'Venda Médica',         icon: 'healing',     color: 'text-pink-500',   match: 'Bandage'       }] },
]

const currentRound     = computed(() => rounds[currentRoundIndex.value])
const isRoundCompleted = computed(() => currentRoundCards.value.length > 0 && currentRoundCards.value.every(c => c.matched))

function startGame(key) {
  activeGame.value = key
  const sel = games.find(g => g.key === key)
  selectedGameName.value = sel ? sel.name : ''
  if (key === 'drag_match') { currentRoundIndex.value = 0; gameFinished.value = false; loadRound() }
}
function quitGame()  { activeGame.value = null }
function loadRound() {
  const roundData = rounds[currentRoundIndex.value]
  currentRoundCards.value   = roundData.items.map(item => ({ ...item, x: 0, y: 0, matched: false, isResetting: false }))
  currentRoundTargets.value = [...roundData.items.map(item => ({ match: item.match, matchedCard: null }))].sort(() => Math.random() - 0.5)
}
function nextRound() {
  if (currentRoundIndex.value < 3) { currentRoundIndex.value++; loadRound() } else { gameFinished.value = true }
}
function resetGame() { currentRoundIndex.value = 0; gameFinished.value = false; loadRound() }

function startDrag(event, card) {
  if (card.matched) return
  activeDragCard.value = card; card.isResetting = false
  initialPointerX = event.clientX; initialPointerY = event.clientY
  initialCardX = card.x; initialCardY = card.y
  event.target.setPointerCapture(event.pointerId)
}
function onDrag(event) {
  if (!activeDragCard.value) return
  activeDragCard.value.x = initialCardX + (event.clientX - initialPointerX)
  activeDragCard.value.y = initialCardY + (event.clientY - initialPointerY)
}
function endDrag(event, card) {
  if (!activeDragCard.value) return
  activeDragCard.value = null
  event.target.releasePointerCapture(event.pointerId)
  const elements = document.elementsFromPoint(event.clientX, event.clientY)
  let dropEl = null
  for (const el of elements) { if (el.classList.contains('drop-target')) { dropEl = el; break } }
  if (dropEl) {
    const matchText = dropEl.getAttribute('data-match')
    if (matchText === card.match) {
      card.matched = true
      const target = currentRoundTargets.value.find(t => t.match === matchText)
      if (target) target.matchedCard = card
    } else { slideBack(card) }
  } else { slideBack(card) }
}
function slideBack(card) {
  card.isResetting = true; card.x = 0; card.y = 0
  setTimeout(() => { card.isResetting = false }, 300)
}
</script>

<style scoped>
.draggable-card { user-select: none; }
.card-reset { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes zoomIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
