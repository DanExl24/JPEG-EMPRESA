<template>
  <div class="max-w-4xl mx-auto pb-12 space-y-6">

    <!-- Back Button -->
    <div class="flex items-center gap-3">
      <button
        @click="$router.back()"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-[#006688] hover:text-[#006688] transition-all shadow-sm"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Volver a Actividades
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-14 h-14 rounded-full border-4 border-[#006688]/20 border-t-[#006688] animate-spin"></div>
      <p class="text-gray-400 text-sm font-semibold">Cargando actividad...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-4xl text-red-400 block">error</span>
      <p class="font-bold text-red-700">No se pudo cargar la actividad</p>
      <p class="text-sm text-red-500">{{ error }}</p>
      <button @click="fetchActivity" class="mt-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
        Reintentar
      </button>
    </div>

    <!-- Activity Content -->
    <template v-else-if="activity">

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-[#006688] to-[#008aad] p-6 text-white">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1 flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                  {{ templateLabel }}
                </span>
                <span class="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Fase: {{ activity.phase }}
                </span>
              </div>
              <h2 class="text-2xl font-black leading-tight">{{ activity.title }}</h2>
              <p class="text-white/70 text-sm mt-1">{{ activity.course }}</p>
            </div>
            <div class="shrink-0 text-center">
              <div class="w-16 h-16 rounded-2xl bg-white/20 flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-3xl">{{ templateIcon }}</span>
                <span class="text-[9px] font-black mt-0.5">{{ activity.points }} pts</span>
              </div>
            </div>
          </div>
          <!-- Progress info row -->
          <div class="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
            <div class="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <span class="material-symbols-outlined text-sm">replay</span>
              Intentos: {{ activity.attemptsLimit || 'Ilimitados' }}
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <span class="material-symbols-outlined text-sm">emoji_events</span>
              {{ isAlreadyPassed ? 'Puntos ya obtenidos' : `${activity.points} puntos al completar` }}
            </div>
            <div v-if="isAlreadyPassed" class="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <span class="material-symbols-outlined text-sm">verified</span>
              Aprobada ({{ activity.points }} XP)
            </div>
            <div v-else-if="submitted && feedbackResult === false" class="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <span class="material-symbols-outlined text-sm">cancel</span>
              No Aprobada
            </div>
            <div v-else-if="submitted && reviewStatus === 'pending'" class="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span class="material-symbols-outlined text-sm">hourglass_top</span>
              En Calificación
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Panel -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        <!-- Status Banner: Solved / Practice / Failed -->
        <div v-if="isAlreadyPassed" class="p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap" :class="practiceMode ? 'bg-indigo-50/90 border-indigo-200' : 'bg-emerald-50/90 border-emerald-200'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="practiceMode ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'">
              <span class="material-symbols-outlined text-xl">{{ practiceMode ? 'fitness_center' : 'verified' }}</span>
            </div>
            <div>
              <p class="font-bold text-sm" :class="practiceMode ? 'text-indigo-950' : 'text-emerald-950'">
                {{ practiceMode ? 'Modo Práctica Activo' : 'Actividad Aprobada · Visualizando Respuestas' }}
              </p>
              <p class="text-xs" :class="practiceMode ? 'text-indigo-700' : 'text-emerald-700'">
                {{ practiceMode 
                  ? 'Estás repasando esta actividad libremente. No se sumarán puntos adicionales (XP ya acreditado previamente).' 
                  : 'Ya superaste este reto con éxito y tus puntos fueron otorgados. Puedes revisar lo resuelto o activar el modo práctica para repasar.' 
                }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!practiceMode"
              @click="startPracticeMode"
              type="button"
              class="px-3.5 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">fitness_center</span>
              Repasar en Modo Práctica
            </button>
            <button
              v-else
              @click="restoreSolvedView"
              type="button"
              class="px-3.5 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">visibility</span>
              Ver Respuestas Aprobadas
            </button>
          </div>
        </div>

        <!-- Banner for Failed Activity -->
        <div v-else-if="submitted && feedbackResult === false" class="p-4 rounded-2xl border bg-rose-50 border-rose-200 flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-xl">cancel</span>
            </div>
            <div>
              <p class="font-bold text-sm text-rose-950">Actividad No Aprobada</p>
              <p class="text-xs text-rose-700">Aún no has superado este reto. Puedes revisar tus respuestas anteriores o reintentarlo para ganar tus {{ activity.points }} puntos XP.</p>
            </div>
          </div>
          <button
            @click="retryFailedActivity"
            type="button"
            class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm">replay</span>
            Reintentar Ahora
          </button>
        </div>

        <!-- Feedback Banner -->
        <transition name="fade">
          <div
            v-if="submitted && reviewStatus === 'pending'"
            class="flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-slide-up bg-amber-50 border border-amber-200 text-amber-700"
          >
            <span class="material-symbols-outlined text-xl">hourglass_top</span>
            <span>Tu entrega tiene preguntas abiertas. Queda pendiente de revisión por el instructor.</span>
          </div>
          <div
            v-else-if="feedbackResult !== null && !isAlreadyPassed"
            :class="`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-slide-up ${
              feedbackResult ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-amber-50 border border-amber-200 text-amber-700'
            }`"
          >
            <span class="material-symbols-outlined text-xl">{{ feedbackResult ? 'check_circle' : 'info' }}</span>
            <span>{{ feedbackResult ? (activity.successMessage || '¡Excelente! Has completado la actividad correctamente.') : (activity.hintMessage || 'Sigue intentando. Revisa el contenido y vuelve a intentarlo.') }}</span>
          </div>
        </transition>

        <!-- ── SOPA DE LETRAS ── -->
        <div v-if="activity.template === 'sopa'" class="space-y-4">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-[#006688] rounded-full"></span>
            Sopa de Letras
          </h3>
          <p class="text-xs text-gray-500">Selecciona las letras en el tablero para encontrar las palabras ocultas:</p>

          <!-- Word chips -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="w in sopaWordsList"
              :key="w"
              :class="`px-3 py-1.5 border rounded-xl text-xs font-bold font-mono transition-all ${
                foundWords.includes(w)
                  ? 'bg-green-100 text-green-700 border-green-300 line-through'
                  : 'bg-white text-gray-700 border-gray-300'
              }`"
            >
              {{ w }}
            </span>
          </div>

          <!-- Grid -->
          <div
            class="grid gap-1.5 mx-auto border border-gray-200 p-3 rounded-2xl bg-gray-50 shadow-inner"
            :style="`grid-template-columns: repeat(${sopaSize}, 2.25rem); width: fit-content;`"
          >
            <button
              v-for="(cell, idx) in sopaGrid"
              :key="idx"
              @click="selectSopaCell(idx)"
              :class="`w-9 h-9 rounded-lg text-xs font-black border transition-all select-none ${
                isCellFoundWord(idx)
                  ? 'bg-green-400 text-white border-green-500 shadow-sm'
                  : selectedLetters.includes(idx)
                    ? 'bg-[#006688] text-white border-[#006688] scale-105 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-[#006688]/10 cursor-pointer'
              }`"
            >
              {{ cell.letter }}
            </button>
          </div>

          <p v-if="sopaSelectionHint" class="text-xs text-center font-bold" :class="sopaSelectionHint.ok ? 'text-green-600' : 'text-red-500'">
            {{ sopaSelectionHint.msg }}
          </p>

          <div v-if="sopaWordsList.length > 0 && sopaWordsList.every(w => foundWords.includes(w))" class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-bold">
            <span class="material-symbols-outlined">check_circle</span>
            ¡Has encontrado todas las palabras!
          </div>
        </div>

        <!-- ── CRUCIGRAMA ── -->
        <div v-else-if="activity.template === 'crucigrama'" class="space-y-4">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-[#006688] rounded-full"></span>
            Crucigrama
          </h3>

          <div v-if="crosswordLayout && crosswordLayout.success" class="space-y-6">
            <!-- Grid -->
            <div
              class="grid gap-1 p-4 bg-gray-100 rounded-2xl border border-gray-200 overflow-auto mx-auto select-none"
              :style="{
                gridTemplateColumns: `repeat(${crosswordLayout.width}, 2.25rem)`,
                gridTemplateRows: `repeat(${crosswordLayout.height}, 2.25rem)`,
                width: 'fit-content',
              }"
            >
              <template v-for="y in crosswordLayout.height" :key="'row-' + y">
                <template v-for="x in crosswordLayout.width" :key="'cell-' + (x-1) + '-' + (y-1)">
                  <div
                    v-if="crosswordLayout.grid[(x-1) + ',' + (y-1)]"
                    class="relative w-9 h-9 border border-gray-300 rounded-lg bg-white flex items-center justify-center shadow-sm focus-within:border-[#006688] focus-within:ring-2 focus-within:ring-[#006688]/20"
                  >
                    <span
                      v-if="getWordNumberAt(x-1, y-1)"
                      class="absolute top-0.5 left-1 text-[8px] font-black text-[#006688] select-none pointer-events-none"
                    >
                      {{ getWordNumberAt(x-1, y-1) }}
                    </span>
                    <input
                      type="text"
                      maxlength="1"
                      v-model="gridInputs[(x-1) + ',' + (y-1)]"
                      @input="onGridInput($event, x-1, y-1)"
                      @keydown="onGridKeyDown($event, x-1, y-1)"
                      @focus="onCellFocus(x-1, y-1)"
                      :disabled="submitted"
                      class="w-full h-full text-center border-none bg-transparent focus:outline-none font-black uppercase text-sm text-gray-800 disabled:cursor-default"
                      :id="`cw-cell-${x-1}-${y-1}`"
                    />
                  </div>
                  <div v-else class="w-9 h-9 rounded-lg bg-gray-300 border border-gray-300"></div>
                </template>
              </template>
            </div>

            <!-- Clues -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4 border-gray-100">
              <div class="space-y-3">
                <h5 class="text-xs font-black text-[#006688] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100">
                  <span class="material-symbols-outlined text-sm">swap_horiz</span>
                  Horizontales
                </h5>
                <div class="space-y-2 max-h-52 overflow-y-auto pr-2">
                  <div
                    v-for="w in crosswordLayout.words.filter(wd => wd.orientation === 'horizontal')"
                    :key="w.id"
                    @click="focusWordStart(w)"
                    class="text-xs text-gray-700 hover:text-[#006688] cursor-pointer hover:bg-[#006688]/5 p-2 rounded-lg transition-all flex items-center gap-1"
                  >
                    <span class="font-black text-[#006688]">{{ crosswordWordNumbers[w.id] }}.</span>
                    <span>{{ w.clue }}</span>
                    <span class="text-gray-400 font-medium ml-auto">({{ w.word.length }} letras)</span>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <h5 class="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-100">
                  <span class="material-symbols-outlined text-sm">swap_vert</span>
                  Verticales
                </h5>
                <div class="space-y-2 max-h-52 overflow-y-auto pr-2">
                  <div
                    v-for="w in crosswordLayout.words.filter(wd => wd.orientation === 'vertical')"
                    :key="w.id"
                    @click="focusWordStart(w)"
                    class="text-xs text-gray-700 hover:text-orange-600 cursor-pointer hover:bg-orange-50 p-2 rounded-lg transition-all flex items-center gap-1"
                  >
                    <span class="font-black text-orange-600">{{ crosswordWordNumbers[w.id] }}.</span>
                    <span>{{ w.clue }}</span>
                    <span class="text-gray-400 font-medium ml-auto">({{ w.word.length }} letras)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-sm text-red-500 font-bold bg-red-50 rounded-2xl border border-red-200">
            <span class="material-symbols-outlined text-3xl block mb-2">warning</span>
            El crucigrama de esta actividad no se puede mostrar correctamente.
          </div>
        </div>

        <!-- ── QUIZ / PREGUNTAS ── -->
        <div v-else-if="activity.template === 'quiz' || activity.template === 'preguntas'" class="space-y-6">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-green-500 rounded-full"></span>
            {{ activity.template === 'quiz' ? 'Quiz' : 'Opción Múltiple' }}
          </h3>

          <div v-for="(q, qIdx) in quizQuestionsList" :key="qIdx" class="space-y-3">
            <div class="flex items-center gap-2">
              <p class="flex-1 text-sm font-semibold text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {{ qIdx + 1 }}. {{ q.question || '¿Pregunta del Quiz?' }}
              </p>
              <span v-if="submitted && reviewedAnswers[qIdx]" class="material-symbols-outlined text-2xl shrink-0" :class="
                reviewedAnswers[qIdx].correct === true ? 'text-green-500' : reviewedAnswers[qIdx].correct === false ? 'text-red-500' : 'text-amber-500'
              ">{{ reviewedAnswers[qIdx].correct === true ? 'check_circle' : reviewedAnswers[qIdx].correct === false ? 'cancel' : 'hourglass_top' }}</span>
            </div>

            <!-- Verdadero / Falso -->
            <div v-if="q.type === 'truefalse'" class="grid grid-cols-2 gap-3">
              <button
                v-for="opt in [{ value: true, label: 'Verdadero' }, { value: false, label: 'Falso' }]"
                :key="String(opt.value)"
                @click="selectedAnswer[qIdx] = opt.value"
                :disabled="submitted"
                :class="`px-5 py-4 border-2 rounded-xl text-sm font-bold text-left transition-all ${
                  submitted
                    ? opt.value === q.correct
                      ? 'bg-green-50 text-green-700 border-green-400'
                      : selectedAnswer[qIdx] === opt.value
                        ? 'bg-red-50 text-red-700 border-red-400'
                        : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
                    : selectedAnswer[qIdx] === opt.value
                      ? 'bg-[#006688] text-white border-[#006688] shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]/50 hover:bg-[#006688]/5 cursor-pointer'
                }`"
              >{{ opt.label }}</button>
            </div>

            <!-- Pregunta Abierta -->
            <div v-else-if="q.type === 'open'" class="space-y-1">
              <textarea
                v-model="selectedAnswer[qIdx]"
                :disabled="submitted"
                rows="3"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#006688] disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Escribe tu respuesta..."
              ></textarea>
              <p v-if="submitted && reviewStatus === 'pending'" class="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">hourglass_top</span>
                Pendiente de revisión del instructor.
              </p>
            </div>

            <!-- Selección Múltiple -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="(opt, idx) in quizOptionsList[qIdx]"
                :key="idx"
                @click="selectedAnswer[qIdx] = opt._i"
                :disabled="submitted"
                :class="`px-5 py-4 border-2 rounded-xl text-sm font-bold text-left transition-all ${
                  submitted
                    ? opt.correct
                      ? 'bg-green-50 text-green-700 border-green-400'
                      : selectedAnswer[qIdx] === opt._i
                        ? 'bg-red-50 text-red-700 border-red-400'
                        : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
                    : selectedAnswer[qIdx] === opt._i
                      ? 'bg-[#006688] text-white border-[#006688] shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]/50 hover:bg-[#006688]/5 cursor-pointer'
                }`"
              >
                <div class="flex items-center gap-2">
                  <span
                    v-if="submitted"
                    class="material-symbols-outlined text-base"
                  >{{ opt.correct ? 'check_circle' : (selectedAnswer[qIdx] === opt._i ? 'cancel' : 'radio_button_unchecked') }}</span>
                  {{ opt.text }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- ── CONECTAR SIGNIFICADOS ── -->
        <div v-else-if="activity.template === 'match'" class="space-y-4">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-purple-500 rounded-full"></span>
            Conectar Significados
          </h3>
          <p class="text-xs text-gray-500">Une cada término con su significado correcto:</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Términos</p>
              <button
                v-for="term in matchTermsList"
                :key="term"
                @click="selectTerm(term)"
                :disabled="isPairMatched(term, 'term') || submitted"
                :class="`w-full p-3 border-2 rounded-xl text-xs font-bold text-center transition-all ${
                  isPairMatched(term, 'term')
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : selectedTerm === term
                      ? 'bg-[#006688] text-white border-[#006688] shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]/50 hover:bg-[#006688]/5'
                }`"
              >{{ term }}</button>
            </div>
            <div class="space-y-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Significados</p>
              <button
                v-for="meaning in matchMeaningsList"
                :key="meaning"
                @click="selectMeaning(meaning)"
                :disabled="isPairMatched(meaning, 'meaning') || submitted"
                :class="`w-full p-3 border-2 rounded-xl text-xs font-bold text-center transition-all ${
                  isPairMatched(meaning, 'meaning')
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : selectedMeaning === meaning
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400/50 hover:bg-orange-50'
                }`"
              >{{ meaning }}</button>
            </div>
          </div>
          <p v-if="matchFeedback" :class="`text-xs font-bold mt-1 ${matchFeedback.ok ? 'text-green-600' : 'text-red-500'}`">
            {{ matchFeedback.msg }}
          </p>
        </div>

        <!-- ── ESCUCHA (LISTENING) ── -->
        <div v-else-if="activity.template === 'listening'" class="space-y-4">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-pink-500 rounded-full"></span>
            Escucha y Escribe
          </h3>
          <p class="text-xs text-gray-500">Escucha la frase y escríbela a continuación:</p>
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <button
              @click="playListeningAudio"
              type="button"
              class="w-12 h-12 rounded-full bg-[#006688] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md shrink-0"
            >
              <span class="material-symbols-outlined text-xl">volume_up</span>
            </button>
            <span class="text-xs text-gray-500 italic">Haz clic para escuchar la frase</span>
          </div>
          <input
            type="text"
            v-model="listeningInput"
            :disabled="submitted"
            class="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:border-[#006688] rounded-xl text-sm font-semibold transition-colors"
            placeholder="Escribe aquí lo que escuchas..."
          />
        </div>

        <!-- ── PRONUNCIACIÓN (RECONOCIMIENTO DE VOZ REAL) ── -->
        <div v-else-if="activity.template === 'pronunciation'" class="space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
              <span class="w-2 h-5 bg-red-500 rounded-full"></span>
              Práctica de Pronunciación en Inglés
            </h3>
            <button
              @click="playModelPronunciation"
              type="button"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-all border border-red-200 shadow-2xs"
              title="Escuchar pronunciación modelo en inglés"
            >
              <span class="material-symbols-outlined text-base">volume_up</span>
              Escuchar frase modelo
            </button>
          </div>

          <p class="text-xs text-gray-500">
            Escucha la frase de referencia y luego presiona el micrófono para leerla en voz alta en inglés:
          </p>

          <!-- Phrase target card -->
          <div class="p-5 bg-gradient-to-br from-red-50/40 via-white to-gray-50 border border-red-100 rounded-2xl text-center space-y-1.5 shadow-2xs">
            <span class="text-[10px] font-black tracking-wider uppercase text-red-600 bg-red-100/70 px-2.5 py-0.5 rounded-full">
              Frase Objetivo
            </span>
            <p class="text-xl sm:text-2xl font-black text-gray-800 tracking-wide mt-1">
              "{{ activity.pronouncePhrase || 'Nice to meet you too' }}"
            </p>
          </div>

          <!-- Browser Support Warning if SpeechRecognition not available -->
          <div v-if="!speechSupported" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
            <p class="font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base text-amber-600">warning</span>
              Reconocimiento de voz no soportado por este navegador
            </p>
            <p>Te sugerimos usar Google Chrome, Microsoft Edge o Safari para interactuar con actividades de pronunciación por micrófono.</p>
          </div>

          <!-- Microphone Controls & Status -->
          <div v-else class="flex flex-col items-center gap-4 py-2">
            <div class="relative flex items-center justify-center">
              <!-- Pulsing outer ring when recording -->
              <div 
                v-if="isRecording"
                class="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping pointer-events-none"
              ></div>
              <div 
                v-if="isRecording"
                class="absolute w-20 h-20 rounded-full bg-red-500/30 animate-pulse pointer-events-none"
              ></div>

              <button
                @click="toggleSpeechRecognition"
                type="button"
                :disabled="submitted"
                :class="`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 hover:scale-105 shadow-red-600/30' 
                    : pronunciationPassed
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                      : 'bg-[#006688] hover:bg-[#004e69] hover:scale-105 shadow-[#006688]/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`"
              >
                <span class="material-symbols-outlined text-2xl">
                  {{ isRecording ? 'mic' : pronunciationPassed ? 'check' : 'mic' }}
                </span>
              </button>
            </div>

            <p class="text-xs font-bold text-gray-600 text-center">
              {{ isRecording ? '🎙️ Escuchando en inglés... ¡Habla ahora!' : pronunciationPassed ? '✓ Pronunciación validada con éxito' : 'Presiona el micrófono y pronuncia la frase en voz alta' }}
            </p>

            <!-- Error message if any -->
            <div v-if="speechError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold text-center max-w-md">
              {{ speechError }}
            </div>

            <!-- Recognition Result & Live Evaluation Panel -->
            <div v-if="recognizedText" class="w-full max-w-lg bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-gray-500 uppercase tracking-wider">Lo que escuchamos:</span>
                <span 
                  class="font-black px-2.5 py-0.5 rounded-full text-[11px]"
                  :class="pronunciationPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ speechSimilarity }}% de similitud
                </span>
              </div>

              <p class="text-sm font-bold text-gray-800 bg-white p-3 rounded-xl border border-gray-150 italic text-center">
                "{{ recognizedText }}"
              </p>

              <!-- Progress Bar -->
              <div class="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-500 rounded-full"
                  :class="pronunciationPassed ? 'bg-emerald-500' : 'bg-amber-500'"
                  :style="`width: ${Math.max(5, speechSimilarity)}%`"
                ></div>
              </div>

              <!-- Word Breakdown Highlight -->
              <div class="pt-1">
                <span class="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase">Desglose de palabras detectadas:</span>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="(w, idx) in wordBreakdown" 
                    :key="idx"
                    :class="`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      w.matched 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200 line-through'
                    }`"
                  >
                    {{ w.word }}
                  </span>
                </div>
              </div>

              <!-- Feedback message -->
              <div 
                class="p-2.5 rounded-xl text-xs font-bold text-center"
                :class="pronunciationPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
              >
                {{ pronunciationPassed 
                  ? '¡Excelente pronunciación! Cumples con el estándar clínico requerido.' 
                  : 'Pronunciación no del todo clara. Vuelve a presionar el micrófono para intentar de nuevo.' 
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- ── COMPLETAR ORACIÓN (FILL IN THE BLANK) ── -->
        <div v-else-if="activity.template === 'fillblank'" class="space-y-4">
          <h3 class="font-black text-gray-800 text-base flex items-center gap-2">
            <span class="w-2 h-5 bg-[#006688] rounded-full"></span>
            Completar Oración
          </h3>
          <p class="text-xs text-gray-500">Completa la palabra que falta en la oración médica:</p>
          <div class="p-5 bg-[#006688]/5 border border-[#006688]/20 rounded-2xl flex items-center justify-center gap-2 flex-wrap text-center">
            <span class="text-sm font-bold text-gray-700">
              {{ activity.fillblankSentence ? activity.fillblankSentence.split('[blank]')[0] : 'The ' }}
            </span>
            <input 
              type="text" 
              v-model="fillblankInput"
              :disabled="submitted"
              class="px-3 py-1 border border-gray-300 focus:outline-[#006688] rounded-xl text-xs font-bold text-center w-36 uppercase text-[#006688] outline-none disabled:opacity-70 disabled:bg-gray-150"
              placeholder="palabra..."
            />
            <span class="text-sm font-bold text-gray-700">
              {{ activity.fillblankSentence && activity.fillblankSentence.includes('[blank]') ? activity.fillblankSentence.split('[blank]')[1] : ' is used to listen to heart sounds.' }}
            </span>
          </div>
        </div>

        <!-- Unknown template fallback -->
        <div v-else class="text-center py-10 text-gray-400">
          <span class="material-symbols-outlined text-4xl block mb-2">help</span>
          <p class="font-semibold">Tipo de actividad no reconocido.</p>
        </div>

        <!-- Action Bar -->
        <div class="flex items-center gap-3 pt-6 border-t border-gray-100 flex-wrap">
          <!-- 1. Activity already passed and in consultation mode -->
          <template v-if="isAlreadyPassed && !practiceMode">
            <button
              @click="startPracticeMode"
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#006688] hover:bg-[#004e69] text-white transition-all shadow-xs cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">fitness_center</span>
              Repasar en Modo Práctica
            </button>
            <div class="flex items-center gap-2 ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <span class="material-symbols-outlined text-sm">verified</span>
              Actividad Aprobada (XP ya acreditado)
            </div>
          </template>

          <!-- 2. Active solving / practice mode (not yet submitted) -->
          <template v-else-if="!submitted">
            <button
              @click="submitActivity"
              :disabled="!canSubmit"
              :class="`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black shadow transition-all ${
                canSubmit
                  ? 'bg-[#006688] hover:bg-[#004e69] text-white hover:shadow-lg cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`"
            >
              <span class="material-symbols-outlined text-base">send</span>
              {{ isAlreadyPassed ? 'Comprobar Práctica' : 'Entregar Actividad' }}
              <span v-if="isAlreadyPassed" class="text-[11px] font-semibold opacity-80">(+0 XP)</span>
            </button>

            <button
              v-if="isAlreadyPassed"
              @click="restoreSolvedView"
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">visibility</span>
              Ver Respuestas Aprobadas
            </button>

            <button
              v-else
              @click="resetActivity"
              :disabled="reviewStatus === 'pending'"
              :title="reviewStatus === 'pending' ? 'Espera a que el instructor revise tu entrega antes de reiniciar' : ''"
              class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">restart_alt</span>
              Reiniciar
            </button>
          </template>

          <!-- 3. Submitted and failed -->
          <template v-else-if="submitted && feedbackResult === false">
            <button
              @click="retryFailedActivity"
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-xs cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">replay</span>
              Reintentar Actividad
            </button>
            <div class="flex items-center gap-2 ml-auto text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
              <span class="material-symbols-outlined text-sm">cancel</span>
              No Aprobada · Reintenta para ganar los puntos
            </div>
          </template>

          <!-- 4. Submitted and pending teacher review -->
          <template v-else-if="submitted && reviewStatus === 'pending'">
            <div class="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
              <span class="material-symbols-outlined text-sm">hourglass_top</span>
              Entrega en revisión por el instructor
            </div>
          </template>

          <!-- 5. Submitted practice attempt -->
          <template v-else-if="submitted && isAlreadyPassed">
            <button
              @click="startPracticeMode"
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#006688] hover:bg-[#004e69] text-white transition-all shadow-xs cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">fitness_center</span>
              Practicar Nuevamente
            </button>
            <button
              @click="restoreSolvedView"
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">visibility</span>
              Ver Respuestas Aprobadas
            </button>
            <div class="flex items-center gap-2 ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <span class="material-symbols-outlined text-sm">verified</span>
              Práctica Validada (+0 XP)
            </div>
          </template>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { generateCrossword } from '../../utils/crosswordGenerator'
import { useNotificationStore } from '../../stores/notification'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const route = useRoute()
const notificationStore = useNotificationStore()
const auth = useAuthStore()

const apiBaseUrl = getApiBaseUrl()

function getToken() {
  const rawToken = auth.token || (auth.user && auth.user.token)
  if (rawToken) return typeof rawToken === 'string' ? rawToken : rawToken.value || null
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

// ── State ──────────────────────────────────────
const loading = ref(true)
const error = ref(null)
const activity = ref(null)

const submitted = ref(false)
const feedbackResult = ref(null)
const isAlreadyPassed = ref(false)
const practiceMode = ref(false)
const savedSolvedState = ref(null)

const selectedAnswer = ref({})
const reviewStatus = ref('graded')
const reviewedAnswers = ref([])

function applySolvedState() {
  const data = activity.value
  if (!data) return

  // 1. Quiz / Preguntas
  if (data.template === 'quiz' || data.template === 'preguntas') {
    const list = quizQuestionsList.value
    if (savedSolvedState.value?.answers && Array.isArray(savedSolvedState.value.answers) && savedSolvedState.value.answers.length > 0) {
      reviewedAnswers.value = savedSolvedState.value.answers
      savedSolvedState.value.answers.forEach(a => {
        selectedAnswer.value[a.qIdx] = a.type === 'open' ? a.text : a.selected
      })
    } else {
      const autoAnswers = list.map((q, idx) => {
        if (q.type === 'truefalse') {
          selectedAnswer.value[idx] = q.correct
          return { qIdx: idx, type: 'truefalse', selected: q.correct, correct: true }
        }
        if (q.type === 'open') {
          selectedAnswer.value[idx] = 'Respuesta aprobada'
          return { qIdx: idx, type: 'open', text: 'Respuesta aprobada', correct: true }
        }
        const optIdx = q.options ? q.options.findIndex(opt => opt.correct) : 0
        const chosen = optIdx >= 0 ? optIdx : 0
        selectedAnswer.value[idx] = chosen
        return { qIdx: idx, type: 'multiple', selected: chosen, correct: true }
      })
      reviewedAnswers.value = autoAnswers
    }
  }

  // 2. Sopa de letras
  if (data.template === 'sopa') {
    foundWords.value = [...sopaWordsList.value]
  }

  // 3. Crucigrama
  if (data.template === 'crucigrama') {
    if (crosswordLayout.value?.grid) {
      const g = {}
      Object.entries(crosswordLayout.value.grid).forEach(([key, cell]) => {
        g[key] = cell.char
      })
      gridInputs.value = g
    }
  }

  // 4. Match
  if (data.template === 'match') {
    matchedPairs.value = [
      { term: data.matchTerm || 'Syringe', meaning: data.matchMeaning || 'Instrument used to inject fluids' },
      { term: 'Suture', meaning: 'Stitch used to close a wound' },
      { term: 'Stethoscope', meaning: 'Instrument to listen to body sounds' }
    ]
  }

  // 5. Listening
  if (data.template === 'listening') {
    listeningInput.value = data.listeningPhrase || 'The patient requires immediate attention'
  }

  // 6. Pronunciation
  if (data.template === 'pronunciation') {
    pronunciationPassed.value = true
    speechSimilarity.value = 100
    recognizedText.value = data.pronouncePhrase || 'Nice to meet you too'
  }

  // 7. Fill in the blank
  if (data.template === 'fillblank') {
    fillblankInput.value = data.fillblankAnswer || 'stethoscope'
  }
}

function clearAllInputs() {
  selectedAnswer.value = {}
  reviewedAnswers.value = []
  foundWords.value = []
  selectedLetters.value = []
  sopaSelectionHint.value = null
  if (crosswordLayout.value?.grid) {
    const empty = {}
    Object.keys(crosswordLayout.value.grid).forEach(k => { empty[k] = '' })
    gridInputs.value = empty
  }
  selectedTerm.value = ''
  selectedMeaning.value = ''
  matchedPairs.value = []
  matchFeedback.value = null
  listeningInput.value = ''
  isRecording.value = false
  recognizedText.value = ''
  speechSimilarity.value = 0
  pronunciationPassed.value = false
  speechError.value = null
  fillblankInput.value = ''
  stopSpeechRecognition()
}

function startPracticeMode() {
  practiceMode.value = true
  submitted.value = false
  feedbackResult.value = null
  clearAllInputs()
}

function restoreSolvedView() {
  practiceMode.value = false
  submitted.value = true
  feedbackResult.value = true
  applySolvedState()
}

function retryFailedActivity() {
  submitted.value = false
  feedbackResult.value = null
  clearAllInputs()
}

// ── Fetch activity + check prior submission ─────
async function fetchActivity() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${apiBaseUrl}/api/activities/${route.params.activityId}`)
    if (!res.ok) throw new Error(`Actividad no encontrada (${res.status})`)
    const data = await res.json()
    activity.value = data

    // Check if this apprentice already submitted
    const userId = auth.user?.id
    if (userId) {
      const token = getToken()
      const subRes = await fetch(`${apiBaseUrl}/api/activities/my-submissions?apprenticeId=${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (subRes.ok) {
        const subs = await subRes.json()
        const existing = subs.find(s => s.activityId === data.id)
        if (existing) {
          reviewStatus.value = existing.reviewStatus || 'graded'
          const isPassed = existing.passed === true
          isAlreadyPassed.value = isPassed
          feedbackResult.value = reviewStatus.value === 'pending' ? null : isPassed
          submitted.value = true

          try {
            const parsedAnswers = JSON.parse(existing.answers || '[]')
            savedSolvedState.value = { answers: parsedAnswers }
          } catch (e) {
            savedSolvedState.value = { answers: [] }
          }

          if (isPassed) {
            applySolvedState()
          } else {
            // Failed attempt: preserve user's past answers so they can analyze where they failed
            if (savedSolvedState.value?.answers?.length) {
              reviewedAnswers.value = savedSolvedState.value.answers
              savedSolvedState.value.answers.forEach(a => {
                selectedAnswer.value[a.qIdx] = a.type === 'open' ? a.text : a.selected
              })
            }
          }
        }
      }
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchActivity)

// ── Template metadata ───────────────────────────
const TEMPLATE_META = {
  sopa:         { label: 'Sopa de Letras',        icon: 'grid_on' },
  crucigrama:   { label: 'Crucigrama',             icon: 'border_inner' },
  quiz:         { label: 'Quiz',                   icon: 'quiz' },
  preguntas:    { label: 'Opción Múltiple',        icon: 'list_alt' },
  match:        { label: 'Conectar Significados',  icon: 'compare_arrows' },
  listening:    { label: 'Escucha (Audio)',         icon: 'volume_up' },
  pronunciation:{ label: 'Pronunciación',          icon: 'mic' },
  fillblank:    { label: 'Completar Oración',      icon: 'edit_note' },
}

const templateLabel = computed(() => TEMPLATE_META[activity.value?.template]?.label ?? 'Actividad')
const templateIcon  = computed(() => TEMPLATE_META[activity.value?.template]?.icon  ?? 'task')

// ════════════════════════════════════════════════
//  SOPA DE LETRAS
// ════════════════════════════════════════════════
const foundWords     = ref([])
const selectedLetters = ref([])
const sopaSelectionHint = ref(null)
let sopaHintTimer = null

const sopaWordsList = computed(() => {
  const raw = activity.value?.sopaWords || ''
  return raw.split(',').map(w => w.trim().toUpperCase()).filter(Boolean)
})

function seededRand(seed) {
  let s = seed
  return function () {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const sopaSize = computed(() => {
  const words = sopaWordsList.value
  if (!words.length) return 6
  const longest = Math.max(...words.map(w => w.length))
  return Math.min(Math.max(longest + 1, 6), 10)
})

const sopaGrid = computed(() => {
  const words = sopaWordsList.value
  const size  = sopaSize.value
  const seed  = words.join('').split('').reduce((acc, c) => acc + c.charCodeAt(0), 1)
  const rand  = seededRand(seed)

  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ letter: '', wordIdx: -1, posInWord: -1 }))
  )

  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi]
    if (word.length > size) continue
    let placed = false, attempts = 0
    while (!placed && attempts < 200) {
      attempts++
      const [dr, dc] = dirs[Math.floor(rand() * dirs.length)]
      const maxR = dr > 0 ? size - word.length : dr < 0 ? word.length - 1 : size - 1
      const minR = dr < 0 ? word.length - 1 : 0
      const maxC = dc > 0 ? size - word.length : dc < 0 ? word.length - 1 : size - 1
      const minC = dc < 0 ? word.length - 1 : 0
      if (maxR < minR || maxC < minC) continue
      const startR = minR + Math.floor(rand() * (maxR - minR + 1))
      const startC = minC + Math.floor(rand() * (maxC - minC + 1))
      let canPlace = true
      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i, c = startC + dc * i
        if (r < 0 || r >= size || c < 0 || c >= size) { canPlace = false; break }
        const ex = grid[r][c].letter
        if (ex !== '' && ex !== word[i]) { canPlace = false; break }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = startR + dr * i, c = startC + dc * i
          grid[r][c] = { letter: word[i], wordIdx: wi, posInWord: i }
        }
        placed = true
      }
    }
  }

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c].letter === '')
        grid[r][c] = { letter: alpha[Math.floor(rand() * alpha.length)], wordIdx: -1, posInWord: -1 }

  return grid.flat()
})

const wordCellMap = computed(() => {
  const map = {}
  sopaWordsList.value.forEach((w, wi) => {
    map[w] = sopaGrid.value
      .map((cell, idx) => ({ cell, idx }))
      .filter(({ cell }) => cell.wordIdx === wi)
      .sort((a, b) => a.cell.posInWord - b.cell.posInWord)
      .map(({ idx }) => idx)
  })
  return map
})

const foundWordCells = computed(() => {
  const cells = new Set()
  foundWords.value.forEach(w => { (wordCellMap.value[w] || []).forEach(i => cells.add(i)) })
  return cells
})

function isCellFoundWord(idx) { return foundWordCells.value.has(idx) }

function selectSopaCell(idx) {
  if (submitted.value || isCellFoundWord(idx)) return
  const pos = selectedLetters.value.indexOf(idx)
  if (pos >= 0) { selectedLetters.value.splice(pos, 1); sopaSelectionHint.value = null; return }
  selectedLetters.value.push(idx)

  let matched = null
  for (const word of sopaWordsList.value) {
    if (foundWords.value.includes(word)) continue
    const cells = wordCellMap.value[word] || []
    if (cells.length !== selectedLetters.value.length) continue
    const sel = [...selectedLetters.value].sort((a, b) => a - b)
    const wrd = [...cells].sort((a, b) => a - b)
    if (sel.every((v, i) => v === wrd[i])) { matched = word; break }
  }

  if (matched) {
    foundWords.value.push(matched)
    selectedLetters.value = []
    if (sopaHintTimer) clearTimeout(sopaHintTimer)
    sopaSelectionHint.value = { ok: true, msg: `✓ "${matched}" encontrada!` }
    sopaHintTimer = setTimeout(() => { sopaSelectionHint.value = null }, 2000)
  } else {
    const canContinue = sopaWordsList.value.some(word => {
      if (foundWords.value.includes(word)) return false
      const cells = wordCellMap.value[word] || []
      return selectedLetters.value.every(i => cells.includes(i))
    })
    if (!canContinue) {
      if (sopaHintTimer) clearTimeout(sopaHintTimer)
      sopaSelectionHint.value = { ok: false, msg: 'Selección inválida, intenta de nuevo.' }
      sopaHintTimer = setTimeout(() => { selectedLetters.value = []; sopaSelectionHint.value = null }, 1200)
    }
  }
}

// ════════════════════════════════════════════════
//  CRUCIGRAMA
// ════════════════════════════════════════════════
const gridInputs    = ref({})
const activeDirection = ref('horizontal')

const crosswordLayout = computed(() => {
  if (!activity.value || activity.value.template !== 'crucigrama') return null
  const clueStr = activity.value.crossword1Clue || ''
  let words = []
  let layoutMode = 'automatic'

  if (clueStr.startsWith('[') || clueStr.startsWith('{')) {
    try {
      const parsed = JSON.parse(clueStr)
      if (Array.isArray(parsed)) {
        words = parsed
      } else if (parsed && parsed.words) {
        words = parsed.words
        layoutMode = parsed.layoutMode || 'automatic'
      }
    } catch (e) {
      console.error('Error parsing crossword JSON:', e)
    }
  } else {
    words = [{ word: activity.value.crossword1Word || 'HEART', clue: clueStr || 'Órgano principal del sistema cardiovascular', orientation: 'horizontal' }]
  }

  const validWords = words.filter(w => w.word && w.word.trim() && w.clue && w.clue.trim())
  if (!validWords.length) return { success: true, words: [], grid: {}, width: 0, height: 0 }
  return generateCrossword(validWords, layoutMode)
})

watch(crosswordLayout, (newLayout) => {
  if (!newLayout || !newLayout.success || !newLayout.grid) return
  const newInputs = {}
  Object.keys(newLayout.grid).forEach(key => {
    newInputs[key] = (isAlreadyPassed.value && !practiceMode.value)
      ? newLayout.grid[key].char
      : (gridInputs.value[key] || '')
  })
  gridInputs.value = newInputs
}, { immediate: true })

const crosswordWordNumbers = computed(() => {
  const layout = crosswordLayout.value
  if (!layout || !layout.success || !layout.words) return {}
  const sorted = [...layout.words].sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x)
  let n = 1; const numbers = {}; const startCellNums = {}
  sorted.forEach(w => {
    const key = `${w.x},${w.y}`
    if (startCellNums[key]) { numbers[w.id] = startCellNums[key] }
    else { numbers[w.id] = n; startCellNums[key] = n; n++ }
  })
  return numbers
})

function getWordNumberAt(x, y) {
  if (!crosswordLayout.value?.words) return null
  const w = crosswordLayout.value.words.find(wd => wd.x === x && wd.y === y)
  return w ? crosswordWordNumbers.value[w.id] : null
}

function onCellFocus(x, y) {
  const cell = crosswordLayout.value?.grid?.[`${x},${y}`]
  if (cell?.wordOrientations?.length === 1) activeDirection.value = cell.wordOrientations[0]
}

function onGridInput(event, x, y) {
  const val = event.target.value
  if (!val) return
  gridInputs.value[`${x},${y}`] = val.toUpperCase()
  const nx = x + (activeDirection.value === 'horizontal' ? 1 : 0)
  const ny = y + (activeDirection.value === 'vertical'   ? 1 : 0)
  const next = document.getElementById(`cw-cell-${nx}-${ny}`)
  if (next) { next.focus(); setTimeout(() => next.select(), 10) }
}

function onGridKeyDown(event, x, y) {
  if (event.key === 'Backspace') {
    const val = gridInputs.value[`${x},${y}`]
    if (!val) {
      const px = x - (activeDirection.value === 'horizontal' ? 1 : 0)
      const py = y - (activeDirection.value === 'vertical'   ? 1 : 0)
      const prev = document.getElementById(`cw-cell-${px}-${py}`)
      if (prev) { prev.focus(); gridInputs.value[`${px},${py}`] = ''; event.preventDefault() }
    }
  } else if (event.key === 'ArrowRight') { const el = document.getElementById(`cw-cell-${x+1}-${y}`); if(el){el.focus();event.preventDefault()} }
  else if (event.key === 'ArrowLeft')  { const el = document.getElementById(`cw-cell-${x-1}-${y}`); if(el){el.focus();event.preventDefault()} }
  else if (event.key === 'ArrowUp')    { const el = document.getElementById(`cw-cell-${x}-${y-1}`); if(el){el.focus();event.preventDefault()} }
  else if (event.key === 'ArrowDown')  { const el = document.getElementById(`cw-cell-${x}-${y+1}`); if(el){el.focus();event.preventDefault()} }
}

function focusWordStart(word) {
  activeDirection.value = word.orientation
  const input = document.getElementById(`cw-cell-${word.x}-${word.y}`)
  if (input) { input.focus(); setTimeout(() => input.select(), 10) }
}

// ════════════════════════════════════════════════
//  QUIZ / PREGUNTAS
// ════════════════════════════════════════════════
const quizQuestionsList = computed(() => {
  if (!activity.value) return []
  const qStr = activity.value.quizQuestion || ''
  if (qStr.startsWith('{')) {
    try {
      const parsed = JSON.parse(qStr)
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) {
        // Compatibilidad con formatos anteriores { question, correct, incorrect } sin options[]/type
        return parsed.questions.map(q => {
          if (q.type === 'truefalse' || q.type === 'open') return q
          if (Array.isArray(q.options)) return { type: 'multiple', ...q }
          return { type: 'multiple', question: q.question, options: [{ text: q.correct || 'Respuesta correcta', correct: true }, { text: q.incorrect || 'Respuesta incorrecta', correct: false }] }
        })
      }
    } catch (e) {
      console.error('Error parsing quiz JSON:', e)
    }
  }
  return [{
    type: 'multiple',
    question: qStr || '¿Pregunta del Quiz?',
    options: [
      { text: activity.value.quizCorrect || 'Respuesta correcta', correct: true },
      { text: activity.value.quizIncorrect || 'Respuesta incorrecta', correct: false },
    ],
  }]
})

function isQuizQuestionAnswered(q, idx) {
  const v = selectedAnswer.value[idx]
  if (q.type === 'open') return typeof v === 'string' && v.trim().length > 0
  return v !== undefined
}

const quizOptionsList = computed(() => {
  const id = activity.value?.id || 0
  // Shuffle deterministically per question so it's stable; conserva índice original en _i
  return quizQuestionsList.value.map((q, idx) => {
    if (!Array.isArray(q.options)) return []
    const tagged = q.options.map((o, i) => ({ ...o, _i: i }))
    return (id + idx) % 2 === 0 ? tagged : [...tagged].reverse()
  })
})

// ════════════════════════════════════════════════
//  MATCH (CONECTAR SIGNIFICADOS)
// ════════════════════════════════════════════════
const selectedTerm    = ref('')
const selectedMeaning = ref('')
const matchedPairs    = ref([])
const matchFeedback   = ref(null)

const matchTermsList = computed(() => {
  if (!activity.value) return []
  return [activity.value.matchTerm || 'Syringe', 'Suture', 'Stethoscope']
})

const matchMeaningsList = computed(() => {
  if (!activity.value) return []
  return [
    activity.value.matchMeaning || 'Instrument used to inject fluids',
    'Stitch used to close a wound',
    'Instrument to listen to body sounds',
  ].sort()
})

function isPairMatched(val, type) {
  return type === 'term'
    ? matchedPairs.value.some(p => p.term === val)
    : matchedPairs.value.some(p => p.meaning === val)
}

function selectTerm(term) { selectedTerm.value = term; checkMatchPair() }
function selectMeaning(meaning) { selectedMeaning.value = meaning; checkMatchPair() }

function checkMatchPair() {
  if (!selectedTerm.value || !selectedMeaning.value) return
  const term = selectedTerm.value, meaning = selectedMeaning.value
  let correct = false
  if (term === (activity.value?.matchTerm || 'Syringe') && meaning === (activity.value?.matchMeaning || 'Instrument used to inject fluids')) correct = true
  else if (term === 'Suture' && meaning === 'Stitch used to close a wound') correct = true
  else if (term === 'Stethoscope' && meaning === 'Instrument to listen to body sounds') correct = true

  if (correct) {
    matchedPairs.value.push({ term, meaning })
    matchFeedback.value = { ok: true, msg: `✓ ¡Pareja correcta! "${term}"` }
  } else {
    matchFeedback.value = { ok: false, msg: 'Pareja incorrecta. Inténtalo de nuevo.' }
  }
  setTimeout(() => { matchFeedback.value = null }, 1800)
  selectedTerm.value = ''; selectedMeaning.value = ''
}

// ════════════════════════════════════════════════
//  LISTENING
// ════════════════════════════════════════════════
const listeningInput = ref('')

function playListeningAudio() {
  const phrase = activity.value?.listeningPhrase || 'The patient requires immediate attention'
  if ('speechSynthesis' in window) {
    const utt = new SpeechSynthesisUtterance(phrase)
    utt.lang = 'en-US'
    window.speechSynthesis.speak(utt)
  } else {
    notificationStore.notify({ type: 'info', title: 'Audio', message: phrase })
  }
}

// ════════════════════════════════════════════════
//  PRONUNCIATION (REAL WEB SPEECH API)
// ════════════════════════════════════════════════
const isRecording = ref(false)
const recognizedText = ref('')
const speechSimilarity = ref(0)
const pronunciationPassed = ref(false)
const speechError = ref(null)
const speechSupported = ref(typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))

let recognitionInstance = null

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:'"¿¡()\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinDistance(s1, s2) {
  const m = s1.length
  const n = s2.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        )
      }
    }
  }
  return dp[m][n]
}

function evaluateSpeech(spoken) {
  const target = activity.value?.pronouncePhrase || ''
  const normTarget = normalizeText(target)
  const normSpoken = normalizeText(spoken)

  if (!normTarget || !normSpoken) {
    speechSimilarity.value = 0
    pronunciationPassed.value = false
    return
  }

  if (normTarget === normSpoken) {
    speechSimilarity.value = 100
    pronunciationPassed.value = true
    return
  }

  const maxLen = Math.max(normTarget.length, normSpoken.length)
  const dist = levenshteinDistance(normTarget, normSpoken)
  const levRatio = maxLen > 0 ? (maxLen - dist) / maxLen : 0

  const targetWords = normTarget.split(' ').filter(Boolean)
  const spokenWords = normSpoken.split(' ').filter(Boolean)
  let matches = 0
  targetWords.forEach(tw => {
    if (spokenWords.some(sw => sw === tw || (sw.length >= 4 && (tw.includes(sw) || sw.includes(tw))))) {
      matches++
    }
  })
  const wordRatio = targetWords.length > 0 ? matches / targetWords.length : 0

  const score = Math.round((levRatio * 0.5 + wordRatio * 0.5) * 100)
  speechSimilarity.value = Math.max(0, Math.min(100, score))
  // Aprobado con 70% o más de coincidencia fonética/textual
  pronunciationPassed.value = score >= 70
}

const wordBreakdown = computed(() => {
  const target = activity.value?.pronouncePhrase || ''
  const spoken = recognizedText.value || ''
  const normSpoken = normalizeText(spoken).split(' ').filter(Boolean)
  const targetWords = target.split(/\s+/).filter(Boolean)

  return targetWords.map(word => {
    const cleanWord = normalizeText(word)
    const matched = normSpoken.some(sw => sw === cleanWord || (cleanWord.length >= 4 && (sw.includes(cleanWord) || cleanWord.includes(sw))))
    return { word, matched }
  })
})

function playModelPronunciation() {
  const phrase = activity.value?.pronouncePhrase || ''
  if (!phrase) return
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(phrase)
    utt.lang = 'en-US'
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  } else {
    notificationStore.notify({ type: 'info', title: 'Frase Modelo', message: phrase })
  }
}

function toggleSpeechRecognition() {
  if (isRecording.value) {
    stopSpeechRecognition()
  } else {
    startSpeechRecognition()
  }
}

function startSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRec) {
    speechSupported.value = false
    speechError.value = 'Tu navegador no soporta reconocimiento de voz nativo. Te recomendamos usar Google Chrome o Edge.'
    return
  }

  speechError.value = null
  recognizedText.value = ''
  speechSimilarity.value = 0
  pronunciationPassed.value = false

  try {
    if (recognitionInstance) {
      try { recognitionInstance.abort() } catch {}
    }

    const rec = new SpeechRec()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      isRecording.value = true
    }

    rec.onresult = (event) => {
      let interim = ''
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      const text = (finalTranscript || interim).trim()
      if (text) {
        recognizedText.value = text
        evaluateSpeech(text)
      }
    }

    rec.onerror = (event) => {
      isRecording.value = false
      if (event.error === 'not-allowed') {
        speechError.value = 'Permiso de micrófono denegado. Permite el acceso al micrófono en la barra de direcciones del navegador.'
      } else if (event.error === 'no-speech') {
        speechError.value = 'No se detectó voz. Por favor habla de nuevo más cerca del micrófono.'
      } else if (event.error !== 'aborted') {
        speechError.value = `Aviso de audio (${event.error}). Puedes presionar el botón e intentar de nuevo.`
      }
    }

    rec.onend = () => {
      isRecording.value = false
      if (recognizedText.value) {
        evaluateSpeech(recognizedText.value)
      }
    }

    recognitionInstance = rec
    rec.start()
  } catch (err) {
    isRecording.value = false
    speechError.value = 'No se pudo iniciar el micrófono. Verifica los permisos de tu navegador.'
    console.error('Speech recognition error:', err)
  }
}

function stopSpeechRecognition() {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop()
    } catch {}
  }
  isRecording.value = false
}

// ════════════════════════════════════════════════
//  FILL IN THE BLANK
// ════════════════════════════════════════════════
const fillblankInput = ref('')

// ════════════════════════════════════════════════
//  SUBMIT / RESET
// ════════════════════════════════════════════════
const canSubmit = computed(() => {
  if (!activity.value) return false
  const tpl = activity.value.template
  if (tpl === 'sopa') return sopaWordsList.value.length > 0 && sopaWordsList.value.every(w => foundWords.value.includes(w))
  if (tpl === 'crucigrama') {
    const layout = crosswordLayout.value
    if (!layout || !layout.success || !layout.grid) return false
    return Object.entries(layout.grid).every(([key]) => (gridInputs.value[key] || '').trim().length > 0)
  }
  if (tpl === 'quiz' || tpl === 'preguntas') return quizQuestionsList.value.length > 0 && quizQuestionsList.value.every((q, idx) => isQuizQuestionAnswered(q, idx))
  if (tpl === 'match') return matchedPairs.value.length === matchTermsList.value.length
  if (tpl === 'listening') return listeningInput.value.trim().length > 0
  if (tpl === 'pronunciation') return pronunciationPassed.value
  if (tpl === 'fillblank') return fillblankInput.value.trim().length > 0
  return false
})

async function submitActivity() {
  if (!canSubmit.value) return
  const tpl = activity.value.template
  let ok = false
  let quizAnswers = null

  if (tpl === 'sopa') {
    ok = sopaWordsList.value.every(w => foundWords.value.includes(w))
  } else if (tpl === 'crucigrama') {
    const layout = crosswordLayout.value
    ok = layout && layout.success && Object.entries(layout.grid).every(([key, cell]) =>
      (gridInputs.value[key] || '').trim().toUpperCase() === cell.char.toUpperCase()
    )
  } else if (tpl === 'quiz' || tpl === 'preguntas') {
    quizAnswers = quizQuestionsList.value.map((q, idx) => {
      const v = selectedAnswer.value[idx]
      if (q.type === 'truefalse') return { qIdx: idx, type: 'truefalse', selected: v, correct: v === q.correct }
      if (q.type === 'open') return { qIdx: idx, type: 'open', text: v, correct: null }
      const chosen = q.options[v]
      return { qIdx: idx, type: 'multiple', selected: v, correct: !!(chosen && chosen.correct) }
    })
    const hasOpen = quizAnswers.some(a => a.type === 'open')
    reviewStatus.value = hasOpen ? 'pending' : 'graded'
    ok = !hasOpen && quizAnswers.every(a => a.correct)
    reviewedAnswers.value = quizAnswers
  } else if (tpl === 'match') {
    ok = matchedPairs.value.length === matchTermsList.value.length
  } else if (tpl === 'listening') {
    const phrase   = (activity.value.listeningPhrase || '').toLowerCase().replace(/[.,!?;:]/g, '')
    const entered  = listeningInput.value.toLowerCase().replace(/[.,!?;:]/g, '')
    ok = entered.includes(phrase) || phrase.includes(entered)
  } else if (tpl === 'pronunciation') {
    ok = pronunciationPassed.value
  } else if (tpl === 'fillblank') {
    const correct = (activity.value.fillblankAnswer || '').trim().toLowerCase()
    const entered = fillblankInput.value.trim().toLowerCase()
    ok = correct && entered === correct
  }

  const pending = reviewStatus.value === 'pending'
  submitted.value      = pending ? true : ok
  feedbackResult.value = pending ? null : ok

  // Persist to backend and award XP
  const userId = auth.user?.id
  let xpAwarded = 0
  if (userId) {
    try {
      const token = getToken()
      const res = await fetch(`${apiBaseUrl}/api/activities/${activity.value.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ apprenticeId: userId, passed: ok, answers: quizAnswers })
      })
      if (res.ok) {
        const json = await res.json()
        xpAwarded = json.xpAwarded || 0
        if (json.newXpTotal && auth.user) {
          auth.user.xp = json.newXpTotal
        }
        if (typeof auth.checkAuth === 'function') {
          await auth.checkAuth()
        }
      } else {
        const errText = await res.text().catch(() => '')
        console.error('Error submitting activity:', res.status, errText)
      }
    } catch (err) {
      console.error('Error saving submission:', err)
    }
  }

  if (pending) {
    notificationStore.notify({
      type: 'info',
      title: 'Entregado',
      message: 'Tu respuesta con preguntas abiertas quedó pendiente de revisión del instructor.'
    })
  } else if (ok) {
    if (isAlreadyPassed.value) {
      notificationStore.notify({
        type: 'success',
        title: '¡Práctica completada con éxito!',
        message: '¡Excelente trabajo! Has validado correctamente la actividad. Como ya la habías aprobado previamente, no se suman puntos adicionales a tu cuenta.'
      })
    } else {
      const xpNotice = xpAwarded > 0 
        ? ` ¡Ganaste +${xpAwarded} XP agregados a tu perfil!` 
        : (activity.value.points ? ` ¡Reto superado con éxito (+${activity.value.points} XP)!` : '')
      notificationStore.notify({
        type: 'success',
        title: '¡Felicidades!',
        message: `${activity.value.successMessage || '¡Respuesta correcta!'}${xpNotice}`
      })
      isAlreadyPassed.value = true
    }
  } else {
    notificationStore.notify({
      type: 'warning',
      title: 'Respuesta incorrecta',
      message: isAlreadyPassed.value
        ? 'Algunas respuestas no fueron correctas en tu práctica. Puedes intentarlo de nuevo.'
        : `${activity.value.hintMessage || 'Sigue intentando.'} Usa "Reiniciar" para volver a intentarlo.`
    })
  }
}

function resetActivity() {
  submitted.value      = false
  feedbackResult.value = null
  reviewStatus.value   = 'graded'
  clearAllInputs()
}

onBeforeUnmount(() => {
  stopSpeechRecognition()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
