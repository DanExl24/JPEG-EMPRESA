<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── MODO JUEGO ACTIVO (APRENDIZ O MODO PRUEBA DOCENTE) ────────── -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeGame" class="space-y-6 animate-fade-in">
      
      <!-- Top Navigation Bar del Juego -->
      <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <button 
            @click="quitGame" 
            class="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all cursor-pointer"
            title="Volver"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-black text-gray-800 text-lg">{{ currentGameInstance?.name || 'Minijuego Clínico' }}</h3>
              <span v-if="isTeacherTestMode" class="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Modo Prueba Docente
              </span>
              <span v-else class="bg-blue-100 text-[#006688] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Partida Oficial
              </span>
            </div>
            <p class="text-xs text-gray-500">{{ currentGameInstance?.subtitle || 'Práctica rápida de enfermería' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-black text-[#006688]">
            <span class="material-symbols-outlined text-sm">emoji_events</span>
            Premio: +{{ currentGameInstance?.pts || 100 }} XP
          </div>
          <button 
            @click="quitGame" 
            class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Salir al Panel
          </button>
        </div>
      </div>

      <!-- ── MOTOR 1: WARM-UP DRAG MATCH (CALENTAMIENTO) ── -->
      <div v-if="activeEngine === 'warmup_drag_match'" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div v-if="!gameFinished" class="space-y-6">
          <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-blue-700">Ronda {{ currentRoundIndex + 1 }} de {{ activeRounds.length }}</span>
              <p class="text-sm font-bold text-gray-800">{{ currentRound.theme }}</p>
            </div>
            <span class="text-xs font-semibold text-gray-500">Arrastra cada elemento a su casilla en inglés</span>
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
            <span class="text-xs text-gray-400">Completa las 4 rondas para sumar el XP.</span>
            <button 
              @click="nextDragRound" 
              :disabled="!isRoundCompleted"
              :class="`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ${
                isRoundCompleted 
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`"
            >
              {{ currentRoundIndex === activeRounds.length - 1 ? 'Finalizar Calentamiento' : 'Siguiente Ronda' }}
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Pantalla de Victoria de Calentamiento -->
        <div v-else class="text-center space-y-5 py-8 animate-fade-in max-w-md mx-auto">
          <div class="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center shadow-lg mx-auto text-white">
            <span class="material-symbols-outlined text-4xl">emoji_events</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-xl font-black text-gray-800">¡Calentamiento Superado!</h3>
            <p class="text-xs text-gray-600">Completaste las 4 rondas de terminología médica.</p>
            <div class="pt-2">
              <span class="inline-block bg-green-100 text-green-800 font-black text-sm px-3 py-1 rounded-full">
                +{{ currentGameInstance?.pts || 100 }} XP {{ isTeacherTestMode ? '(Simulado)' : 'Añadidos' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button @click="resetDragGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">
              Repetir
            </button>
            <button @click="quitGame" class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl cursor-pointer">
              Volver al Arcade
            </button>
          </div>
        </div>
      </div>

      <!-- ── MOTOR 2: TRIVIA MÉDICA CONTRARRELOJ (BD) ── -->
      <div v-else-if="activeEngine === 'trivia_medica'" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div v-if="!gameFinished && currentTriviaQ" class="space-y-6">
          <!-- Trivia Status Bar -->
          <div class="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-4 gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                {{ triviaCurrentIdx + 1 }}
              </span>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800">Pregunta {{ triviaCurrentIdx + 1 }} de {{ triviaList.length }}</span>
                <p class="text-xs text-emerald-700 font-semibold">{{ currentTriviaQ.category || 'Términos Clínicos' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-black text-emerald-700">
                Puntos: {{ triviaScore }} / {{ triviaList.length * 10 }} XP
              </div>
            </div>
          </div>

          <!-- Question Prompt -->
          <div class="space-y-2 text-center py-4">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Pregunta de vocabulario</span>
            <h4 class="text-xl sm:text-2xl font-black text-gray-800 leading-snug">
              {{ currentTriviaQ.question }}
            </h4>
            <p v-if="currentTriviaQ.hint && triviaAnswered" class="text-xs text-gray-500 italic">
              Pista: {{ currentTriviaQ.hint }}
            </p>
          </div>

          <!-- 4 Options Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              v-for="(option, idx) in currentTriviaQ.options"
              :key="idx"
              @click="handleTriviaSelect(option)"
              :disabled="triviaAnswered"
              :class="`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                triviaAnswered 
                  ? option === currentTriviaQ.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-800 shadow-sm ring-2 ring-green-400'
                    : option === triviaSelectedOption
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-gray-700 shadow-sm'
              }`"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                  {{ ['A', 'B', 'C', 'D'][idx] }}
                </span>
                <span>{{ option }}</span>
              </div>
              <span v-if="triviaAnswered && option === currentTriviaQ.correctAnswer" class="material-symbols-outlined text-green-600 text-lg">
                check_circle
              </span>
              <span v-else-if="triviaAnswered && option === triviaSelectedOption" class="material-symbols-outlined text-red-500 text-lg">
                cancel
              </span>
            </button>
          </div>

          <!-- Next Button -->
          <div v-if="triviaAnswered" class="flex justify-center pt-2 animate-fade-in">
            <button
              @click="nextTriviaQuestion"
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {{ triviaCurrentIdx + 1 === triviaList.length ? 'Ver Resultados Finales' : 'Siguiente Pregunta' }}
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Pantalla de Victoria Trivia -->
        <div v-else class="text-center space-y-5 py-8 animate-fade-in max-w-md mx-auto">
          <div class="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg mx-auto text-white">
            <span class="material-symbols-outlined text-4xl">quiz</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-xl font-black text-gray-800">¡Trivia Médica Finalizada!</h3>
            <p class="text-xs text-gray-600">
              Acertaste <strong class="text-gray-900 font-black">{{ triviaCorrectCount }}</strong> de <strong class="text-gray-900 font-black">{{ triviaList.length }}</strong> preguntas.
            </p>
            <div class="pt-2">
              <span class="inline-block bg-emerald-100 text-emerald-800 font-black text-sm px-3 py-1 rounded-full">
                +{{ triviaScore }} XP {{ isTeacherTestMode ? '(Simulado)' : 'Ganados' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button @click="resetTriviaGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">
              Jugar de Nuevo
            </button>
            <button @click="quitGame" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              Volver al Arcade
            </button>
          </div>
        </div>
      </div>

      <!-- ── MOTOR 3: PARES CLÍNICOS / SPEED MATCH (BD) ── -->
      <div v-else-if="activeEngine === 'drug_match'" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div v-if="!gameFinished" class="space-y-6">
          <div class="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl p-4 gap-4 flex-wrap">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-orange-800">Pares Encontrados</span>
              <p class="text-sm font-bold text-gray-800">{{ matchPairsFound }} de {{ totalPairsCount }} parejas resueltas</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-600">Selecciona el término en inglés y su significado en español</span>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <button
              v-for="card in matchCards"
              :key="card.uid"
              @click="handleMatchCardClick(card)"
              :disabled="card.matched"
              :class="`min-h-[110px] p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none ${
                card.matched 
                  ? 'border-green-400 bg-green-50/80 text-green-800 opacity-90 cursor-default ring-1 ring-green-300' 
                  : selectedMatchCards.includes(card)
                    ? 'border-orange-500 bg-orange-50/70 text-orange-900 ring-2 ring-orange-400 shadow-md transform -translate-y-1'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30 text-gray-700 shadow-sm'
              }`"
            >
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" :class="card.lang === 'en' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'">
                {{ card.lang === 'en' ? 'Inglés' : 'Español' }}
              </span>
              <p class="font-black text-xs sm:text-sm leading-snug">{{ card.text }}</p>
              <span v-if="card.matched" class="material-symbols-outlined text-green-600 text-base">check</span>
            </button>
          </div>
        </div>

        <!-- Pantalla de Victoria Match -->
        <div v-else class="text-center space-y-5 py-8 animate-fade-in max-w-md mx-auto">
          <div class="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg mx-auto text-white">
            <span class="material-symbols-outlined text-4xl">style</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-xl font-black text-gray-800">¡Tablero Completado!</h3>
            <p class="text-xs text-gray-600">Emparejaste correctamente todos los términos clínicos.</p>
            <div class="pt-2">
              <span class="inline-block bg-orange-100 text-orange-800 font-black text-sm px-3 py-1 rounded-full">
                +{{ currentGameInstance?.pts || 80 }} XP {{ isTeacherTestMode ? '(Simulado)' : 'Ganados' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button @click="resetMatchGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">
              Jugar de Nuevo
            </button>
            <button @click="quitGame" class="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              Volver al Arcade
            </button>
          </div>
        </div>
      </div>

      <!-- ── MOTOR 4: DESAFÍO DE ESCUCHA FONÉTICA (BD + Web Speech API) ── -->
      <div v-else-if="activeEngine === 'listening_challenge'" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div v-if="!gameFinished && currentListenItem" class="space-y-6">
          <div class="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl p-4 gap-4 flex-wrap">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-purple-800">Ronda de Escucha</span>
              <p class="text-sm font-bold text-gray-800">Término {{ listeningCurrentIdx + 1 }} de {{ listeningList.length }}</p>
            </div>
            <div class="bg-white px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-black text-purple-700">
              Aciertos: {{ listeningCorrectCount }} / {{ listeningList.length }}
            </div>
          </div>

          <!-- Pronunciation Player Box -->
          <div class="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto border border-purple-100">
            <div class="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md cursor-pointer hover:scale-105 transition-transform"
              @click="playAudioTerm(currentListenItem.wordEn)">
              <span class="material-symbols-outlined text-3xl">volume_up</span>
            </div>
            <div>
              <button 
                @click="playAudioTerm(currentListenItem.wordEn)" 
                class="text-xs font-black text-purple-700 hover:underline uppercase tracking-wider cursor-pointer"
              >
                Haz clic para escuchar el audio
              </button>
              <p class="text-xs text-gray-500 mt-1">Significado: "{{ currentListenItem.wordEs }}"</p>
            </div>
          </div>

          <!-- Option Buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <button
              v-for="(opt, idx) in currentListenItem.options"
              :key="idx"
              @click="handleListeningSelect(opt)"
              :disabled="listeningAnswered"
              :class="`p-4 rounded-2xl border font-bold text-sm text-center transition-all cursor-pointer ${
                listeningAnswered 
                  ? opt === currentListenItem.wordEn
                    ? 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-400'
                    : opt === listeningSelectedOption
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50/50 text-gray-700 shadow-sm'
              }`"
            >
              {{ opt }}
            </button>
          </div>

          <div v-if="listeningAnswered" class="flex justify-center pt-2 animate-fade-in">
            <button
              @click="nextListeningItem"
              class="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {{ listeningCurrentIdx + 1 === listeningList.length ? 'Finalizar Desafío' : 'Siguiente Audio' }}
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Pantalla de Victoria Escucha -->
        <div v-else class="text-center space-y-5 py-8 animate-fade-in max-w-md mx-auto">
          <div class="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center shadow-lg mx-auto text-white">
            <span class="material-symbols-outlined text-4xl">headphones</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-xl font-black text-gray-800">¡Práctica de Audio Superada!</h3>
            <p class="text-xs text-gray-600">
              Reconociste correctamente <strong class="text-gray-900 font-black">{{ listeningCorrectCount }}</strong> de <strong class="text-gray-900 font-black">{{ listeningList.length }}</strong> términos clínicos.
            </p>
            <div class="pt-2">
              <span class="inline-block bg-purple-100 text-purple-800 font-black text-sm px-3 py-1 rounded-full">
                +{{ currentGameInstance?.pts || 80 }} XP {{ isTeacherTestMode ? '(Simulado)' : 'Ganados' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button @click="resetListeningGame" class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl cursor-pointer">
              Jugar de Nuevo
            </button>
            <button @click="quitGame" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              Volver al Arcade
            </button>
          </div>
        </div>
      </div>

      <!-- Fallback en caso de que activeEngine no coincida con ningún motor conocido -->
      <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-3xl">sports_esports</span>
        </div>
        <div class="space-y-1">
          <h4 class="text-base font-black text-gray-800">Motor de Minijuego no Disponible</h4>
          <p class="text-xs text-gray-500">Este minijuego está en configuración o su plantilla aún no está disponible.</p>
        </div>
        <button 
          @click="quitGame" 
          class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Volver al Catálogo de Juegos
        </button>
      </div>
    </div>


    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── PORTAL DE ADMINISTRACIÓN (ADMIN / INSTRUCTOR) ─────────────── -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="auth.isAdmin || auth.isInstructor">
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header Banner Admin -->
        <div class="bg-gradient-to-r from-[#006688] to-[#00a8cc] rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-6 flex-wrap">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Centro de Control Docente
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black">Arcade Lúdico & Gamificación</h2>
            <p class="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Gestiona el catálogo de minijuegos del arcade, activa/pausa mecánicas, supervisa estadísticas reales y audita partidas de los aprendices.
            </p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <button 
              @click="openCreateGameModal"
              class="px-5 py-2.5 bg-white text-[#006688] hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">add_circle</span>
              Crear Minijuego
            </button>
            <button 
              @click="startTeacherTest('warmup_drag_match')"
              class="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">sports_esports</span>
              Probar Calentamiento
            </button>
          </div>
        </div>

        <!-- KPIs Reales de Gamificación -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-[#006688] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">sports_esports</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400">Partidas Totales</span>
              <p class="text-2xl font-black text-gray-800 leading-none mt-1">{{ adminStats.totalPlays }}</p>
              <span class="text-[10px] text-gray-400">Sesiones registradas</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">emoji_events</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400">XP Otorgado</span>
              <p class="text-2xl font-black text-gray-800 leading-none mt-1">{{ adminStats.totalXpAwarded }} <span class="text-xs font-bold text-amber-600">XP</span></p>
              <span class="text-[10px] text-gray-400">En partidas de juego</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400">Alumnos Activos</span>
              <p class="text-2xl font-black text-gray-800 leading-none mt-1">{{ adminStats.activePlayersCount }}</p>
              <span class="text-[10px] text-gray-400">Participantes únicos</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-gray-400">Juego Popular</span>
              <p class="text-sm font-black text-gray-800 leading-tight mt-1 truncate max-w-[130px]" :title="adminStats.mostPopularGame">
                {{ adminStats.mostPopularGame || 'Warm-up Match' }}
              </p>
              <span class="text-[10px] text-gray-400">Mayor retención</span>
            </div>
          </div>
        </div>

        <!-- Pestañas de Navegación Admin -->
        <div class="flex items-center gap-2 border-b border-gray-200">
          <button 
            @click="adminTab = 'games'"
            :class="`pb-3 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'games' 
                ? 'border-[#006688] text-[#006688]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`"
          >
            <span class="material-symbols-outlined text-base">videogame_asset</span>
            Gestión de Minijuegos ({{ arcadeGamesList.length }})
          </button>
          <button 
            @click="adminTab = 'history'"
            :class="`pb-3 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'history' 
                ? 'border-[#006688] text-[#006688]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`"
          >
            <span class="material-symbols-outlined text-base">history</span>
            Auditoría de Partidas en Vivo ({{ recentScores.length }})
          </button>
        </div>

        <!-- Tab 1: Minijuegos del Arcade Clínico (CRUD) -->
        <div v-if="adminTab === 'games'" class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">
              Los juegos activos estarán disponibles de inmediato en la sección de juegos del aprendiz.
            </p>
            <button 
              @click="openCreateGameModal"
              class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">add</span>
              Nuevo Juego
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div 
              v-for="game in arcadeGamesList" 
              :key="game.id || game.key"
              :class="`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all gap-5 ${
                game.active !== false ? 'border-gray-100 hover:border-blue-100 hover:shadow-md' : 'border-gray-200 bg-gray-50/50 opacity-75'
              }`"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div :class="`w-12 h-12 rounded-2xl ${game.bg || 'bg-blue-50'} flex items-center justify-center shadow-xs`">
                      <span :class="`material-symbols-outlined text-2xl ${game.color || 'text-blue-500'}`">{{ game.icon || 'sports_esports' }}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-black text-gray-800 text-base leading-tight">{{ game.name }}</h4>
                        <span 
                          :class="`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            game.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`"
                        >
                          {{ game.active !== false ? 'Activo' : 'Pausado' }}
                        </span>
                      </div>
                      <span class="text-[11px] font-semibold text-gray-400">{{ game.subtitle || 'Minijuego Clínico' }}</span>
                    </div>
                  </div>
                  <span class="bg-blue-50 text-[#006688] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                    +{{ game.pts }} XP
                  </span>
                </div>

                <p class="text-xs text-gray-600 leading-relaxed">
                  {{ game.description || game.desc }}
                </p>

                <!-- Estadísticas de uso por minijuego -->
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[11px]">
                  <div class="bg-gray-50 rounded-xl p-2.5">
                    <span class="text-gray-400 block text-[10px] uppercase font-bold">Partidas Jugadas</span>
                    <strong class="text-gray-800 font-black text-sm">{{ game.playsCount || 0 }}</strong>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-2.5">
                    <span class="text-gray-400 block text-[10px] uppercase font-bold">XP Acumulado</span>
                    <strong class="text-amber-600 font-black text-sm">{{ game.totalXp || 0 }} XP</strong>
                  </div>
                </div>
              </div>

              <!-- Acciones de Administración (CRUD + Probar) -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  <span>{{ game.duration || '5 min' }}</span>
                  <span>•</span>
                  <span><strong>{{ game.difficulty || 'Medio' }}</strong></span>
                </div>

                <div class="flex items-center gap-1.5 flex-wrap">
                  <!-- Toggle Activo / Pausado -->
                  <button 
                    v-if="game.id"
                    @click="toggleGameStatus(game)"
                    :class="`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      game.active !== false 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`"
                    :title="game.active !== false ? 'Pausar juego' : 'Activar juego'"
                  >
                    <span class="material-symbols-outlined text-base">
                      {{ game.active !== false ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>

                  <!-- Editar -->
                  <button 
                    v-if="game.id"
                    @click="openEditGameModal(game)"
                    class="p-2 bg-gray-100 hover:bg-blue-50 hover:text-[#006688] text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Editar juego"
                  >
                    <span class="material-symbols-outlined text-base">edit</span>
                  </button>

                  <!-- Eliminar -->
                  <button 
                    v-if="game.id"
                    @click="deleteGame(game)"
                    class="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Eliminar juego"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>

                  <!-- Modo Prueba Docente -->
                  <button 
                    @click="startTeacherTest(game)"
                    class="px-3 py-2 bg-gray-100 hover:bg-[#006688] hover:text-white text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-sm">visibility</span>
                    Probar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Auditoría y Monitoreo de Partidas en Vivo -->
        <div v-else-if="adminTab === 'history'" class="space-y-4">
          <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-gray-800 text-sm">Registro de Partidas Recientes</h4>
                <p class="text-xs text-gray-400">Auditoría en tiempo real de los retos resueltos por los aprendices.</p>
              </div>
              <button 
                @click="loadAdminData" 
                class="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">refresh</span>
                Refrescar
              </button>
            </div>

            <div v-if="recentScores.length === 0" class="p-12 text-center text-gray-400 space-y-2">
              <span class="material-symbols-outlined text-4xl text-gray-300">sports_esports</span>
              <p class="text-sm font-semibold">No se han registrado partidas aún.</p>
              <p class="text-xs text-gray-400">Los puntajes aparecerán aquí en vivo cuando los aprendices jueguen.</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-gray-50/80 text-gray-500 uppercase font-black tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th class="py-3.5 px-6">Aprendiz</th>
                    <th class="py-3.5 px-6">Minijuego</th>
                    <th class="py-3.5 px-6">Puntaje / XP</th>
                    <th class="py-3.5 px-6">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="score in recentScores" :key="score.id" class="hover:bg-blue-50/30 transition-colors">
                    <td class="py-3.5 px-6">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#006688]/10 text-[#006688] font-black flex items-center justify-center text-xs">
                          {{ (score.user?.nombre?.[0] || 'A') }}{{ (score.user?.apellido?.[0] || 'P') }}
                        </div>
                        <div>
                          <p class="font-bold text-gray-800 leading-none">
                            {{ score.user?.nombre }} {{ score.user?.apellido }}
                          </p>
                          <span class="text-[10px] text-gray-400">{{ score.user?.correo || score.user?.cedula }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-6">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#006688] border border-blue-100">
                        {{ formatGameName(score.gameKey) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-6 font-black text-amber-600">
                      +{{ score.score }} XP
                    </td>
                    <td class="py-3.5 px-6 text-gray-500">
                      {{ formatDate(score.playedAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </template>


    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── PORTAL DE APRENDICES (ZONA DE JUEGOS Y ARCADE) ────────────── -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <template v-else>
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header Banner Aprendiz -->
        <div class="bg-gradient-to-r from-[#006688] to-[#00a8cc] rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-6 flex-wrap">
          <div class="space-y-2 max-w-xl">
            <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
              Zona de Juegos & Práctica Libre
            </span>
            <h2 class="text-2xl sm:text-3xl font-black">Gimnasio Clínico Lúdico</h2>
            <p class="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Juega retos interactivos para entrenar tu vocabulario de enfermería, sumar puntos de experiencia (XP) y escalar puestos en el Ranking.
            </p>
          </div>

          <!-- User XP Badge -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md">
              <span class="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-blue-100">Tu Nivel Actual</span>
              <p class="text-xl font-black text-white">{{ userXp }} <span class="text-xs font-bold text-amber-300">XP</span></p>
              <router-link to="/dashboard/ranking" class="text-[11px] font-bold text-blue-100 hover:underline flex items-center gap-0.5">
                Ver Ranking
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Catálogo de Minijuegos Activos del Arcade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="game in activeArcadeGamesForApprentice" 
            :key="game.id || game.key"
            class="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-blue-100 transition-all gap-5"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3.5">
                  <div :class="`w-14 h-14 rounded-2xl ${game.bg || 'bg-blue-50'} flex items-center justify-center shadow-sm`">
                    <span :class="`material-symbols-outlined text-3xl ${game.color || 'text-blue-500'}`">{{ game.icon || 'sports_esports' }}</span>
                  </div>
                  <div>
                    <h3 class="font-black text-gray-800 text-lg leading-tight">{{ game.name }}</h3>
                    <p class="text-xs text-gray-400 font-semibold">{{ game.subtitle || 'Minijuego Clínico' }}</p>
                  </div>
                </div>
                <span class="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-amber-600">emoji_events</span>
                  +{{ game.pts }} XP
                </span>
              </div>

              <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {{ game.description || game.desc }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <span class="material-symbols-outlined text-sm">schedule</span>
                <span>{{ game.duration || '5 min' }}</span>
                <span>•</span>
                <span>{{ game.difficulty || 'Medio' }}</span>
              </div>
              <button 
                @click="startApprenticeGame(game)"
                class="px-6 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Jugar Ahora</span>
                <span class="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>


    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ── MODAL DE CREACIÓN / EDICIÓN DE MINIJUEGO (ADMIN & INSTRUCTOR) ─ -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="showGameModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 my-6 max-h-[92vh] flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#006688]/10 text-[#006688] flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">{{ isEditingGame ? 'edit' : 'add_circle' }}</span>
            </div>
            <div>
              <h3 class="font-black text-gray-800 text-lg">
                {{ isEditingGame ? 'Editar Minijuego' : 'Crear Nuevo Minijuego' }}
              </h3>
              <p class="text-xs text-gray-400">Personaliza la dinámica pedagógica, preguntas y vocabulario del juego.</p>
            </div>
          </div>
          <button @click="showGameModal = false" class="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Selector de Pestañas del Modal -->
        <div class="flex items-center gap-2 border-b border-gray-100 pb-3 flex-shrink-0">
          <button 
            type="button"
            @click="modalTab = 'general'"
            :class="`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              modalTab === 'general' 
                ? 'bg-[#006688] text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`"
          >
            <span class="material-symbols-outlined text-base">tune</span>
            1. Ajustes Generales
          </button>

          <button 
            type="button"
            @click="modalTab = 'interactive'"
            :class="`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              modalTab === 'interactive' 
                ? 'bg-[#006688] text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`"
          >
            <span class="material-symbols-outlined text-base">extension</span>
            2. Dinámica & Contenido ({{ getTemplateLabel(gameForm.template) }})
            <span class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-black" :class="modalTab === 'interactive' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'">
              {{ getContentItemsCount() }}
            </span>
          </button>
        </div>

        <!-- Form Body con Scroll -->
        <form @submit.prevent="saveGameForm" class="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          
          <!-- PESTAÑA 1: AJUSTES GENERALES -->
          <div v-show="modalTab === 'general'" class="space-y-4">
            <!-- Nombre del Juego -->
            <div class="space-y-1">
              <label class="font-bold text-gray-700">Nombre del Minijuego *</label>
              <input 
                v-model="gameForm.name" 
                type="text" 
                required
                placeholder="Ej: Trivia Médica de Farmacología" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none"
              />
            </div>

            <!-- Subtítulo -->
            <div class="space-y-1">
              <label class="font-bold text-gray-700">Subtítulo / Especialidad</label>
              <input 
                v-model="gameForm.subtitle" 
                type="text" 
                placeholder="Ej: Desafío de cálculo de dosis y antibióticos" 
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none"
              />
            </div>

            <!-- Mecánica / Plantilla de Juego -->
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="font-bold text-gray-700">Mecánica Interactiva (Plantilla) *</label>
                <span class="text-[11px] text-gray-400">Define el motor interactivo que ejecutará el juego</span>
              </div>
              <select 
                v-model="gameForm.template"
                @change="onTemplateChange"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none cursor-pointer"
              >
                <option value="trivia_medica">Trivia Médica Contrarreloj (Preguntas de opción múltiple)</option>
                <option value="drug_match">Pares Clínicos / Speed Match (Tablero de emparejar tarjetas)</option>
                <option value="listening_challenge">Desafío de Escucha Fonética (Audio y reconocimiento)</option>
                <option value="warmup_drag_match">Warm-up Drag Match (Calentamiento con iconos y términos)</option>
              </select>
            </div>

            <!-- Descripción -->
            <div class="space-y-1">
              <label class="font-bold text-gray-700">Descripción Pedagógica *</label>
              <textarea 
                v-model="gameForm.description" 
                rows="2"
                required
                placeholder="Explica a los aprendices en qué consiste la dinámica..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none"
              ></textarea>
            </div>

            <!-- Puntos XP y Dificultad -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-gray-700">Puntos XP Otorgados *</label>
                <input 
                  v-model.number="gameForm.pts" 
                  type="number" 
                  min="10" 
                  max="500" 
                  step="5" 
                  required
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold text-gray-700">Nivel de Dificultad</label>
                <select 
                  v-model="gameForm.difficulty"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none cursor-pointer"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Medio">Medio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <!-- Duración y Estado Activo -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-gray-700">Duración Estimada</label>
                <input 
                  v-model="gameForm.duration" 
                  type="text" 
                  placeholder="Ej: 5 min"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none"
                />
              </div>

              <div class="space-y-1">
                <label class="font-bold text-gray-700">Estado Inicial</label>
                <select 
                  v-model="gameForm.active"
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:bg-white focus:border-[#006688] focus:outline-none cursor-pointer"
                >
                  <option :value="true">Activo (Visible para aprendices)</option>
                  <option :value="false">Pausado (Oculto para aprendices)</option>
                </select>
              </div>
            </div>

            <!-- Banner Guía hacia pestaña 2 -->
            <div class="p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-blue-900">
                <span class="material-symbols-outlined text-lg text-[#006688]">lightbulb</span>
                <span class="text-xs font-semibold">
                  Personaliza las preguntas, tarjetas o audios en la siguiente pestaña.
                </span>
              </div>
              <button 
                type="button" 
                @click="modalTab = 'interactive'"
                class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                Personalizar Contenido
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- PESTAÑA 2: DINÁMICA & CONTENIDO INTERACTIVO -->
          <div v-show="modalTab === 'interactive'" class="space-y-4">
            
            <!-- Barra de Herramientas del Editor Interactivo -->
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-800">Contenido:</span>
                <span class="px-2.5 py-1 bg-white border border-gray-200 rounded-lg font-bold text-[#006688]">
                  {{ getTemplateLabel(gameForm.template) }}
                </span>
                <span class="text-gray-400">({{ getContentItemsCount() }} elementos)</span>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button"
                  @click="resetInteractiveConfigToDefault"
                  class="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Cargar plantilla de preguntas o términos sugeridos"
                >
                  <span class="material-symbols-outlined text-sm text-[#006688]">restart_alt</span>
                  Cargar Sugeridos
                </button>
              </div>
            </div>

            <!-- SUB-EDITOR: TRIVIA MÉDICA -->
            <div v-if="gameForm.template === 'trivia_medica'" class="space-y-3">
              <div 
                v-for="(q, qIdx) in gameForm.config.questions" 
                :key="qIdx"
                class="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3 relative group"
              >
                <div class="flex items-center justify-between">
                  <span class="font-black text-[#006688] text-xs flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">quiz</span>
                    Pregunta #{{ qIdx + 1 }}
                  </span>
                  <button 
                    type="button" 
                    @click="removeTriviaQuestion(qIdx)"
                    :disabled="gameForm.config.questions.length <= 1"
                    class="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-30 cursor-pointer"
                    title="Eliminar pregunta"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <!-- Enunciado de la pregunta -->
                <div class="space-y-1">
                  <label class="font-bold text-gray-700">Enunciado de la Pregunta *</label>
                  <input 
                    v-model="q.question" 
                    type="text" 
                    required
                    placeholder="Ej: ¿Cuál es el significado clínico de 'Blood pressure'?" 
                    class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-semibold text-gray-800 focus:border-[#006688] focus:outline-none"
                  />
                </div>

                <!-- Respuesta Correcta -->
                <div class="space-y-1">
                  <label class="font-bold text-emerald-700 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                    Respuesta Correcta *
                  </label>
                  <input 
                    v-model="q.correctAnswer" 
                    type="text" 
                    required
                    placeholder="Ej: Presión arterial" 
                    class="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 font-bold text-emerald-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <!-- Opciones Distractoras -->
                <div class="space-y-1">
                  <label class="font-bold text-gray-600 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">cancel</span>
                    3 Opciones Incorrectas (Distractores) *
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input 
                      v-model="q.options[1]" 
                      type="text" 
                      required
                      placeholder="Distractor 1" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                    <input 
                      v-model="q.options[2]" 
                      type="text" 
                      required
                      placeholder="Distractor 2" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                    <input 
                      v-model="q.options[3]" 
                      type="text" 
                      required
                      placeholder="Distractor 3" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 font-medium text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                </div>

                <!-- Pista y Categoría -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="font-bold text-gray-500">Categoría Pedagógica</label>
                    <input 
                      v-model="q.category" 
                      type="text" 
                      placeholder="Ej: Signos Vitales, Farmacología" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="font-bold text-gray-500">Pista Pedagógica (Opcional)</label>
                    <input 
                      v-model="q.hint" 
                      type="text" 
                      placeholder="Ej: Fuerza ejercida por la sangre contra las arterias" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                @click="addTriviaQuestion"
                class="w-full py-2.5 border-2 border-dashed border-[#006688]/30 hover:border-[#006688] hover:bg-blue-50/50 text-[#006688] font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                Agregar Nueva Pregunta a la Trivia
              </button>
            </div>

            <!-- SUB-EDITOR: PARES CLÍNICOS (SPEED MATCH) -->
            <div v-else-if="gameForm.template === 'drug_match'" class="space-y-3">
              <div class="text-[11px] text-gray-500 bg-orange-50/60 border border-orange-200 p-2.5 rounded-xl flex items-center gap-2">
                <span class="material-symbols-outlined text-orange-600 text-sm">info</span>
                <span>Configura al menos 4 a 6 parejas para una experiencia de emparejamiento completa.</span>
              </div>

              <div class="space-y-2">
                <div 
                  v-for="(p, pIdx) in gameForm.config.pairs" 
                  :key="pIdx"
                  class="p-3 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div class="sm:col-span-1 text-center font-black text-gray-400">
                    #{{ pIdx + 1 }}
                  </div>
                  <div class="sm:col-span-4">
                    <input 
                      v-model="p.wordEn" 
                      type="text" 
                      required
                      placeholder="Término en Inglés *" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-bold text-gray-800 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                  <div class="sm:col-span-4">
                    <input 
                      v-model="p.wordEs" 
                      type="text" 
                      required
                      placeholder="Traducción en Español *" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-gray-700 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <input 
                      v-model="p.category" 
                      type="text" 
                      placeholder="Categoría" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-600 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                  <div class="sm:col-span-1 text-right">
                    <button 
                      type="button" 
                      @click="removeMatchPair(pIdx)"
                      :disabled="gameForm.config.pairs.length <= 2"
                      class="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30 cursor-pointer"
                      title="Eliminar pareja"
                    >
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                @click="addMatchPair"
                class="w-full py-2.5 border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50/50 text-orange-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                Agregar Nueva Pareja de Términos
              </button>
            </div>

            <!-- SUB-EDITOR: DESAFÍO DE ESCUCHA FONÉTICA -->
            <div v-else-if="gameForm.template === 'listening_challenge'" class="space-y-3">
              <div 
                v-for="(item, iIdx) in gameForm.config.items" 
                :key="iIdx"
                class="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3"
              >
                <div class="flex items-center justify-between">
                  <span class="font-black text-purple-700 text-xs flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">hearing</span>
                    Término Auditivo #{{ iIdx + 1 }}
                  </span>
                  <button 
                    type="button" 
                    @click="removeListeningItem(iIdx)"
                    :disabled="gameForm.config.items.length <= 1"
                    class="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30 cursor-pointer"
                    title="Eliminar término"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="font-bold text-gray-700 flex items-center justify-between">
                      <span>Palabra o Frase en Inglés (Audio) *</span>
                      <button 
                        type="button" 
                        @click="playAudioTerm(item.wordEn)" 
                        class="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Escuchar cómo se pronuncia"
                      >
                        <span class="material-symbols-outlined text-sm">volume_up</span>
                        Probar
                      </button>
                    </label>
                    <input 
                      v-model="item.wordEn" 
                      type="text" 
                      required
                      placeholder="Ej: Stethoscope" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-bold text-purple-900 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="font-bold text-gray-700">Traducción Clínica en Español *</label>
                    <input 
                      v-model="item.wordEs" 
                      type="text" 
                      required
                      placeholder="Ej: Estetoscopio" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-semibold text-gray-800 focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="font-bold text-gray-600">3 Opciones Distractoras *</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input 
                      v-model="item.options[1]" 
                      type="text" 
                      required
                      placeholder="Distractor 1" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:border-purple-500 focus:outline-none"
                    />
                    <input 
                      v-model="item.options[2]" 
                      type="text" 
                      required
                      placeholder="Distractor 2" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:border-purple-500 focus:outline-none"
                    />
                    <input 
                      v-model="item.options[3]" 
                      type="text" 
                      required
                      placeholder="Distractor 3" 
                      class="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                @click="addListeningItem"
                class="w-full py-2.5 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 text-purple-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                Agregar Término Auditivo
              </button>
            </div>

            <!-- SUB-EDITOR: WARM-UP DRAG MATCH -->
            <div v-else-if="gameForm.template === 'warmup_drag_match'" class="space-y-4">
              <div 
                v-for="(round, rIdx) in gameForm.config.rounds" 
                :key="rIdx"
                class="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3"
              >
                <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div class="flex items-center gap-2 flex-1 mr-2">
                    <span class="font-black text-blue-700 text-xs">Ronda #{{ rIdx + 1 }}:</span>
                    <input 
                      v-model="round.theme" 
                      type="text" 
                      required
                      placeholder="Título temático de la ronda" 
                      class="bg-white border border-gray-200 rounded-xl px-2.5 py-1 font-bold text-gray-800 flex-1 text-xs focus:border-[#006688] focus:outline-none"
                    />
                  </div>
                  <button 
                    type="button" 
                    @click="removeDragRound(rIdx)"
                    :disabled="gameForm.config.rounds.length <= 1"
                    class="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30 cursor-pointer"
                    title="Eliminar ronda"
                  >
                    <span class="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <div class="space-y-2">
                  <label class="font-bold text-gray-600 block">Elementos Arrastrables y sus Destinos:</label>
                  <div 
                    v-for="(it, itIdx) in round.items" 
                    :key="itIdx"
                    class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-200"
                  >
                    <div class="sm:col-span-4">
                      <input 
                        v-model="it.label" 
                        type="text" 
                        required
                        placeholder="Etiqueta / Nombre *" 
                        class="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-semibold text-gray-800 focus:border-[#006688] focus:outline-none"
                      />
                    </div>
                    <div class="sm:col-span-2 flex items-center gap-1">
                      <span class="material-symbols-outlined text-gray-500 text-sm">{{ it.icon || 'star' }}</span>
                      <input 
                        v-model="it.icon" 
                        type="text" 
                        placeholder="Icono" 
                        class="w-full bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 text-[11px] focus:border-[#006688] focus:outline-none"
                      />
                    </div>
                    <div class="sm:col-span-5">
                      <input 
                        v-model="it.match" 
                        type="text" 
                        required
                        placeholder="Expresión en inglés objetivo *" 
                        class="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 font-bold text-blue-900 focus:border-[#006688] focus:outline-none"
                      />
                    </div>
                    <div class="sm:col-span-1 text-right">
                      <button 
                        type="button" 
                        @click="removeDragItemFromRound(round, itIdx)"
                        :disabled="round.items.length <= 1"
                        class="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  @click="addDragItemToRound(round)"
                  class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#006688] font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">add</span>
                  Agregar Elemento a la Ronda
                </button>
              </div>

              <button 
                type="button" 
                @click="addDragRound"
                class="w-full py-2.5 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/50 text-[#006688] font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">add_circle</span>
                Agregar Nueva Ronda de Calentamiento
              </button>
            </div>

          </div>

          <!-- Botones de Acción Modal -->
          <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
            <div>
              <button 
                v-if="modalTab === 'interactive'"
                type="button"
                @click="modalTab = 'general'"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">arrow_back</span>
                Atrás
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="showGameModal = false"
                class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                :disabled="savingGame"
                class="px-6 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-base">save</span>
                {{ isEditingGame ? 'Guardar Cambios' : 'Crear Minijuego' }}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'

const route = useRoute()
const router = useRouter()

const auth = useAuthStore()
const notificationStore = useNotificationStore()

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

// ─────────────────────────────────────────────────────────────
// STATE & NAVIGATION
// ─────────────────────────────────────────────────────────────
const activeGame = ref(null) // game key or template
const activeEngine = ref(null) // 'warmup_drag_match' | 'trivia_medica' | 'drug_match' | 'listening_challenge'
const currentGameInstance = ref(null)
const isTeacherTestMode = ref(false)
const adminTab = ref('games') // 'games' | 'history'
const adminLoading = ref(false)

const adminStats = ref({
  totalPlays: 0,
  totalXpAwarded: 0,
  activePlayersCount: 0,
  totalArcadeGames: 4,
  mostPopularGame: 'Warm-up Drag Match'
})

const recentScores = ref([])

const DEFAULT_PREDETERMINED_GAMES = [
  {
    id: 1,
    key: 'warmup_drag_match',
    template: 'warmup_drag_match',
    name: 'Warm-up Drag Match',
    subtitle: 'Calentamiento Clínico Interactivo',
    description: 'Asocia iconos clínicos y saludos médicos arrastrándolos a sus expresiones en inglés correspondientes.',
    icon: 'pan_tool',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    difficulty: 'Fácil',
    pts: 100,
    duration: '3 min',
    active: true,
    playsCount: 0,
    totalXp: 0
  },
  {
    id: 2,
    key: 'trivia_medica',
    template: 'trivia_medica',
    name: 'Trivia Médica Contrarreloj',
    subtitle: 'Desafío Rápido de Vocabulario y Síntomas',
    description: 'Preguntas de opción múltiple generadas en vivo desde el vocabulario de enfermería para poner a prueba tu velocidad.',
    icon: 'quiz',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    difficulty: 'Medio',
    pts: 100,
    duration: '5 min',
    active: true,
    playsCount: 0,
    totalXp: 0
  },
  {
    id: 3,
    key: 'drug_match',
    template: 'drug_match',
    name: 'Pares Clínicos / Speed Match',
    subtitle: 'Emparejamiento de Términos y Definiciones',
    description: 'Encuentra las parejas correspondientes entre términos en inglés y su traducción clínica antes de que expire el tiempo.',
    icon: 'medication',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    difficulty: 'Medio',
    pts: 80,
    duration: '4 min',
    active: true,
    playsCount: 0,
    totalXp: 0
  },
  {
    id: 4,
    key: 'listening_challenge',
    template: 'listening_challenge',
    name: 'Desafío de Escucha Fonética',
    subtitle: 'Audio y Transcripción Clínica',
    description: 'Escucha la pronunciación en inglés de términos médicos y selecciona o transcribe la palabra correcta.',
    icon: 'hearing',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    difficulty: 'Difícil',
    pts: 80,
    duration: '4 min',
    active: true,
    playsCount: 0,
    totalXp: 0
  }
]

const arcadeGamesList = ref([...DEFAULT_PREDETERMINED_GAMES])

const userXp = computed(() => auth.user?.xp || 0)

const activeArcadeGamesForApprentice = computed(() => {
  return arcadeGamesList.value.filter(g => g.active !== false)
})

const gameFinished = ref(false)

// ─────────────────────────────────────────────────────────────
// CRUD MODAL STATE & INTERACTIVE CONFIG
// ─────────────────────────────────────────────────────────────
const showGameModal = ref(false)
const isEditingGame = ref(false)
const editingGameId = ref(null)
const savingGame = ref(false)
const modalTab = ref('general') // 'general' | 'interactive'

function getDefaultConfigForTemplate(template) {
  if (template === 'trivia_medica') {
    return {
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
        }
      ]
    }
  } else if (template === 'drug_match') {
    return {
      pairs: [
        { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial', category: 'Signos' },
        { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio', category: 'Equipos' },
        { id: 3, wordEn: 'Heart rate', wordEs: 'Frecuencia cardíaca', category: 'Signos' },
        { id: 4, wordEn: 'Syringe', wordEs: 'Jeringa', category: 'Equipos' },
        { id: 5, wordEn: 'Painkiller', wordEs: 'Analgésico', category: 'Farmacología' },
        { id: 6, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', category: 'Movilidad' }
      ]
    }
  } else if (template === 'listening_challenge') {
    return {
      items: [
        { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial', options: ['Blood pressure', 'Heart rate', 'Body temperature', 'Respiratory rate'] },
        { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio', options: ['Stethoscope', 'Sphygmomanometer', 'Pulse oximeter', 'Wheelchair'] },
        { id: 3, wordEn: 'Pulse oximeter', wordEs: 'Pulsioxímetro', options: ['Pulse oximeter', 'Thermometer', 'Stethoscope', 'Syringe'] },
        { id: 4, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', options: ['Wheelchair', 'Ambulance', 'Emergency bed', 'Crutches'] }
      ]
    }
  } else if (template === 'warmup_drag_match') {
    return {
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
        }
      ]
    }
  }
  return {}
}

const gameForm = ref({
  name: '',
  subtitle: '',
  description: '',
  template: 'trivia_medica',
  pts: 100,
  difficulty: 'Medio',
  duration: '5 min',
  active: true,
  icon: 'quiz',
  color: 'text-emerald-500',
  bg: 'bg-emerald-50',
  config: getDefaultConfigForTemplate('trivia_medica')
})

function getTemplateLabel(template) {
  if (template === 'trivia_medica') return 'Trivia Médica'
  if (template === 'drug_match') return 'Pares Clínicos'
  if (template === 'listening_challenge') return 'Desafío de Escucha'
  if (template === 'warmup_drag_match') return 'Warm-up Drag Match'
  return 'Juego'
}

function getContentItemsCount() {
  if (!gameForm.value.config) return 0
  if (gameForm.value.template === 'trivia_medica') {
    return gameForm.value.config.questions?.length || 0
  }
  if (gameForm.value.template === 'drug_match') {
    return gameForm.value.config.pairs?.length || 0
  }
  if (gameForm.value.template === 'listening_challenge') {
    return gameForm.value.config.items?.length || 0
  }
  if (gameForm.value.template === 'warmup_drag_match') {
    return gameForm.value.config.rounds?.length || 0
  }
  return 0
}

function onTemplateChange() {
  gameForm.value.config = getDefaultConfigForTemplate(gameForm.value.template)
}

function resetInteractiveConfigToDefault() {
  gameForm.value.config = getDefaultConfigForTemplate(gameForm.value.template)
  notificationStore.notify({
    type: 'info',
    title: 'Plantilla Sugerida Cargada',
    message: 'Se cargó el contenido sugerido para este minijuego.'
  })
}

// Sub-editor Helpers: TRIVIA
function addTriviaQuestion() {
  if (!gameForm.value.config.questions) gameForm.value.config.questions = []
  gameForm.value.config.questions.push({
    id: Date.now(),
    question: '',
    correctAnswer: '',
    options: ['', '', '', ''],
    category: 'Clínica General',
    hint: ''
  })
}

function removeTriviaQuestion(index) {
  gameForm.value.config.questions.splice(index, 1)
}

// Sub-editor Helpers: PARES CLÍNICOS
function addMatchPair() {
  if (!gameForm.value.config.pairs) gameForm.value.config.pairs = []
  gameForm.value.config.pairs.push({
    id: Date.now(),
    wordEn: '',
    wordEs: '',
    category: 'Vocabulario'
  })
}

function removeMatchPair(index) {
  gameForm.value.config.pairs.splice(index, 1)
}

// Sub-editor Helpers: LISTENING
function addListeningItem() {
  if (!gameForm.value.config.items) gameForm.value.config.items = []
  gameForm.value.config.items.push({
    id: Date.now(),
    wordEn: '',
    wordEs: '',
    options: ['', '', '', '']
  })
}

function removeListeningItem(index) {
  gameForm.value.config.items.splice(index, 1)
}

// Sub-editor Helpers: DRAG MATCH
function addDragRound() {
  if (!gameForm.value.config.rounds) gameForm.value.config.rounds = []
  gameForm.value.config.rounds.push({
    id: Date.now(),
    theme: 'Nueva Ronda Temática',
    items: [
      { id: `r-${Date.now()}-1`, label: 'Termómetro', icon: 'thermostat', color: 'text-red-500', match: 'Thermometer' },
      { id: `r-${Date.now()}-2`, label: 'Estetoscopio', icon: 'stethoscope', color: 'text-[#006688]', match: 'Stethoscope' }
    ]
  })
}

function removeDragRound(index) {
  gameForm.value.config.rounds.splice(index, 1)
}

function addDragItemToRound(round) {
  if (!round.items) round.items = []
  round.items.push({
    id: `r-${Date.now()}`,
    label: '',
    icon: 'medication',
    color: 'text-emerald-500',
    match: ''
  })
}

function removeDragItemFromRound(round, itemIndex) {
  round.items.splice(itemIndex, 1)
}

function openCreateGameModal() {
  isEditingGame.value = false
  editingGameId.value = null
  modalTab.value = 'general'
  const template = 'trivia_medica'
  gameForm.value = {
    name: '',
    subtitle: '',
    description: '',
    template,
    pts: 100,
    difficulty: 'Medio',
    duration: '5 min',
    active: true,
    icon: 'quiz',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    config: getDefaultConfigForTemplate(template)
  }
  showGameModal.value = true
}

function openEditGameModal(game) {
  isEditingGame.value = true
  editingGameId.value = game.id
  modalTab.value = 'general'

  let loadedConfig = null
  if (game.config) {
    try {
      loadedConfig = typeof game.config === 'string' ? JSON.parse(game.config) : JSON.parse(JSON.stringify(game.config))
    } catch {
      loadedConfig = null
    }
  }

  if (!loadedConfig || Object.keys(loadedConfig).length === 0) {
    loadedConfig = getDefaultConfigForTemplate(game.template || 'trivia_medica')
  }

  gameForm.value = {
    name: game.name || '',
    subtitle: game.subtitle || '',
    description: game.description || game.desc || '',
    template: game.template || 'trivia_medica',
    pts: game.pts || 100,
    difficulty: game.difficulty || 'Medio',
    duration: game.duration || '5 min',
    active: game.active !== false,
    icon: game.icon || 'sports_esports',
    color: game.color || 'text-blue-500',
    bg: game.bg || 'bg-blue-50',
    config: loadedConfig
  }
  showGameModal.value = true
}

async function saveGameForm() {
  savingGame.value = true
  const token = getToken()
  try {
    const url = isEditingGame.value 
      ? `${apiBaseUrl}/api/gamification/admin/games/${editingGameId.value}`
      : `${apiBaseUrl}/api/gamification/admin/games`
    
    const method = isEditingGame.value ? 'PUT' : 'POST'

    // Asignar colores/iconos según la plantilla seleccionada si no tiene
    if (gameForm.value.template === 'trivia_medica') {
      gameForm.value.icon = 'quiz'
      gameForm.value.color = 'text-emerald-500'
      gameForm.value.bg = 'bg-emerald-50'
      // Sincronizar respuesta correcta como opción 0
      if (gameForm.value.config?.questions) {
        gameForm.value.config.questions.forEach((q) => {
          if (!q.options) q.options = []
          q.options[0] = q.correctAnswer
        })
      }
    } else if (gameForm.value.template === 'drug_match') {
      gameForm.value.icon = 'medication'
      gameForm.value.color = 'text-orange-500'
      gameForm.value.bg = 'bg-orange-50'
    } else if (gameForm.value.template === 'listening_challenge') {
      gameForm.value.icon = 'hearing'
      gameForm.value.color = 'text-purple-500'
      gameForm.value.bg = 'bg-purple-50'
      if (gameForm.value.config?.items) {
        gameForm.value.config.items.forEach((item) => {
          if (!item.options) item.options = []
          item.options[0] = item.wordEn
        })
      }
    } else if (gameForm.value.template === 'warmup_drag_match') {
      gameForm.value.icon = 'pan_tool'
      gameForm.value.color = 'text-blue-500'
      gameForm.value.bg = 'bg-blue-50'
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(gameForm.value)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Error al guardar el minijuego.')
    }

    notificationStore.notify({
      type: 'success',
      title: isEditingGame.value ? 'Juego Actualizado' : 'Juego Creado',
      message: 'Los cambios y la dinámica pedagógica fueron guardados con éxito.'
    })

    showGameModal.value = false
    await loadAdminData()
    await fetchArcadeContent()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo guardar el juego.'
    })
  } finally {
    savingGame.value = false
  }
}

async function deleteGame(game) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el minijuego "${game.name}"?`)) return
  const token = getToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/gamification/admin/games/${game.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    if (!res.ok) throw new Error('Error al eliminar el juego.')

    notificationStore.notify({
      type: 'success',
      title: 'Juego Eliminado',
      message: 'El minijuego fue retirado del arcade.'
    })

    await loadAdminData()
    await fetchArcadeContent()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo eliminar el juego.'
    })
  }
}

async function toggleGameStatus(game) {
  const token = getToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/gamification/admin/games/${game.id}/toggle`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    if (!res.ok) throw new Error('Error al cambiar estado.')

    const data = await res.json()
    const updated = data.data || data
    game.active = updated.active

    notificationStore.notify({
      type: 'info',
      title: updated.active ? 'Juego Activado' : 'Juego Pausado',
      message: `El juego ahora está ${updated.active ? 'visible' : 'oculto'} para los aprendices.`
    })
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: 'No se pudo cambiar el estado del juego.'
    })
  }
}

// ─────────────────────────────────────────────────────────────
// TOKEN HELPER
// ─────────────────────────────────────────────────────────────
function getToken() {
  if (auth.token) return auth.token
  if (auth.user?.token) return auth.user.token
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

// ─────────────────────────────────────────────────────────────
// DATA FETCHING
// ─────────────────────────────────────────────────────────────
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
      if (payload.stats) adminStats.value = payload.stats
      if (payload.recentScores) recentScores.value = payload.recentScores
      if (payload.games && Array.isArray(payload.games) && payload.games.length > 0) {
        arcadeGamesList.value = payload.games
      }
    }
  } catch (err) {
    console.error('Error al cargar datos de gamificación:', err)
  } finally {
    adminLoading.value = false
  }
}

async function fetchArcadeContent() {
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/gamification/arcade/content`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      const payload = data.data || data
      if (payload.catalog && Array.isArray(payload.catalog) && payload.catalog.length > 0) {
        arcadeGamesList.value = payload.catalog
      }
      if (payload.trivia && payload.trivia.length > 0) {
        triviaList.value = payload.trivia
      }
      if (payload.pairs && payload.pairs.length > 0) {
        setupMatchCardsFromData(payload.pairs)
      }
      if (payload.listening && payload.listening.length > 0) {
        listeningList.value = payload.listening
      }
    }
  } catch (err) {
    console.error('Error al cargar contenido de arcade:', err)
  }
}

// ─────────────────────────────────────────────────────────────
// GAME LAUNCHERS & SCORE SAVING
// ─────────────────────────────────────────────────────────────
function startTeacherTest(gameOrKey) {
  isTeacherTestMode.value = true
  launchGame(gameOrKey)
}

function startApprenticeGame(gameOrKey) {
  isTeacherTestMode.value = false
  launchGame(gameOrKey)
}

function launchGame(gameOrKey) {
  let game = null
  let keyOrTemplate = ''

  if (typeof gameOrKey === 'string') {
    keyOrTemplate = gameOrKey
    game = arcadeGamesList.value.find(g => g.key === gameOrKey || g.template === gameOrKey || String(g.id) === String(gameOrKey))
  } else if (gameOrKey && typeof gameOrKey === 'object') {
    game = gameOrKey
    keyOrTemplate = game.key || game.template
  }

  const selectedKey = game?.key || keyOrTemplate || 'warmup_drag_match'

  currentGameInstance.value = game || {
    name: 'Minijuego Clínico',
    subtitle: 'Práctica de enfermería',
    pts: 100,
    key: selectedKey
  }

  activeGame.value = selectedKey
  activeEngine.value = game?.template || keyOrTemplate || 'warmup_drag_match'
  gameFinished.value = false

  // Sincronizar ruta en la URL si difiere
  if (route.params.gameId !== selectedKey) {
    router.replace(`/dashboard/juegos/${selectedKey}`)
  }

  let customConfig = null
  if (game?.config) {
    try {
      customConfig = typeof game.config === 'string' ? JSON.parse(game.config) : game.config
    } catch {
      customConfig = null
    }
  }

  if (activeEngine.value === 'warmup_drag_match') {
    resetDragGame(customConfig)
  } else if (activeEngine.value === 'trivia_medica') {
    resetTriviaGame(customConfig)
  } else if (activeEngine.value === 'drug_match') {
    resetMatchGame(customConfig)
  } else if (activeEngine.value === 'listening_challenge') {
    resetListeningGame(customConfig)
  }
}

function quitGame() {
  activeGame.value = null
  activeEngine.value = null
  currentGameInstance.value = null
  isTeacherTestMode.value = false
  gameFinished.value = false
  if (route.params.gameId) {
    router.push('/dashboard/juegos')
  }
  if (auth.isAdmin || auth.isInstructor) {
    loadAdminData()
  }
}

async function recordFinalScore(scoreAwarded, roundsCount = 4) {
  gameFinished.value = true

  // Si es Modo Prueba Docente, no guarda puntaje de aprendiz en BD
  if (isTeacherTestMode.value || auth.isAdmin || auth.isInstructor) {
    return
  }

  const finalPts = currentGameInstance.value?.pts || scoreAwarded

  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/gamification/games/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        gameKey: activeGame.value,
        score: finalPts,
        roundsCompleted: roundsCount
      })
    })

    if (res.ok) {
      const data = await res.json()
      const payload = data.data || data
      if (payload.currentTotalXp && auth.user) {
        auth.user.xp = payload.currentTotalXp
      }
      notificationStore.notify({
        type: 'success',
        title: `+${finalPts} XP Ganados`,
        message: '¡Excelente desempeño en el arcade clínico!'
      })
    }
  } catch (err) {
    console.error('Error al registrar XP de partida:', err)
  }
}

// ─────────────────────────────────────────────────────────────
// MOTOR 1: WARM-UP DRAG MATCH (LÓGICA)
// ─────────────────────────────────────────────────────────────
const currentRoundIndex = ref(0)
const DEFAULT_DRAG_ROUNDS = [
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

const activeRounds = ref([...DEFAULT_DRAG_ROUNDS])
const rounds = computed(() => activeRounds.value)
const currentRoundCards = ref([])
const currentRoundTargets = ref([])

const currentRound = computed(() => activeRounds.value[currentRoundIndex.value] || activeRounds.value[0])
const isRoundCompleted = computed(() => currentRoundCards.value.length > 0 && currentRoundCards.value.every(c => c.matched))

const activeDragCard = ref(null)
let initialPointerX = 0
let initialPointerY = 0
let initialCardX = 0
let initialCardY = 0

function initDragRound(index) {
  currentRoundIndex.value = index
  const round = activeRounds.value[index]
  if (!round) return

  currentRoundTargets.value = round.items.map(item => ({
    id: `target-${item.id}`,
    match: item.match,
    filledWith: null
  }))

  const shuffled = [...round.items].sort(() => Math.random() - 0.5)
  currentRoundCards.value = shuffled.map(item => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    color: item.color || 'text-[#006688]',
    match: item.match,
    matched: false,
    x: 0,
    y: 0,
    isResetting: false
  }))
}

function nextDragRound() {
  if (currentRoundIndex.value < activeRounds.value.length - 1) {
    initDragRound(currentRoundIndex.value + 1)
  } else {
    recordFinalScore(100, activeRounds.value.length)
  }
}

function resetDragGame(customConfig) {
  if (customConfig?.rounds && Array.isArray(customConfig.rounds) && customConfig.rounds.length > 0) {
    activeRounds.value = JSON.parse(JSON.stringify(customConfig.rounds))
  } else {
    activeRounds.value = JSON.parse(JSON.stringify(DEFAULT_DRAG_ROUNDS))
  }
  gameFinished.value = false
  initDragRound(0)
}

function startDrag(event, card) {
  if (card.matched) return
  activeDragCard.value = card
  initialPointerX = event.clientX
  initialPointerY = event.clientY
  initialCardX = card.x
  initialCardY = card.y

  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
}

function onDragMove(event) {
  if (!activeDragCard.value) return
  const dx = event.clientX - initialPointerX
  const dy = event.clientY - initialPointerY
  activeDragCard.value.x = initialCardX + dx
  activeDragCard.value.y = initialCardY + dy
}

function onDragEnd(event) {
  if (!activeDragCard.value) return
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)

  const card = activeDragCard.value
  activeDragCard.value = null

  const targetElements = document.querySelectorAll('.border-dashed')
  let droppedTarget = null

  targetElements.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      const matchText = el.querySelector('p')?.innerText?.replace(/"/g, '')?.trim()
      droppedTarget = currentRoundTargets.value.find(t => t.match === matchText && !t.filledWith)
    }
  })

  if (droppedTarget && droppedTarget.match === card.match) {
    droppedTarget.filledWith = card
    card.matched = true
  } else {
    card.isResetting = true
    card.x = 0
    card.y = 0
    setTimeout(() => { card.isResetting = false }, 300)
  }
}

// ─────────────────────────────────────────────────────────────
// MOTOR 2: TRIVIA MÉDICA CONTRARRELOJ (BD)
// ─────────────────────────────────────────────────────────────
const triviaList = ref([
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
])

const triviaCurrentIdx = ref(0)
const triviaScore = ref(0)
const triviaCorrectCount = ref(0)
const triviaAnswered = ref(false)
const triviaSelectedOption = ref('')

const currentTriviaQ = computed(() => triviaList.value[triviaCurrentIdx.value])

function resetTriviaGame(customConfig) {
  if (customConfig?.questions && Array.isArray(customConfig.questions) && customConfig.questions.length > 0) {
    triviaList.value = customConfig.questions.map((q, idx) => {
      const allOpts = [q.correctAnswer, ...(q.options?.slice(1) || [])].filter(Boolean)
      const shuffledOpts = [...allOpts].sort(() => Math.random() - 0.5)
      return {
        ...q,
        id: q.id || idx + 1,
        options: shuffledOpts.length > 0 ? shuffledOpts : [q.correctAnswer]
      }
    })
  }
  triviaCurrentIdx.value = 0
  triviaScore.value = 0
  triviaCorrectCount.value = 0
  triviaAnswered.value = false
  triviaSelectedOption.value = ''
  gameFinished.value = false
}

function handleTriviaSelect(option) {
  if (triviaAnswered.value) return
  triviaAnswered.value = true
  triviaSelectedOption.value = option

  if (option === currentTriviaQ.value.correctAnswer) {
    triviaScore.value += 10
    triviaCorrectCount.value += 1
  }
}

function nextTriviaQuestion() {
  if (triviaCurrentIdx.value + 1 < triviaList.value.length) {
    triviaCurrentIdx.value += 1
    triviaAnswered.value = false
    triviaSelectedOption.value = ''
  } else {
    recordFinalScore(triviaScore.value, triviaList.value.length)
  }
}

// ─────────────────────────────────────────────────────────────
// MOTOR 3: PARES CLÍNICOS / SPEED MATCH (BD)
// ─────────────────────────────────────────────────────────────
const matchCards = ref([])
const selectedMatchCards = ref([])
const matchPairsFound = ref(0)
const totalPairsCount = ref(6)

function setupMatchCardsFromData(vocabPairs) {
  const selected = (vocabPairs && vocabPairs.length >= 2) ? vocabPairs : [
    { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial' },
    { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio' },
    { id: 3, wordEn: 'Heart rate', wordEs: 'Frecuencia cardíaca' },
    { id: 4, wordEn: 'Syringe', wordEs: 'Jeringa' },
    { id: 5, wordEn: 'Painkiller', wordEs: 'Analgésico' },
    { id: 6, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas' }
  ]

  totalPairsCount.value = selected.length

  const cards = []
  selected.forEach(item => {
    cards.push({
      uid: `en-${item.id}`,
      pairId: item.id,
      lang: 'en',
      text: item.wordEn,
      matched: false
    })
    cards.push({
      uid: `es-${item.id}`,
      pairId: item.id,
      lang: 'es',
      text: item.wordEs,
      matched: false
    })
  })

  matchCards.value = cards.sort(() => Math.random() - 0.5)
}

function resetMatchGame(customConfig) {
  matchPairsFound.value = 0
  selectedMatchCards.value = []
  gameFinished.value = false
  if (customConfig?.pairs && Array.isArray(customConfig.pairs) && customConfig.pairs.length > 0) {
    setupMatchCardsFromData(customConfig.pairs)
  } else {
    setupMatchCardsFromData()
  }
}

function handleMatchCardClick(card) {
  if (card.matched) return
  if (selectedMatchCards.value.includes(card)) return

  if (selectedMatchCards.value.length >= 2) return

  selectedMatchCards.value.push(card)

  if (selectedMatchCards.value.length === 2) {
    const [c1, c2] = selectedMatchCards.value

    if (c1.pairId === c2.pairId && c1.lang !== c2.lang) {
      c1.matched = true
      c2.matched = true
      matchPairsFound.value += 1
      selectedMatchCards.value = []

      if (matchPairsFound.value === totalPairsCount.value) {
        setTimeout(() => {
          recordFinalScore(80, totalPairsCount.value)
        }, 500)
      }
    } else {
      setTimeout(() => {
        selectedMatchCards.value = []
      }, 700)
    }
  }
}

// ─────────────────────────────────────────────────────────────
// MOTOR 4: DESAFÍO DE ESCUCHA FONÉTICA (BD + Web Speech API)
// ─────────────────────────────────────────────────────────────
const listeningList = ref([
  { id: 1, wordEn: 'Blood pressure', wordEs: 'Presión arterial', options: ['Blood pressure', 'Heart rate', 'Body temperature', 'Respiratory rate'] },
  { id: 2, wordEn: 'Stethoscope', wordEs: 'Estetoscopio', options: ['Stethoscope', 'Sphygmomanometer', 'Pulse oximeter', 'Wheelchair'] },
  { id: 3, wordEn: 'Pulse oximeter', wordEs: 'Pulsioxímetro', options: ['Pulse oximeter', 'Thermometer', 'Stethoscope', 'Syringe'] },
  { id: 4, wordEn: 'Wheelchair', wordEs: 'Silla de ruedas', options: ['Wheelchair', 'Ambulance', 'Emergency bed', 'Crutches'] }
])

const listeningCurrentIdx = ref(0)
const listeningCorrectCount = ref(0)
const listeningAnswered = ref(false)
const listeningSelectedOption = ref('')

const currentListenItem = computed(() => listeningList.value[listeningCurrentIdx.value])

function resetListeningGame(customConfig) {
  if (customConfig?.items && Array.isArray(customConfig.items) && customConfig.items.length > 0) {
    listeningList.value = customConfig.items.map((it, idx) => {
      const allOpts = [it.wordEn, ...(it.options?.slice(1) || [])].filter(Boolean)
      const shuffled = [...allOpts].sort(() => Math.random() - 0.5)
      return {
        ...it,
        id: it.id || idx + 1,
        options: shuffled.length > 0 ? shuffled : [it.wordEn]
      }
    })
  }
  listeningCurrentIdx.value = 0
  listeningCorrectCount.value = 0
  listeningAnswered.value = false
  listeningSelectedOption.value = ''
  gameFinished.value = false
  if (currentListenItem.value) {
    playAudioTerm(currentListenItem.value.wordEn)
  }
}

function playAudioTerm(text) {
  if (!text) return
  if (!('speechSynthesis' in window)) {
    notificationStore.notify({
      type: 'info',
      title: 'Audio',
      message: `Audio no disponible en este navegador: ${text}`
    })
    return
  }
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.error('Speech synthesis error:', e)
  }
}

function handleListeningSelect(option) {
  if (listeningAnswered.value) return
  listeningAnswered.value = true
  listeningSelectedOption.value = option

  if (option === currentListenItem.value.wordEn) {
    listeningCorrectCount.value += 1
  }
}

function nextListeningItem() {
  if (listeningCurrentIdx.value + 1 < listeningList.value.length) {
    listeningCurrentIdx.value += 1
    listeningAnswered.value = false
    listeningSelectedOption.value = ''
    playAudioTerm(currentListenItem.value.wordEn)
  } else {
    recordFinalScore(80, listeningList.value.length)
  }
}

// ─────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────
function formatGameName(key) {
  const map = {
    warmup_drag_match: 'Warm-up Drag Match',
    trivia_medica: 'Trivia Médica',
    drug_match: 'Pares Clínicos',
    listening_challenge: 'Desafío de Escucha'
  }
  return map[key] || key || 'Minijuego Clínico'
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

// ─────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────
function checkRouteGame() {
  const gameId = route.params.gameId
  if (gameId && activeGame.value !== gameId) {
    const found = arcadeGamesList.value.find(g => g.key === gameId || g.template === gameId || String(g.id) === String(gameId))
    launchGame(found || gameId)
  }
}

watch(() => route.params.gameId, (newGameId) => {
  if (newGameId && activeGame.value !== newGameId) {
    const found = arcadeGamesList.value.find(g => g.key === newGameId || g.template === newGameId || String(g.id) === String(newGameId))
    launchGame(found || newGameId)
  } else if (!newGameId && activeGame.value) {
    activeGame.value = null
    activeEngine.value = null
    currentGameInstance.value = null
  }
})

onMounted(async () => {
  setupMatchCardsFromData()
  if (auth.isAdmin || auth.isInstructor) {
    await loadAdminData()
  }
  await fetchArcadeContent()
  checkRouteGame()
})
</script>

<style scoped>
.draggable-card {
  touch-action: none;
}
.card-reset {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-zoom-in {
  animation: zoomIn 0.25s ease-out forwards;
}
</style>
