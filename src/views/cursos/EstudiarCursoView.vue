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
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-black text-gray-800">{{ currentCourseTitle }}</h2>
          <span :class="`text-xs font-bold px-2.5 py-0.5 rounded-full ${isModule2 ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`">
            {{ isModule2 ? 'Fase Planeación · RAP 2 y 3' : 'Fase Análisis · RAP 1' }}
          </span>
        </div>
        <p class="text-xs text-gray-500">
          {{ isModule2 ? 'Caso Clínico: Hospitalización y Entrega de Turno de Mr. Thomas' : 'Módulo de Inglés Técnico Aplicado a la Enfermería' }}
        </p>
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
        v-for="phase in phases" 
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
        <div v-if="phaseProgress[phase.id] === 100" class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-bl-lg"></div>
        <span class="material-symbols-outlined text-lg">
          {{ isPhaseLocked(phase.id) ? 'lock' : phase.icon }}
        </span>
        <span class="truncate">{{ phase.name }}</span>
        <span v-if="phaseProgress[phase.id] === 100" class="material-symbols-outlined text-xs bg-white text-green-500 rounded-full p-0.5 shrink-0">check</span>
      </button>
    </div>

    <!-- Active Phase Panels -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 min-h-[400px]">

      <!-- ========================================== -->
      <!-- FASE 1: INICIO (PREPARACIÓN) -->
      <!-- ========================================== -->
      <div v-if="currentPhase === 'inicio'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            {{ isModule2 ? 'Módulo 2 — Work Life Interaction' : 'Módulo 1 — Getting to Know Other People' }}
            <span :class="`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${isModule2 ? 'bg-indigo-100 text-indigo-700' : 'bg-[#006688]/10 text-[#006688]'}`">
              {{ isModule2 ? 'Fase Planeación · RAP 2 y 3' : 'Fase Análisis · RAP 1' }}
            </span>
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ isModule2 
              ? 'Momento 1: Acompaña a Mr. Thomas en su hospitalización. Completa el video introductorio y el juego de calentamiento de turnos hospitalarios.' 
              : 'Momento 1: Completa el video introductorio y el juego de calentamiento antes de avanzar a la absorción de conocimiento.' }}
          </p>
        </div>

        <!-- Welcome Video Section -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="md:col-span-3 space-y-4">
            <div class="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-md group flex items-center justify-center">
              
              <!-- Video Placeholder Overlay -->
              <div v-if="!videoPlaying && !videoCompleted" class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-6 text-center space-y-3 z-10">
                <span class="material-symbols-outlined text-5xl text-[#006688] bg-white rounded-full p-3 shadow-lg group-hover:scale-105 transition-transform cursor-pointer" @click="playVideo">play_arrow</span>
                <p class="font-bold text-sm">
                  {{ isModule2 ? 'Caso Clínico: Hospitalización de Mr. Thomas (Habitación 204)' : 'Video de Bienvenida: Nursing Basics Introduction' }}
                </p>
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
                <span class="material-symbols-outlined text-8xl text-white/5">{{ isModule2 ? 'hotel' : 'clinical_notes' }}</span>
              </div>
            </div>
          </div>

          <!-- Objectives Panel -->
          <div class="md:col-span-2 space-y-4 flex flex-col justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 class="font-black text-gray-800 text-sm">
              {{ isModule2 ? '¿Qué aprenderás? — Objetivos del RAP 2 y 3' : '¿Qué aprenderás? — Objetivos del RAP 1' }}
            </h4>
            
            <!-- Module 2 Objectives -->
            <ul v-if="isModule2" class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Describir el estado físico de los pacientes y lesiones comunes</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Detallar el entorno hospitalario (habitaciones, camillas, sala de espera)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">✓</span> Identificar partes del cuerpo humano y anatomía básica</li>
              <li class="flex items-start gap-1.5"><span class="text-indigo-600 font-bold mt-0.5">⏱️</span> Usar el <strong>Pasado Simple</strong> para relatar antecedentes clínicos (*He fell, He had*)</li>
              <li class="flex items-start gap-1.5"><span class="text-teal-600 font-bold mt-0.5">📋</span> Usar <strong>Adjetivos Descriptivos</strong> para el estado actual (*He is pale, The room is cold*)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">🏥</span> Realizar una <strong>Entrega de Turno (Shift Handover)</strong> en inglés</li>
            </ul>

            <!-- Module 1 Objectives -->
            <ul v-else class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
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
              {{ isModule2 
                ? '"En este módulo acompañarás a Mr. Thomas en su hospitalización. Al final, serás capaz de describir el estado físico de tus pacientes, detallar su entorno hospitalario y relatar antecedentes clínicos."' 
                : '"At the end of this module, you will be able to introduce yourself, greet other people and ask for basic personal information in English."' }}
            </p>
          </div>
        </div>

        <!-- Warm-up Game Section -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
            <h4 class="font-bold text-gray-800 text-sm">
              {{ isModule2 
                ? 'Warm-Up: Hospital Shifts & Handover — Empareja los turnos con el saludo de relevo' 
                : 'Warm-Up: Greetings — Empareja el momento del día con su saludo' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ isModule2 
              ? 'Instrucción: Empareja el horario y turno hospitalario de la izquierda con la expresión y saludo de relevo correspondiente en inglés.' 
              : 'Instrucción: Empareja el momento del día de la columna izquierda con el saludo correspondiente en inglés.' }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Left column -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                {{ isModule2 ? 'Turno Hospitalario / Momento' : 'Momento del día' }}
              </span>
              <button 
                v-for="item in activeLeftItems" 
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
                    {{ item.includes('Morning') || item === 'Sun' ? 'light_mode' : (item.includes('Afternoon') || item === 'Afternoon' ? 'wb_twilight' : 'dark_mode') }}
                  </span>
                  <span>{{ item }}</span>
                </div>
                <span v-if="matchedPairs.includes(item)" class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
              </button>
            </div>

            <!-- Right column -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                {{ isModule2 ? 'Expresiones de Entrega de Turno' : 'Saludos en Inglés' }}
              </span>
              <button 
                v-for="item in activeRightItems" 
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
              
              <span v-if="gameSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Excelente! Has emparejado todos los elementos correctamente. Momento 1 completado.
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


      <!-- ========================================== -->
      <!-- FASE 2: ESTUDIO (ABSORCIÓN) -->
      <!-- ========================================== -->
      <div v-if="currentPhase === 'estudio'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Momento 2 — Absorción de Conocimiento
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ isModule2 
              ? 'Momento 2: Explora el Pasado Simple vs. Adjetivos Descriptivos, interactúa con las flashcards de anatomía/hospital y analiza el Storybook de entrega de turno.' 
              : 'Momento 2: Explora la gramática básica, practica el vocabulario de saludos e información personal, y revisa el Storybook y el contexto de enfermería.' }}
          </p>
        </div>

        <!-- MODULE 2 GRAMMAR PILL: Two-column clinical comparison -->
        <div v-if="isModule2" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">table_chart</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Pasado Simple vs. Adjetivos Descriptivos (Caso Mr. Thomas)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Aprende a diferenciar qué le ocurrió al paciente en el pasado (<strong>Past Simple</strong>) de cómo se encuentra en el momento actual (<strong>Descriptive Adjectives & Present</strong>).
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Column 1: Patient's History -->
            <div class="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-purple-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-purple-700 text-lg">history</span>
                  <span class="text-xs font-black text-purple-900 uppercase tracking-wide">Patient's History (Past Simple)</span>
                </div>
                <span class="text-[10px] font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Qué le ocurrió</span>
              </div>
              <p class="text-[11px] text-purple-700 font-medium">Usa verbos en pasado para relatar los hechos y antecedentes ocurridos:</p>
              
              <div class="space-y-2">
                <div v-for="(item, idx) in m2PastExamples" :key="idx" class="bg-white p-3 rounded-xl border border-purple-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-purple-600 font-black">{{ item.subject }}</span>
                      <span class="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-black mx-1 underline">{{ item.verb }}</span>
                      <span>{{ item.complement }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Column 2: Current Status -->
            <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-700 text-lg">vital_signs</span>
                  <span class="text-xs font-black text-emerald-900 uppercase tracking-wide">Current Status (Adjectives)</span>
                </div>
                <span class="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Cómo está hoy</span>
              </div>
              <p class="text-[11px] text-emerald-700 font-medium">Usa adjetivos descriptivos y el presente para detallar el estado del paciente y su entorno:</p>
              
              <div class="space-y-2">
                <div v-for="(item, idx) in m2PresentExamples" :key="idx" class="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-emerald-700 font-black">{{ item.subject }}</span>
                      <span class="text-gray-700 mx-1">{{ item.verb }}</span>
                      <span class="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-black">{{ item.adjective }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- MODULE 1 GRAMMAR PILL -->
        <div v-else class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">palette</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Basic Sentence Structure (Subject + Verb + Complement)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Haz clic en los botones de leyenda para activar o desactivar el resaltado de colores en las oraciones de ejemplo del RAP 1.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <div class="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed text-center px-4">
              <span 
                v-for="(part, idx) in grammarSentence" 
                :key="idx" 
                :class="`transition-all duration-300 px-1 py-0.5 rounded ${getGrammarHighlightClass(part.type)}`"
              >
                {{ part.text }}
              </span>
            </div>

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

        <!-- Vocabulary Laboratory Flashcards Zone -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">style</span>
              <h4 class="font-bold text-gray-800 text-sm">
                {{ isModule2 
                  ? '2. Laboratorio de Vocabulario — Flashcards (Partes del Cuerpo y Entorno Hospitalario)' 
                  : '2. Vocabulary Laboratory — Greetings, Farewells & Personal Information' }}
              </h4>
            </div>
            <span class="text-xs bg-[#006688]/5 text-[#006688] font-bold px-3 py-1 rounded-full">
              Escuchados: {{ activeVocabList.filter(v => v.played).length }} / {{ activeVocabList.length }}
            </span>
          </div>
          <p class="text-xs text-gray-600">
            {{ isModule2 
              ? 'Interactúa con las tarjetas interactivas (Flashcards). Escucha la pronunciación correcta de cada término anatómico y hospitalario.' 
              : 'Reproduce el audio de cada expresión del módulo. Escucha todos los ítems para habilitar la siguiente fase.' }}
          </p>

          <!-- Vocabulary Flashcard Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="v in activeVocabList" 
              :key="v.id" 
              class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-[#006688] transition-all flex flex-col justify-between group"
            >
              <div class="space-y-1.5">
                <div class="flex justify-between items-start">
                  <span class="text-base font-bold text-gray-800 flex items-center gap-1.5">
                    <span v-if="v.emoji" class="text-lg">{{ v.emoji }}</span>
                    {{ v.word }}
                  </span>
                  <span v-if="v.played" class="text-green-600 material-symbols-outlined text-sm">check_circle</span>
                </div>
                <p class="text-xs text-[#006688] italic font-medium">{{ v.ipa }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ v.translation }}</p>
                <span v-if="v.category" class="inline-block text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {{ v.category }}
                </span>
              </div>

              <!-- Audio Player Button -->
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button 
                  @click="playVocabAudio(v)"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] text-xs font-bold transition-all w-full justify-center"
                >
                  <span class="material-symbols-outlined text-base">
                    {{ playingVocabId === v.id ? 'graphic_eq' : 'volume_up' }}
                  </span>
                  <span>{{ playingVocabId === v.id ? 'Reproduciendo...' : 'Pronunciación' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Storybook Dialogue -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">forum</span>
            <h4 class="font-bold text-gray-800 text-sm">
              {{ isModule2 ? '3. Storybook — Recibo de Turno: Nurse Andrea & Nurse Carlos' : '3. Storybook — Greetings and Presentations: Nurse & Nurse' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ isModule2 
              ? 'Observa la conversación dinámica de entrega de turno sobre el caso clínico de Mr. Thomas en la habitación 204. Haz clic en el audio para escuchar cada intervención.' 
              : 'Revisa la conversación de presentación entre dos enfermeras — un escenario real de inicio de turno.' }}
          </p>

          <div class="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4 max-h-[350px] overflow-y-auto">
            <div 
              v-for="(bubble, bIdx) in activeDialogue" 
              :key="bIdx" 
              :class="`flex gap-3 max-w-[85%] ${bubble.role === 'nurse' || bubble.role === 'nurseA' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`"
            >
              <div :class="`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${bubble.role === 'nurse' || bubble.role === 'nurseA' ? 'bg-[#006688]' : 'bg-indigo-600'}`">
                {{ bubble.role === 'nurse' || bubble.role === 'nurseA' ? '👩‍⚕️' : '👨‍⚕️' }}
              </div>
              <div :class="`p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed ${bubble.role === 'nurse' || bubble.role === 'nurseA' ? 'bg-white text-gray-800 rounded-tl-none border-gray-100' : 'bg-indigo-50/60 text-gray-800 rounded-tr-none border-indigo-100'}`">
                <div class="flex items-center justify-between gap-4 mb-1">
                  <span class="font-bold text-[10px] uppercase tracking-widest text-gray-400">
                    {{ bubble.speaker || (bubble.role === 'nurse' ? 'Nurse Sarah' : 'Nurse David') }}
                  </span>
                  <button @click="speakEnglish(bubble.english)" class="text-[#006688] hover:text-[#004e69] text-xs" title="Escuchar frase">
                    <span class="material-symbols-outlined text-sm">volume_up</span>
                  </button>
                </div>
                <p class="font-semibold text-gray-900">{{ bubble.english }}</p>
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


      <!-- ========================================== -->
      <!-- FASE 3: PRÁCTICA -->
      <!-- ========================================== -->
      <div v-if="currentPhase === 'practica'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Momento 3 — Práctica y Aplicación {{ isModule2 ? '(RAP 2 y 3)' : '(RAP 1)' }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ isModule2 
              ? 'Completa las notas de enfermería escuchando el reporte médico, describe la habitación de Mr. Thomas y graba tu entrega de turno (Handover Report).' 
              : 'Completa el perfil personal, realiza los deletreos y graba tu presentación personal como evidencia de aprendizaje.' }}
          </p>
        </div>

        <!-- MODULE 2 PRACTICE 1: Listening & Nursing Notes -->
        <div v-if="isModule2" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">clinical_notes</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Práctica Guiada 1 — Listening & Completar Notas de Enfermería</h4>
          </div>
          <p class="text-xs text-gray-600">
            Escucha el audio del médico describiendo el ingreso y antecedentes de Mr. Thomas. Llena los 5 espacios en blanco con las palabras clave en inglés.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            
            <!-- Dr. Miller Audio Player Card -->
            <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div class="flex items-center gap-3">
                <button 
                  @click="playDrMillerReport" 
                  class="w-10 h-10 rounded-full bg-[#006688] text-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ drMillerPlaying ? 'pause' : 'play_arrow' }}
                  </span>
                </button>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-800">Audio Clínico: Dr. Miller's Admission Report</span>
                    <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Audio Médico</span>
                  </div>
                  <p class="text-[11px] text-gray-500">Escucha con atención las palabras clave para completar el cuadro clínico.</p>
                </div>
              </div>
              <button 
                @click="playDrMillerReport"
                type="button" 
                class="px-3 py-1.5 text-xs font-bold text-[#006688] bg-[#006688]/10 rounded-lg hover:bg-[#006688]/20 transition-all"
              >
                {{ drMillerPlaying ? 'Detener Audio' : 'Reproducir Audio Completo' }}
              </button>
            </div>

            <!-- Nursing Notes Form with Blanks -->
            <div class="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-amber-200 pb-2">
                <span class="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">edit_note</span>
                  Nursing Notes — Patient Chart (Room 204)
                </span>
                <span class="text-[10px] font-bold text-amber-800">Mr. Thomas, 68 y/o</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold text-gray-700">1. Diagnóstico de la lesión (X-ray confirmed a...):</label>
                    <button @click="speakEnglish('fracture')" class="text-[#006688] text-xs" title="Pista de audio">
                      <span class="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                  </div>
                  <input type="text" v-model="m2Notes.fracture" placeholder="Palabra clave en inglés..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold text-gray-700">2. Cuándo ocurrió la caída (The accident happened...):</label>
                    <button @click="speakEnglish('yesterday')" class="text-[#006688] text-xs" title="Pista de audio">
                      <span class="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                  </div>
                  <input type="text" v-model="m2Notes.yesterday" placeholder="Palabra clave en inglés..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold text-gray-700">3. Lugar inicial de espera (Patient waited in the...):</label>
                    <button @click="speakEnglish('waiting room')" class="text-[#006688] text-xs" title="Pista de audio">
                      <span class="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                  </div>
                  <input type="text" v-model="m2Notes.waitingRoom" placeholder="Palabra clave en inglés..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold text-gray-700">4. Tratamiento aplicado (The nurse applied a clean...):</label>
                    <button @click="speakEnglish('bandage')" class="text-[#006688] text-xs" title="Pista de audio">
                      <span class="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                  </div>
                  <input type="text" v-model="m2Notes.bandage" placeholder="Palabra clave en inglés..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>

                <div class="sm:col-span-2 space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold text-gray-700">5. Signo físico observado (His right arm is...):</label>
                    <button @click="speakEnglish('swollen')" class="text-[#006688] text-xs" title="Pista de audio">
                      <span class="material-symbols-outlined text-sm">volume_up</span>
                    </button>
                  </div>
                  <input type="text" v-model="m2Notes.swollen" placeholder="Palabra clave en inglés..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <button @click="validateM2Notes" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                  Verificar Notas de Enfermería
                </button>
                <span v-if="m2NotesSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  ¡Notas clínicas completadas y verificadas correctamente!
                </span>
                <span v-if="m2NotesSuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">cancel</span>
                  Revisa las palabras tecleadas. Escucha los audios de pista si necesitas ayuda.
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- MODULE 1 PRACTICE 1: Complete the Profile -->
        <div v-else class="space-y-4">
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

        <!-- MODULE 2 PRACTICE 2: Room 204 Clinical Scene with Dropdowns -->
        <div v-if="isModule2" class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">dashboard_customize</span>
            <h4 class="font-bold text-gray-800 text-sm">2. Práctica Guiada 2 — Descripción Clínica (Habitación de Mr. Thomas)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Observa la escena panorámica de la habitación 204 y selecciona en cada menú desplegable la opción correcta para describir la escena usando la estructura gramatical clínica.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-5">
            
            <!-- Illustrated Visual Scenario Card -->
            <div class="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-2xl text-teal-400">hotel</span>
                  <span class="text-xs font-bold uppercase tracking-widest text-teal-300">Habitación 204 — Escena Clínica</span>
                </div>
                <p class="text-sm font-semibold text-gray-200">
                  Mr. Thomas está en la cama de hospital. Tiene un vendaje en el brazo derecho por una fractura. La habitación está limpia y tranquila.
                </p>
              </div>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">🛏️ En cama</span>
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">🩹 Vendaje</span>
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">🏥 Hab. 204</span>
              </div>
            </div>

            <!-- 4 Dropdown Sentence Selectors -->
            <div class="space-y-3">
              <!-- Sentence 1 -->
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">1.</span>
                <select v-model="m2RoomScene.s1_sub" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Sujeto --</option>
                  <option value="The patient">The patient</option>
                  <option value="The doctor">The doctor</option>
                  <option value="A nurse">A nurse</option>
                </select>
                <select v-model="m2RoomScene.s1_v" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Verbo --</option>
                  <option value="is">is</option>
                  <option value="was">was</option>
                  <option value="are">are</option>
                </select>
                <select v-model="m2RoomScene.s1_comp" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Complemento --</option>
                  <option value="in the bed">in the bed</option>
                  <option value="at the hotel">at the hotel</option>
                  <option value="in the street">in the street</option>
                </select>
              </div>

              <!-- Sentence 2 -->
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">2.</span>
                <select v-model="m2RoomScene.s2_sub" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Sujeto --</option>
                  <option value="He">He</option>
                  <option value="She">She</option>
                  <option value="They">They</option>
                </select>
                <select v-model="m2RoomScene.s2_v" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Verbo --</option>
                  <option value="has">has</option>
                  <option value="had">had</option>
                  <option value="having">having</option>
                </select>
                <select v-model="m2RoomScene.s2_comp" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Complemento --</option>
                  <option value="a bandage on his arm">a bandage on his arm</option>
                  <option value="a cast on his leg">a cast on his leg</option>
                  <option value="an oxygen mask">an oxygen mask</option>
                </select>
              </div>

              <!-- Sentence 3 -->
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">3.</span>
                <select v-model="m2RoomScene.s3_sub" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Sujeto --</option>
                  <option value="The room">The room</option>
                  <option value="The hotel">The hotel</option>
                  <option value="The pharmacy">The pharmacy</option>
                </select>
                <select v-model="m2RoomScene.s3_v" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Verbo --</option>
                  <option value="is">is</option>
                  <option value="were">were</option>
                  <option value="are">are</option>
                </select>
                <select v-model="m2RoomScene.s3_comp" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Complemento --</option>
                  <option value="quiet and clean">quiet and clean</option>
                  <option value="noisy and dark">noisy and dark</option>
                  <option value="crowded and loud">crowded and loud</option>
                </select>
              </div>

              <!-- Sentence 4 -->
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">4.</span>
                <select v-model="m2RoomScene.s4_sub" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Sujeto --</option>
                  <option value="His right arm">His right arm</option>
                  <option value="His left foot">His left foot</option>
                  <option value="His head">His head</option>
                </select>
                <select v-model="m2RoomScene.s4_v" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Verbo --</option>
                  <option value="is">is</option>
                  <option value="was">was</option>
                  <option value="are">are</option>
                </select>
                <select v-model="m2RoomScene.s4_comp" class="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Complemento --</option>
                  <option value="swollen and painful">swollen and painful</option>
                  <option value="healthy and fine">healthy and fine</option>
                  <option value="strong and fast">strong and fast</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button @click="validateM2RoomScene" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                Verificar Descripción Clínica
              </button>
              <span v-if="m2RoomSceneSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Todas las oraciones descriptivas son correctas!
              </span>
              <span v-if="m2RoomSceneSuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Algunas opciones no coinciden con la escena de Mr. Thomas. Revisa y prueba de nuevo.
              </span>
            </div>

          </div>
        </div>

        <!-- MODULE 1 PRACTICE 2: Spelling -->
        <div v-else class="space-y-4 pt-4 border-t border-gray-100">
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

        <!-- Voice Recorder Challenge Component (Common to both with tailored prompts) -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">mic</span>
            <h4 class="font-bold text-gray-800 text-sm">
              {{ isModule2 ? '3. El Desafío — Shift Handover Report (Nota de Voz de Entrega de Turno)' : '3. Learning Evidence Challenge' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ isModule2 
              ? 'Graba un audio de máximo 1 minuto simulando que le entregas el turno a tu supervisor: describe físicamente a Mr. Thomas, indica en qué lugar se encuentra (Habitación 204) y relata qué le ocurrió ayer usando verbos en pasado.' 
              : 'Graba un audio de máximo 1 minuto presentándote a un paciente extranjero. Incluye tu nombre, deletreo de apellido y teléfono:' }}
            <br />
            <span class="block mt-2 bg-[#006688]/5 text-[#006688] p-3 rounded-xl border border-[#006688]/10 font-mono text-[11px] leading-relaxed">
              {{ isModule2 
                ? '🎤 Ejemplo: "Good morning supervisor. Mr. Thomas is in room 204. He is an older man. Yesterday, he fell at the hotel and suffered an arm fracture. Today, he has a bandage on his arm and is resting in bed. His vitals are stable."' 
                : '🎤 Ejemplo: "Good morning. My name is John. My last name is Smith. S-M-I-T-H. My phone number is 312 456 7890. Nice to meet you."' }}
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


      <!-- ========================================== -->
      <!-- FASE 4: EVALUACIÓN (CIERRE) -->
      <!-- ========================================== -->
      <div v-if="currentPhase === 'evaluacion'" class="space-y-8 animate-fade-in">
        <div class="border-b border-gray-100 pb-4">
          <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
            <span class="w-2 h-6 bg-[#006688] rounded-full"></span>
            Momento 4 — Cierre: Test Your Knowledge
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ isModule2 
              ? 'Completa la evaluación del RAP 2 y 3 sobre el caso de Mr. Thomas para aprobar y recibir tu insignia digital Handover Specialist Badge.' 
              : 'Completa la evaluación del RAP 1 para aprobar y recibir tu insignia digital de Getting to Know Other People.' }}
          </p>
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
            <p class="text-sm font-bold text-yellow-700">
              {{ isModule2 ? '🏆 Handover Specialist Badge — RAP 2 y 3' : '🏆 RAP 1 — Getting to Know Other People' }}
            </p>
            <p class="text-xs text-yellow-600 max-w-md mx-auto leading-relaxed">
              {{ isModule2 
                ? 'Has demostrado dominio en la descripción de pacientes hospitalizados, notas de enfermería, pasado simple clínico y entrega de turno en inglés. ¡Esta insignia aparecerá con orgullo en tu perfil!' 
                : 'Has demostrado que puedes saludar, presentarte, dar información personal y aplicar la estructura Subject + Verb + Complement en inglés.' }}
            </p>
          </div>
          <button @click="showBadgeAward = false" class="text-xs font-bold text-yellow-800 hover:underline">Entendido, cerrar</button>
        </div>

        <!-- Exam Questions Form -->
        <div v-if="!examPassed" class="space-y-6">
          <p class="text-xs text-gray-600">
            Deberás responder correctamente al menos <strong>5 de las 6 preguntas</strong> (75%) para aprobar el {{ isModule2 ? 'RAP 2 y 3' : 'RAP 1' }}.
          </p>

          <div v-for="(q, qIndex) in activeExamQuestions" :key="q.id" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
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
            <h4 class="text-xl font-black text-green-800">
              {{ isModule2 ? '🎉 ¡Has completado el Módulo 2!' : '🎉 ¡Has completado el Módulo 1!' }}
            </h4>
            <p class="text-xs text-green-700">
              {{ isModule2 
                ? 'RAP 2 y 3 — Work Life Interaction completado con éxito. Ahora dominas el pasado simple clínico, notas de enfermería y entrega de turno en inglés.' 
                : 'RAP 1 — Getting to Know Other People completado con éxito. Ahora puedes saludar, presentarte y comunicarte con pacientes extranjeros en inglés.' }}
            </p>
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

      <!-- Complementary DB Activities Section -->
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
              
              <span v-if="completedActivityIds.includes(act.id)" class="text-green-600 material-symbols-outlined text-lg">check_circle</span>
            </div>
          </div>

          <!-- Active Activity Player -->
          <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div v-if="activeDbActivity" class="space-y-4">
              <div class="flex justify-between items-start border-b border-gray-200 pb-2">
                <div>
                  <h4 class="text-xs font-bold text-gray-800">{{ activeDbActivity.title }}</h4>
                  <span class="text-[9px] text-[#006688] font-bold uppercase">Plantilla: {{ activeDbActivity.template }}</span>
                </div>
                <span class="text-xs font-bold text-amber-600">+{{ activeDbActivity.points }} pts</span>
              </div>

              <!-- Quiz/Preguntas Interactive Player -->
              <div v-if="activeDbActivity.template === 'quiz' || activeDbActivity.template === 'preguntas'" class="space-y-3">
                <p class="text-xs font-semibold text-gray-700">{{ activeDbActivity.quizQuestion }}</p>
                <div class="grid grid-cols-1 gap-2">
                  <button 
                    @click="activeDbSelectedAnswer = 'correct'"
                    :class="`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      activeDbSelectedAnswer === 'correct' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200'
                    }`"
                  >
                    {{ activeDbActivity.quizCorrect }}
                  </button>
                  <button 
                    @click="activeDbSelectedAnswer = 'incorrect'"
                    :class="`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      activeDbSelectedAnswer === 'incorrect' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200'
                    }`"
                  >
                    {{ activeDbActivity.quizIncorrect }}
                  </button>
                </div>
              </div>

              <!-- Match/Conectar Meaning Player -->
              <div v-if="activeDbActivity.template === 'match'" class="space-y-3">
                <p class="text-[10px] text-gray-500 font-semibold">Empareja el término en inglés con su traducción al español:</p>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    @click="selectActiveDbTerm(activeDbActivity.matchTerm)"
                    :disabled="activeDbMatchedPairs.includes(activeDbActivity.matchTerm)"
                    :class="`p-2.5 border rounded-xl text-xs font-bold text-left ${
                      activeDbMatchedPairs.includes(activeDbActivity.matchTerm)
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : activeDbSelectedTerm === activeDbActivity.matchTerm
                          ? 'bg-[#006688] text-white border-[#006688]'
                          : 'bg-white text-gray-700 border-gray-200'
                    }`"
                  >
                    {{ activeDbActivity.matchTerm }}
                  </button>
                  <button 
                    @click="selectActiveDbMeaning(activeDbActivity.matchMeaning)"
                    :disabled="activeDbMatchedPairs.includes(activeDbActivity.matchMeaning)"
                    :class="`p-2.5 border rounded-xl text-xs font-bold text-left ${
                      activeDbMatchedPairs.includes(activeDbActivity.matchMeaning)
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : activeDbSelectedMeaning === activeDbActivity.matchMeaning
                          ? 'bg-[#006688] text-white border-[#006688]'
                          : 'bg-white text-gray-700 border-gray-200'
                    }`"
                  >
                    {{ activeDbActivity.matchMeaning }}
                  </button>
                </div>
              </div>

              <!-- Listening Player -->
              <div v-if="activeDbActivity.template === 'listening'" class="space-y-3">
                <p class="text-[10px] text-gray-500 font-semibold">Escucha el audio y escribe la frase en inglés:</p>
                <div class="flex items-center gap-2">
                  <button @click="playActiveDbListeningAudio" class="p-2 bg-[#006688] text-white rounded-lg hover:bg-[#004e69] flex items-center gap-1 text-xs font-bold">
                    <span class="material-symbols-outlined text-sm">volume_up</span>
                    Escuchar Frase
                  </button>
                </div>
                <input type="text" v-model="activeDbTypedPhrase" placeholder="Escribe lo que escuchas..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
              </div>

              <!-- Pronunciation Player -->
              <div v-if="activeDbActivity.template === 'pronunciation'" class="space-y-3">
                <p class="text-[10px] text-gray-500 font-semibold">Pronuncia la siguiente frase en inglés:</p>
                <div class="p-3 bg-white border border-gray-200 rounded-xl font-bold text-xs text-[#006688] text-center">
                  "{{ activeDbActivity.pronouncePhrase }}"
                </div>
                <div class="flex items-center justify-center gap-2">
                  <button @click="simulateActiveDbMicRecording" :class="`p-2.5 rounded-full text-white flex items-center justify-center ${activeDbRecording ? 'bg-red-600 animate-pulse' : 'bg-[#006688]'}`">
                    <span class="material-symbols-outlined text-base">mic</span>
                  </button>
                  <span class="text-[10px] font-bold text-gray-500">
                    {{ activeDbRecording ? 'Grabando...' : (activeDbVoiceRecorded ? 'Pronunciación grabada' : 'Haz clic para grabar') }}
                  </span>
                </div>
              </div>

              <!-- Action Validation for Activity -->
              <div class="flex items-center gap-2 pt-2 border-t border-gray-200">
                <button @click="validateActiveDbSubmission" class="px-3.5 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-[10px] font-bold rounded-lg transition-all shadow-xs">
                  Verificar Solución
                </button>
                <button @click="resetActiveDbDemo" class="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg transition-all">
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

const route = useRoute()
const auth = useAuthStore()

// State
const courseId = computed(() => route.params.courseId || '1')
const isModule2 = computed(() => courseId.value === '2' || courseId.value === '3')

const currentCourseTitle = computed(() => {
  return isModule2.value ? 'Work Life Interaction' : 'Getting to Know Other People'
})

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

// Calculate overall modules progress
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
  return dbActivities.value.filter(a => a.course === currentCourseTitle.value && a.phase === targetPhase)
})

// Helper speech synthesis function
function speakEnglish(text, rate = 0.85) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }
}

// -----------------------------------------------------------------
// Phase 1 State (Warm-up Match Game)
// -----------------------------------------------------------------
const videoPlaying = ref(false)
const videoCompleted = ref(false)
const videoProgress = ref(0)
let videoTimer = null

// M1 warm-up items
const m1LeftItems = ['Sun', 'Afternoon', 'Moon']
const m1RightItems = ['Good morning', 'Good afternoon', 'Good evening']

// M2 warm-up items (Hospital Shifts & Handover greetings)
const m2LeftItems = ['Morning Shift (07:00 AM)', 'Afternoon Shift (03:00 PM)', 'Night Shift (11:00 PM)']
const m2RightItems = ['Good morning, Nurse', 'Good afternoon, Team', 'Good evening, Shift']

const activeLeftItems = computed(() => isModule2.value ? m2LeftItems : m1LeftItems)
const activeRightItems = computed(() => isModule2.value ? m2RightItems : m1RightItems)

const selectedLeft = ref(null)
const selectedRight = ref(null)
const matchedPairs = ref([])
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
    const correctPairs = isModule2.value ? {
      'Morning Shift (07:00 AM)': 'Good morning, Nurse',
      'Afternoon Shift (03:00 PM)': 'Good afternoon, Team',
      'Night Shift (11:00 PM)': 'Good evening, Shift'
    } : {
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

function checkPhase1Completion() {
  if (videoCompleted.value && gameSuccess.value === true) {
    phaseProgress.value.inicio = 100
  }
}

watch([videoCompleted, gameSuccess], () => {
  checkPhase1Completion()
})

// -----------------------------------------------------------------
// Phase 2 State: Grammar Pill, Vocabulary Flashcards, Storybook
// -----------------------------------------------------------------
const activeGrammarFilters = ref(['subject', 'verb', 'complement'])

// Module 1 Grammar Sentence
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

// Module 2 Grammar Examples (Mr. Thomas Case)
const m2PastExamples = [
  { subject: 'He', verb: 'fell down', complement: 'at the hotel.', spanish: 'Él se cayó en el hotel.', full: 'He fell down at the hotel.' },
  { subject: 'He', verb: 'had', complement: 'an accident yesterday.', spanish: 'Él tuvo un accidente ayer.', full: 'He had an accident yesterday.' },
  { subject: 'He', verb: 'arrived', complement: 'at the emergency room at night.', spanish: 'Él llegó a urgencias en la noche.', full: 'He arrived at the emergency room at night.' },
  { subject: 'The doctor', verb: 'examined', complement: 'his right arm.', spanish: 'El doctor examinó su brazo derecho.', full: 'The doctor examined his right arm.' },
  { subject: 'He', verb: 'felt', complement: 'severe pain in his shoulder.', spanish: 'Él sintió dolor severo en su hombro.', full: 'He felt severe pain in his shoulder.' },
]

const m2PresentExamples = [
  { subject: 'He', verb: 'is', adjective: 'pale and weak.', spanish: 'Él está pálido y débil.', full: 'He is pale and weak.' },
  { subject: 'The room', verb: 'is', adjective: 'cold and quiet.', spanish: 'La habitación está fría y silenciosa.', full: 'The room is cold and quiet.' },
  { subject: 'His right arm', verb: 'is', adjective: 'swollen and painful.', spanish: 'Su brazo derecho está hinchado y doloroso.', full: 'His right arm is swollen and painful.' },
  { subject: 'He', verb: 'is', adjective: 'stable today.', spanish: 'Él está estable hoy.', full: 'He is stable today.' },
  { subject: 'He', verb: 'feels', adjective: 'dizzy when walking.', spanish: 'Se siente mareado al caminar.', full: 'He feels dizzy when walking.' },
]

// Module 1 Vocabulary
const m1VocabList = ref([
  { id: 'v1', word: 'Hello', ipa: '/həˈloʊ/', translation: 'Hola (Saludo general)', category: 'Saludo', emoji: '👋', played: false },
  { id: 'v2', word: 'Good morning', ipa: '/ɡʊd ˈmɔːr.nɪŋ/', translation: 'Buenos días (hasta 12pm)', category: 'Saludo', emoji: '🌅', played: false },
  { id: 'v3', word: 'Good afternoon', ipa: '/ɡʊd ˌæf.tɚˈnuːn/', translation: 'Buenas tardes (12pm–6pm)', category: 'Saludo', emoji: '☀️', played: false },
  { id: 'v4', word: 'Good evening', ipa: '/ɡʊd ˈiːv.nɪŋ/', translation: 'Buenas noches (al llegar)', category: 'Saludo', emoji: '🌆', played: false },
  { id: 'v5', word: 'Goodbye', ipa: '/ɡʊdˈbaɪ/', translation: 'Adiós (despedida formal)', category: 'Despedida', emoji: '🚶', played: false },
  { id: 'v6', word: 'See you later', ipa: '/siː juː ˈleɪ.t̬ɚ/', translation: 'Hasta luego', category: 'Despedida', emoji: '👋', played: false },
  { id: 'v7', word: 'Name', ipa: '/neɪm/', translation: 'Nombre — What is your name?', category: 'Personal', emoji: '🪪', played: false },
  { id: 'v8', word: 'Last name', ipa: '/læst neɪm/', translation: 'Apellido — What is your last name?', category: 'Personal', emoji: '📋', played: false },
  { id: 'v9', word: 'Age', ipa: '/eɪdʒ/', translation: 'Edad — How old are you?', category: 'Personal', emoji: '🎂', played: false },
  { id: 'v10', word: 'Nationality', ipa: '/ˌnæʃ.ənˈæl.ə.t̬i/', translation: 'Nacionalidad', category: 'Personal', emoji: '🌎', played: false },
  { id: 'v11', word: 'Phone number', ipa: '/foʊn ˈnʌm.bɚ/', translation: 'Número de teléfono', category: 'Personal', emoji: '📞', played: false },
  { id: 'v12', word: 'Spelling', ipa: '/ˈspel.ɪŋ/', translation: 'Deletreo de nombres', category: 'Habilidad', emoji: '🔤', played: false },
])

// Module 2 Vocabulary (Body parts & Hospital Environment)
const m2VocabList = ref([
  { id: 'm2_v1', word: 'Head', ipa: '/hɛd/', translation: 'Cabeza — "He has a minor head injury"', category: 'Anatomía', emoji: '🧠', played: false },
  { id: 'm2_v2', word: 'Arm', ipa: '/ɑːrm/', translation: 'Brazo — "His right arm is injured"', category: 'Anatomía', emoji: '💪', played: false },
  { id: 'm2_v3', word: 'Leg', ipa: '/lɛɡ/', translation: 'Pierna — "He can move his left leg"', category: 'Anatomía', emoji: '🦵', played: false },
  { id: 'm2_v4', word: 'Chest', ipa: '/tʃɛst/', translation: 'Pecho — "Chest sounds are normal"', category: 'Anatomía', emoji: '🫁', played: false },
  { id: 'm2_v5', word: 'Waiting room', ipa: '/ˈweɪtɪŋ ruːm/', translation: 'Sala de espera hospitalaria', category: 'Entorno', emoji: '🪑', played: false },
  { id: 'm2_v6', word: 'Stretcher', ipa: '/ˈstrɛtʃər/', translation: 'Camilla de traslado', category: 'Entorno', emoji: '🚑', played: false },
  { id: 'm2_v7', word: 'Hospital room', ipa: '/ˈhɒspɪtl ruːm/', translation: 'Habitación de hospital (Room 204)', category: 'Entorno', emoji: '🏥', played: false },
  { id: 'm2_v8', word: 'Bandage', ipa: '/ˈbændɪdʒ/', translation: 'Vendaje elástico de protección', category: 'Tratamiento', emoji: '🩹', played: false },
  { id: 'm2_v9', word: 'Fracture', ipa: '/ˈfræktʃər/', translation: 'Fractura ósea diagnosticada', category: 'Diagnóstico', emoji: '🦴', played: false },
  { id: 'm2_v10', word: 'Swollen', ipa: '/ˈswoʊlən/', translation: 'Hinchado / Inflamado', category: 'Signo clínico', emoji: '🔴', played: false },
  { id: 'm2_v11', word: 'Pale', ipa: '/peɪl/', translation: 'Pálido — aspecto del paciente', category: 'Signo clínico', emoji: '⚪', played: false },
  { id: 'm2_v12', word: 'Dizzy', ipa: '/ˈdɪzi/', translation: 'Mareado al levantarse', category: 'Síntoma', emoji: '💫', played: false },
])

const activeVocabList = computed(() => isModule2.value ? m2VocabList.value : m1VocabList.value)
const playingVocabId = ref(null)

// Dialogues
const m1Dialogue = [
  { role: 'nurse', speaker: 'Nurse Sarah', english: 'Good morning. My name is Sarah.', spanish: 'Buenos días. Mi nombre es Sarah.' },
  { role: 'patient', speaker: 'Nurse David', english: 'Good morning, Sarah. I\'m David.', spanish: 'Buenos días, Sarah. Soy David.' },
  { role: 'nurse', speaker: 'Nurse Sarah', english: 'Nice to meet you, David.', spanish: 'Mucho gusto, David.' },
  { role: 'patient', speaker: 'Nurse David', english: 'Nice to meet you too.', spanish: 'Igualmente.' },
  { role: 'nurse', speaker: 'Nurse Sarah', english: 'What\'s your last name?', spanish: '¿Cuál es su apellido?' },
  { role: 'patient', speaker: 'Nurse David', english: 'My last name is Smith. S-M-I-T-H.', spanish: 'Mi apellido es Smith. S-M-I-T-H.' },
  { role: 'nurse', speaker: 'Nurse Sarah', english: 'How old are you?', spanish: '¿Cuántos años tiene?' },
  { role: 'patient', speaker: 'Nurse David', english: 'I\'m 25 years old.', spanish: 'Tengo 25 años.' },
  { role: 'nurse', speaker: 'Nurse Sarah', english: 'What is your phone number?', spanish: '¿Cuál es su número de teléfono?' },
  { role: 'patient', speaker: 'Nurse David', english: 'My phone number is 312 456 7890.', spanish: 'Mi número de teléfono es 312 456 7890.' },
]

const m2Dialogue = [
  { role: 'nurseA', speaker: 'Nurse Andrea (Nurse A)', english: 'Good morning, Nurse Carlos. How is Mr. Thomas in room 204?', spanish: 'Buenos días, enfermero Carlos. ¿Cómo está el Sr. Thomas en la habitación 204?' },
  { role: 'nurseB', speaker: 'Nurse Carlos (Nurse B)', english: 'Good morning, Andrea. He is a tall, 68-year-old man. He feels tired today.', spanish: 'Buenos días, Andrea. Es un hombre alto de 68 años. Se siente cansado hoy.' },
  { role: 'nurseA', speaker: 'Nurse Andrea (Nurse A)', english: 'What happened to him yesterday?', spanish: '¿Qué le ocurrió ayer?' },
  { role: 'nurseB', speaker: 'Nurse Carlos (Nurse B)', english: 'Yesterday, he fell at the hotel and injured his right arm. He arrived at emergency at 9 PM.', spanish: 'Ayer se cayó en el hotel y se lastimó el brazo derecho. Llegó a urgencias a las 9 PM.' },
  { role: 'nurseA', speaker: 'Nurse Andrea (Nurse A)', english: 'Did the doctor confirm any fracture?', spanish: '¿El doctor confirmó alguna fractura?' },
  { role: 'nurseB', speaker: 'Nurse Carlos (Nurse B)', english: 'Yes, a minor fracture. His arm is swollen, but he has a bandage and is resting in bed now.', spanish: 'Sí, una fractura menor. Su brazo está hinchado, pero tiene un vendaje y está descansando en cama.' },
  { role: 'nurseA', speaker: 'Nurse Andrea (Nurse A)', english: 'Is room 204 quiet for his recovery?', spanish: '¿La habitación 204 está tranquila para su recuperación?' },
  { role: 'nurseB', speaker: 'Nurse Carlos (Nurse B)', english: 'Yes, the room is quiet and clean. He received painkillers and his vitals are stable.', spanish: 'Sí, la habitación está limpia y tranquila. Recibió analgésicos y sus signos vitales están estables.' },
]

const activeDialogue = computed(() => isModule2.value ? m2Dialogue : m1Dialogue)
const isStudyCompleted = computed(() => phaseProgress.value.estudio === 100)

function playVocabAudio(vocabItem) {
  playingVocabId.value = vocabItem.id
  speakEnglish(vocabItem.word)
  setTimeout(() => {
    playingVocabId.value = null
    vocabItem.played = true
    checkPhase2Completion()
  }, 1000)
}

function checkPhase2Completion() {
  const allPlayed = activeVocabList.value.every(v => v.played)
  if (allPlayed) {
    phaseProgress.value.estudio = 100
    saveProgress()
  }
}

function validateStudyPhase() {
  phaseProgress.value.estudio = 100
  saveProgress()
  goToPhase('practica')
}

// -----------------------------------------------------------------
// Phase 3 State: Practice & Voice Recorder
// -----------------------------------------------------------------

// Module 1 Practice 1: Profile Form
const profileForm = ref({ firstName: '', lastName: '', age: '', nationality: '', phone: '', email: '' })
const profileFormSuccess = ref(null)

function validateProfileForm() {
  const f = profileForm.value
  const fnOk = f.firstName.trim().toLowerCase().startsWith('i am') || f.firstName.trim().toLowerCase().startsWith('my name is')
  const lnOk = f.lastName.trim().toLowerCase().includes('is') || f.lastName.trim().toLowerCase().startsWith('my last name is')
  const ageOk = f.age.trim().toLowerCase().startsWith('i am') && f.age.trim().toLowerCase().includes('old')
  const natOk = f.nationality.trim().toLowerCase().startsWith('i am')
  const phoneOk = f.phone.trim().toLowerCase().includes('my phone number is') || f.phone.trim().replace(/\s/g,'').match(/^\d{7,}$/)
  const emailOk = f.email.trim().includes('@') && f.email.trim().length > 5

  profileFormSuccess.value = fnOk && lnOk && ageOk && natOk && phoneOk && emailOk
  checkPhase3Completion()
}

// Module 2 Practice 1: Listening & Nursing Notes Form
const m2Notes = ref({ fracture: '', yesterday: '', waitingRoom: '', bandage: '', swollen: '' })
const m2NotesSuccess = ref(null)
const drMillerPlaying = ref(false)

function playDrMillerReport() {
  drMillerPlaying.value = true
  const script = "Clinical report for Mr. Thomas in room 204. The patient fell yesterday at the hotel. In the waiting room, an X-ray confirmed an arm fracture. His right arm was swollen, so we applied a sterile bandage. Today he is resting in bed and vitals are stable."
  speakEnglish(script, 0.8)
  setTimeout(() => {
    drMillerPlaying.value = false
  }, 9000)
}

function validateM2Notes() {
  const n = m2Notes.value
  const fOk = n.fracture.trim().toLowerCase().includes('fracture')
  const yOk = n.yesterday.trim().toLowerCase().includes('yesterday')
  const wOk = n.waitingRoom.trim().toLowerCase().includes('waiting') || n.waitingRoom.trim().toLowerCase().includes('room')
  const bOk = n.bandage.trim().toLowerCase().includes('bandage')
  const sOk = n.swollen.trim().toLowerCase().includes('swollen')

  m2NotesSuccess.value = fOk && yOk && wOk && bOk && sOk
  checkPhase3Completion()
}

// Module 1 Practice 2: Spelling Tasks
const spellingTasks = [
  { text: 'john', audioText: 'J O H N', hint: 'Nombre: J-O-H-N' },
  { text: 'smith', audioText: 'S M I T H', hint: 'Apellido: S-M-I-T-H' },
  { text: 'brown', audioText: 'B R O W N', hint: 'Apellido: B-R-O-W-N' },
  { text: 'john.smith@gmail.com', audioText: 'J O H N dot S M I T H at G M A I L dot C O M', hint: 'Correo electrónico' },
  { text: '312-456-7890', audioText: '3 1 2 4 5 6 7 8 9 0', hint: 'Número telefónico' },
]
const spellingAnswers = ref(['', '', '', '', ''])
const spellingResults = ref([null, null, null, null, null])
const spellingAllCorrect = ref(false)

function playSpellingAudio(text) {
  speakEnglish(text, 0.65)
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

// Module 2 Practice 2: Room 204 Scene Dropdowns
const m2RoomScene = ref({
  s1_sub: '', s1_v: '', s1_comp: '',
  s2_sub: '', s2_v: '', s2_comp: '',
  s3_sub: '', s3_v: '', s3_comp: '',
  s4_sub: '', s4_v: '', s4_comp: ''
})
const m2RoomSceneSuccess = ref(null)

function validateM2RoomScene() {
  const r = m2RoomScene.value
  const s1Ok = r.s1_sub === 'The patient' && r.s1_v === 'is' && r.s1_comp === 'in the bed'
  const s2Ok = r.s2_sub === 'He' && r.s2_v === 'has' && r.s2_comp === 'a bandage on his arm'
  const s3Ok = r.s3_sub === 'The room' && r.s3_v === 'is' && r.s3_comp === 'quiet and clean'
  const s4Ok = r.s4_sub === 'His right arm' && r.s4_v === 'is' && r.s4_comp === 'swollen and painful'

  m2RoomSceneSuccess.value = s1Ok && s2Ok && s3Ok && s4Ok
  checkPhase3Completion()
}

// Voice Recorder State
const isRecording = ref(false)
const voiceRecorded = ref(false)
const recordingSeconds = ref(0)
const voicePreviewPlaying = ref(false)
let recorderInterval = null

async function toggleRecording() {
  if (isRecording.value) {
    isRecording.value = false
    if (recorderInterval) clearInterval(recorderInterval)
    voiceRecorded.value = true
    checkPhase3Completion()
  } else {
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

const isPracticeCompleted = computed(() => phaseProgress.value.practica === 100)

function checkPhase3Completion() {
  if (isModule2.value) {
    if (m2NotesSuccess.value === true && m2RoomSceneSuccess.value === true && voiceRecorded.value) {
      phaseProgress.value.practica = 100
    } else {
      phaseProgress.value.practica = 0
    }
  } else {
    if (profileFormSuccess.value === true && spellingAllCorrect.value === true && voiceRecorded.value) {
      phaseProgress.value.practica = 100
    } else {
      phaseProgress.value.practica = 0
    }
  }
  updatePhaseProgress()
}

function validatePracticePhase() {
  phaseProgress.value.practica = 100
  saveProgress()
  goToPhase('evaluacion')
}

// -----------------------------------------------------------------
// Phase 4 State: Exam Questions & Badges
// -----------------------------------------------------------------
const examAnswers = ref({})
const examPassed = ref(false)
const showBadgeAward = ref(false)
const examScoreMessage = ref('')

// Module 1 Exam Questions
const m1ExamQuestions = [
  { id: 'q1', question: 'Which greeting is correct for the morning?', options: ['Good night', 'Good morning', 'Goodbye', 'See you'], correct: 'Good morning' },
  { id: 'q2', question: 'Identify the VERB in: "I am a nurse."', options: ['I', 'am', 'a', 'nurse'], correct: 'am' },
  { id: 'q3', question: 'How do you ask someone for their name?', options: ['Where are you from?', 'How old are you?', 'What is your name?', 'What is your phone number?'], correct: 'What is your name?' },
  { id: 'q4', question: 'How do you spell the name JOHN?', options: ['G-O-H-N', 'J-O-H-N', 'J-O-N', 'J-H-O-N'], correct: 'J-O-H-N' },
  { id: 'q5', question: 'Which sentence is grammatically correct? (Subject + Verb + Complement)', options: ['Am Colombian I.', 'Colombian am I.', 'I am Colombian.', 'I Colombian am.'], correct: 'I am Colombian.' },
  { id: 'q6', question: 'What is the correct farewell used when leaving for the day?', options: ['Good morning', 'Nice to meet you', 'Goodbye', 'Good afternoon'], correct: 'Goodbye' },
]

// Module 2 Exam Questions (Mr. Thomas Case, Anatomy & Past Simple)
const m2ExamQuestions = [
  { id: 'm2_q1', question: 'What happened to Mr. Thomas yesterday?', options: ['He had knee surgery', 'He fell at the hotel and injured his arm', 'He caught a cold at the hospital', 'He visited a friend'], correct: 'He fell at the hotel and injured his arm' },
  { id: 'm2_q2', question: 'Identify the PAST SIMPLE verb in: "The patient arrived at the emergency room."', options: ['patient', 'arrived', 'emergency', 'room'], correct: 'arrived' },
  { id: 'm2_q3', question: 'Which descriptive adjective describes the state of Mr. Thomas\'s arm?', options: ['Tall', 'Swollen', 'Cold', 'Dizzy'], correct: 'Swollen' },
  { id: 'm2_q4', question: 'Complete the sentence: "He _____ a bandage on his right arm today."', options: ['has', 'fell', 'was', 'yesterday'], correct: 'has' },
  { id: 'm2_q5', question: 'Where is Mr. Thomas located according to the handover report?', options: ['In the waiting room', 'In room 204', 'In the pharmacy', 'At the hotel'], correct: 'In room 204' },
  { id: 'm2_q6', question: 'Which sentence correctly describes a past clinical event?', options: ['The room is quiet.', 'He is pale today.', 'He fell down and had an accident.', 'He has a clean bandage.'], correct: 'He fell down and had an accident.' },
]

const activeExamQuestions = computed(() => isModule2.value ? m2ExamQuestions : m1ExamQuestions)

function submitExam() {
  let correctCount = 0
  activeExamQuestions.value.forEach(q => {
    if (examAnswers.value[q.id] === q.correct) {
      correctCount++
    }
  })
  
  const pct = (correctCount / activeExamQuestions.value.length) * 100
  
  if (pct >= 75) {
    examPassed.value = true
    showBadgeAward.value = true
    phaseProgress.value.evaluacion = 100
    examScoreMessage.value = ''
    saveProgress()
  } else {
    examScoreMessage.value = `Calificación: ${Math.round(pct)}%. Necesitas al menos 75% (5 de 6 preguntas correctas) para aprobar. Intenta de nuevo.`
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
// Phase Navigation & Locks
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

function toggleSimulatedMediaFailure() {
  simulatedMediaFailure.value = !simulatedMediaFailure.value
  mediaWarningMessage.value = simulatedMediaFailure.value 
    ? 'Fallo al inicializar codec de audio/video. El módulo continuará en modo texto.' 
    : null
}

async function playVideo() {
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

// -----------------------------------------------------------------
// Dynamic DB Complementary Activities
// -----------------------------------------------------------------
const activeDbActivity = ref(null)
const activeDbSelectedAnswer = ref(null)
const activeDbTypedPhrase = ref('')
const activeDbFeedbackSuccess = ref(null)
const activeDbSelectedTerm = ref('')
const activeDbSelectedMeaning = ref('')
const activeDbMatchedPairs = ref([])
const activeDbRecording = ref(false)
const activeDbVoiceRecorded = ref(false)

function selectActiveDbActivity(act) {
  activeDbActivity.value = act
  activeDbFeedbackSuccess.value = null
  activeDbSelectedAnswer.value = null
  activeDbTypedPhrase.value = ''
  activeDbSelectedTerm.value = ''
  activeDbSelectedMeaning.value = ''
  activeDbMatchedPairs.value = []
  activeDbRecording.value = false
  activeDbVoiceRecorded.value = false
}

function resetActiveDbDemo() {
  activeDbFeedbackSuccess.value = null
  activeDbSelectedAnswer.value = null
  activeDbTypedPhrase.value = ''
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
  if (activeDbActivity.value?.listeningPhrase) {
    speakEnglish(activeDbActivity.value.listeningPhrase)
  }
}

function simulateActiveDbMicRecording() {
  activeDbRecording.value = !activeDbRecording.value
  if (activeDbRecording.value) {
    setTimeout(() => {
      activeDbRecording.value = false
      activeDbVoiceRecorded.value = true
    }, 2000)
  }
}

function validateActiveDbSubmission() {
  if (!activeDbActivity.value) return
  const act = activeDbActivity.value
  let success = false

  if (act.template === 'quiz' || act.template === 'preguntas') {
    if (activeDbSelectedAnswer.value === 'correct') success = true
  } else if (act.template === 'match') {
    if (activeDbMatchedPairs.value.includes(act.matchTerm)) success = true
  } else if (act.template === 'listening') {
    const phrase = (act.listeningPhrase || '').trim().toLowerCase()
    const entered = activeDbTypedPhrase.value.trim().toLowerCase()
    if (phrase && entered.includes(phrase)) success = true
  } else if (act.template === 'pronunciation') {
    if (activeDbVoiceRecorded.value) success = true
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
  saveProgress()
}

// -----------------------------------------------------------------
// LocalStorage Auto-Saving Progress (Specific to courseId)
// -----------------------------------------------------------------
const storageKey = computed(() => {
  const apprenticeId = auth.user?.id || 'guest'
  return `nursing_academy_progress_${apprenticeId}_course_${courseId.value}`
})

function saveProgress() {
  const state = {
    currentPhase: currentPhase.value,
    phaseProgress: phaseProgress.value,
    videoCompleted: videoCompleted.value,
    gameSuccess: gameSuccess.value,
    matchedPairs: matchedPairs.value,
    vocabPlayed: activeVocabList.value.map(v => ({ id: v.id, played: v.played })),
    profileForm: profileForm.value,
    profileFormSuccess: profileFormSuccess.value,
    spellingAnswers: spellingAnswers.value,
    spellingResults: spellingResults.value,
    spellingAllCorrect: spellingAllCorrect.value,
    m2Notes: m2Notes.value,
    m2NotesSuccess: m2NotesSuccess.value,
    m2RoomScene: m2RoomScene.value,
    m2RoomSceneSuccess: m2RoomSceneSuccess.value,
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
    if (!raw) {
      // Reset state for new course
      phaseProgress.value = { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 }
      currentPhase.value = 'inicio'
      videoCompleted.value = false
      gameSuccess.value = null
      matchedPairs.value = []
      voiceRecorded.value = false
      examPassed.value = false
      showBadgeAward.value = false
      examAnswers.value = {}
      return
    }
    const state = JSON.parse(raw)
    if (state.currentPhase) currentPhase.value = state.currentPhase
    if (state.phaseProgress) phaseProgress.value = state.phaseProgress
    if (state.videoCompleted !== undefined) videoCompleted.value = state.videoCompleted
    if (state.gameSuccess !== undefined) gameSuccess.value = state.gameSuccess
    if (state.matchedPairs) matchedPairs.value = state.matchedPairs
    if (state.vocabPlayed) {
      state.vocabPlayed.forEach(sp => {
        const item = activeVocabList.value.find(v => v.id === sp.id)
        if (item) item.played = sp.played
      })
    }
    if (state.profileForm) profileForm.value = state.profileForm
    if (state.profileFormSuccess !== undefined) profileFormSuccess.value = state.profileFormSuccess
    if (state.spellingAnswers) spellingAnswers.value = state.spellingAnswers
    if (state.spellingResults) spellingResults.value = state.spellingResults
    if (state.spellingAllCorrect !== undefined) spellingAllCorrect.value = state.spellingAllCorrect
    if (state.m2Notes) m2Notes.value = state.m2Notes
    if (state.m2NotesSuccess !== undefined) m2NotesSuccess.value = state.m2NotesSuccess
    if (state.m2RoomScene) m2RoomScene.value = state.m2RoomScene
    if (state.m2RoomSceneSuccess !== undefined) m2RoomSceneSuccess.value = state.m2RoomSceneSuccess
    if (state.voiceRecorded !== undefined) voiceRecorded.value = state.voiceRecorded
    if (state.examPassed !== undefined) examPassed.value = state.examPassed
    if (state.showBadgeAward !== undefined) showBadgeAward.value = state.showBadgeAward
    if (state.examAnswers) examAnswers.value = state.examAnswers
    if (state.completedActivityIds) completedActivityIds.value = state.completedActivityIds
  } catch (err) {
    console.error('Error loading progress:', err)
  }
}

watch(courseId, () => {
  loadProgress()
})

onMounted(async () => {
  await fetchDbActivities()
  loadProgress()
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
