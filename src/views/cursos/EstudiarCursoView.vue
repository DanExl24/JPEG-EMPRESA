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
            Módulo 1 — Getting to Know Other People
            <span class="text-xs font-bold bg-[#006688]/10 text-[#006688] px-2 py-0.5 rounded-full ml-2">Fase Análisis · RAP 1</span>
          </h3>
          <p class="text-xs text-gray-500 mt-1">Completa el video introductorio y el juego de calentamiento antes de avanzar a la absorción de conocimiento.</p>
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
            <h4 class="font-black text-gray-800 text-sm">¿Qué aprenderás? — Objetivos del RAP 1</h4>
            <ul class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Saludar y despedirte correctamente en inglés</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Presentarte e introducir a otras personas</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Dar información personal básica (nombre, edad, nacionalidad)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Preguntar información básica a otra persona</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Deletrear nombres y apellidos (spelling)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Utilizar números (teléfono, edad)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Construir oraciones básicas (Subject + Verb + Complement)</li>
              <li class="flex items-start gap-1.5"><span class="text-teal-600 font-bold mt-0.5">🏥</span> Aplicar estas expresiones con pacientes extranjeros</li>
            </ul>
            <p class="text-[10px] text-[#006688] italic mt-3 border-t border-[#006688]/10 pt-2">
              "At the end of this module, you will be able to introduce yourself, greet other people and ask for basic personal information in English."
            </p>
          </div>
        </div>

        <!-- Warm-up Game Section -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
            <h4 class="font-bold text-gray-800 text-sm">Warm-Up: Greetings — Empareja el momento del día con su saludo</h4>
          </div>
          <p class="text-xs text-gray-600">
            Instrucción: Empareja el momento del día de la columna izquierda con el saludo correspondiente en inglés.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Left column: Moment representing items -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Momento del día</span>
              <button 
                v-for="item in leftItems" 
                :key="item"
                @click="selectLeftItem(item)"
                type="button"
                :disabled="matchedPairs.includes(item)"
                :class="`w-full p-3.5 border rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  matchedPairs.includes(item)
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                    : selectedLeft === item
                      ? 'bg-[#006688] text-white border-[#006688] shadow-md scale-[1.02]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688] hover:text-[#006688]'
                }`"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">
                    {{ item === 'Sun' ? 'light_mode' : item === 'Afternoon' ? 'wb_twilight' : 'dark_mode' }}
                  </span>
                  <span>{{ item === 'Sun' ? 'Sun (Mañana)' : item === 'Afternoon' ? 'Afternoon (Tarde)' : 'Moon (Noche)' }}</span>
                </div>
                <span v-if="matchedPairs.includes(item)" class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
              </button>
            </div>

            <!-- Right column: Greetings -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Saludos en Inglés</span>
              <button 
                v-for="item in rightItems" 
                :key="item"
                @click="selectRightItem(item)"
                type="button"
                :disabled="matchedPairs.includes(item)"
                :class="`w-full p-3.5 border rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                  matchedPairs.includes(item)
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-not-allowed'
                    : selectedRight === item
                      ? 'bg-[#006688] text-white border-[#006688] shadow-md scale-[1.02]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688] hover:text-[#006688]'
                }`"
              >
                <span>{{ item }}</span>
                <span v-if="matchedPairs.includes(item)" class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
              </button>
            </div>

            <div class="sm:col-span-2 flex items-center gap-3 pt-2 border-t border-gray-200">
              <button 
                @click="resetWarmupGame"
                type="button"
                class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Limpiar Juego
              </button>
              
              <!-- Feedback messages -->
              <span v-if="gameSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Excelente! Has emparejado todos los saludos correctamente. Fase 1 completada.
              </span>
              <span v-if="gameSuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Emparejamiento incorrecto. Inténtalo de nuevo.
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
            Momento 2 — Absorción de Conocimiento
          </h3>
          <p class="text-xs text-gray-500 mt-1">Momento 2: Explora la gramática básica, practica el vocabulario de saludos e información personal, y revisa el Storybook y el contexto de enfermería.</p>
        </div>

        <!-- Color Highlighted Grammar -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">palette</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Basic Sentence Structure (Subject + Verb + Complement)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Haz clic en los botones de leyenda para activar o desactivar el resaltado de colores en las oraciones de ejemplo del RAP 1.
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
              <h4 class="font-bold text-gray-800 text-sm">2. Vocabulary Laboratory — Greetings, Farewells & Personal Information</h4>
            </div>
            <span class="text-xs bg-[#006688]/5 text-[#006688] font-bold px-3 py-1 rounded-full">
              Escuchados: {{ vocabList.filter(v => v.played).length }} / {{ vocabList.length }}
            </span>
          </div>
          <p class="text-xs text-gray-600">
            Reproduce el audio de cada expresión del módulo. Escucha todos los ítems para habilitar la siguiente fase.
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
            <h4 class="font-bold text-gray-800 text-sm">3. Storybook — Greetings and Presentations: Nurse & Nurse</h4>
          </div>
          <p class="text-xs text-gray-600">Revisa la conversación de presentación entre dos enfermeras — un escenario real de inicio de turno.</p>

          <div class="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4 max-h-[300px] overflow-y-auto">
            <div 
              v-for="(bubble, bIdx) in dialogue" 
              :key="bIdx" 
              :class="`flex gap-3 max-w-[80%] ${bubble.role === 'nurse' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`"
            >
              <div :class="`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${bubble.role === 'nurse' ? 'bg-[#006688]' : 'bg-orange-500'}`">
                {{ bubble.role === 'nurse' ? '👩‍⚕️' : '🧑' }}
              </div>
              <div :class="`p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed ${bubble.role === 'nurse' ? 'bg-white text-gray-800 rounded-tl-none border-gray-100' : 'bg-orange-50/50 text-gray-800 rounded-tr-none border-orange-100'}`">
                <div class="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-1">{{ bubble.role === 'nurse' ? 'Nurse Sarah' : 'Nurse David' }}</div>
                <p class="font-semibold">{{ bubble.english }}</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">{{ bubble.spanish }}</p>
              </div>
            </div>
          </div>
        </div>


        <!-- English for Nursing — Clinical Context Section -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-teal-600">local_hospital</span>
            <h4 class="font-bold text-gray-800 text-sm">4. English for Nursing — Situación Clínica Real</h4>
          </div>
          <p class="text-xs text-gray-600">Observa cómo se aplica el vocabulario del módulo cuando un paciente extranjero llega a una institución de salud.</p>

          <div class="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 space-y-4 max-h-[320px] overflow-y-auto">
            <!-- Clinical scenario badge -->
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-100 px-3 py-1 rounded-full">🏥 Caso Clínico — Admisión de Paciente Extranjero</span>
            </div>
            <!-- Nurse Laura -->
            <div class="flex gap-3 max-w-[80%] mr-auto">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm bg-[#006688]">👩‍⚕️</div>
              <div class="p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed bg-white text-gray-800 rounded-tl-none border-gray-100">
                <div class="font-bold text-[10px] text-[#006688] uppercase tracking-widest mb-1">Nurse Laura</div>
                <p class="font-semibold">Good morning. My name is Laura. I'm a nurse.</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">Buenos días. Me llamo Laura. Soy enfermera.</p>
                <p class="font-semibold mt-2">What is your name?</p>
                <p class="text-gray-500 mt-0.5 italic text-[11px]">¿Cuál es su nombre?</p>
              </div>
            </div>
            <!-- Patient Michael -->
            <div class="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm bg-orange-500">🧑</div>
              <div class="p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed bg-orange-50/50 text-gray-800 rounded-tr-none border-orange-100">
                <div class="font-bold text-[10px] text-orange-600 uppercase tracking-widest mb-1">Patient Michael</div>
                <p class="font-semibold">My name is Michael Brown.</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">Mi nombre es Michael Brown.</p>
              </div>
            </div>
            <!-- Nurse Laura -->
            <div class="flex gap-3 max-w-[80%] mr-auto">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm bg-[#006688]">👩‍⚕️</div>
              <div class="p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed bg-white text-gray-800 rounded-tl-none border-gray-100">
                <div class="font-bold text-[10px] text-[#006688] uppercase tracking-widest mb-1">Nurse Laura</div>
                <p class="font-semibold">How do you spell your last name?</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">¿Cómo se deletrea su apellido?</p>
              </div>
            </div>
            <!-- Patient Michael -->
            <div class="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm bg-orange-500">🧑</div>
              <div class="p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed bg-orange-50/50 text-gray-800 rounded-tr-none border-orange-100">
                <div class="font-bold text-[10px] text-orange-600 uppercase tracking-widest mb-1">Patient Michael</div>
                <p class="font-semibold">B-R-O-W-N.</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">B-R-O-W-N.</p>
              </div>
            </div>
            <!-- Nurse Laura -->
            <div class="flex gap-3 max-w-[80%] mr-auto">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm bg-[#006688]">👩‍⚕️</div>
              <div class="p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed bg-white text-gray-800 rounded-tl-none border-gray-100">
                <div class="font-bold text-[10px] text-[#006688] uppercase tracking-widest mb-1">Nurse Laura</div>
                <p class="font-semibold">What is your phone number?</p>
                <p class="text-gray-500 mt-1 italic text-[11px]">¿Cuál es su número de teléfono?</p>
              </div>
            </div>
          </div>
          <div class="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-700 font-medium flex items-start gap-2">
            <span class="material-symbols-outlined text-sm text-teal-500 mt-0.5">info</span>
            <span>Este es el tipo de comunicación que podrás tener con pacientes extranjeros al finalizar este módulo.</span>
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
            Momento 3 — Práctica y Aplicación (RAP 1)
          </h3>
          <p class="text-xs text-gray-500 mt-1">Completa el perfil personal, realiza los deletreos y graba tu presentación personal como evidencia de aprendizaje.</p>
        </div>

        <!-- Guided Practice 1 — Complete the Profile -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">edit_note</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Guided Practice 1 — Complete the Profile</h4>
          </div>
          <p class="text-xs text-gray-600">Completa el formulario utilizando oraciones completas. Utiliza la estructura: <strong>Subject + Verb + Complement</strong> (ej: <i>My name is John</i>, <i>I am 25 years old</i>, <i>I am Colombian</i>).</p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">First Name (e.g., My name is John)</label>
                <input type="text" v-model="profileForm.firstName" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="My name is [name] / I am [name]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Last Name (e.g., My last name is Smith)</label>
                <input type="text" v-model="profileForm.lastName" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="My last name is [last name]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Age (e.g., I am 25 years old)</label>
                <input type="text" v-model="profileForm.age" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="I am [age] years old" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Nationality (e.g., I am Colombian)</label>
                <input type="text" v-model="profileForm.nationality" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="I am [nationality]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Phone Number (e.g., My phone number is 312 456 7890)</label>
                <input type="text" v-model="profileForm.phone" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="My phone number is [number]" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Email (e.g., john.smith@gmail.com)</label>
                <input type="email" v-model="profileForm.email" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="your.email@example.com" />
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button @click="validateProfileForm" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">Verificar Formulario</button>
              <span v-if="profileFormSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                Formulario correcto y estructurado.
              </span>
              <span v-if="profileFormSuccess === false" class="text-red-650 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Revisa los ejemplos. Asegúrate de incluir el sujeto, verbo y complemento.
              </span>
            </div>
          </div>
        </div>

        <!-- Guided Practice 2 — Listening and Spelling -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">text_to_speech</span>
            <h4 class="font-bold text-gray-800 text-sm">2. Guided Practice 2 – Listening and Spelling</h4>
          </div>
          <p class="text-xs text-gray-600">Escucha la información deletreada en inglés y escríbela correctamente en el cuadro correspondiente.</p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div v-for="(sp, idx) in spellingTasks" :key="idx" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <div class="flex items-center gap-3">
                <button 
                  @click="playSpellingAudio(sp.audioText)"
                  type="button"
                  class="w-8 h-8 rounded-full bg-[#006688] text-white flex items-center justify-center hover:scale-105 transition-transform"
                  title="Escuchar deletreo"
                >
                  <span class="material-symbols-outlined text-sm">volume_up</span>
                </button>
                <div class="space-y-0.5">
                  <span class="text-xs font-bold text-gray-700">Audio {{ idx + 1 }}</span>
                  <p class="text-[9px] text-gray-400 font-semibold">{{ sp.hint }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  v-model="spellingAnswers[idx]" 
                  placeholder="Escribe lo que escuchas..."
                  class="px-3 py-1.5 border border-gray-200 focus:outline-none focus:border-[#006688] rounded-xl text-xs font-semibold"
                />
                <span v-if="spellingResults[idx] === true" class="text-green-600 material-symbols-outlined text-sm">check_circle</span>
                <span v-else-if="spellingResults[idx] === false" class="text-red-600 material-symbols-outlined text-sm">cancel</span>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button @click="validateSpellingTasks" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">Verificar Deletreos</button>
              <span v-if="spellingAllCorrect === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Todos los deletreos son correctos!
              </span>
            </div>
          </div>
        </div>

        <!-- Voice Recorder Component -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">mic</span>
            <h4 class="font-bold text-gray-800 text-sm">3. Learning Evidence Challenge</h4>
          </div>
          <p class="text-xs text-gray-600">
            Graba un audio de máximo 1 minuto presentándote a un paciente extranjero. Incluye:
            <br />
            <span class="block mt-2 bg-[#006688]/5 text-[#006688] p-3 rounded-xl border border-[#006688]/10 font-mono text-[11px] leading-relaxed">
              🎤 Ejemplo: "Good morning. My name is John. My last name is Smith. S-M-I-T-H. My phone number is 312 456 7890. Nice to meet you."
            </span>
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <!-- Left: Controls -->
              <div class="flex items-center gap-4">
                <button 
                  @click="toggleRecording"
                  type="button"
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
                  type="button"
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
            Momento 4 — Cierre: Test Your Knowledge
          </h3>
          <p class="text-xs text-gray-500 mt-1">Completa la evaluación del RAP 1 para aprobar y recibir tu insignia digital de Getting to Know Other People.</p>
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
            <h4 class="text-lg font-black text-yellow-800">🎉 ¡Felicidades! Módulo Completado</h4>
            <p class="text-sm font-bold text-yellow-700">🏆 RAP 1 — Getting to Know Other People</p>
            <p class="text-xs text-yellow-600 max-w-md mx-auto leading-relaxed">
              Has demostrado que puedes saludar, presentarte, dar información personal y aplicar la estructura Subject + Verb + Complement en inglés.
              Esta insignia aparecerá con orgullo en tu perfil.
            </p>
          </div>
          <button @click="showBadgeAward = false" class="text-xs font-bold text-yellow-800 hover:underline">Entendido, cerrar</button>
        </div>

        <!-- Exam Questions Form -->
        <div v-if="!examPassed" class="space-y-6">
          <p class="text-xs text-gray-600">
            Deberás responder correctamente al menos <strong>5 de las 6 preguntas</strong> (75%) para aprobar el RAP 1.
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
              :disabled="Object.keys(examAnswers).length < 6"
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
            <h4 class="text-xl font-black text-green-800">🎉 ¡Has completado el Módulo 1!</h4>
            <p class="text-xs text-green-700">RAP 1 — Getting to Know Other People completado con éxito. Ahora puedes saludar, presentarte y comunicarte con pacientes extranjeros en inglés.</p>
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
                <!-- If layout generated successfully -->
                <div v-if="crosswordLayout && crosswordLayout.success" class="space-y-6">
                  <!-- Visual Grid -->
                  <div 
                    class="grid gap-1 p-4 bg-gray-150 rounded-2xl border border-gray-200 overflow-auto mx-auto select-none"
                    :style="{
                      gridTemplateColumns: `repeat(${crosswordLayout.width}, 2.2rem)`,
                      gridTemplateRows: `repeat(${crosswordLayout.height}, 2.2rem)`,
                      width: 'fit-content',
                    }"
                  >
                    <template v-for="y in crosswordLayout.height" :key="'row-' + y">
                      <template v-for="x in crosswordLayout.width" :key="'cell-' + (x-1) + '-' + (y-1)">
                        <div 
                          v-if="crosswordLayout.grid[(x-1) + ',' + (y-1)]" 
                          class="relative w-9 h-9 border border-gray-300 rounded-lg bg-white flex items-center justify-center shadow-xs focus-within:border-[#006688] focus-within:ring-2 focus-within:ring-[#006688]/20"
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
                            v-model="activeDbGridInputs[(x-1) + ',' + (y-1)]"
                            @input="onGridInput($event, x-1, y-1)"
                            @keydown="onGridKeyDown($event, x-1, y-1)"
                            @focus="onCellFocus(x-1, y-1)"
                            class="w-full h-full text-center border-none bg-transparent focus:outline-none font-black uppercase text-sm text-gray-800"
                            :id="`active-cell-input-${x-1}-${y-1}`"
                          />
                        </div>
                        <div 
                          v-else 
                          class="w-9 h-9 rounded-lg bg-gray-200 border border-gray-250 select-none"
                        ></div>
                      </template>
                    </template>
                  </div>

                  <!-- Clues columns -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-4 border-gray-100">
                    <!-- Horizontales -->
                    <div class="space-y-2">
                      <h5 class="text-xs font-bold text-[#006688] uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-gray-100">
                        <span class="material-symbols-outlined text-sm font-bold">swap_horiz</span>
                        Pistas Horizontales
                      </h5>
                      <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                        <div 
                          v-for="w in crosswordLayout.words.filter(word => word.orientation === 'horizontal')" 
                          :key="w.id"
                          @click="focusWordStart(w)"
                          class="text-xs text-gray-700 hover:text-[#006688] cursor-pointer hover:bg-[#006688]/5 p-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                          <span class="font-bold text-[#006688]">{{ crosswordWordNumbers[w.id] }}.</span>
                          <span>{{ w.clue }}</span>
                          <span class="text-gray-400 font-medium ml-auto">({{ w.word.length }} letras)</span>
                        </div>
                      </div>
                    </div>

                    <!-- Verticales -->
                    <div class="space-y-2">
                      <h5 class="text-xs font-bold text-orange-650 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 border-gray-100">
                        <span class="material-symbols-outlined text-sm font-bold">swap_vert</span>
                        Pistas Verticales
                      </h5>
                      <div class="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                        <div 
                          v-for="w in crosswordLayout.words.filter(word => word.orientation === 'vertical')" 
                          :key="w.id"
                          @click="focusWordStart(w)"
                          class="text-xs text-gray-700 hover:text-orange-600 cursor-pointer hover:bg-orange-50 p-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                          <span class="font-bold text-orange-600">{{ crosswordWordNumbers[w.id] }}.</span>
                          <span>{{ w.clue }}</span>
                          <span class="text-gray-400 font-medium ml-auto">({{ w.word.length }} letras)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- If layout failed to generate -->
                <div v-else class="text-center py-6 text-xs text-red-500 font-bold bg-red-50 rounded-2xl border border-red-200">
                  <span class="material-symbols-outlined text-2xl block mb-1">warning</span>
                  Error al cargar el crucigrama. Por favor contacta al instructor.
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
import { getApiBaseUrl } from '../../lib/api'
import { generateCrossword, reconstructLayout } from '../../utils/crosswordGenerator'

const route = useRoute()
const auth = useAuthStore()

// State
const courseId = route.params.courseId || '1'
const courseTitle = ref('Getting to Know Other People')

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
const apiBaseUrl = getApiBaseUrl()
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
const activeDbGridInputs = ref({})
const activeDbDirection = ref('horizontal')
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

const crosswordLayout = computed(() => {
  const words = crosswordWords.value
  if (!words || words.length === 0) return null

  const hasCoordinates = words.every(w => typeof w.x === 'number' && typeof w.y === 'number')
  if (hasCoordinates) {
    return reconstructLayout(words)
  } else {
    const res = generateCrossword(words)
    return res.success ? res : null
  }
})

watch(crosswordLayout, (newLayout) => {
  const newInputs = {}
  if (newLayout && newLayout.success && newLayout.grid) {
    Object.keys(newLayout.grid).forEach(key => {
      newInputs[key] = activeDbGridInputs.value[key] || ''
    })
  }
  activeDbGridInputs.value = newInputs
}, { deep: true, immediate: true })

const crosswordWordNumbers = computed(() => {
  const layout = crosswordLayout.value
  if (!layout || !layout.success || !layout.words) return {}

  const sorted = [...layout.words].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })

  let currentNum = 1
  const numbers = {}
  const startCellNums = {}

  sorted.forEach(w => {
    const key = `${w.x},${w.y}`
    if (startCellNums[key]) {
      numbers[w.id] = startCellNums[key]
    } else {
      numbers[w.id] = currentNum
      startCellNums[key] = currentNum
      currentNum++
    }
  })

  return numbers
})

function getWordNumberAt(x, y) {
  if (!crosswordLayout.value || !crosswordLayout.value.words) return null
  const w = crosswordLayout.value.words.find(word => word.x === x && word.y === y)
  return w ? crosswordWordNumbers.value[w.id] : null
}

function onCellFocus(x, y) {
  if (!crosswordLayout.value || !crosswordLayout.value.grid) return
  const cell = crosswordLayout.value.grid[`${x},${y}`]
  if (cell && cell.wordOrientations.length === 1) {
    activeDbDirection.value = cell.wordOrientations[0]
  }
}

function onGridInput(event, x, y) {
  const val = event.target.value
  if (!val) return

  activeDbGridInputs.value[`${x},${y}`] = val.toUpperCase()

  const nextX = x + (activeDbDirection.value === 'horizontal' ? 1 : 0)
  const nextY = y + (activeDbDirection.value === 'vertical' ? 1 : 0)
  
  const nextInput = document.getElementById(`active-cell-input-${nextX}-${nextY}`)
  if (nextInput) {
    nextInput.focus()
    setTimeout(() => { nextInput.select() }, 10)
  }
}

function onGridKeyDown(event, x, y) {
  if (event.key === 'Backspace') {
    const val = activeDbGridInputs.value[`${x},${y}`]
    if (!val || val === '') {
      const prevX = x - (activeDbDirection.value === 'horizontal' ? 1 : 0)
      const prevY = y - (activeDbDirection.value === 'vertical' ? 1 : 0)
      const prevInput = document.getElementById(`active-cell-input-${prevX}-${prevY}`)
      if (prevInput) {
        prevInput.focus()
        activeDbGridInputs.value[`${prevX},${prevY}`] = ''
        event.preventDefault()
      }
    }
  } else if (event.key === 'ArrowRight') {
    const nextInput = document.getElementById(`active-cell-input-${x+1}-${y}`)
    if (nextInput) { nextInput.focus(); event.preventDefault() }
  } else if (event.key === 'ArrowLeft') {
    const prevInput = document.getElementById(`active-cell-input-${x-1}-${y}`)
    if (prevInput) { prevInput.focus(); event.preventDefault() }
  } else if (event.key === 'ArrowUp') {
    const upInput = document.getElementById(`active-cell-input-${x}-${y-1}`)
    if (upInput) { upInput.focus(); event.preventDefault() }
  } else if (event.key === 'ArrowDown') {
    const downInput = document.getElementById(`active-cell-input-${x}-${y+1}`)
    if (downInput) { downInput.focus(); event.preventDefault() }
  }
}

function focusWordStart(word) {
  activeDbDirection.value = word.orientation
  const input = document.getElementById(`active-cell-input-${word.x}-${word.y}`)
  if (input) {
    input.focus()
    setTimeout(() => { input.select() }, 10)
  }
}
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
  activeDbGridInputs.value = {}
  if (crosswordLayout.value && crosswordLayout.value.success) {
    Object.keys(crosswordLayout.value.grid).forEach(key => {
      activeDbGridInputs.value[key] = ''
    })
  }
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
    const layout = crosswordLayout.value
    if (!layout || !layout.success) {
      success = false
    } else {
      let allCorrect = true
      for (const [key, cell] of Object.entries(layout.grid)) {
        const entered = (activeDbGridInputs.value[key] || '').trim().toUpperCase()
        const correct = cell.char.toUpperCase()
        if (entered !== correct) {
          allCorrect = false
          break
        }
      }
      success = allCorrect
    }
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
  const p3BaseCompleted = profileFormSuccess.value === true && spellingAllCorrect.value === true && voiceRecorded.value
  phaseProgress.value.practica = (p3BaseCompleted && p3DbCompleted) ? 100 : 0

  // 4. Phase 4 (Evaluación)
  const phase4DbActs = dbActivities.value.filter(a => a.course === courseTitle.value && a.phase === 'Cierre')
  const p4DbCompleted = phase4DbActs.every(a => completedActivityIds.value.includes(a.id))
  const p4BaseCompleted = examPassed.value
  phaseProgress.value.evaluacion = (p4BaseCompleted && p4DbCompleted) ? 100 : 0
  
  saveProgress()
}

// -----------------------------------------------------------------
// Phase 1: Welcome Video & Warm-up Game State (Greetings / Sun-Moon match)
// -----------------------------------------------------------------
const videoPlaying = ref(false)
const videoCompleted = ref(false)
const videoProgress = ref(0)
let videoTimer = null

const leftItems = ['Sun', 'Afternoon', 'Moon']
const rightItems = ['Good morning', 'Good afternoon', 'Good evening']
const selectedLeft = ref(null)
const selectedRight = ref(null)
const matchedPairs = ref([]) // matched left & right items
const gameSuccess = ref(null)
const isGameCompleted = computed(() => phaseProgress.value.inicio === 100)

function selectLeftItem(item) {
  if (matchedPairs.value.includes(item)) return
  selectedLeft.value = item
  checkWarmupMatch()
}

function selectRightItem(item) {
  if (matchedPairs.value.includes(item)) return
  selectedRight.value = item
  checkWarmupMatch()
}

function checkWarmupMatch() {
  if (selectedLeft.value && selectedRight.value) {
    const correctPairs = {
      'Sun': 'Good morning',
      'Afternoon': 'Good afternoon',
      'Moon': 'Good evening'
    }
    if (correctPairs[selectedLeft.value] === selectedRight.value) {
      matchedPairs.value.push(selectedLeft.value, selectedRight.value)
    }
    selectedLeft.value = null
    selectedRight.value = null
    
    if (matchedPairs.value.length === 6) {
      gameSuccess.value = true
      phaseProgress.value.inicio = 100
      saveProgress()
    }
  }
}

function resetWarmupGame() {
  selectedLeft.value = null
  selectedRight.value = null
  matchedPairs.value = []
  gameSuccess.value = null
  phaseProgress.value.inicio = 0
  saveProgress()
}

function validateWarmupGame() {
  if (matchedPairs.value.length === 6) {
    gameSuccess.value = true
    phaseProgress.value.inicio = 100
  } else {
    gameSuccess.value = false
  }
}

function checkPhase1Completion() {
  if (videoCompleted.value && gameSuccess.value === true) {
    phaseProgress.value.inicio = 100
  }
}

// Watch game success & video complete
watch([videoCompleted, gameSuccess], () => {
  checkPhase1Completion()
})

// -----------------------------------------------------------------
// Phase 2: Highlighted Grammar, Audio Vocabulary, Dialogue (Sarah & John)
// -----------------------------------------------------------------
const activeGrammarFilters = ref(['subject', 'verb', 'complement'])
// Grammar Pill — Basic Sentence Structure (RAP 1)
const grammarSentence = [
  { text: 'I ', type: 'subject' },
  { text: 'am ', type: 'verb' },
  { text: 'a nurse. ', type: 'complement' },
  { text: 'I ', type: 'subject' },
  { text: 'am ', type: 'verb' },
  { text: 'Colombian. ', type: 'complement' },
  { text: 'I ', type: 'subject' },
  { text: 'live ', type: 'verb' },
  { text: 'in Colombia. ', type: 'complement' },
  { text: 'I ', type: 'subject' },
  { text: 'speak ', type: 'verb' },
  { text: 'English.', type: 'complement' }
]

const grammarLegend = [
  { id: 'subject', label: 'Sujeto (Subject)', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dotBg: 'bg-blue-500' },
  { id: 'verb', label: 'Verbo To Be (Verb)', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dotBg: 'bg-green-500' },
  { id: 'complement', label: 'Complemento (Complement)', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dotBg: 'bg-amber-500' }
]

// Vocabulary Laboratory — RAP 1: Getting to Know Other People
const vocabList = ref([
  // Greetings & Farewells
  { id: 'v1', word: 'Hello', ipa: '/həˈloʊ/', translation: 'Hola (Saludo general)', played: false, speed: 1.0 },
  { id: 'v2', word: 'Hi', ipa: '/haɪ/', translation: 'Hola (Saludo informal)', played: false, speed: 1.0 },
  { id: 'v3', word: 'Good morning', ipa: '/ɡʊd ˈmɔːr.nɪŋ/', translation: 'Buenos días (hasta mediodía)', played: false, speed: 1.0 },
  { id: 'v4', word: 'Good afternoon', ipa: '/ɡʊd ˌæf.tɚˈnuːn/', translation: 'Buenas tardes (12pm–6pm)', played: false, speed: 1.0 },
  { id: 'v5', word: 'Good evening', ipa: '/ɡʊd ˈiːv.nɪŋ/', translation: 'Buenas noches (al llegar)', played: false, speed: 1.0 },
  { id: 'v6', word: 'Goodbye', ipa: '/ɡʊdˈbaɪ/', translation: 'Adiós (despedida formal)', played: false, speed: 1.0 },
  { id: 'v7', word: 'See you later', ipa: '/siː juː ˈleɪ.t̬ɚ/', translation: 'Hasta luego (despedida informal)', played: false, speed: 1.0 },
  // Personal Information
  { id: 'v8', word: 'Name', ipa: '/neɪm/', translation: 'Nombre — What is your name?', played: false, speed: 1.0 },
  { id: 'v9', word: 'Last name', ipa: '/læst neɪm/', translation: 'Apellido — What is your last name?', played: false, speed: 1.0 },
  { id: 'v10', word: 'Age', ipa: '/eɪdʒ/', translation: 'Edad — How old are you?', played: false, speed: 1.0 },
  { id: 'v11', word: 'Nationality', ipa: '/ˌnæʃ.ənˈæl.ə.t̬i/', translation: 'Nacionalidad — What is your nationality?', played: false, speed: 1.0 },
  { id: 'v12', word: 'Phone number', ipa: '/foʊn ˈnʌm.bɚ/', translation: 'Número de teléfono — What is your phone number?', played: false, speed: 1.0 },
  { id: 'v13', word: 'Spelling', ipa: '/ˈspel.ɪŋ/', translation: 'Deletreo — How do you spell your name?', played: false, speed: 1.0 },
  { id: 'v14', word: 'Nice to meet you', ipa: '/naɪs tuː miːt juː/', translation: 'Mucho gusto / Encantado de conocerte', played: false, speed: 1.0 },
])

const playingVocabId = ref(null)
const vocabAudioProgress = ref(0)
let vocabAudioInterval = null

// Storybook — Greetings and Presentations (RAP 1)
const dialogue = [
  { role: 'nurse', english: 'Good morning. My name is Sarah.', spanish: 'Buenos días. Mi nombre es Sarah.' },
  { role: 'patient', english: 'Good morning, Sarah. I\'m David.', spanish: 'Buenos días, Sarah. Soy David.' },
  { role: 'nurse', english: 'Nice to meet you, David.', spanish: 'Mucho gusto, David.' },
  { role: 'patient', english: 'Nice to meet you too.', spanish: 'Igualmente.' },
  { role: 'nurse', english: 'What\'s your last name?', spanish: '¿Cuál es su apellido?' },
  { role: 'patient', english: 'My last name is Smith. S-M-I-T-H.', spanish: 'Mi apellido es Smith. S-M-I-T-H.' },
  { role: 'nurse', english: 'How old are you?', spanish: '¿Cuántos años tiene?' },
  { role: 'patient', english: 'I\'m 25 years old.', spanish: 'Tengo 25 años.' },
  { role: 'nurse', english: 'Where are you from?', spanish: '¿De dónde es usted?' },
  { role: 'patient', english: 'I\'m from Colombia.', spanish: 'Soy de Colombia.' },
  { role: 'nurse', english: 'What is your phone number?', spanish: '¿Cuál es su número de teléfono?' },
  { role: 'patient', english: 'My phone number is 312 456 7890.', spanish: 'Mi número de teléfono es 312 456 7890.' },
]

const isStudyCompleted = computed(() => phaseProgress.value.estudio === 100)

// -----------------------------------------------------------------
// Phase 3: Profile Form & Spelling Tasks (Guided Practice 1 & 2)
// -----------------------------------------------------------------
// Guided Practice 1 — Complete the Profile (RAP 1: 6 fields)
const profileForm = ref({
  firstName: '',
  lastName: '',
  age: '',
  nationality: '',
  phone: '',
  email: ''
})
const profileFormSuccess = ref(null)

function validateProfileForm() {
  const f = profileForm.value
  // RAP 1 validation: Subject + Verb + Complement structure required
  const fnOk = f.firstName.trim().toLowerCase().startsWith('i am') || f.firstName.trim().toLowerCase().startsWith('my name is')
  const lnOk = f.lastName.trim().toLowerCase().includes('is') || f.lastName.trim().toLowerCase().startsWith('my last name is')
  const ageOk = f.age.trim().toLowerCase().startsWith('i am') && f.age.trim().toLowerCase().includes('old')
  const natOk = f.nationality.trim().toLowerCase().startsWith('i am')
  const phoneOk = f.phone.trim().toLowerCase().includes('my phone number is') || f.phone.trim().replace(/\s/g,'').match(/^\d{7,}$/)
  const emailOk = f.email.trim().includes('@') && f.email.trim().length > 5

  if (fnOk && lnOk && ageOk && natOk && phoneOk && emailOk) {
    profileFormSuccess.value = true
  } else {
    profileFormSuccess.value = false
  }
  checkPhase3Completion()
}

// Guided Practice 2 — Listening & Spelling (RAP 1)
const spellingTasks = [
  { text: 'john', audioText: 'J O H N', hint: 'Nombre: J-O-H-N' },
  { text: 'smith', audioText: 'S M I T H', hint: 'Apellido: S-M-I-T-H' },
  { text: 'brown', audioText: 'B R O W N', hint: 'Apellido: B-R-O-W-N' },
  { text: 'john.smith@gmail.com', audioText: 'J O H N dot S M I T H at G M A I L dot C O M', hint: 'Correo electrónico deletreado' },
  { text: '312-456-7890', audioText: '3 1 2 4 5 6 7 8 9 0', hint: 'Número de teléfono dígito a dígito' },
]

const spellingAnswers = ref(['', '', '', '', ''])
const spellingResults = ref([null, null, null, null, null])
const spellingAllCorrect = ref(false)

function playSpellingAudio(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.65 // slower rate for clarity
    window.speechSynthesis.speak(utterance)
  } else {
    alert('Spelled audio: ' + text)
  }
}

function validateSpellingTasks() {
  let allOk = true
  spellingTasks.forEach((task, idx) => {
    const entered = spellingAnswers.value[idx].trim().toLowerCase().replace(/[-\s]/g, '')
    const correct = task.text.toLowerCase().replace(/[-\s]/g, '')
    if (entered === correct) {
      spellingResults.value[idx] = true
    } else {
      spellingResults.value[idx] = false
      allOk = false
    }
  })
  spellingAllCorrect.value = allOk
  checkPhase3Completion()
}

const isRecording = ref(false)
const voiceRecorded = ref(false)
const recordingSeconds = ref(0)
const voicePreviewPlaying = ref(false)
let recorderInterval = null

const isPracticeCompleted = computed(() => phaseProgress.value.practica === 100)

// -----------------------------------------------------------------
// Phase 4: Exam & Badges (Knowledge Check)
// -----------------------------------------------------------------
const examAnswers = ref({})
const examPassed = ref(false)
const showBadgeAward = ref(false)
const examScoreMessage = ref('')

// Test Your Knowledge — RAP 1: Getting to Know Other People (6 questions)
const examQuestions = [
  {
    id: 'q1',
    question: 'Which greeting is correct for the morning?',
    options: ['Good night', 'Good morning', 'Goodbye', 'See you'],
    correct: 'Good morning',
  },
  {
    id: 'q2',
    question: 'Identify the VERB in: "I am a nurse."',
    options: ['I', 'am', 'a', 'nurse'],
    correct: 'am',
  },
  {
    id: 'q3',
    question: 'How do you ask someone for their name?',
    options: ['Where are you from?', 'How old are you?', 'What is your name?', 'What is your phone number?'],
    correct: 'What is your name?',
  },
  {
    id: 'q4',
    question: 'How do you spell the name JOHN?',
    options: ['G-O-H-N', 'J-O-H-N', 'J-O-N', 'J-H-O-N'],
    correct: 'J-O-H-N',
  },
  {
    id: 'q5',
    question: 'Which sentence is grammatically correct? (Subject + Verb + Complement)',
    options: ['Am Colombian I.', 'Colombian am I.', 'I am Colombian.', 'I Colombian am.'],
    correct: 'I am Colombian.',
  },
  {
    id: 'q6',
    question: 'What is the correct farewell used when leaving for the day?',
    options: ['Good morning', 'Nice to meet you', 'Goodbye', 'Good afternoon'],
    correct: 'Goodbye',
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

function getGrammarHighlightClass(type) {
  if (!type || !activeGrammarFilters.value.includes(type)) return ''
  if (type === 'subject') return 'bg-blue-100 text-blue-700 border-b border-blue-400 font-bold'
  if (type === 'verb') return 'bg-green-100 text-green-700 border-b border-green-400 font-bold'
  if (type === 'complement') return 'bg-amber-100 text-amber-700 border-b border-amber-400 font-bold'
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
  const f = profileFormSuccess.value === true
  const s = spellingAllCorrect.value === true
  
  if (f && s && voiceRecorded.value) {
    phaseProgress.value.practica = 100
  } else {
    phaseProgress.value.practica = 0
  }
  updatePhaseProgress()
}

watch([profileFormSuccess, spellingAllCorrect, voiceRecorded], () => {
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
  
  if (pct >= 75) {
    examPassed.value = true
    showBadgeAward.value = true
    phaseProgress.value.evaluacion = 100
    examScoreMessage.value = ''
    saveProgress()
  } else {
    examScoreMessage.value = `Calificación: ${Math.round(pct)}%. Necesitas al menos 75% (5 de 6 preguntas correctas) para aprobar el RAP 1. Intenta de nuevo.`
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
    matchedPairs: matchedPairs.value,
    vocabPlayed: vocabList.value.map(v => ({ id: v.id, played: v.played })),
    profileForm: profileForm.value,
    profileFormSuccess: profileFormSuccess.value,
    spellingAnswers: spellingAnswers.value,
    spellingResults: spellingResults.value,
    spellingAllCorrect: spellingAllCorrect.value,
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
    if (state.matchedPairs) matchedPairs.value = state.matchedPairs
    
    if (state.vocabPlayed) {
      state.vocabPlayed.forEach(sp => {
        const item = vocabList.value.find(v => v.id === sp.id)
        if (item) item.played = sp.played
      })
    }
    
    if (state.profileForm) profileForm.value = state.profileForm
    if (state.profileFormSuccess !== undefined) profileFormSuccess.value = state.profileFormSuccess
    if (state.spellingAnswers) spellingAnswers.value = state.spellingAnswers
    if (state.spellingResults) spellingResults.value = state.spellingResults
    if (state.spellingAllCorrect !== undefined) spellingAllCorrect.value = state.spellingAllCorrect
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
  matchedPairs, 
  profileForm,
  profileFormSuccess,
  spellingAnswers,
  spellingResults,
  spellingAllCorrect,
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
