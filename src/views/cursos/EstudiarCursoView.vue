<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <router-link to="/dashboard/cursos" class="flex items-center gap-1 text-[#006688] hover:underline text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Cursos
          </router-link>
        </div>
        <h2 class="text-2xl font-black text-gray-800">{{ courseTitle }}</h2>
        <p class="text-xs text-gray-500">Módulo de Inglés Técnico Aplicado a la Enfermería</p>
      </div>

      <!-- Main Progress Tracking -->
      <div class="w-full sm:w-64 space-y-2">
        <div class="flex justify-between text-xs font-bold text-gray-600">
          <span>Progreso del Módulo</span>
          <span class="text-[#006688]">{{ Math.round(moduleProgress) }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="h-2 rounded-full bg-[#006688] transition-all duration-500 shadow-sm" :style="`width: ${moduleProgress}%`"></div>
        </div>
      </div>
    </div>

    <!-- Media Check Settings Banner (Simulation) -->
    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-gray-500">settings_suggest</span>
        <span class="text-gray-600 font-medium">Panel de Simulación de Recursos y Estado:</span>
        <button 
          @click="toggleSimulatedMediaFailure" 
          :class="`px-3 py-1.5 rounded-lg font-bold transition-all ${simulatedMediaFailure ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`"
        >
          {{ simulatedMediaFailure ? '❌ Recursos Caídos (Fallo)' : '✅ Recursos Disponibles' }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-400 font-medium">Progreso guardado automáticamente en:</span>
        <span class="font-bold text-gray-700 bg-white border border-gray-100 px-2 py-1 rounded">LocalStorage</span>
      </div>
    </div>

    <!-- Warning Banner for Media Pre-Check (Non-blocking) -->
    <transition name="fade">
      <div v-if="mediaWarningMessage" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <span class="material-symbols-outlined text-amber-600 shrink-0 mt-0.5">warning</span>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-amber-800">Advertencia de Recursos de Audio/Video</h4>
          <p class="text-xs text-amber-700 mt-1 leading-relaxed">{{ mediaWarningMessage }}</p>
        </div>
        <button @click="mediaWarningMessage = null" class="text-amber-500 hover:text-amber-700">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </transition>

    <!-- Phase Tabs Navigation (Strict Sequential Lock) -->
    <div class="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-wrap gap-1">
      <button 
        v-for="(phase, index) in phases" 
        :key="phase.id"
        @click="goToPhase(phase.id)"
        :disabled="isPhaseLocked(phase.id)"
        :class="`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${
          currentPhase === phase.id 
            ? 'bg-[#006688] text-white shadow-md' 
            : isPhaseLocked(phase.id) 
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-50'
        }`"
      >
        <!-- Background indicator for completion -->
        <div v-if="phaseProgress[phase.id] === 100" class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-bl-lg"></div>
        
        <span class="material-symbols-outlined text-lg">
          {{ isPhaseLocked(phase.id) ? 'lock' : phase.icon }}
        </span>
        <span class="truncate">{{ phase.name }}</span>
        
        <!-- Check icon for finished phases -->
        <span v-if="phaseProgress[phase.id] === 100" class="material-symbols-outlined text-xs bg-white text-green-500 rounded-full p-0.5 shrink-0">check</span>
      </button>
    </div>

    <!-- Active Phase Panels -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 min-h-[400px]">

      <!-- FASE 1: INICIO (PREPARACIÓN) -->
      <div v-if="currentPhase === 'inicio'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Fase de Inicio: Bienvenida y Calentamiento
          </h3>
          <p class="text-xs text-gray-500 mt-1">Mira el video introductorio y completa el juego de calentamiento técnico antes de ver la teoría.</p>
        </div>

        <!-- Welcome Video Section -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="md:col-span-3 space-y-4">
            <div class="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-md group flex items-center justify-center">
              
              <!-- Video Placeholder Overlay -->
              <div v-if="!videoPlaying && !videoCompleted" class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-6 text-center space-y-3 z-10">
                <span class="material-symbols-outlined text-5xl text-[#006688] bg-white rounded-full p-3 shadow-lg group-hover:scale-105 transition-transform cursor-pointer" @click="playVideo">play_arrow</span>
                <p class="font-bold text-sm">Video de Bienvenida: Nursing Basics Introduction</p>
                <p class="text-[10px] text-gray-300">Duración estimada: 25s (Simulado)</p>
              </div>

              <!-- Simulating Video Playing -->
              <div v-if="videoPlaying" class="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-6 z-10">
                <span class="material-symbols-outlined text-4xl text-[#006688] animate-spin">sync</span>
                <p class="text-sm mt-3 font-semibold">Reproduciendo Video de Introducción...</p>
                <div class="w-48 bg-white/20 h-1 rounded-full mt-4 overflow-hidden">
                  <div class="bg-[#006688] h-1 transition-all duration-[25000ms] linear" :style="`width: ${videoProgress}%`"></div>
                </div>
                <button @click="skipVideo" class="mt-6 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20">Omitir e ir al Calentamiento</button>
              </div>

              <!-- Video Completed Screen -->
              <div v-if="videoCompleted" class="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 text-white p-6 text-center space-y-2 z-10">
                <span class="material-symbols-outlined text-5xl text-white bg-green-500 rounded-full p-2">check_circle</span>
                <p class="font-bold text-sm">¡Video Completado!</p>
                <button @click="resetVideo" class="text-xs underline text-green-200 hover:text-white mt-1">Ver de nuevo</button>
              </div>

              <!-- Static BG representation -->
              <div class="absolute inset-0 bg-gradient-to-tr from-cyan-900 to-indigo-950 flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-white/5">clinical_notes</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 space-y-4 flex flex-col justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 class="font-black text-gray-800 text-sm">¿Qué aprenderás en este módulo?</h4>
            <ul class="text-xs text-gray-600 space-y-2">
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-xs text-[#006688] mt-0.5">check_circle</span>
                <span>Vocabulario clínico esencial en inglés para enfermeros.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-xs text-[#006688] mt-0.5">check_circle</span>
                <span>Uso correcto de verbos, sustantivos y adjetivos en el ámbito de la salud.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-xs text-[#006688] mt-0.5">check_circle</span>
                <span>Conversaciones comunes de atención a pacientes angloparlantes.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Warm-up Game Section -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
            <h4 class="font-bold text-gray-800 text-sm">Juego de Calentamiento (Warm-up)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Instrucción: Ordena la siguiente frase en inglés haciendo clic sobre las palabras en orden lógico. 
            <strong>"El enfermero registra la presión arterial del paciente."</strong>
          </p>

          <div class="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Target Slot / Selected Words -->
            <div class="min-h-[50px] bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 items-center shadow-inner">
              <span v-if="gameSelectedWords.length === 0" class="text-gray-400 text-xs italic">Haz clic en las palabras de abajo para formar la frase...</span>
              <button 
                v-for="(word, index) in gameSelectedWords" 
                :key="'sel-' + index"
                @click="removeWordFromGame(index)"
                class="px-3 py-1.5 bg-[#006688]/10 text-[#006688] border border-[#006688]/20 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-[#006688]/20 transition-all"
              >
                {{ word }}
                <span class="material-symbols-outlined text-[10px]">close</span>
              </button>
            </div>

            <!-- Scrambled Available Words -->
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="(word, index) in gameScrambledWords" 
                :key="'scram-' + index"
                @click="addWordToGame(word, index)"
                :disabled="gameSelectedWords.includes(word)"
                :class="`px-3 py-2 border rounded-xl text-xs font-semibold shadow-sm transition-all ${
                  gameSelectedWords.includes(word)
                    ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed shadow-none'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688] hover:text-[#006688] active:scale-95'
                }`"
              >
                {{ word }}
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button 
                @click="validateWarmupGame" 
                :disabled="gameSelectedWords.length === 0"
                class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Validar Frase
              </button>
              <button 
                @click="resetWarmupGame"
                class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all"
              >
                Limpiar
              </button>
              
              <!-- Feedback messages -->
              <span v-if="gameSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Excelente! Frase correcta. Fase 1 validada.
              </span>
              <span v-if="gameSuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Inténtalo de nuevo. Revisa el orden.
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Button -->
        <div class="flex justify-end pt-4">
          <button 
            @click="goToPhase('estudio')" 
            :disabled="!isGameCompleted" 
            :class="`flex items-center gap-1 px-5 py-3 text-xs font-black rounded-xl shadow transition-all ${
              isGameCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`"
          >
            Siguiente Fase: Estudio (Absorción)
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>


      <!-- FASE 2: ESTUDIO (ABSORCIÓN) -->
      <div v-if="currentPhase === 'estudio'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Fase de Estudio: Absorción Conceptual
          </h3>
          <p class="text-xs text-gray-500 mt-1">Explora las estructuras gramaticales, practica la escucha de vocabulario médico y revisa la conversación de enfermería.</p>
        </div>

        <!-- Color Highlighted Grammar -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">palette</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Análisis Gramatical Interactivo</h4>
          </div>
          <p class="text-xs text-gray-600">
            Haz clic en los botones de leyenda para activar o desactivar el resaltado de colores en la oración clínica en inglés.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <!-- Sentence Render -->
            <div class="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed text-center px-4">
              <span 
                v-for="(part, idx) in grammarSentence" 
                :key="idx" 
                :class="`transition-all duration-300 px-1 py-0.5 rounded ${getGrammarHighlightClass(part.type)}`"
              >
                {{ part.text }}
              </span>
            </div>

            <!-- Legend Toggle Controls -->
            <div class="flex flex-wrap justify-center gap-2 pt-2 border-t border-gray-200">
              <button 
                v-for="leg in grammarLegend" 
                :key="leg.id"
                @click="toggleGrammarLegend(leg.id)"
                :class="`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeGrammarFilters.includes(leg.id)
                    ? `${leg.bg} ${leg.text} ${leg.border}`
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`"
              >
                <span :class="`w-2 h-2 rounded-full ${leg.dotBg}`"></span>
                {{ leg.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Listening Technical Vocabulary Zone -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">volume_up</span>
              <h4 class="font-bold text-gray-800 text-sm">2. Vocabulario Técnico Médico (Escucha)</h4>
            </div>
            <span class="text-xs bg-[#006688]/5 text-[#006688] font-bold px-3 py-1 rounded-full">
              Escuchados: {{ vocabList.filter(v => v.played).length }} / {{ vocabList.length }}
            </span>
          </div>
          <p class="text-xs text-gray-600">
            Reproduce el audio para cada uno de los términos clínicos clave. Debes escuchar todos para habilitar la validación.
          </p>

          <!-- Vocabulary Player Card -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              v-for="v in vocabList" 
              :key="v.id" 
              class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-[#006688] transition-all flex flex-col justify-between"
            >
              <div class="space-y-1">
                <div class="flex justify-between items-start">
                  <span class="text-base font-bold text-gray-800">{{ v.word }}</span>
                  <span v-if="v.played" class="text-green-600 material-symbols-outlined text-sm">check_circle</span>
                </div>
                <p class="text-xs text-[#006688] italic font-medium">{{ v.ipa }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ v.translation }}</p>
              </div>

              <!-- Term Audio Player Simulator -->
              <div class="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div class="flex items-center gap-3">
                  <!-- Play/Pause Button -->
                  <button 
                    @click="playVocabAudio(v)"
                    class="w-8 h-8 rounded-full bg-[#006688]/10 hover:bg-[#006688]/20 flex items-center justify-center text-[#006688] transition-all"
                  >
                    <span class="material-symbols-outlined text-base">
                      {{ playingVocabId === v.id ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>

                  <!-- Simulated Audio Wave Progress -->
                  <div class="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden relative">
                    <div 
                      class="bg-[#006688] h-1 absolute left-0 top-0 transition-all" 
                      :style="`width: ${playingVocabId === v.id ? vocabAudioProgress : (v.played ? 100 : 0)}%`"
                    ></div>
                  </div>
                </div>

                <!-- Speed Control -->
                <div class="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                  <span>Velocidad:</span>
                  <div class="flex gap-2">
                    <button 
                      v-for="speed in [0.8, 1.0, 1.2]" 
                      :key="speed"
                      @click="v.speed = speed"
                      :class="`px-1.5 py-0.5 rounded transition-all ${v.speed === speed ? 'bg-[#006688] text-white' : 'hover:bg-gray-100'}`"
                    >
                      {{ speed }}x
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real Conversation Dialogue -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">forum</span>
            <h4 class="font-bold text-gray-800 text-sm">3. Diálogo de la Vida Real: Nurse & Patient</h4>
          </div>
          <p class="text-xs text-gray-600">Revisa la interacción de ejemplo de un caso de triaje de enfermería en emergencias.</p>

          <div class="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4 max-h-[300px] overflow-y-auto">
            <div 
              v-for="(bubble, bIdx) in dialogue" 
              :key="bIdx" 
              :class="`flex gap-3 max-w-[80%] ${bubble.role === 'nurse' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`"
            >
              <div :class="`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${bubble.role === 'nurse' ? 'bg-[#006688]' : 'bg-orange-600'}`">
                {{ bubble.role === 'nurse' ? 'N' : 'P' }}
              </div>
              <div :class="`p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed ${bubble.role === 'nurse' ? 'bg-white text-gray-800 rounded-tl-none border-gray-100' : 'bg-orange-50/50 text-gray-800 rounded-tr-none border-orange-100'}`">
                <div class="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-1">{{ bubble.role === 'nurse' ? 'Nurse Laura' : 'Patient John' }}</div>
                <p class="font-semibold">{{ bubble.english }}</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">{{ bubble.spanish }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Validation -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            @click="goToPhase('inicio')" 
            class="flex items-center gap-1 px-4 py-2.5 text-xs border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Inicio
          </button>
          
          <button 
            @click="validateStudyPhase" 
            :disabled="!isStudyCompleted" 
            :class="`flex items-center gap-1 px-5 py-3 text-xs font-black rounded-xl shadow transition-all ${
              isStudyCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`"
          >
            Siguiente Fase: Práctica
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>


      <!-- FASE 3: PRÁCTICA -->
      <div v-if="currentPhase === 'practica'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Fase de Práctica Activa
          </h3>
          <p class="text-xs text-gray-500 mt-1">Completa el formulario de gramática, escribe el dictado médico y realiza la grabación de tu voz.</p>
        </div>

        <!-- Fill in the blank Form -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">edit_note</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Rellenar Espacios en Blanco</h4>
          </div>
          <p class="text-xs text-gray-600">Completa la oración seleccionando o escribiendo la opción correcta para un contexto clínico.</p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="text-sm font-semibold text-gray-700">
              Oración: "The doctor wrote a <span class="bg-white border-b-2 border-[#006688] px-2 py-0.5 inline-block text-[#006688] min-w-[120px] text-center font-bold">{{ fillInput || '______' }}</span> for the outpatient's medication."
            </div>
            
            <div class="flex gap-2">
              <button 
                v-for="opt in ['prescription', 'stethoscope', 'suture']" 
                :key="opt"
                @click="fillInput = opt"
                :class="`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  fillInput === opt
                    ? 'bg-[#006688] text-white border-[#006688]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`"
              >
                {{ opt }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dictation Activity -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">text_to_speech</span>
            <h4 class="font-bold text-gray-800 text-sm">2. Dictado Clínico (Escribir lo que escuchas)</h4>
          </div>
          <p class="text-xs text-gray-600">Escucha la frase de instrucción clínica haciendo clic en el altavoz y escríbela exactamente en el cuadro de texto.</p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex items-center gap-3">
              <button 
                @click="playDictationAudio"
                class="w-10 h-10 rounded-full bg-[#006688] text-white flex items-center justify-center hover:scale-105 transition-transform"
                title="Reproducir frase"
              >
                <span class="material-symbols-outlined text-xl">
                  {{ dictationPlaying ? 'volume_mute animate-pulse' : 'volume_up' }}
                </span>
              </button>
              <span class="text-xs text-gray-500 italic font-semibold">(Pista: frase de 5 palabras sobre los signos vitales)</span>
            </div>

            <div class="space-y-1">
              <input 
                type="text" 
                v-model="dictationInput" 
                placeholder="Escribe la frase aquí..."
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#006688] text-sm font-semibold"
              />
              <p class="text-[10px] text-gray-400 font-medium">Ejemplo para comprobar: "Please check the heart rate"</p>
            </div>
          </div>
        </div>

        <!-- Voice Recorder Component -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">mic</span>
            <h4 class="font-bold text-gray-800 text-sm">3. Grabación de Voz (Pronunciación)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Lee en voz alta y graba la siguiente oración: 
            <strong class="text-[#006688]">"The patient requires urgent sutures for the laceration."</strong> 
            (Tiempo máximo: 60 segundos).
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <!-- Left: Controls -->
              <div class="flex items-center gap-4">
                <button 
                  @click="toggleRecording"
                  :class="`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-[#006688] hover:bg-[#004e69]'
                  }`"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ isRecording ? 'stop' : 'mic' }}
                  </span>
                </button>

                <div class="space-y-0.5">
                  <div class="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <span v-if="isRecording" class="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    <span>{{ isRecording ? 'Grabando...' : (voiceRecorded ? 'Grabación lista' : 'Esperando micrófono...') }}</span>
                  </div>
                  <div class="text-xs text-gray-500 font-mono">
                    {{ formatRecordTime(recordingSeconds) }} / 01:00
                  </div>
                </div>
              </div>

              <!-- Center: Soundwave Animation -->
              <div class="flex-1 max-w-[200px] h-8 flex items-center justify-center gap-0.5">
                <span 
                  v-for="bar in 10" 
                  :key="bar" 
                  class="w-1 bg-[#006688] rounded-full transition-all duration-75"
                  :style="`height: ${isRecording ? (20 + Math.random() * 80) : 15}%`"
                ></span>
              </div>

              <!-- Right: Voice Preview playing simulation -->
              <div v-if="voiceRecorded" class="flex items-center gap-2">
                <button 
                  @click="playVoicePreview"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-all hover:bg-green-200"
                >
                  <span class="material-symbols-outlined text-xs">
                    {{ voicePreviewPlaying ? 'pause' : 'play_arrow' }}
                  </span>
                  Escuchar Grabación
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            @click="goToPhase('estudio')" 
            class="flex items-center gap-1 px-4 py-2.5 text-xs border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Estudio
          </button>
          
          <button 
            @click="validatePracticePhase" 
            :disabled="!isPracticeCompleted" 
            :class="`flex items-center gap-1 px-5 py-3 text-xs font-black rounded-xl shadow transition-all ${
              isPracticeCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`"
          >
            Siguiente Fase: Evaluación (Cierre)
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>


      <!-- FASE 4: EVALUACIÓN (CIERRE) -->
      <div v-if="currentPhase === 'evaluacion'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Fase de Finalización: Examen y Medallas
          </h3>
          <p class="text-xs text-gray-500 mt-1">Completa la evaluación de fin de módulo para aprobar y recibir tu insignia digital.</p>
        </div>

        <!-- Badge Success Notification -->
        <div v-if="examPassed && showBadgeAward" class="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-6 text-center space-y-4 shadow-md animate-bounce">
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg relative border-4 border-white">
              <span class="material-symbols-outlined text-white text-5xl">emoji_events</span>
              <span class="absolute -top-1 -right-1 flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
              </span>
            </div>
          </div>
          <div class="space-y-1">
            <h4 class="text-lg font-black text-yellow-800">¡Felicidades! Logro Desbloqueado</h4>
            <p class="text-sm font-bold text-yellow-700">Medalla de Inglés Clínico: Fundamentos de Enfermería</p>
            <p class="text-xs text-yellow-600 max-w-md mx-auto leading-relaxed">
              Has demostrado comprender las estructuras esenciales, el vocabulario técnico y la pronunciación para enfermeros.
              Esta medalla aparecerá ahora con orgullo en tu perfil.
            </p>
          </div>
          <button @click="showBadgeAward = false" class="text-xs font-bold text-yellow-800 hover:underline">Entendido, cerrar</button>
        </div>

        <!-- Exam Questions Form -->
        <div v-if="!examPassed" class="space-y-6">
          <p class="text-xs text-gray-600">
            Deberás responder correctamente al menos **2 de las 3 preguntas** (80%) para validar satisfactoriamente el módulo.
          </p>

          <div v-for="(q, qIndex) in examQuestions" :key="q.id" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
            <div class="text-sm font-bold text-gray-800">Pregunta {{ qIndex + 1 }}: {{ q.question }}</div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <button 
                v-for="opt in q.options" 
                :key="opt"
                @click="examAnswers[q.id] = opt"
                :class="`px-4 py-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center ${
                  examAnswers[q.id] === opt
                    ? 'bg-[#006688] text-white border-[#006688]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]'
                }`"
              >
                {{ opt }}
                <span v-if="examAnswers[q.id] === opt" class="material-symbols-outlined text-sm">radio_button_checked</span>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button 
              @click="submitExam" 
              :disabled="Object.keys(examAnswers).length < 3"
              class="px-6 py-3 bg-[#006688] hover:bg-[#004e69] text-white font-black text-xs rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow"
            >
              Entregar Evaluación
            </button>

            <!-- Exam Errors Feedback -->
            <span v-if="examScoreMessage" class="text-xs font-bold text-red-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">cancel</span>
              {{ examScoreMessage }}
            </span>
          </div>
        </div>

        <!-- Final Passed Screen -->
        <div v-if="examPassed" class="bg-green-50 border border-green-200 rounded-3xl p-8 text-center space-y-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
              <span class="material-symbols-outlined text-3xl font-bold">celebration</span>
            </div>
          </div>
          <div class="space-y-1">
            <h4 class="text-xl font-black text-green-800">¡Has completado todo el Módulo!</h4>
            <p class="text-xs text-green-700">Módulo validado y guardado con éxito. Has desbloqueado el progreso para futuros cursos de enfermería en inglés.</p>
          </div>
          <div class="inline-flex gap-2">
            <button 
              @click="resetExamForReview"
              class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all"
            >
              Re-presentar Examen (Prueba)
            </button>
            <router-link 
              to="/dashboard/cursos" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Volver a la Lista de Cursos
            </router-link>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            @click="goToPhase('practica')" 
            class="flex items-center gap-1 px-4 py-2.5 text-xs border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Práctica
          </button>
        </div>
      </div>

      <!-- Seccion de Actividades de Refuerzo / Complementarias -->
      <div v-if="currentPhaseActivities.length > 0" class="mt-8 pt-6 border-t border-gray-205 space-y-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
          <h4 class="font-bold text-gray-800 text-sm">Ejercicios de Refuerzo Clínico ({{ currentPhaseActivities.length }})</h4>
        </div>
        <p class="text-xs text-gray-500">Debes completar todos los ejercicios adicionales de esta fase para poder continuar con el módulo.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- List of Activities -->
          <div class="space-y-2">
            <div 
              v-for="act in currentPhaseActivities" 
              :key="act.id"
              @click="selectActiveDbActivity(act)"
              :class="`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                activeDbActivity?.id === act.id
                  ? 'border-[#006688] bg-[#006688]/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`"
            >
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-gray-800">{{ act.title }}</span>
                  <span class="text-[9px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {{ act.template }}
                  </span>
                </div>
                <p class="text-[10px] text-gray-400 mt-1">Puntos: {{ act.points }}</p>
              </div>
              
              <span :class="`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                completedActivityIds.includes(act.id)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`">
                {{ completedActivityIds.includes(act.id) ? 'Completada ✓' : 'Pendiente' }}
              </span>
            </div>
          </div>

          <!-- Playable Game Area -->
          <div class="bg-gray-50 rounded-3xl p-5 border border-gray-150 min-h-[220px] flex flex-col justify-between">
            <div v-if="activeDbActivity" class="space-y-4">
              <div class="border-b border-gray-200 pb-2 flex justify-between items-center">
                <span class="text-xs font-black text-[#006688]">{{ activeDbActivity.title }}</span>
                <span class="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-xs">emoji_events</span>
                  +{{ activeDbActivity.points }} pts
                </span>
              </div>

              <!-- 1. Playable Word Search (sopa) -->
              <div v-if="activeDbActivity.template === 'sopa'" class="space-y-3">
                <p class="text-[11px] text-gray-600 font-bold">Selecciona las letras en el tablero para encontrar las palabras:</p>
                
                <!-- Word list display -->
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="w in activeDbActivitySopaWords" 
                    :key="w" 
                    :class="`px-2 py-0.5 border rounded-lg text-[10px] font-bold font-mono transition-all ${
                      activeDbActivityFoundWords.includes(w) 
                        ? 'bg-green-100 text-green-700 border-green-300 line-through' 
                        : 'bg-white text-gray-650 border-gray-300'
                    }`"
                  >
                    {{ w }}
                  </span>
                </div>

                <!-- Tablero grid -->
                <div class="grid gap-0.5 mx-auto border border-gray-200 p-1.5 rounded-xl bg-white" :style="`grid-template-columns: repeat(${activeDbActivitySopaSize}, 1.75rem); width: fit-content;`">
                  <button 
                    v-for="(cell, idx) in activeDbActivitySopaGrid" 
                    :key="idx" 
                    @click="selectActiveDbSopaCell(idx)"
                    type="button"
                    :class="`w-7 h-7 rounded text-[10px] font-bold border transition-all ${
                      isActiveDbCellFoundWord(idx)
                        ? 'bg-green-400 text-white border-green-500'
                        : activeDbActivitySelectedLetters.includes(idx)
                          ? 'bg-[#006688] text-white border-[#006688] scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-[#006688]/10 cursor-pointer'
                    }`"
                  >
                    {{ cell.letter }}
                  </button>
                </div>
                <p v-if="activeDbSopaSelectionHint" class="text-[10px] text-center font-bold" :class="activeDbSopaSelectionHint.ok ? 'text-green-600' : 'text-red-500'">{{ activeDbSopaSelectionHint.msg }}</p>
              </div>

              <!-- 2. Playable Crosswords (crucigrama) -->
              <div v-if="activeDbActivity.template === 'crucigrama'" class="space-y-6">
                <!-- Horizontales -->
                <div v-if="crosswordWords.some(w => w.orientation === 'horizontal')" class="space-y-4">
                  <h5 class="text-xs font-bold text-[#006688] uppercase tracking-wider flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm font-bold">swap_horiz</span>
                    Palabras Horizontales
                  </h5>
                  <div v-for="(w, wIdx) in crosswordWords" :key="'h-' + wIdx">
                    <div v-if="w.orientation === 'horizontal'" class="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p class="text-xs font-bold text-gray-700">Pista: <span class="text-gray-600 font-semibold">{{ w.clue }}</span> <span class="text-gray-400 font-medium">({{ w.word.length }} letras)</span></p>
                      <div class="flex gap-1">
                        <input 
                          v-for="(char, idx) in w.word.length" 
                          :key="idx" 
                          type="text" 
                          maxlength="1" 
                          v-model="activeDbCrosswordInputs[wIdx][idx]"
                          class="w-7 h-7 text-center border-2 border-gray-250 focus:border-[#006688] focus:outline-none rounded-lg font-black uppercase text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Verticales -->
                <div v-if="crosswordWords.some(w => w.orientation === 'vertical')" class="space-y-4">
                  <h5 class="text-xs font-bold text-orange-650 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm font-bold">swap_vert</span>
                    Palabras Verticales
                  </h5>
                  <div v-for="(w, wIdx) in crosswordWords" :key="'v-' + wIdx">
                    <div v-if="w.orientation === 'vertical'" class="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p class="text-xs font-bold text-gray-700">Pista: <span class="text-gray-600 font-semibold">{{ w.clue }}</span> <span class="text-gray-400 font-medium">({{ w.word.length }} letras)</span></p>
                      <div class="flex gap-1">
                        <input 
                          v-for="(char, idx) in w.word.length" 
                          :key="idx" 
                          type="text" 
                          maxlength="1" 
                          v-model="activeDbCrosswordInputs[wIdx][idx]"
                          class="w-7 h-7 text-center border-2 border-gray-250 focus:border-[#006688] focus:outline-none rounded-lg font-black uppercase text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Playable Quiz / Preguntas (quiz / preguntas) -->
              <div v-if="activeDbActivity.template === 'quiz' || activeDbActivity.template === 'preguntas'" class="space-y-3">
                <div class="text-xs font-bold text-gray-800">{{ activeDbActivity.quizQuestion || '¿Pregunta del Quiz?' }}</div>
                <div class="grid grid-cols-1 gap-2">
                  <button 
                    @click="activeDbSelectedAnswer = 'correct'"
                    type="button"
                    :class="`px-3 py-2 border rounded-xl text-xs font-bold text-left transition-all ${
                      activeDbSelectedAnswer === 'correct' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`"
                  >
                    {{ activeDbActivity.quizCorrect || 'Opción Correcta' }}
                  </button>
                  <button 
                    @click="activeDbSelectedAnswer = 'incorrect'"
                    type="button"
                    :class="`px-3 py-2 border rounded-xl text-xs font-bold text-left transition-all ${
                      activeDbSelectedAnswer === 'incorrect' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`"
                  >
                    {{ activeDbActivity.quizIncorrect || 'Opción Incorrecta' }}
                  </button>
                </div>
              </div>

              <!-- 4. Playable Match Meaning (match) -->
              <div v-if="activeDbActivity.template === 'match'" class="space-y-4">
                <p class="text-[11px] text-gray-650 font-bold">Une la pareja correcta:</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <button 
                      @click="selectActiveDbTerm(activeDbActivity.matchTerm)"
                      type="button"
                      :disabled="activeDbMatchedPairs.includes(activeDbActivity.matchTerm)"
                      :class="`w-full p-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                        activeDbMatchedPairs.includes(activeDbActivity.matchTerm)
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : activeDbSelectedTerm === activeDbActivity.matchTerm
                            ? 'bg-[#006688] text-white border-[#006688] shadow'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`"
                    >
                      {{ activeDbActivity.matchTerm }}
                    </button>
                  </div>
                  <div class="space-y-2">
                    <button 
                      @click="selectActiveDbMeaning(activeDbActivity.matchMeaning)"
                      type="button"
                      :disabled="activeDbMatchedPairs.includes(activeDbActivity.matchMeaning)"
                      :class="`w-full p-2 border rounded-xl text-[11px] font-bold text-center transition-all ${
                        activeDbMatchedPairs.includes(activeDbActivity.matchMeaning)
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : activeDbSelectedMeaning === activeDbActivity.matchMeaning
                            ? 'bg-orange-600 text-white border-orange-600 shadow'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`"
                    >
                      {{ activeDbActivity.matchMeaning }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 5. Playable Listening (listening) -->
              <div v-if="activeDbActivity.template === 'listening'" class="space-y-3">
                <div class="flex items-center gap-2">
                  <button @click="playActiveDbListeningAudio" type="button" class="w-8 h-8 rounded-full bg-[#006688] text-white flex items-center justify-center hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-sm">volume_up</span>
                  </button>
                  <span class="text-[10px] text-gray-400 italic">Haz clic para oír la frase</span>
                </div>
                <input 
                  type="text" 
                  v-model="activeDbTypedPhrase"
                  class="w-full px-2.5 py-1.5 border border-gray-200 focus:outline-none focus:border-[#006688] rounded-xl text-xs font-semibold"
                  placeholder="Escribe la frase que escuchas..."
                />
              </div>

              <!-- 6. Playable Pronunciation (pronunciation) -->
              <div v-if="activeDbActivity.template === 'pronunciation'" class="space-y-3">
                <p class="text-[11px] text-gray-600 font-bold">Lee esta oración en voz alta:</p>
                <p class="text-xs font-semibold text-[#006688] bg-[#006688]/5 p-2.5 rounded-xl border border-[#006688]/10 text-center">
                  "{{ activeDbActivity.pronouncePhrase || 'Frase a pronunciar' }}"
                </p>
                <div class="flex flex-col items-center gap-1">
                  <button 
                    @click="simulateActiveDbMicRecording"
                    type="button"
                    :class="`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${
                      activeDbRecording ? 'bg-red-600 animate-pulse' : 'bg-[#006688] hover:bg-[#004e69]'
                    }`"
                  >
                    <span class="material-symbols-outlined text-sm">
                      {{ activeDbRecording ? 'stop' : 'mic' }}
                    </span>
                  </button>
                  <span class="text-[9px] text-gray-400 font-bold">
                    {{ activeDbRecording ? 'Grabando...' : (activeDbVoiceRecorded ? 'Grabación lista' : 'Haz clic para simular grabar') }}
                  </span>
                </div>
              </div>

              <!-- Action buttons for validation -->
              <div class="flex items-center gap-2 pt-3 border-t border-gray-200">
                <button 
                  @click="validateActiveDbSubmission"
                  type="button"
                  class="px-3.5 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-[10px] font-bold rounded-lg transition-all shadow-xs"
                >
                  Verificar Solución
                </button>
                <button 
                  @click="resetActiveDbDemo"
                  type="button"
                  class="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg transition-all"
                >
                  Reiniciar
                </button>

                <span v-if="activeDbFeedbackSuccess === true" class="text-green-600 text-[10px] font-bold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                  ¡Correcto! +{{ activeDbActivity.points }} pts
                </span>
                <span v-else-if="activeDbFeedbackSuccess === false" class="text-amber-600 text-[10px] font-bold flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-xs">info</span>
                  Intenta de nuevo.
                </span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-xs text-gray-400 italic">
              Selecciona una actividad de refuerzo para resolverla.
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const auth = useAuthStore()

// State
const courseId = route.params.courseId || '1'
const courseTitle = ref('Fundamentos de Enfermería')

// Tab Navigation Definition
const phases = [
  { id: 'inicio', name: 'Inicio (Preparación)', icon: 'flight_takeoff' },
  { id: 'estudio', name: 'Estudio (Absorción)', icon: 'menu_book' },
  { id: 'practica', name: 'Práctica', icon: 'edit' },
  { id: 'evaluacion', name: 'Evaluación (Cierre)', icon: 'check_circle' },
]

const currentPhase = ref('inicio')

// Media pre-checks
const simulatedMediaFailure = ref(false)
const mediaWarningMessage = ref(null)

// Phase Completion Progress values (from 0 to 100 per phase)
const phaseProgress = ref({
  inicio: 0,
  estudio: 0,
  practica: 0,
  evaluacion: 0,
})

// Calculate overall modules progress (average of phases progress)
const moduleProgress = computed(() => {
  const sum = Object.values(phaseProgress.value).reduce((a, b) => a + b, 0)
  return sum / Object.keys(phaseProgress.value).length
})

// Dynamic DB activities state
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const dbActivities = ref([])
const completedActivityIds = ref([])

async function fetchDbActivities() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/activities`)
    if (response.ok) {
      dbActivities.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
  }
}

const currentPhaseActivities = computed(() => {
  const phaseMapping = {
    inicio: 'Preparación',
    estudio: 'Absorción',
    practica: 'Práctica',
    evaluacion: 'Cierre'
  }
  const targetPhase = phaseMapping[currentPhase.value]
  return dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === targetPhase)
})

// Dynamic Game State variables for Active DB Activity
const activeDbActivity = ref(null)
const activeDbSelectedAnswer = ref(null)
const activeDbTypedPhrase = ref('')
const activeDbFeedbackSuccess = ref(null)
const activeDbCrosswordInputs = ref([])
const crosswordWords = computed(() => {
  if (!activeDbActivity.value) return []
  const clueStr = activeDbActivity.value.crossword1Clue || ''
  if (clueStr.startsWith('[') || clueStr.startsWith('{')) {
    try {
      return JSON.parse(clueStr)
    } catch (e) {
      console.error('Error parsing crossword JSON:', e)
    }
  }
  return [
    {
      word: activeDbActivity.value.crossword1Word || 'HEART',
      clue: activeDbActivity.value.crossword1Clue || 'Organ that pumps blood',
      orientation: 'horizontal'
    }
  ]
})
const activeDbSelectedTerm = ref('')
const activeDbSelectedMeaning = ref('')
const activeDbMatchedPairs = ref([])
const activeDbRecording = ref(false)
const activeDbVoiceRecorded = ref(false)

const activeDbActivitySopaWords = computed(() => {
  if (!activeDbActivity.value || activeDbActivity.value.template !== 'sopa') return []
  return (activeDbActivity.value.sopaWords || '')
    .split(',')
    .map(w => w.trim().toUpperCase())
    .filter(Boolean)
})

const activeDbActivitySopaSize = computed(() => {
  const words = activeDbActivitySopaWords.value
  if (!words.length) return 8
  const maxLen = Math.max(...words.map(w => w.length))
  return Math.max(maxLen + 2, 8)
})

const activeDbActivitySopaGrid = ref([])
const activeDbActivityFoundWords = ref([])
const activeDbActivitySelectedLetters = ref([])
const activeDbSopaSelectionHint = ref(null)

function generateActiveDbSopaGrid() {
  const words = activeDbActivitySopaWords.value
  const size = activeDbActivitySopaSize.value
  const grid = Array.from({ length: size * size }, () => ({ letter: '', wordIdx: -1, posInWord: -1 }))

  words.forEach((word, wIdx) => {
    let placed = false
    let attempts = 0
    while (!placed && attempts < 100) {
      attempts++
      const dir = Math.floor(Math.random() * 3) // 0: Horiz, 1: Vert, 2: Diag
      const startX = Math.floor(Math.random() * size)
      const startY = Math.floor(Math.random() * size)

      let fits = true
      const cells = []
      for (let i = 0; i < word.length; i++) {
        let x = startX
        let y = startY
        if (dir === 0) x += i
        if (dir === 1) y += i
        if (dir === 2) { x += i; y += i }

        if (x >= size || y >= size) { fits = false; break }
        const idx = y * size + x
        if (grid[idx].letter && grid[idx].letter !== word[i]) { fits = false; break }
        cells.push(idx)
      }

      if (fits) {
        cells.forEach((idx, i) => {
          grid[idx] = { letter: word[i], wordIdx: wIdx, posInWord: i }
        })
        placed = true
      }
    }
  })

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i].letter) {
      grid[i].letter = letters[Math.floor(Math.random() * letters.length)]
    }
  }

  activeDbActivitySopaGrid.value = grid
}

watch(activeDbActivity, (newAct) => {
  resetActiveDbDemo()
  if (newAct && newAct.template === 'sopa') {
    generateActiveDbSopaGrid()
  }
})

let activeDbSopaHintTimer = null

function selectActiveDbSopaCell(idx) {
  if (isActiveDbCellFoundWord(idx)) return
  const list = activeDbActivitySelectedLetters.value
  const foundIdx = list.indexOf(idx)
  if (foundIdx >= 0) {
    list.splice(foundIdx, 1)
  } else {
    list.push(idx)
  }

  const selectedStr = list
    .map(i => activeDbActivitySopaGrid.value[i]?.letter || '')
    .join('')
  const reversedStr = selectedStr.split('').reverse().join('')

  let matched = ''
  for (const word of activeDbActivitySopaWords.value) {
    if (selectedStr === word || reversedStr === word) {
      matched = word
      break
    }
  }

  if (matched && !activeDbActivityFoundWords.value.includes(matched)) {
    activeDbActivityFoundWords.value.push(matched)
    activeDbActivitySelectedLetters.value = []
    if (activeDbSopaHintTimer) clearTimeout(activeDbSopaHintTimer)
    activeDbSopaSelectionHint.value = { ok: true, msg: `✓ "${matched}" encontrada!` }
    activeDbSopaHintTimer = setTimeout(() => { activeDbSopaSelectionHint.value = null }, 2000)
  } else {
    const canContinue = activeDbActivitySopaWords.value.some(word => {
      return word.startsWith(selectedStr) || word.startsWith(reversedStr)
    })
    if (!canContinue && selectedStr.length > 1) {
      activeDbActivitySelectedLetters.value = []
      if (activeDbSopaHintTimer) clearTimeout(activeDbSopaHintTimer)
      activeDbSopaSelectionHint.value = { ok: false, msg: 'Selección inválida, intenta de nuevo.' }
      activeDbSopaHintTimer = setTimeout(() => { activeDbSopaSelectionHint.value = null }, 2000)
    }
  }
}

function isActiveDbCellFoundWord(idx) {
  const cell = activeDbActivitySopaGrid.value[idx]
  if (!cell || cell.wordIdx === -1) return false
  const word = activeDbActivitySopaWords.value[cell.wordIdx]
  return activeDbActivityFoundWords.value.includes(word)
}

function selectActiveDbActivity(act) {
  activeDbActivity.value = act
}

function resetActiveDbDemo() {
  activeDbSelectedAnswer.value = null
  activeDbTypedPhrase.value = ''
  activeDbFeedbackSuccess.value = null
  activeDbActivityFoundWords.value = []
  activeDbActivitySelectedLetters.value = []
  activeDbSopaSelectionHint.value = null
  if (activeDbSopaHintTimer) { clearTimeout(activeDbSopaHintTimer); activeDbSopaHintTimer = null }
  activeDbCrosswordInputs.value = crosswordWords.value.map(w => Array(w.word.length).fill(''))
  activeDbSelectedTerm.value = ''
  activeDbSelectedMeaning.value = ''
  activeDbMatchedPairs.value = []
  activeDbRecording.value = false
  activeDbVoiceRecorded.value = false
}

function selectActiveDbTerm(term) {
  if (activeDbMatchedPairs.value.includes(term)) return
  activeDbSelectedTerm.value = term
  checkActiveDbMatch()
}

function selectActiveDbMeaning(meaning) {
  if (activeDbMatchedPairs.value.includes(meaning)) return
  activeDbSelectedMeaning.value = meaning
  checkActiveDbMatch()
}

function checkActiveDbMatch() {
  if (activeDbSelectedTerm.value && activeDbSelectedMeaning.value) {
    if (activeDbSelectedTerm.value === activeDbActivity.value.matchTerm && activeDbSelectedMeaning.value === activeDbActivity.value.matchMeaning) {
      activeDbMatchedPairs.value.push(activeDbSelectedTerm.value, activeDbSelectedMeaning.value)
    }
    activeDbSelectedTerm.value = ''
    activeDbSelectedMeaning.value = ''
  }
}

function playActiveDbListeningAudio() {
  if ('speechSynthesis' in window && activeDbActivity.value?.listeningPhrase) {
    const utterance = new SpeechSynthesisUtterance(activeDbActivity.value.listeningPhrase)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  } else {
    alert('Reproduciendo: ' + (activeDbActivity.value?.listeningPhrase || 'Audio'))
  }
}

function simulateActiveDbMicRecording() {
  if (activeDbRecording.value) {
    activeDbRecording.value = false
    activeDbVoiceRecorded.value = true
  } else {
    activeDbRecording.value = true
    activeDbVoiceRecorded.value = false
    setTimeout(() => {
      if (activeDbRecording.value) {
        activeDbRecording.value = false
        activeDbVoiceRecorded.value = true
      }
    }, 3000)
  }
}

function validateActiveDbSubmission() {
  if (!activeDbActivity.value) return

  const act = activeDbActivity.value
  let success = false

  if (act.template === 'quiz' || act.template === 'preguntas') {
    if (activeDbSelectedAnswer.value === 'correct') {
      success = true
    }
  } else if (act.template === 'sopa') {
    const allWords = activeDbActivitySopaWords.value
    if (allWords.length > 0 && allWords.every(w => activeDbActivityFoundWords.value.includes(w))) {
      success = true
    }
  } else if (act.template === 'crucigrama') {
    success = crosswordWords.value.every((w, wIdx) => {
      const enteredWord = (activeDbCrosswordInputs.value[wIdx] || []).join('').trim().toLowerCase()
      const correctWord = w.word.trim().toLowerCase()
      return enteredWord === correctWord
    })
  } else if (act.template === 'match') {
    if (activeDbMatchedPairs.value.includes(act.matchTerm)) {
      success = true
    }
  } else if (act.template === 'listening') {
    const phrase = (act.listeningPhrase || '').trim().toLowerCase()
    const entered = activeDbTypedPhrase.value.trim().toLowerCase()
    const cleanPhrase = phrase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    const cleanEntered = entered.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    if (cleanPhrase && cleanEntered.includes(cleanPhrase)) {
      success = true
    }
  } else if (act.template === 'pronunciation') {
    if (activeDbVoiceRecorded.value) {
      success = true
    }
  }

  if (success) {
    activeDbFeedbackSuccess.value = true
    if (!completedActivityIds.value.includes(act.id)) {
      completedActivityIds.value.push(act.id)
    }
    updatePhaseProgress()
  } else {
    activeDbFeedbackSuccess.value = false
  }
}

function updatePhaseProgress() {
  // 1. Phase 1 (Inicio)
  const phase1DbActs = dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === 'Preparación')
  const p1DbCompleted = phase1DbActs.every(a => completedActivityIds.value.includes(a.id))
  const p1BaseCompleted = videoCompleted.value && gameSuccess.value === true
  phaseProgress.value.inicio = (p1BaseCompleted && p1DbCompleted) ? 100 : 0

  // 2. Phase 2 (Estudio)
  const phase2DbActs = dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === 'Absorción')
  const p2DbCompleted = phase2DbActs.every(a => completedActivityIds.value.includes(a.id))
  const p2BaseCompleted = vocabList.value.every(v => v.played)
  phaseProgress.value.estudio = (p2BaseCompleted && p2DbCompleted) ? 100 : 0

  // 3. Phase 3 (Práctica)
  const phase3DbActs = dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === 'Práctica')
  const p3DbCompleted = phase3DbActs.every(a => completedActivityIds.value.includes(a.id))
  const filled = fillInput.value.trim().toLowerCase() === 'prescription'
  const dictated = dictationInput.value.trim().toLowerCase().includes('heart rate')
  const p3BaseCompleted = filled && dictated && voiceRecorded.value
  phaseProgress.value.practica = (p3BaseCompleted && p3DbCompleted) ? 100 : 0

  // 4. Phase 4 (Evaluación)
  const phase4DbActs = dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === 'Cierre')
  const p4DbCompleted = phase4DbActs.every(a => completedActivityIds.value.includes(a.id))
  const p4BaseCompleted = examPassed.value
  phaseProgress.value.evaluacion = (p4BaseCompleted && p4DbCompleted) ? 100 : 0
  
  saveProgress()
}

// -----------------------------------------------------------------
// Phase 1: Welcome Video & Warm-up Game State
// -----------------------------------------------------------------
const videoPlaying = ref(false)
const videoCompleted = ref(false)
const videoProgress = ref(0)
let videoTimer = null

const gameScrambledWords = ref(['checks', 'The nurse', 'blood pressure', "patient's", 'the'])
const gameSelectedWords = ref([])
const gameSuccess = ref(null) // null = unchecked, true = correct, false = wrong
const isGameCompleted = computed(() => phaseProgress.value.inicio === 100)

// -----------------------------------------------------------------
// Phase 2: Highlighted Grammar, Audio Vocabulary, Clinical Dialogue
// -----------------------------------------------------------------
const activeGrammarFilters = ref(['verb', 'noun', 'adjective', 'adverb'])
const grammarSentence = [
  { text: 'The ', type: '' },
  { text: 'diligent ', type: 'adjective' },
  { text: 'nurse ', type: 'noun' },
  { text: 'administers ', type: 'verb' },
  { text: 'the ', type: '' },
  { text: 'vital ', type: 'adjective' },
  { text: 'medication ', type: 'noun' },
  { text: 'carefully', type: 'adverb' },
  { text: '.', type: '' },
]

const grammarLegend = [
  { id: 'verb', label: 'Verbo (Verb)', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dotBg: 'bg-green-500' },
  { id: 'noun', label: 'Sustantivo (Noun)', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dotBg: 'bg-blue-500' },
  { id: 'adjective', label: 'Adjetivo (Adjective)', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dotBg: 'bg-amber-500' },
  { id: 'adverb', label: 'Adverbio (Adverb)', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dotBg: 'bg-pink-500' },
]

const vocabList = ref([
  { id: 'v1', word: 'Stethoscope', ipa: '/ˈsteθ.ə.skoʊp/', translation: 'Estetoscopio', played: false, speed: 1.0 },
  { id: 'v2', word: 'Intravenous (IV)', ipa: '/ˌɪn.trəˈviː.nəs/', translation: 'Intravenoso', played: false, speed: 1.0 },
  { id: 'v3', word: 'Suture', ipa: '/ˈsuː.tʃɚ/', translation: 'Sutura (puntos)', played: false, speed: 1.0 },
])

const playingVocabId = ref(null)
const vocabAudioProgress = ref(0)
let vocabAudioInterval = null

const dialogue = [
  { role: 'nurse', english: 'Good morning, John. I need to take your vital signs before the doctor examines you.', spanish: 'Buenos días, John. Necesito tomarle sus signos vitales antes de que el doctor lo examine.' },
  { role: 'patient', english: 'Good morning, nurse. Sure, go ahead. My arm hurts a little bit.', spanish: 'Buenos días, enfermera. Claro, adelante. Me duele un poco el brazo.' },
  { role: 'nurse', english: 'Please rest your left arm. I will check your blood pressure and heart rate.', spanish: 'Por favor, apoye su brazo izquierdo. Revisaré su presión arterial y frecuencia cardíaca.' },
  { role: 'patient', english: 'Okay. Is my blood pressure high?', spanish: 'De acuerdo. ¿Está alta mi presión arterial?' },
  { role: 'nurse', english: 'It is stable: 120 over 80. Do you require any pain relievers?', spanish: 'Está estable: 120 sobre 80. ¿Requiere algún analgésico?' },
]

const isStudyCompleted = computed(() => phaseProgress.value.estudio === 100)

// -----------------------------------------------------------------
// Phase 3: Fill Blanks, Dictation, Voice Recorder
// -----------------------------------------------------------------
const fillInput = ref('')
const dictationInput = ref('')
const dictationPlaying = ref(false)

const isRecording = ref(false)
const voiceRecorded = ref(false)
const recordingSeconds = ref(0)
const voicePreviewPlaying = ref(false)
let recorderInterval = null

const isPracticeCompleted = computed(() => phaseProgress.value.practica === 100)

// -----------------------------------------------------------------
// Phase 4: Exam & Badges
// -----------------------------------------------------------------
const examAnswers = ref({})
const examPassed = ref(false)
const showBadgeAward = ref(false)
const examScoreMessage = ref('')

const examQuestions = [
  {
    id: 'q1',
    question: '¿Qué significa "respiration rate" en el contexto de la salud?',
    options: ['Frecuencia respiratoria', 'Ritmo cardíaco', 'Presión arterial', 'Frecuencia de dosificación'],
    correct: 'Frecuencia respiratoria',
  },
  {
    id: 'q2',
    question: 'Completa la frase clínica: "The nurse must check the ______ before administering medication."',
    options: ['stethoscope', 'suture', 'patient\'s file', 'ranking'],
    correct: 'patient\'s file',
  },
  {
    id: 'q3',
    question: '¿Cuál de las siguientes palabras resaltadas corresponde a un sustantivo (Noun)? "The diligent *nurse* administers medication."',
    options: ['diligent', 'nurse', 'administers', 'medication'],
    correct: 'nurse',
  },
]

// -----------------------------------------------------------------
// Sequential Access Restriction checks
// -----------------------------------------------------------------
function isPhaseLocked(phaseId) {
  if (phaseId === 'inicio') return false
  if (phaseId === 'estudio') return phaseProgress.value.inicio < 100
  if (phaseId === 'practica') return phaseProgress.value.estudio < 100
  if (phaseId === 'evaluacion') return phaseProgress.value.practica < 100
  return true
}

function goToPhase(phaseId) {
  if (!isPhaseLocked(phaseId)) {
    currentPhase.value = phaseId
  }
}

// -----------------------------------------------------------------
// Pre-Check Simulation Helpers
// -----------------------------------------------------------------
function toggleSimulatedMediaFailure() {
  simulatedMediaFailure.value = !simulatedMediaFailure.value
  if (simulatedMediaFailure.value) {
    mediaWarningMessage.value = 'Fallo al inicializar codec de audio/video. Se simula una caída de archivos multimedia, pero puedes continuar con la parte de texto.'
  } else {
    mediaWarningMessage.value = null
  }
}

async function verifyMediaResource(resourceName) {
  // Pre-check simulation: wait 300ms
  return new Promise((resolve) => {
    setTimeout(() => {
      if (simulatedMediaFailure.value) {
        mediaWarningMessage.value = `Advertencia: No se pudo verificar el archivo "${resourceName}". Comprueba tu conexión a Internet. El módulo continuará en modo texto.`
        resolve(false)
      } else {
        resolve(true)
      }
    }, 300)
  })
}

// -----------------------------------------------------------------
// Phase 1 Actions
// -----------------------------------------------------------------
async function playVideo() {
  const ready = await verifyMediaResource('Basics_Intro_Video.mp4')
  if (!ready) {
    // Media fails, but we allow user to skip or validate directly as not to block
    videoCompleted.value = true
    return
  }
  
  videoPlaying.value = true
  videoProgress.value = 0
  videoTimer = setInterval(() => {
    videoProgress.value += 10
    if (videoProgress.value >= 100) {
      clearInterval(videoTimer)
      videoPlaying.value = false
      videoCompleted.value = true
      checkPhase1Completion()
    }
  }, 1000)
}

function skipVideo() {
  if (videoTimer) clearInterval(videoTimer)
  videoPlaying.value = false
  videoCompleted.value = true
  checkPhase1Completion()
}

function resetVideo() {
  videoCompleted.value = false
  videoPlaying.value = false
  videoProgress.value = 0
}

function addWordToGame(word, index) {
  if (!gameSelectedWords.value.includes(word)) {
    gameSelectedWords.value.push(word)
  }
}

function removeWordFromGame(index) {
  gameSelectedWords.value.splice(index, 1)
}

function resetWarmupGame() {
  gameSelectedWords.value = []
  gameSuccess.value = null
}

function validateWarmupGame() {
  const correctOrder = ['The nurse', 'checks', 'the', "patient's", 'blood pressure']
  
  const matches = gameSelectedWords.value.length === correctOrder.length &&
                  gameSelectedWords.value.every((word, i) => word === correctOrder[i])

  if (matches) {
    gameSuccess.value = true
    phaseProgress.value.inicio = 100
  } else {
    gameSuccess.value = false
  }
}

function checkPhase1Completion() {
  // Video completed is positive, but the Game completes Phase 1
  if (videoCompleted.value && gameSuccess.value === true) {
    phaseProgress.value.inicio = 100
  }
}

// Watch game success & video complete
watch([videoCompleted, gameSuccess], () => {
  checkPhase1Completion()
})

// -----------------------------------------------------------------
// Phase 2 Actions
// -----------------------------------------------------------------
function getGrammarHighlightClass(type) {
  if (!type || !activeGrammarFilters.value.includes(type)) return ''
  if (type === 'verb') return 'bg-green-100 text-green-700 border-b border-green-400 font-bold'
  if (type === 'noun') return 'bg-blue-100 text-blue-700 border-b border-blue-400 font-bold'
  if (type === 'adjective') return 'bg-amber-100 text-amber-700 border-b border-amber-400 font-bold'
  if (type === 'adverb') return 'bg-pink-100 text-pink-700 border-b border-pink-400 font-bold'
  return ''
}

function toggleGrammarLegend(id) {
  const index = activeGrammarFilters.value.indexOf(id)
  if (index >= 0) {
    activeGrammarFilters.value.splice(index, 1)
  } else {
    activeGrammarFilters.value.push(id)
  }
}

async function playVocabAudio(vocabItem) {
  if (playingVocabId.value === vocabItem.id) {
    // Pause
    playingVocabId.value = null
    if (vocabAudioInterval) clearInterval(vocabAudioInterval)
    return
  }

  // Pre-check resource
  const ready = await verifyMediaResource(`${vocabItem.word}_pronunciation.mp3`)
  
  playingVocabId.value = vocabItem.id
  vocabAudioProgress.value = 0
  
  if (vocabAudioInterval) clearInterval(vocabAudioInterval)
  
  // Calculate speed interval multiplier
  const intervalMs = Math.round(100 / (vocabItem.speed || 1.0))

  vocabAudioInterval = setInterval(() => {
    vocabAudioProgress.value += 10
    if (vocabAudioProgress.value >= 100) {
      clearInterval(vocabAudioInterval)
      playingVocabId.value = null
      vocabItem.played = true
      checkPhase2Completion()
    }
  }, intervalMs)
}

function checkPhase2Completion() {
  const allPlayed = vocabList.value.every(v => v.played)
  if (allPlayed) {
    phaseProgress.value.estudio = 100
  }
}

function validateStudyPhase() {
  phaseProgress.value.estudio = 100
  goToPhase('practica')
}

// -----------------------------------------------------------------
// Phase 3 Actions
// -----------------------------------------------------------------
async function playDictationAudio() {
  const ready = await verifyMediaResource('clinical_dictation_1.mp3')
  dictationPlaying.value = true
  setTimeout(() => {
    dictationPlaying.value = false
  }, 3000)
}

async function toggleRecording() {
  if (isRecording.value) {
    // Stop recording
    isRecording.value = false
    if (recorderInterval) clearInterval(recorderInterval)
    voiceRecorded.value = true
    checkPhase3Completion()
  } else {
    // Start recording
    const ready = await verifyMediaResource('microphone_hardware_check')
    
    isRecording.value = true
    voiceRecorded.value = false
    recordingSeconds.value = 0
    
    if (recorderInterval) clearInterval(recorderInterval)
    
    recorderInterval = setInterval(() => {
      recordingSeconds.value++
      if (recordingSeconds.value >= 60) {
        clearInterval(recorderInterval)
        isRecording.value = false
        voiceRecorded.value = true
        checkPhase3Completion()
      }
    }, 1000)
  }
}

function formatRecordTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function playVoicePreview() {
  voicePreviewPlaying.value = true
  setTimeout(() => {
    voicePreviewPlaying.value = false
  }, 2000)
}

function checkPhase3Completion() {
  const filled = fillInput.value.trim().toLowerCase() === 'prescription'
  const dictated = dictationInput.value.trim().toLowerCase().includes('heart rate')
  
  if (filled && dictated && voiceRecorded.value) {
    phaseProgress.value.practica = 100
  }
}

watch([fillInput, dictationInput, voiceRecorded], () => {
  checkPhase3Completion()
})

function validatePracticePhase() {
  phaseProgress.value.practica = 100
  goToPhase('evaluacion')
}

// -----------------------------------------------------------------
// Phase 4 Actions
// -----------------------------------------------------------------
function submitExam() {
  let correctCount = 0
  
  examQuestions.forEach(q => {
    if (examAnswers.value[q.id] === q.correct) {
      correctCount++
    }
  })
  
  const pct = (correctCount / examQuestions.length) * 100
  
  if (pct >= 80) {
    examPassed.value = true
    showBadgeAward.value = true
    phaseProgress.value.evaluacion = 100
    examScoreMessage.value = ''
    saveProgress()
  } else {
    examScoreMessage.value = `Calificación: ${Math.round(pct)}%. Necesitas al menos 80% (2 preguntas correctas) para aprobar. Intenta de nuevo.`
  }
}

function resetExamForReview() {
  examPassed.value = false
  showBadgeAward.value = false
  examAnswers.value = {}
  examScoreMessage.value = ''
  phaseProgress.value.evaluacion = 0
  saveProgress()
}

// -----------------------------------------------------------------
// LocalStorage Auto-Saving Progress
// -----------------------------------------------------------------
const storageKey = computed(() => {
  const apprenticeId = auth.user?.id || 'guest'
  return `nursing_academy_progress_${apprenticeId}_course_${courseId}`
})

function saveProgress() {
  const state = {
    currentPhase: currentPhase.value,
    phaseProgress: phaseProgress.value,
    videoCompleted: videoCompleted.value,
    gameSuccess: gameSuccess.value,
    gameSelectedWords: gameSelectedWords.value,
    vocabPlayed: vocabList.value.map(v => ({ id: v.id, played: v.played })),
    fillInput: fillInput.value,
    dictationInput: dictationInput.value,
    voiceRecorded: voiceRecorded.value,
    examPassed: examPassed.value,
    showBadgeAward: showBadgeAward.value,
    examAnswers: examAnswers.value,
    completedActivityIds: completedActivityIds.value,
  }
  localStorage.setItem(storageKey.value, JSON.stringify(state))
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) return
    const state = JSON.parse(raw)
    
    if (state.currentPhase) currentPhase.value = state.currentPhase
    if (state.phaseProgress) phaseProgress.value = state.phaseProgress
    if (state.videoCompleted) videoCompleted.value = state.videoCompleted
    if (state.gameSuccess) gameSuccess.value = state.gameSuccess
    if (state.gameSelectedWords) gameSelectedWords.value = state.gameSelectedWords
    
    if (state.vocabPlayed) {
      state.vocabPlayed.forEach(sp => {
        const item = vocabList.value.find(v => v.id === sp.id)
        if (item) item.played = sp.played
      })
    }
    
    if (state.fillInput) fillInput.value = state.fillInput
    if (state.dictationInput) dictationInput.value = state.dictationInput
    if (state.voiceRecorded) voiceRecorded.value = state.voiceRecorded
    if (state.examPassed) examPassed.value = state.examPassed
    if (state.showBadgeAward) showBadgeAward.value = state.showBadgeAward
    if (state.examAnswers) examAnswers.value = state.examAnswers
    if (state.completedActivityIds) completedActivityIds.value = state.completedActivityIds
    
  } catch (err) {
    console.error('Error loading progress from localStorage:', err)
  }
}

// Watch relevant state changes and auto-save
watch([
  currentPhase, 
  phaseProgress, 
  videoCompleted, 
  gameSuccess, 
  gameSelectedWords, 
  fillInput, 
  dictationInput, 
  voiceRecorded, 
  examPassed,
  showBadgeAward,
  examAnswers,
  completedActivityIds
], () => {
  saveProgress()
}, { deep: true })

onMounted(async () => {
  // Update Course title based on ID if we want
  const titles = {
    '1': 'Fundamentos de Enfermería',
    '2': 'Farmacología Clínica',
    '3': 'Cuidados Críticos UCI',
    '4': 'Salud Mental y Psiquiatría',
    '5': 'Atención Materno-Infantil',
    '6': 'Urgencias y Emergencias',
  }
  if (titles[courseId]) {
    courseTitle.value = titles[courseId]
  }

  await fetchDbActivities()
  loadProgress()
  updatePhaseProgress()
})
</script>

<style scoped>
.linear {
  transition-timing-function: linear;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
