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
          <span :class="`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            moduleNumber === 4 ? 'bg-emerald-100 text-emerald-700' :
            moduleNumber === 3 ? 'bg-amber-100 text-amber-700' :
            moduleNumber === 2 ? 'bg-indigo-100 text-indigo-700' : 
            'bg-teal-100 text-teal-700'
          }`">
            {{ currentCourseBadge }}
          </span>
        </div>
        <p class="text-xs text-gray-500">{{ currentCourseSubtitle }}</p>
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
            {{ currentCourseTitle }}
            <span :class="`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${
              moduleNumber === 4 ? 'bg-emerald-100 text-emerald-700' :
              moduleNumber === 3 ? 'bg-amber-100 text-amber-700' :
              moduleNumber === 2 ? 'bg-indigo-100 text-indigo-700' : 
              'bg-[#006688]/10 text-[#006688]'
            }`">
              {{ currentCourseBadge }}
            </span>
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ moduleNumber === 4
              ? 'Momento 1: ¡Mr. Thomas se va a casa! Completa el video de alta médica y el juego de calentamiento de verificación de estados clínicos.'
              : moduleNumber === 3
              ? 'Momento 1: ¡Tu turno ha comenzado! Completa el video introductorio y el juego de calentamiento de acciones clínicas y roles hospitalarios.'
              : moduleNumber === 2
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
                  {{ moduleNumber === 4 ? 'Video Clínico: ¡Mr. Thomas se va a casa! (Discharge Preparation)' : moduleNumber === 3 ? 'Video Clínico: ¡Tu turno en el hospital ha comenzado!' : moduleNumber === 2 ? 'Caso Clínico: Hospitalización de Mr. Thomas (Habitación 204)' : 'Video de Bienvenida: Nursing Basics Introduction' }}
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
                <span class="material-symbols-outlined text-8xl text-white/5">
                  {{ moduleNumber === 4 ? 'verified_user' : moduleNumber === 3 ? 'groups' : moduleNumber === 2 ? 'hotel' : 'clinical_notes' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Objectives Panel -->
          <div class="md:col-span-2 space-y-4 flex flex-col justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 class="font-black text-gray-800 text-sm">
              ¿Qué aprenderás? — Objetivos {{ currentCourseBadge }}
            </h4>
            
            <!-- Module 4 Objectives -->
            <ul v-if="moduleNumber === 4" class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
              <li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold mt-0.5">✓</span> Dar instrucciones y órdenes de alta médica (*Discharge Orders*)</li>
              <li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold mt-0.5">✓</span> Usar verbos modales para consejos de salud (*You must, You should*)</li>
              <li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold mt-0.5">✓</span> Reportar estados y resultados finales (*Vitals stable, Pain resolved*)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">💊</span> Vocabulario ocupacional (*Prescription, Painkiller, Follow-up*)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">📋</span> Evaluar y cerrar listas de verificación (*Nursing Checklist*)</li>
              <li class="flex items-start gap-1.5"><span class="text-teal-600 font-bold mt-0.5">🎓</span> Acceder al <strong>Post-Test Global</strong> de certificación</li>
            </ul>

            <!-- Module 3 Objectives -->
            <ul v-else-if="moduleNumber === 3" class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
              <li class="flex items-start gap-1.5"><span class="text-amber-600 font-bold mt-0.5">✓</span> Explicar procedimientos clínicos de rutina (Present Simple)</li>
              <li class="flex items-start gap-1.5"><span class="text-amber-600 font-bold mt-0.5">✓</span> Comunicar acciones en progreso en el momento (Present Continuous)</li>
              <li class="flex items-start gap-1.5"><span class="text-amber-600 font-bold mt-0.5">✓</span> Interactuar cortésmente con familiares y visitantes de pacientes</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">💡</span> Proponer mejoras en el flujo de trabajo laboral (*We should..., Let's...*)</li>
              <li class="flex items-start gap-1.5"><span class="text-[#006688] font-bold mt-0.5">🧰</span> Vocabulario técnico de herramientas médicas diarias (*Thermometer, Checklist*)</li>
              <li class="flex items-start gap-1.5"><span class="text-teal-600 font-bold mt-0.5">📋</span> Manejar listas de verificación clínica (*Nursing Checklist*)</li>
            </ul>

            <!-- Module 2 Objectives -->
            <ul v-else-if="moduleNumber === 2" class="text-xs text-gray-600 leading-relaxed space-y-1 mt-2 list-none">
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
              {{ moduleNumber === 4
                ? '"¡Mr. Thomas se va a casa! En este último módulo, aprenderás a dar instrucciones de alta médica, recomendaciones de cuidado en casa y a evaluar los resultados de tu trabajo analizando las listas de verificación en inglés."'
                : moduleNumber === 3
                ? '"¡Tu turno ha comenzado! En este módulo aprenderás a comunicarte con médicos, colegas y familiares de pacientes. Al final, podrás explicar procedimientos de rutina, interactuar con visitantes y proponer mejoras en tu entorno laboral."'
                : moduleNumber === 2 
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
              {{ moduleNumber === 4
                ? 'Warm-Up: Estados de Alta Médica — Empareja los estados con el criterio de la lista de verificación'
                : moduleNumber === 3
                ? 'Warm-Up: Acciones Rutinarias & Roles — Empareja cada acción con su destinatario'
                : moduleNumber === 2 
                ? 'Warm-Up: Hospital Shifts & Handover — Empareja los turnos con el saludo de relevo' 
                : 'Warm-Up: Greetings — Empareja el momento del día con su saludo' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ moduleNumber === 4
              ? 'Instrucción: Empareja el estado clínico del paciente a la izquierda con el indicador de la lista de verificación de alta a la derecha.'
              : moduleNumber === 3
              ? 'Instrucción: Empareja la acción rutinaria de enfermería de la izquierda con la persona o rol hospitalario correspondiente en la derecha.'
              : moduleNumber === 2 
              ? 'Instrucción: Empareja el horario y turno hospitalario de la izquierda con la expresión y saludo de relevo correspondiente en inglés.' 
              : 'Instrucción: Empareja el momento del día de la columna izquierda con el saludo correspondiente en inglés.' }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Left column -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                {{ moduleNumber === 4 ? 'Estado Clínico Final' : moduleNumber === 3 ? 'Acción Rutinaria de Enfermería' : moduleNumber === 2 ? 'Turno Hospitalario / Momento' : 'Momento del día' }}
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
                    {{ moduleNumber === 4 ? 'verified' : moduleNumber === 3 ? 'vital_signs' : (item.includes('Morning') || item === 'Sun' ? 'light_mode' : (item.includes('Afternoon') || item === 'Afternoon' ? 'wb_twilight' : 'dark_mode')) }}
                  </span>
                  <span>{{ item }}</span>
                </div>
                <span v-if="matchedPairs.includes(item)" class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
              </button>
            </div>

            <!-- Right column -->
            <div class="space-y-2">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                {{ moduleNumber === 4 ? 'Criterio de Checklist (Verificado)' : moduleNumber === 3 ? 'Persona o Rol Hospitalario' : moduleNumber === 2 ? 'Expresiones de Entrega de Turno' : 'Saludos en Inglés' }}
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
            {{ moduleNumber === 4
              ? 'Momento 2: Aprende a estructurar órdenes y consejos médicos con verbos modales (Medical Advice) y a reportar resultados finales de la lista de verificación (Reporting Results).'
              : moduleNumber === 3
              ? 'Momento 2: Explora el Presente Simple (rutinas) vs. Presente Continuo (acciones ahora), fórmulas de sugerencias de mejora, flashcards de herramientas médicas y el diálogo de atención.'
              : moduleNumber === 2 
              ? 'Momento 2: Explora el Pasado Simple vs. Adjetivos Descriptivos, interactúa con las flashcards de anatomía/hospital y analiza el Storybook de entrega de turno.' 
              : 'Momento 2: Explora la gramática básica, practica el vocabulario de saludos e información personal, y revisa el Storybook y el contexto de enfermería.' }}
          </p>
        </div>

        <!-- MODULE 4 GRAMMAR PILL: Medical Advice with Modals vs Reporting Results -->
        <div v-if="moduleNumber === 4" class="space-y-6">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">table_chart</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Medical Advice (Verbos Modales) vs. Reporting Results</h4>
          </div>
          <p class="text-xs text-gray-600">
            Aprende a dar órdenes e instrucciones terapéuticas usando <strong>You must</strong> (obligación estricta), <strong>You should</strong> (recomendación/consejo) y a reportar estados finales con <strong>Reporting Results</strong>.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            
            <!-- Column 1: Medical Advice -->
            <div class="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-700 text-lg">medical_information</span>
                  <span class="text-xs font-black text-emerald-900 uppercase tracking-wide">Medical Advice (Must / Should)</span>
                </div>
                <span class="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Instrucciones de alta</span>
              </div>
              <p class="text-[11px] text-emerald-800 font-medium">Usa modales para guiar el tratamiento del paciente en casa:</p>
              
              <div class="space-y-2">
                <div v-for="(item, idx) in m4AdviceExamples" :key="idx" class="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-emerald-800 font-black">{{ item.subject }}</span>
                      <span class="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-black mx-1 underline">{{ item.modal }}</span>
                      <span>{{ item.action }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Column 2: Reporting Results -->
            <div class="bg-teal-50/80 border border-teal-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-teal-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-teal-700 text-lg">verified</span>
                  <span class="text-xs font-black text-teal-900 uppercase tracking-wide">Reporting Results (Reporte Final)</span>
                </div>
                <span class="text-[10px] font-bold bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full">Evaluación de checklist</span>
              </div>
              <p class="text-[11px] text-teal-800 font-medium">Usa frases sencillas para confirmar que todo se cumplió con éxito:</p>
              
              <div class="space-y-2">
                <div v-for="(item, idx) in m4ResultsExamples" :key="idx" class="bg-white p-3 rounded-xl border border-teal-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-teal-800 font-black">{{ item.subject }}</span>
                      <span class="bg-teal-100 text-teal-900 px-1 py-0.5 rounded font-black mx-1">{{ item.verb }}</span>
                      <span>{{ item.complement }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-teal-700 hover:bg-teal-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- MODULE 3 GRAMMAR PILL -->
        <div v-else-if="moduleNumber === 3" class="space-y-6">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">table_chart</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Present Simple vs. Present Continuous & Sugerencias de Mejora</h4>
          </div>
          <p class="text-xs text-gray-600">
            Contrasta las rutinas diarias de enfermería (<strong>Daily Routine</strong>) con las acciones que ocurren en este momento (<strong>Happening Now</strong>) y aprende fórmulas de cortesía para sugerir mejoras.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-amber-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-700 text-lg">calendar_today</span>
                  <span class="text-xs font-black text-amber-900 uppercase tracking-wide">Daily Routine (Present Simple)</span>
                </div>
                <span class="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Rutinas laborales</span>
              </div>
              <div class="space-y-2">
                <div v-for="(item, idx) in m3RoutineExamples" :key="idx" class="bg-white p-3 rounded-xl border border-amber-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-amber-800 font-black">{{ item.subject }}</span>
                      <span class="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-black mx-1 underline">{{ item.verb }}</span>
                      <span>{{ item.complement }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-amber-700 hover:bg-amber-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-sky-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-sky-700 text-lg">pending_actions</span>
                  <span class="text-xs font-black text-sky-900 uppercase tracking-wide">Happening Now (Continuous)</span>
                </div>
                <span class="text-[10px] font-bold bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full">Acciones en progreso</span>
              </div>
              <div class="space-y-2">
                <div v-for="(item, idx) in m3ContinuousExamples" :key="idx" class="bg-white p-3 rounded-xl border border-sky-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-sky-700 font-black">{{ item.subject }}</span>
                      <span class="bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-black mx-1">{{ item.verb }}</span>
                      <span>{{ item.complement }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ item.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(item.full)" class="text-sky-600 hover:bg-sky-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODULE 2 GRAMMAR PILL -->
        <div v-else-if="moduleNumber === 2" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">table_chart</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Grammar Pill — Pasado Simple vs. Adjetivos Descriptivos (Caso Mr. Thomas)</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div class="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-purple-200 pb-2">
                <span class="text-xs font-black text-purple-900 uppercase">Patient's History (Past Simple)</span>
              </div>
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
                  <button @click="speakEnglish(item.full)" class="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg shrink-0">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span class="text-xs font-black text-emerald-900 uppercase">Current Status (Adjectives)</span>
              </div>
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
                  <button @click="speakEnglish(item.full)" class="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg shrink-0">
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
                {{ moduleNumber === 4
                  ? '2. Laboratorio de Vocabulario — Alta Médica, Prescripción y Evaluación (Discharge Summary)'
                  : moduleNumber === 3
                  ? '2. Laboratorio de Vocabulario — Herramientas de Uso Diario y Verbos de Acción Clínica'
                  : moduleNumber === 2 
                  ? '2. Laboratorio de Vocabulario — Flashcards (Partes del Cuerpo y Entorno Hospitalario)' 
                  : '2. Vocabulary Laboratory — Greetings, Farewells & Personal Information' }}
              </h4>
            </div>
            <span class="text-xs bg-[#006688]/5 text-[#006688] font-bold px-3 py-1 rounded-full">
              Escuchados: {{ activeVocabList.filter(v => v.played).length }} / {{ activeVocabList.length }}
            </span>
          </div>
          <p class="text-xs text-gray-600">
            {{ moduleNumber === 4
              ? 'Interactúa con las flashcards simulando una orden de alta y prescripción médica. Escucha la pronunciación técnica de cada término de egreso.'
              : moduleNumber === 3
              ? 'Interactúa con las flashcards de instrumentos clínicos y verbos de acción. Escucha la pronunciación correcta de cada herramienta médica.'
              : moduleNumber === 2 
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
              <div class="space-y-2">
                <div class="flex justify-between items-start">
                  <span class="text-base font-bold text-gray-800 flex items-center gap-1.5">
                    <span v-if="v.emoji" class="text-lg">{{ v.emoji }}</span>
                    {{ v.word }}
                  </span>
                  <span v-if="v.played" class="text-green-600 material-symbols-outlined text-sm">check_circle</span>
                </div>
                <div class="inline-flex items-center gap-1 text-[11px] font-bold text-[#006688] bg-[#006688]/8 px-2 py-0.5 rounded-md">
                  <span class="text-[9px] text-gray-400 font-bold uppercase">Pron:</span>
                  <span>{{ v.pronunciation }}</span>
                </div>
                <p class="text-xs text-gray-600 font-medium leading-snug">{{ v.translation }}</p>
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
              {{ moduleNumber === 4
                ? '3. Storybook — Cierre de Caso y Alta Médica (2 Escenas de Evaluación)'
                : moduleNumber === 3
                ? '3. Storybook — Atendiendo al Visitante y al Médico (2 Escenarios Reales)'
                : moduleNumber === 2 
                ? '3. Storybook — Recibo de Turno: Nurse Andrea & Nurse Carlos' 
                : '3. Storybook — Greetings and Presentations: Nurse & Nurse' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ moduleNumber === 4
              ? 'Observa cómo el enfermero le entrega las recomendaciones de alta a Mr. Thomas (Escena 1) y revisa el cierre del checklist con la Head Nurse (Escena 2).'
              : moduleNumber === 3
              ? 'Observa cómo el enfermero atiende cortésmente a la hija del paciente (Escena 1 - RAP 4) y propone una mejora en el checklist al Nurse Manager (Escena 2 - RAP 5).'
              : moduleNumber === 2 
              ? 'Observa la conversación dinámica de entrega de turno sobre el caso clínico de Mr. Thomas en la habitación 204.' 
              : 'Revisa la conversación de presentación entre dos enfermeras — un escenario real de inicio de turno.' }}
          </p>

          <div class="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4 max-h-[360px] overflow-y-auto">
            <div 
              v-for="(bubble, bIdx) in activeDialogue" 
              :key="bIdx" 
              :class="`flex gap-3 max-w-[85%] ${bubble.alignLeft ? 'mr-auto' : 'ml-auto flex-row-reverse'}`"
            >
              <div :class="`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ${bubble.avatarBg || 'bg-[#006688]'}`">
                {{ bubble.avatar || '👩‍⚕️' }}
              </div>
              <div :class="`p-3.5 rounded-2xl text-xs shadow-sm border leading-relaxed ${bubble.alignLeft ? 'bg-white text-gray-800 rounded-tl-none border-gray-100' : 'bg-emerald-50/80 text-gray-800 rounded-tr-none border-emerald-100'}`">
                <div class="flex items-center justify-between gap-4 mb-1">
                  <span class="font-bold text-[10px] uppercase tracking-widest text-gray-400">
                    {{ bubble.speaker }}
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
            Momento 3 — Práctica y Aplicación ({{ currentCourseBadge }})
          </h3>
          <p class="text-xs text-gray-500 mt-1">
            {{ moduleNumber === 4
              ? 'Completa el Discharge Summary escuchando las órdenes del médico, analiza el resultado de la lista de verificación y graba tus recomendaciones de alta.'
              : moduleNumber === 3
              ? 'Completa el Nursing Checklist digital, escucha las instrucciones del Dr. Smith y graba tu evidencia oral en dos misiones.'
              : moduleNumber === 2 
              ? 'Completa las notas de enfermería escuchando el reporte médico, describe la habitación de Mr. Thomas y graba tu entrega de turno (Handover Report).' 
              : 'Completa el perfil personal, realiza los deletreos y graba tu presentación personal como evidencia de aprendizaje.' }}
          </p>
        </div>

        <!-- MODULE 4 PRACTICE 1: Discharge Summary Form with Audio -->
        <div v-if="moduleNumber === 4" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">description</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Práctica Guiada 1 — Listening & Formato Digital "Discharge Summary"</h4>
          </div>
          <p class="text-xs text-gray-600">
            Escucha al médico dictando las órdenes finales de alta de Mr. Thomas y escribe exactamente las medicinas, dosis, descansos y cuidados para completar el resumen de egreso.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            
            <!-- Dr. Miller Audio Card -->
            <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div class="flex items-center gap-3">
                <button 
                  @click="playM4DoctorAudio" 
                  class="w-10 h-10 rounded-full bg-[#006688] text-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ m4DoctorPlaying ? 'pause' : 'play_arrow' }}
                  </span>
                </button>
                <div>
                  <span class="text-xs font-bold text-gray-800">Audio: Dr. Miller's Discharge Orders for Mr. Thomas</span>
                  <p class="text-[11px] text-gray-500">Instrucciones de medicamentos, descanso, vendaje y cita de control.</p>
                </div>
              </div>
              <button 
                @click="playM4DoctorAudio"
                type="button" 
                class="px-3 py-1.5 text-xs font-bold text-[#006688] bg-[#006688]/10 rounded-lg hover:bg-[#006688]/20 transition-all"
              >
                {{ m4DoctorPlaying ? 'Detener Audio' : 'Escuchar Órdenes de Alta' }}
              </button>
            </div>

            <!-- Digital Discharge Summary Form -->
            <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span class="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
                  Official Hospital Discharge Summary & Home Care Plan
                </span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Room 204 — Patient: Mr. Thomas</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[11px] font-bold text-gray-700">1. Tipo de medicamento prescrito para el dolor:</label>
                  <input type="text" v-model="m4Summary.painkiller" placeholder="e.g. painkiller / ibuprofen" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-bold text-gray-700">2. Frecuencia de la toma (e.g. every 8 hours):</label>
                  <input type="text" v-model="m4Summary.frequency" placeholder="every 8 hours" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-bold text-gray-700">3. Tiempo de reposo en casa recomendado (e.g. 3 days):</label>
                  <input type="text" v-model="m4Summary.restDays" placeholder="3 days" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-bold text-gray-700">4. Día de la cita de control (e.g. Monday):</label>
                  <input type="text" v-model="m4Summary.appointmentDay" placeholder="Monday" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="sm:col-span-2 space-y-1">
                  <label class="text-[11px] font-bold text-gray-700">5. Condición en la que debe mantenerse el vendaje:</label>
                  <input type="text" v-model="m4Summary.bandageCare" placeholder="clean and dry" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <button @click="validateM4Summary" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                  Verificar Resumen de Alta
                </button>
                <span v-if="m4SummarySuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  ¡Resumen de alta completado y verificado correctamente!
                </span>
                <span v-if="m4SummarySuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">cancel</span>
                  Revisa los datos tecleados (revisa: painkiller, every 8 hours, 3 days, Monday, clean and dry).
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- MODULE 4 PRACTICE 2: Checklist Analysis with Dropdowns -->
        <div v-if="moduleNumber === 4" class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">fact_check</span>
            <h4 class="font-bold text-gray-800 text-sm">2. Práctica Guiada 2 — Lectura y Análisis de Lista de Verificación (Checklist)</h4>
          </div>
          <p class="text-xs text-gray-600">
            Observa la lista de verificación final de Mr. Thomas y selecciona en cada menú desplegable las frases correctas en inglés que describan el resultado clínico del turno.
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            
            <!-- Real Filled Checklist Visual Banner -->
            <div class="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
                  <span class="text-xs font-bold uppercase tracking-widest text-emerald-300">Final Shift Checklist — All items verified</span>
                </div>
                <p class="text-sm font-semibold text-gray-200">
                  Presión 120/80 (Normal) · Dolor 1/10 (Resuelto) · Vendaje limpio y seco · Órdenes de alta firmadas por el Dr. Miller.
                </p>
              </div>
              <div class="flex gap-2">
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">🩺 Vitals OK</span>
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">✨ Pain low</span>
                <span class="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold">📋 Signed</span>
              </div>
            </div>

            <!-- 4 Dropdown Statements -->
            <div class="space-y-3">
              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">1. Signos vitales:</span>
                <select v-model="m4CheckAnalysis.s1" class="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Selecciona frase descriptiva --</option>
                  <option value="The vital signs are stable">The vital signs are stable</option>
                  <option value="The vital signs are high">The vital signs are high</option>
                </select>
              </div>

              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">2. Nivel de dolor:</span>
                <select v-model="m4CheckAnalysis.s2" class="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Selecciona frase descriptiva --</option>
                  <option value="The pain level is low and resolved">The pain level is low and resolved</option>
                  <option value="The pain is unbearable">The pain is unbearable</option>
                </select>
              </div>

              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">3. Estado del paciente:</span>
                <select v-model="m4CheckAnalysis.s3" class="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Selecciona frase descriptiva --</option>
                  <option value="The patient is ready for discharge">The patient is ready for discharge</option>
                  <option value="The patient is in emergency surgery">The patient is in emergency surgery</option>
                </select>
              </div>

              <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="text-gray-400 font-mono">4. Lista y órdenes médicas:</span>
                <select v-model="m4CheckAnalysis.s4" class="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none">
                  <option value="">-- Selecciona frase descriptiva --</option>
                  <option value="The discharge summary is signed and complete">The discharge summary is signed and complete</option>
                  <option value="The checklist is lost">The checklist is lost</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button @click="validateM4CheckAnalysis" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                Verificar Análisis de Checklist
              </button>
              <span v-if="m4CheckAnalysisSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Análisis de la lista de verificación correcto!
              </span>
              <span v-if="m4CheckAnalysisSuccess === false" class="text-red-600 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Revisa las frases seleccionadas.
              </span>
            </div>

          </div>
        </div>

        <!-- MODULE 3 PRACTICE 1 -->
        <div v-else-if="moduleNumber === 3" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">checklist</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Práctica Guiada 1 — Nursing Checklist Digital</h4>
          </div>
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-150">
                <span class="text-xs font-bold text-gray-700">1. Rutina de Signos Vitales (08:00 AM)</span>
                <div class="flex items-center gap-2">
                  <select v-model="m3Checklist.r1_action" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Acción --</option>
                    <option value="Check vital signs">Check vital signs</option>
                  </select>
                  <select v-model="m3Checklist.r1_tool" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Equipo --</option>
                    <option value="Blood pressure monitor & Thermometer">Blood pressure monitor & Thermometer</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-150">
                <span class="text-xs font-bold text-gray-700">2. Administración de Antibióticos (10:00 AM)</span>
                <div class="flex items-center gap-2">
                  <select v-model="m3Checklist.r2_action" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Acción --</option>
                    <option value="Administer medication">Administer medication</option>
                  </select>
                  <select v-model="m3Checklist.r2_tool" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Equipo --</option>
                    <option value="Syringe & Prescription chart">Syringe & Prescription chart</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-150">
                <span class="text-xs font-bold text-gray-700">3. Higiene y Bioseguridad</span>
                <div class="flex items-center gap-2">
                  <select v-model="m3Checklist.r3_action" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Acción --</option>
                    <option value="Disinfect equipment">Disinfect equipment</option>
                  </select>
                  <select v-model="m3Checklist.r3_tool" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Producto --</option>
                    <option value="Antiseptic wipes">Antiseptic wipes</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-150">
                <span class="text-xs font-bold text-gray-700">4. Monitoreo de Saturación de Oxígeno</span>
                <div class="flex items-center gap-2">
                  <select v-model="m3Checklist.r4_action" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Acción --</option>
                    <option value="Monitor oxygen level">Monitor oxygen level</option>
                  </select>
                  <select v-model="m3Checklist.r4_tool" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold bg-white focus:outline-none">
                    <option value="">-- Dispositivo --</option>
                    <option value="Pulse oximeter">Pulse oximeter</option>
                  </select>
                </div>
              </div>
            </div>
            <button @click="validateM3Checklist" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all shadow-xs">
              Verificar Checklist
            </button>
          </div>
        </div>

        <!-- MODULE 2 PRACTICE 1 -->
        <div v-else-if="moduleNumber === 2" class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">clinical_notes</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Práctica Guiada 1 — Listening & Completar Notas de Enfermería</h4>
          </div>
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
              <button @click="playDrMillerReport" class="px-3 py-1.5 text-xs font-bold text-[#006688] bg-[#006688]/10 rounded-lg hover:bg-[#006688]/20 transition-all">
                {{ drMillerPlaying ? 'Detener Audio' : 'Reproducir Audio' }}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" v-model="m2Notes.fracture" placeholder="1. fracture" class="px-3 py-2 border rounded-xl text-xs" />
              <input type="text" v-model="m2Notes.yesterday" placeholder="2. yesterday" class="px-3 py-2 border rounded-xl text-xs" />
              <input type="text" v-model="m2Notes.waitingRoom" placeholder="3. waiting room" class="px-3 py-2 border rounded-xl text-xs" />
              <input type="text" v-model="m2Notes.bandage" placeholder="4. bandage" class="px-3 py-2 border rounded-xl text-xs" />
              <input type="text" v-model="m2Notes.swollen" placeholder="5. swollen" class="px-3 py-2 border rounded-xl text-xs sm:col-span-2" />
            </div>
            <button @click="validateM2Notes" class="px-4 py-2 bg-[#006688] text-white text-xs font-bold rounded-xl">Verificar</button>
          </div>
        </div>

        <!-- MODULE 1 PRACTICE 1 -->
        <div v-else class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">edit_note</span>
            <h4 class="font-bold text-gray-800 text-sm">1. Guided Practice 1 — Complete the Profile</h4>
          </div>
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" v-model="profileForm.firstName" class="px-3 py-2 border rounded-xl text-xs" placeholder="First Name" />
              <input type="text" v-model="profileForm.lastName" class="px-3 py-2 border rounded-xl text-xs" placeholder="Last Name" />
              <input type="text" v-model="profileForm.age" class="px-3 py-2 border rounded-xl text-xs" placeholder="Age" />
            </div>
            <button @click="validateProfileForm" class="px-4 py-2 bg-[#006688] text-white text-xs font-bold rounded-xl">Verificar</button>
          </div>
        </div>

        <!-- Voice Recorder Challenge Component -->
        <div class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">mic</span>
            <h4 class="font-bold text-gray-800 text-sm">
              {{ moduleNumber === 4
                ? '3. El Desafío — Recomendaciones de Alta Médica y Reporte de Checklist'
                : moduleNumber === 3 
                ? '3. El Desafío — Intercambio Oral (Visitante y Propuesta de Mejora)' 
                : moduleNumber === 2 
                ? '3. El Desafío — Shift Handover Report (Nota de Voz de Entrega de Turno)' 
                : '3. Learning Evidence Challenge' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ moduleNumber === 4
              ? 'Graba un solo audio (máx. 1 minuto) asumiendo tu rol profesional: (1) Dale 2 recomendaciones de salud a Mr. Thomas usando modales (You must take..., You should rest...) y (2) Reporta en una frase que la lista de verificación ha sido completada con éxito.'
              : moduleNumber === 3
              ? 'Graba un solo audio (máx. 1 minuto) cumpliendo dos misiones: (1) Saluda a la familia indicando qué procedimiento ejecutas ahora y (2) Proponle una mejora a tu compañero en el checklist.'
              : moduleNumber === 2 
              ? 'Graba un audio de máximo 1 minuto simulando que le entregas el turno a tu supervisor: describe físicamente a Mr. Thomas y relata antecedentes en pasado.' 
              : 'Graba un audio de máximo 1 minuto presentándote a un paciente extranjero:' }}
            <br />
            <span class="block mt-2 bg-[#006688]/5 text-[#006688] p-3 rounded-xl border border-[#006688]/10 font-mono text-[11px] leading-relaxed">
              {{ moduleNumber === 4
                ? '🎤 Ejemplo: "Good morning Mr. Thomas. You must take your painkiller every 8 hours with water and you should rest your arm for 3 days. Head nurse, the patient\'s vital signs are stable and the discharge checklist is complete."'
                : moduleNumber === 3
                ? '🎤 Ejemplo: "Good afternoon. We are checking Mr. Thomas\'s vital signs right now. He is resting well. Also, colleague, I think we should update the digital checklist for room 204 to streamline our workflow. Let\'s do it today."'
                : moduleNumber === 2 
                ? '🎤 Ejemplo: "Good morning supervisor. Mr. Thomas is in room 204. Yesterday, he fell at the hotel. Today, he has a bandage on his arm and vitals are stable."' 
                : '🎤 Ejemplo: "Good morning. My name is John. My last name is Smith. S-M-I-T-H. My phone number is 312 456 7890. Nice to meet you."' }}
            </span>
          </p>

          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <!-- Controls -->
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

              <!-- Soundwave -->
              <div class="flex-1 max-w-[200px] h-8 flex items-center justify-center gap-0.5">
                <span 
                  v-for="bar in 10" 
                  :key="bar" 
                  class="w-1 bg-[#006688] rounded-full transition-all duration-75"
                  :style="`height: ${isRecording ? (20 + Math.random() * 80) : 15}%`"
                ></span>
              </div>

              <!-- Preview -->
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
            Responde el cuestionario para evaluar tus conocimientos y desbloquear tu insignia digital de {{ currentCourseBadge }}.
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
              {{ moduleNumber === 4 
                ? '🏆 Care Evaluator Badge — RAP 6' 
                : moduleNumber === 3 
                ? '🏆 Clinical Communicator Badge — RAP 4 y 5' 
                : moduleNumber === 2 
                ? '🏆 Handover Specialist Badge — RAP 2 y 3' 
                : '🏆 RAP 1 — Getting to Know Other People' }}
            </p>
            <p class="text-xs text-yellow-600 max-w-md mx-auto leading-relaxed">
              {{ moduleNumber === 4
                ? 'Has demostrado dominio en la emisión de órdenes de alta médica, recomendaciones de cuidado en el hogar con verbos modales y análisis de listas de verificación.'
                : moduleNumber === 3
                ? 'Has demostrado dominio en la comunicación clínica con visitantes y colegas, rutinas médicas, acciones en progreso y propuestas de mejora laboral.'
                : moduleNumber === 2 
                ? 'Has demostrado dominio en la descripción de pacientes hospitalizados, notas de enfermería, pasado simple clínico y entrega de turno en inglés.' 
                : 'Has demostrado que puedes saludar, presentarte, dar información personal y aplicar la estructura Subject + Verb + Complement en inglés.' }}
            </p>
          </div>
          <button @click="showBadgeAward = false" class="text-xs font-bold text-yellow-800 hover:underline">Entendido, cerrar</button>
        </div>

        <!-- Exam Questions Form -->
        <div v-if="!examPassed" class="space-y-6">
          <p class="text-xs text-gray-600">
            Deberás responder correctamente al menos <strong>5 de las 6 preguntas</strong> (75%) para aprobar el {{ currentCourseBadge }}.
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

            <span v-if="examScoreMessage" class="text-xs font-bold text-red-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">cancel</span>
              {{ examScoreMessage }}
            </span>
          </div>
        </div>

        <!-- Final Passed Screen -->
        <div v-if="examPassed" class="bg-green-50 border border-green-200 rounded-3xl p-8 text-center space-y-6">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
              <span class="material-symbols-outlined text-3xl font-bold">celebration</span>
            </div>
          </div>
          <div class="space-y-1">
            <h4 class="text-xl font-black text-green-800">
              🎉 ¡Has completado el {{ currentCourseTitle }}!
            </h4>
            <p class="text-xs text-green-700">
              {{ currentCourseBadge }} completado con éxito. ¡Felicitaciones por tu avance profesional!
            </p>
          </div>

          <!-- POST-TEST GLOBAL UNLOCKED BANNER (For Module 4) -->
          <div v-if="moduleNumber === 4" class="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white text-left shadow-lg space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-2xl text-yellow-300">workspace_premium</span>
                  <span class="text-xs font-black uppercase tracking-widest text-yellow-300">¡Ruta Formativa Completa!</span>
                </div>
                <h5 class="text-base font-black">POST-TEST GLOBAL — Certificación Nursing Academy</h5>
                <p class="text-xs text-gray-200 leading-relaxed">
                  Has completado exitosamente los 4 módulos (RAP 1 al RAP 6). Ahora puedes presentar el <strong>POST-TEST GLOBAL</strong> que evalúa desde el "Hello" del Módulo 1 hasta el "You must rest" del Módulo 4, midiendo tu progreso real frente al PRE-TEST inicial.
                </p>
              </div>
              <button 
                @click="openGlobalPostTest" 
                class="px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black text-xs rounded-xl shadow-md shrink-0 transition-transform hover:scale-105"
              >
                Presentar POST-TEST GLOBAL
              </button>
            </div>
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

    </div>

    <!-- POST-TEST GLOBAL MODAL -->
    <div v-if="showGlobalPostTestModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-2xl text-yellow-500">workspace_premium</span>
            <div>
              <h3 class="text-base font-black text-gray-800">POST-TEST GLOBAL DE EVALUACIÓN</h3>
              <p class="text-xs text-gray-500">Evaluación integradora de toda la ruta formativa (RAP 1 a RAP 6)</p>
            </div>
          </div>
          <button @click="showGlobalPostTestModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div v-if="!globalPostTestSubmitted" class="space-y-4">
          <p class="text-xs text-gray-600">
            Responde las siguientes preguntas representativas de cada uno de los 4 módulos para obtener tu calificación final global.
          </p>

          <div v-for="(q, idx) in globalQuestions" :key="q.id" class="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <span class="text-[10px] font-bold text-[#006688] uppercase tracking-wider">{{ q.moduleTag }}</span>
            <p class="text-xs font-bold text-gray-800">{{ idx + 1 }}. {{ q.question }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <button 
                v-for="opt in q.options" 
                :key="opt"
                @click="globalAnswers[q.id] = opt"
                :class="`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  globalAnswers[q.id] === opt ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button @click="showGlobalPostTestModal = false" class="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-gray-600">Cancelar</button>
            <button 
              @click="submitGlobalPostTest" 
              :disabled="Object.keys(globalAnswers).length < globalQuestions.length"
              class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow disabled:bg-gray-200 disabled:text-gray-400"
            >
              Calificar Post-Test Global
            </button>
          </div>
        </div>

        <div v-else class="text-center py-6 space-y-4">
          <div class="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <span class="material-symbols-outlined text-3xl">emoji_events</span>
          </div>
          <div class="space-y-1">
            <h4 class="text-lg font-black text-gray-800">¡Post-Test Global Completado!</h4>
            <p class="text-sm font-bold text-green-600">Tu calificación final: {{ globalScore }}%</p>
            <p class="text-xs text-gray-500 max-w-md mx-auto">
              Has demostrado tu progreso en inglés técnico de enfermería desde el análisis inicial hasta el egreso hospitalario. ¡Felicitaciones por culminar toda la ruta académica!
            </p>
          </div>
          <button @click="showGlobalPostTestModal = false" class="px-6 py-2.5 bg-[#006688] text-white font-bold text-xs rounded-xl shadow">Cerrar</button>
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

// Course Route State
const courseId = computed(() => route.params.courseId || '1')

const moduleNumber = computed(() => {
  const id = String(courseId.value)
  if (id === '4' || id === '6') return 4
  if (id === '3' || id === '5') return 3
  if (id === '2') return 2
  return 1
})

const currentCourseTitle = computed(() => {
  if (moduleNumber.value === 4) return 'Professional Practice'
  if (moduleNumber.value === 3) return 'Workplace Communication'
  if (moduleNumber.value === 2) return 'Work Life Interaction'
  return 'Getting to Know Other People'
})

const currentCourseSubtitle = computed(() => {
  if (moduleNumber.value === 4) return 'Módulo 4 — Fase Evaluación · RAP 6 (Instrucciones de Alta, Cuidado en Casa y Evaluación de Checklist)'
  if (moduleNumber.value === 3) return 'Módulo 3 — Fase Ejecución · RAP 4 y 5 (Comunicación con Médicos, Colegas y Familiares)'
  if (moduleNumber.value === 2) return 'Módulo 2 — Fase Planeación · RAP 2 y 3 (Caso Clínico Mr. Thomas)'
  return 'Módulo 1 — Fase Análisis · RAP 1 (Inglés Técnico Aplicado a la Enfermería)'
})

const currentCourseBadge = computed(() => {
  if (moduleNumber.value === 4) return 'Fase Evaluación · RAP 6'
  if (moduleNumber.value === 3) return 'Fase Ejecución · RAP 4 y 5'
  if (moduleNumber.value === 2) return 'Fase Planeación · RAP 2 y 3'
  return 'Fase Análisis · RAP 1'
})

// Tab Navigation Definition
const phases = [
  { id: 'inicio', name: 'Inicio (Preparación)', icon: 'flight_takeoff' },
  { id: 'estudio', name: 'Estudio (Absorción)', icon: 'menu_book' },
  { id: 'practica', name: 'Práctica', icon: 'edit' },
  { id: 'evaluacion', name: 'Evaluación (Cierre)', icon: 'check_circle' },
]

const currentPhase = ref('inicio')

// Media simulation
const simulatedMediaFailure = ref(false)
const mediaWarningMessage = ref(null)

// Phase Completion Progress values (0 to 100)
const phaseProgress = ref({
  inicio: 0,
  estudio: 0,
  practica: 0,
  evaluacion: 0,
})

const moduleProgress = computed(() => {
  const sum = Object.values(phaseProgress.value).reduce((a, b) => a + b, 0)
  return sum / Object.keys(phaseProgress.value).length
})

// Speech synthesis helper
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

// M2 warm-up items
const m2LeftItems = ['Morning Shift (07:00 AM)', 'Afternoon Shift (03:00 PM)', 'Night Shift (11:00 PM)']
const m2RightItems = ['Good morning, Nurse', 'Good afternoon, Team', 'Good evening, Shift']

// M3 warm-up items
const m3LeftItems = ['Check vital signs & blood pressure', 'Explain current procedure politely', 'Propose checklist improvements']
const m3RightItems = ['Patient in bed (Paciente)', 'Visitor / Family (Familia)', 'Nurse Manager / Doctor (Supervisor)']

// M4 warm-up items (Discharge Final States vs Checklist Verification Criteria)
const m4LeftItems = ['Vital signs stable', 'Pain resolved', 'Ready for discharge']
const m4RightItems = ['Pulse & BP Normal (Check)', 'Pain Scale < 2/10 (Check)', 'Medical Orders Signed (Check)']

const activeLeftItems = computed(() => {
  if (moduleNumber.value === 4) return m4LeftItems
  if (moduleNumber.value === 3) return m3LeftItems
  if (moduleNumber.value === 2) return m2LeftItems
  return m1LeftItems
})

const activeRightItems = computed(() => {
  if (moduleNumber.value === 4) return m4RightItems
  if (moduleNumber.value === 3) return m3RightItems
  if (moduleNumber.value === 2) return m2RightItems
  return m1RightItems
})

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
    let correctPairs = {}
    if (moduleNumber.value === 4) {
      correctPairs = {
        'Vital signs stable': 'Pulse & BP Normal (Check)',
        'Pain resolved': 'Pain Scale < 2/10 (Check)',
        'Ready for discharge': 'Medical Orders Signed (Check)'
      }
    } else if (moduleNumber.value === 3) {
      correctPairs = {
        'Check vital signs & blood pressure': 'Patient in bed (Paciente)',
        'Explain current procedure politely': 'Visitor / Family (Familia)',
        'Propose checklist improvements': 'Nurse Manager / Doctor (Supervisor)'
      }
    } else if (moduleNumber.value === 2) {
      correctPairs = {
        'Morning Shift (07:00 AM)': 'Good morning, Nurse',
        'Afternoon Shift (03:00 PM)': 'Good afternoon, Team',
        'Night Shift (11:00 PM)': 'Good evening, Shift'
      }
    } else {
      correctPairs = {
        'Sun': 'Good morning',
        'Afternoon': 'Good afternoon',
        'Moon': 'Good evening'
      }
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
  { text: 'Colombian. ', type: 'complement' }
]

const grammarLegend = [
  { id: 'subject', label: 'Sujeto (Subject)', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dotBg: 'bg-blue-500' },
  { id: 'verb', label: 'Verbo To Be (Verb)', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dotBg: 'bg-green-500' },
  { id: 'complement', label: 'Complemento (Complement)', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dotBg: 'bg-amber-500' }
]

// Module 2 Grammar Examples
const m2PastExamples = [
  { subject: 'He', verb: 'fell down', complement: 'at the hotel.', spanish: 'Él se cayó en el hotel.', full: 'He fell down at the hotel.' },
  { subject: 'He', verb: 'had', complement: 'an accident yesterday.', spanish: 'Él tuvo un accidente ayer.', full: 'He had an accident yesterday.' },
  { subject: 'The doctor', verb: 'examined', complement: 'his right arm.', spanish: 'El doctor examinó su brazo derecho.', full: 'The doctor examined his right arm.' },
]

const m2PresentExamples = [
  { subject: 'He', verb: 'is', adjective: 'pale and weak.', spanish: 'Él está pálido y débil.', full: 'He is pale and weak.' },
  { subject: 'His right arm', verb: 'is', adjective: 'swollen and painful.', spanish: 'Su brazo derecho está hinchado.', full: 'His right arm is swollen and painful.' },
]

// Module 3 Grammar Examples
const m3RoutineExamples = [
  { subject: 'I', verb: 'give', complement: 'medication at 8:00 AM every day.', spanish: 'Doy medicación a las 8:00 AM todos los días.', full: 'I give medication at 8:00 AM every day.' },
  { subject: 'The nurse', verb: 'records', complement: 'vital signs every two hours.', spanish: 'La enfermera registra signos vitales cada 2 horas.', full: 'The nurse records vital signs every two hours.' },
]

const m3ContinuousExamples = [
  { subject: 'I', verb: 'am checking', complement: 'the blood pressure now.', spanish: 'Estoy tomando la presión arterial ahora.', full: 'I am checking the blood pressure now.' },
  { subject: 'We', verb: 'are updating', complement: 'the digital nursing checklist.', spanish: 'Estamos actualizando el checklist digital.', full: 'We are updating the digital nursing checklist.' },
]

// Module 4 Grammar Examples (Medical Advice with Modals vs Reporting Results)
const m4AdviceExamples = [
  { subject: 'You', modal: 'must take', action: 'this painkiller every 8 hours with water.', spanish: 'Debe tomar este analgésico cada 8 horas con agua.', full: 'You must take this painkiller every 8 hours with water.' },
  { subject: 'You', modal: 'should rest', action: 'your right arm for at least three days.', spanish: 'Debería descansar su brazo derecho al menos 3 días.', full: 'You should rest your right arm for at least three days.' },
  { subject: 'You', modal: 'need to keep', action: 'the bandage clean and completely dry.', spanish: 'Necesita mantener el vendaje limpio y seco.', full: 'You need to keep the bandage clean and completely dry.' },
  { subject: 'You', modal: 'must attend', action: 'the follow-up appointment next Monday.', spanish: 'Debe asistir a la cita de control el próximo lunes.', full: 'You must attend the follow-up appointment next Monday.' },
]

const m4ResultsExamples = [
  { subject: 'The vital signs', verb: 'are', complement: 'stable and within normal limits.', spanish: 'Los signos vitales están estables dentro de límites normales.', full: 'The vital signs are stable and within normal limits.' },
  { subject: 'The patient', verb: 'is ready', complement: 'for hospital discharge today.', spanish: 'El paciente está listo para el alta médica hoy.', full: 'The patient is ready for hospital discharge today.' },
  { subject: 'The pain level', verb: 'is', complement: 'low and fully resolved.', spanish: 'El nivel de dolor es bajo y completamente resuelto.', full: 'The pain level is low and fully resolved.' },
  { subject: 'The nursing checklist', verb: 'is', complement: 'complete and signed by Dr. Miller.', spanish: 'La lista de verificación está completa y firmada.', full: 'The nursing checklist is complete and signed by Dr. Miller.' },
]

// Vocabulary Lists (Clear Spanish-friendly pronunciation guides)
const m1VocabList = ref([
  { id: 'v1', word: 'Hello', pronunciation: '[je-lóu]', translation: 'Hola (Saludo general)', category: 'Saludo', emoji: '👋', played: false },
  { id: 'v2', word: 'Good morning', pronunciation: '[gud mór-ning]', translation: 'Buenos días (hasta 12pm)', category: 'Saludo', emoji: '🌅', played: false },
  { id: 'v3', word: 'Good afternoon', pronunciation: '[gud áf-ter-nun]', translation: 'Buenas tardes (12pm–6pm)', category: 'Saludo', emoji: '☀️', played: false },
  { id: 'v4', word: 'Good evening', pronunciation: '[gud ív-ning]', translation: 'Buenas noches (al llegar)', category: 'Saludo', emoji: '🌆', played: false },
  { id: 'v5', word: 'Goodbye', pronunciation: '[gud-bái]', translation: 'Adiós (despedida formal)', category: 'Despedida', emoji: '🚶', played: false },
  { id: 'v6', word: 'See you later', pronunciation: '[si yu léi-ter]', translation: 'Hasta luego', category: 'Despedida', emoji: '👋', played: false },
  { id: 'v7', word: 'Name', pronunciation: '[néim]', translation: 'Nombre personal', category: 'Personal', emoji: '🪪', played: false },
  { id: 'v8', word: 'Last name', pronunciation: '[last néim]', translation: 'Apellido', category: 'Personal', emoji: '📋', played: false },
  { id: 'v9', word: 'Age', pronunciation: '[éidch]', translation: 'Edad en años', category: 'Personal', emoji: '🎂', played: false },
  { id: 'v10', word: 'Nationality', pronunciation: '[na-shon-á-li-ti]', translation: 'Nacionalidad u origen', category: 'Personal', emoji: '🌎', played: false },
  { id: 'v11', word: 'Phone number', pronunciation: '[fóun nám-ber]', translation: 'Número de teléfono', category: 'Personal', emoji: '📞', played: false },
  { id: 'v12', word: 'Spelling', pronunciation: '[spé-ling]', translation: 'Deletreo de letras', category: 'Habilidad', emoji: '🔤', played: false },
])

const m2VocabList = ref([
  { id: 'm2_v1', word: 'Head', pronunciation: '[jed]', translation: 'Cabeza (Anatomía)', category: 'Anatomía', emoji: '🧠', played: false },
  { id: 'm2_v2', word: 'Arm', pronunciation: '[arm]', translation: 'Brazo (Anatomía)', category: 'Anatomía', emoji: '💪', played: false },
  { id: 'm2_v3', word: 'Leg', pronunciation: '[leg]', translation: 'Pierna (Anatomía)', category: 'Anatomía', emoji: '🦵', played: false },
  { id: 'm2_v4', word: 'Chest', pronunciation: '[chest]', translation: 'Pecho / Tórax', category: 'Anatomía', emoji: '🫁', played: false },
  { id: 'm2_v5', word: 'Waiting room', pronunciation: '[wéi-ting rum]', translation: 'Sala de espera hospitalaria', category: 'Entorno', emoji: '🪑', played: false },
  { id: 'm2_v6', word: 'Stretcher', pronunciation: '[stré-cher]', translation: 'Camilla de traslado', category: 'Entorno', emoji: '🚑', played: false },
  { id: 'm2_v7', word: 'Hospital room', pronunciation: '[jós-pi-tal rum]', translation: 'Habitación de hospital (Room 204)', category: 'Entorno', emoji: '🏥', played: false },
  { id: 'm2_v8', word: 'Bandage', pronunciation: '[bán-didch]', translation: 'Vendaje elástico de protección', category: 'Tratamiento', emoji: '🩹', played: false },
  { id: 'm2_v9', word: 'Fracture', pronunciation: '[frák-chur]', translation: 'Fractura ósea confirmada', category: 'Diagnóstico', emoji: '🦴', played: false },
  { id: 'm2_v10', word: 'Swollen', pronunciation: '[suó-len]', translation: 'Hinchado / Inflamado', category: 'Signo clínico', emoji: '🔴', played: false },
  { id: 'm2_v11', word: 'Pale', pronunciation: '[péil]', translation: 'Pálido (Aspecto físico)', category: 'Signo clínico', emoji: '⚪', played: false },
  { id: 'm2_v12', word: 'Dizzy', pronunciation: '[dí-zi]', translation: 'Mareado / Inestable', category: 'Síntoma', emoji: '💫', played: false },
])

const m3VocabList = ref([
  { id: 'm3_v1', word: 'Thermometer', pronunciation: '[zer-mó-me-ter]', translation: 'Termómetro clínico', category: 'Herramienta', emoji: '🌡️', played: false },
  { id: 'm3_v2', word: 'Stethoscope', pronunciation: '[sté-zo-scoup]', translation: 'Estetoscopio de auscultación', category: 'Herramienta', emoji: '🩺', played: false },
  { id: 'm3_v3', word: 'Blood pressure monitor', pronunciation: '[blad pré-shur mó-ni-tor]', translation: 'Monitor de presión arterial', category: 'Herramienta', emoji: '📟', played: false },
  { id: 'm3_v4', word: 'Checklist', pronunciation: '[chék-list]', translation: 'Lista de verificación clínica', category: 'Formato', emoji: '📋', played: false },
  { id: 'm3_v5', word: 'Syringe', pronunciation: '[se-ríndch]', translation: 'Jeringa médica descartable', category: 'Herramienta', emoji: '💉', played: false },
  { id: 'm3_v6', word: 'Pulse oximeter', pronunciation: '[pals ok-sí-me-ter]', translation: 'Pulsioxímetro de saturación', category: 'Herramienta', emoji: '🔴', played: false },
  { id: 'm3_v7', word: 'IV Drip', pronunciation: '[ái-vi drip]', translation: 'Suero / Bomba de infusión', category: 'Equipo', emoji: '💧', played: false },
  { id: 'm3_v8', word: 'Administer', pronunciation: '[ad-mí-nis-ter]', translation: 'Administrar medicamentos', category: 'Acción', emoji: '💊', played: false },
  { id: 'm3_v9', word: 'Monitor', pronunciation: '[mó-ni-tor]', translation: 'Monitorear signos vitales', category: 'Acción', emoji: '📊', played: false },
  { id: 'm3_v10', word: 'Disinfect', pronunciation: '[dis-in-féct]', translation: 'Desinfectar instrumental', category: 'Acción', emoji: '🧼', played: false },
  { id: 'm3_v11', word: 'Explain', pronunciation: '[ex-pléin]', translation: 'Explicar procedimientos', category: 'Acción', emoji: '🗣️', played: false },
  { id: 'm3_v12', word: 'Gauze', pronunciation: '[goz]', translation: 'Gasa estéril de curación', category: 'Material', emoji: '🩹', played: false },
])

const m4VocabList = ref([
  { id: 'm4_v1', word: 'Discharge', pronunciation: '[dis-chárdch]', translation: 'Alta médica / Egreso hospitalario', category: 'Egreso', emoji: '📄', played: false },
  { id: 'm4_v2', word: 'Prescription', pronunciation: '[pris-críp-shon]', translation: 'Receta médica autorizada', category: 'Tratamiento', emoji: '💊', played: false },
  { id: 'm4_v3', word: 'Painkiller', pronunciation: '[péin-ki-ler]', translation: 'Analgésico para el dolor', category: 'Medicamento', emoji: '🩹', played: false },
  { id: 'm4_v4', word: 'Follow-up appointment', pronunciation: '[fó-lou-ap a-póint-ment]', translation: 'Cita de control y seguimiento', category: 'Atención', emoji: '📅', played: false },
  { id: 'm4_v5', word: 'Recovery', pronunciation: '[ri-kó-ve-ri]', translation: 'Recuperación clínica del paciente', category: 'Evolución', emoji: '🩺', played: false },
  { id: 'm4_v6', word: 'Outcomes', pronunciation: '[áut-cams]', translation: 'Resultados y desenlaces del cuidado', category: 'Evaluación', emoji: '📈', played: false },
  { id: 'm4_v7', word: 'Dosage', pronunciation: '[dóu-sidch]', translation: 'Dosis y posología indicada', category: 'Tratamiento', emoji: '💧', played: false },
  { id: 'm4_v8', word: 'Home care', pronunciation: '[jóum quer]', translation: 'Cuidado y reposo en el hogar', category: 'Egreso', emoji: '🏡', played: false },
  { id: 'm4_v9', word: 'Wound care', pronunciation: '[wund quer]', translation: 'Cuidado e higiene de la herida', category: 'Curación', emoji: '🩹', played: false },
  { id: 'm4_v10', word: 'Precautions', pronunciation: '[pri-có-shons]', translation: 'Precauciones de seguridad', category: 'Recomendación', emoji: '⚠️', played: false },
  { id: 'm4_v11', word: 'Side effects', pronunciation: '[sáid i-fécts]', translation: 'Efectos secundarios a vigilar', category: 'Seguridad', emoji: '🔍', played: false },
  { id: 'm4_v12', word: 'Signed orders', pronunciation: '[sáind ór-ders]', translation: 'Órdenes médicas firmadas', category: 'Documento', emoji: '✍️', played: false },
])

const activeVocabList = computed(() => {
  if (moduleNumber.value === 4) return m4VocabList.value
  if (moduleNumber.value === 3) return m3VocabList.value
  if (moduleNumber.value === 2) return m2VocabList.value
  return m1VocabList.value
})

const playingVocabId = ref(null)

// Dialogues
const m1Dialogue = [
  { speaker: 'Nurse Sarah', avatar: '👩‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Good morning. My name is Sarah.', spanish: 'Buenos días. Mi nombre es Sarah.' },
  { speaker: 'Nurse David', avatar: '👨‍⚕️', avatarBg: 'bg-indigo-600', alignLeft: false, english: 'Good morning, Sarah. I\'m David.', spanish: 'Buenos días, Sarah. Soy David.' },
]

const m2Dialogue = [
  { speaker: 'Nurse Andrea', avatar: '👩‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Good morning, Nurse Carlos. How is Mr. Thomas?', spanish: 'Buenos días, Carlos. ¿Cómo está Mr. Thomas?' },
  { speaker: 'Nurse Carlos', avatar: '👨‍⚕️', avatarBg: 'bg-indigo-600', alignLeft: false, english: 'He fell yesterday. He has a bandage and is resting.', spanish: 'Se cayó ayer. Tiene un vendaje y está descansando.' },
]

const m3Dialogue = [
  { speaker: 'Emma (Visitor)', avatar: '👩', avatarBg: 'bg-purple-600', alignLeft: true, english: 'Excuse me, nurse. How is my father doing?', spanish: 'Disculpe, enfermero. ¿Cómo está mi padre?' },
  { speaker: 'Nurse (You)', avatar: '👨‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: false, english: 'We are checking his blood pressure right now. He is resting well.', spanish: 'Estamos tomando su presión ahora. Está descansando bien.' },
]

const m4Dialogue = [
  { speaker: 'Nurse (You)', avatar: '👨‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Good morning, Mr. Thomas! Good news: you are ready for discharge today.', spanish: '¡Buenos días, Sr. Thomas! Buenas noticias: está listo para el alta médica hoy.' },
  { speaker: 'Mr. Thomas (Patient)', avatar: '👴', avatarBg: 'bg-emerald-700', alignLeft: false, english: 'Wonderful news! What are my instructions for home care?', spanish: '¡Maravillosa noticia! ¿Cuáles son mis instrucciones para el cuidado en casa?' },
  { speaker: 'Nurse (You)', avatar: '👨‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Mr. Thomas, you must take this painkiller every 8 hours. You should keep your arm rested for 3 days.', spanish: 'Sr. Thomas, debe tomar este analgésico cada 8 horas. Debería descansar el brazo por 3 días.' },
  { speaker: 'Mr. Thomas (Patient)', avatar: '👴', avatarBg: 'bg-emerald-700', alignLeft: false, english: 'Understood. When is my follow-up appointment?', spanish: 'Entendido. ¿Cuándo es mi cita de control?' },
  { speaker: 'Nurse (You)', avatar: '👨‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Your follow-up appointment is next Monday at 10:00 AM with Dr. Miller.', spanish: 'Su cita de control es el próximo lunes a las 10:00 AM con el Dr. Miller.' },
  { speaker: 'Head Nurse', avatar: '👩‍⚕️', avatarBg: 'bg-teal-700', alignLeft: false, english: 'Nurse, is the final checklist complete for room 204?', spanish: 'Enfermero, ¿la lista de verificación final de la habitación 204 está completa?' },
  { speaker: 'Nurse (You)', avatar: '👨‍⚕️', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Yes, Head Nurse. Vitals are stable, pain is resolved and medical orders are signed. He is ready.', spanish: 'Sí, jefa de enfermería. Los signos están estables, el dolor resuelto y las órdenes firmadas. Está listo.' },
]

const activeDialogue = computed(() => {
  if (moduleNumber.value === 4) return m4Dialogue
  if (moduleNumber.value === 3) return m3Dialogue
  if (moduleNumber.value === 2) return m2Dialogue
  return m1Dialogue
})

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

// Module 1 Practice 1
const profileForm = ref({ firstName: '', lastName: '', age: '' })
const profileFormSuccess = ref(null)
function validateProfileForm() {
  profileFormSuccess.value = profileForm.value.firstName.trim().length > 2
  checkPhase3Completion()
}

// Module 2 Practice 1
const m2Notes = ref({ fracture: '', yesterday: '', waitingRoom: '', bandage: '', swollen: '' })
const m2NotesSuccess = ref(null)
const drMillerPlaying = ref(false)
function playDrMillerReport() {
  drMillerPlaying.value = true
  speakEnglish("Mr. Thomas fell yesterday at the hotel. In the waiting room an X-ray confirmed a fracture. We applied a bandage to his swollen arm.", 0.8)
  setTimeout(() => { drMillerPlaying.value = false }, 7000)
}
function validateM2Notes() {
  m2NotesSuccess.value = m2Notes.value.fracture.toLowerCase().includes('fracture')
  checkPhase3Completion()
}

// Module 3 Practice 1
const m3Checklist = ref({ r1_action: '', r1_tool: '', r2_action: '', r2_tool: '', r3_action: '', r3_tool: '', r4_action: '', r4_tool: '' })
const m3ChecklistSuccess = ref(null)
function validateM3Checklist() {
  m3ChecklistSuccess.value = m3Checklist.value.r1_action === 'Check vital signs' && m3Checklist.value.r2_action === 'Administer medication'
  checkPhase3Completion()
}

// Module 4 Practice 1: Discharge Summary Form
const m4Summary = ref({ painkiller: '', frequency: '', restDays: '', appointmentDay: '', bandageCare: '' })
const m4SummarySuccess = ref(null)
const m4DoctorPlaying = ref(false)

function playM4DoctorAudio() {
  m4DoctorPlaying.value = true
  const script = "Official discharge orders for Mr. Thomas in room 204. Prescribe a painkiller to be taken every 8 hours with water. The patient should rest for 3 days at home and keep the arm bandage clean and dry. Schedule the follow-up appointment for next Monday at 10 AM."
  speakEnglish(script, 0.8)
  setTimeout(() => { m4DoctorPlaying.value = false }, 10000)
}

function validateM4Summary() {
  const s = m4Summary.value
  const pkOk = s.painkiller.trim().toLowerCase().includes('painkiller') || s.painkiller.trim().toLowerCase().includes('ibuprofen')
  const fqOk = s.frequency.trim().toLowerCase().includes('8')
  const rdOk = s.restDays.trim().toLowerCase().includes('3')
  const apOk = s.appointmentDay.trim().toLowerCase().includes('monday')
  const bcOk = s.bandageCare.trim().toLowerCase().includes('clean') || s.bandageCare.trim().toLowerCase().includes('dry')

  m4SummarySuccess.value = pkOk && fqOk && rdOk && apOk && bcOk
  checkPhase3Completion()
}

// Module 4 Practice 2: Checklist Analysis
const m4CheckAnalysis = ref({ s1: '', s2: '', s3: '', s4: '' })
const m4CheckAnalysisSuccess = ref(null)

function validateM4CheckAnalysis() {
  const a = m4CheckAnalysis.value
  const s1Ok = a.s1 === 'The vital signs are stable'
  const s2Ok = a.s2 === 'The pain level is low and resolved'
  const s3Ok = a.s3 === 'The patient is ready for discharge'
  const s4Ok = a.s4 === 'The discharge summary is signed and complete'

  m4CheckAnalysisSuccess.value = s1Ok && s2Ok && s3Ok && s4Ok
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
  setTimeout(() => { voicePreviewPlaying.value = false }, 2000)
}

const isPracticeCompleted = computed(() => phaseProgress.value.practica === 100)

function checkPhase3Completion() {
  if (moduleNumber.value === 4) {
    phaseProgress.value.practica = (m4SummarySuccess.value === true && m4CheckAnalysisSuccess.value === true && voiceRecorded.value) ? 100 : 0
  } else if (moduleNumber.value === 3) {
    phaseProgress.value.practica = (m3ChecklistSuccess.value === true && voiceRecorded.value) ? 100 : 0
  } else if (moduleNumber.value === 2) {
    phaseProgress.value.practica = (m2NotesSuccess.value === true && voiceRecorded.value) ? 100 : 0
  } else {
    phaseProgress.value.practica = (profileFormSuccess.value === true && voiceRecorded.value) ? 100 : 0
  }
  saveProgress()
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

const m1ExamQuestions = [
  { id: 'q1', question: 'Which greeting is correct for the morning?', options: ['Good night', 'Good morning', 'Goodbye', 'See you'], correct: 'Good morning' },
  { id: 'q2', question: 'Identify the VERB in: "I am a nurse."', options: ['I', 'am', 'a', 'nurse'], correct: 'am' },
  { id: 'q3', question: 'How do you ask someone for their name?', options: ['Where are you from?', 'How old are you?', 'What is your name?', 'What is your phone number?'], correct: 'What is your name?' },
  { id: 'q4', question: 'How do you spell the name JOHN?', options: ['G-O-H-N', 'J-O-H-N', 'J-O-N', 'J-H-O-N'], correct: 'J-O-H-N' },
  { id: 'q5', question: 'Which sentence is grammatically correct?', options: ['Am Colombian I.', 'Colombian am I.', 'I am Colombian.', 'I Colombian am.'], correct: 'I am Colombian.' },
  { id: 'q6', question: 'What is the correct farewell used when leaving for the day?', options: ['Good morning', 'Nice to meet you', 'Goodbye', 'Good afternoon'], correct: 'Goodbye' },
]

const m2ExamQuestions = [
  { id: 'm2_q1', question: 'What happened to Mr. Thomas yesterday?', options: ['He had knee surgery', 'He fell at the hotel and injured his arm', 'He caught a cold at the hospital', 'He visited a friend'], correct: 'He fell at the hotel and injured his arm' },
  { id: 'm2_q2', question: 'Identify the PAST SIMPLE verb in: "The patient arrived at the emergency room."', options: ['patient', 'arrived', 'emergency', 'room'], correct: 'arrived' },
  { id: 'm2_q3', question: 'Which descriptive adjective describes the state of Mr. Thomas\'s arm?', options: ['Tall', 'Swollen', 'Cold', 'Dizzy'], correct: 'Swollen' },
  { id: 'm2_q4', question: 'Complete the sentence: "He _____ a bandage on his right arm today."', options: ['has', 'fell', 'was', 'yesterday'], correct: 'has' },
  { id: 'm2_q5', question: 'Where is Mr. Thomas located according to the handover report?', options: ['In the waiting room', 'In room 204', 'In the pharmacy', 'At the hotel'], correct: 'In room 204' },
  { id: 'm2_q6', question: 'Which sentence correctly describes a past clinical event?', options: ['The room is quiet.', 'He is pale today.', 'He fell down and had an accident.', 'He has a clean bandage.'], correct: 'He fell down and had an accident.' },
]

const m3ExamQuestions = [
  { id: 'm3_q1', question: 'Which sentence describes an action happening RIGHT NOW?', options: ['I give medication at 8 AM.', 'I am checking the patient\'s blood pressure now.', 'We disinfect tools after each shift.', 'The doctor visits patients in the morning.'], correct: 'I am checking the patient\'s blood pressure now.' },
  { id: 'm3_q2', question: 'Which sentence describes a DAILY ROUTINE?', options: ['I am talking to the visitor.', 'We give medication at 8:00 AM every day.', 'The doctor is examining the patient right now.', 'We are updating the checklist.'], correct: 'We give medication at 8:00 AM every day.' },
  { id: 'm3_q3', question: 'How do you politely propose a workflow improvement to a colleague?', options: ['Do it right now.', 'I think we should update the digital checklist.', 'You are working slow.', 'Don\'t touch the checklist.'], correct: 'I think we should update the digital checklist.' },
  { id: 'm3_q4', question: 'Which medical tool is used to measure body temperature?', options: ['Stethoscope', 'Thermometer', 'Pulse oximeter', 'Syringe'], correct: 'Thermometer' },
  { id: 'm3_q5', question: 'What is the appropriate response to a visitor asking about a patient right now?', options: ['Go away please.', 'We are checking his vitals right now; he is resting comfortably.', 'I don\'t know him.', 'Come back tomorrow.'], correct: 'We are checking his vitals right now; he is resting comfortably.' },
  { id: 'm3_q6', question: 'Which instrument is used to measure blood oxygen saturation?', options: ['Pulse oximeter', 'Stethoscope', 'Checklist', 'Thermometer'], correct: 'Pulse oximeter' },
]

const m4ExamQuestions = [
  { id: 'm4_q1', question: 'Which modal verb indicates an essential medical obligation for taking medication?', options: ['You must take your medication.', 'You might visit.', 'You could ignore the pill.', 'You would sleep.'], correct: 'You must take your medication.' },
  { id: 'm4_q2', question: 'Which sentence gives polite medical advice for home care?', options: ['You should rest for three days.', 'You must work hard today.', 'Never rest.', 'You cannot leave.'], correct: 'You should rest for three days.' },
  { id: 'm4_q3', question: 'What does "Follow-up appointment" mean in nursing practice?', options: ['A hospital invoice', 'A scheduled return visit to evaluate recovery', 'An emergency surgery', 'A cafeteria reservation'], correct: 'A scheduled return visit to evaluate recovery' },
  { id: 'm4_q4', question: 'How do you report that all checks are finished and patient is stable?', options: ['The checklist is complete and vital signs are stable.', 'We forgot the checklist.', 'Patient is missing.', 'Checklist is not signed.'], correct: 'The checklist is complete and vital signs are stable.' },
  { id: 'm4_q5', question: 'What is a "Discharge Summary"?', options: ['A lunch recipe', 'The official medical document authorizing the patient to leave hospital', 'A job contract', 'A parking ticket'], correct: 'The official medical document authorizing the patient to leave hospital' },
  { id: 'm4_q6', question: 'Complete the home care advice: "You must keep the bandage _____ and clean."', options: ['dry', 'wet', 'dirty', 'swollen'], correct: 'dry' },
]

const activeExamQuestions = computed(() => {
  if (moduleNumber.value === 4) return m4ExamQuestions
  if (moduleNumber.value === 3) return m3ExamQuestions
  if (moduleNumber.value === 2) return m2ExamQuestions
  return m1ExamQuestions
})

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
    examScoreMessage.value = `Calificación: ${Math.round(pct)}%. Necesitas al menos 75% (5 de 6 correctas) para aprobar. Intenta de nuevo.`
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
// POST-TEST GLOBAL INTEGRATOR MODAL (All 4 Modules)
// -----------------------------------------------------------------
const showGlobalPostTestModal = ref(false)
const globalPostTestSubmitted = ref(false)
const globalAnswers = ref({})
const globalScore = ref(0)

const globalQuestions = [
  { id: 'gq1', moduleTag: 'MÓDULO 1 (RAP 1)', question: 'Which greeting is used in the morning?', options: ['Good morning', 'Good night', 'Goodbye'], correct: 'Good morning' },
  { id: 'gq2', moduleTag: 'MÓDULO 1 (RAP 1)', question: 'What is the correct structure of a basic sentence?', options: ['Subject + Verb + Complement', 'Verb + Subject + Complement', 'Complement + Verb'], correct: 'Subject + Verb + Complement' },
  { id: 'gq3', moduleTag: 'MÓDULO 2 (RAP 2 y 3)', question: 'How do you describe a past accident in hospital history?', options: ['He fell yesterday and had a fracture.', 'He is falling tomorrow.', 'He fall down now.'], correct: 'He fell yesterday and had a fracture.' },
  { id: 'gq4', moduleTag: 'MÓDULO 2 (RAP 2 y 3)', question: 'Which adjective describes a swollen limb?', options: ['Swollen', 'Fast', 'Tall'], correct: 'Swollen' },
  { id: 'gq5', moduleTag: 'MÓDULO 3 (RAP 4 y 5)', question: 'How do you describe an action happening right now to a visitor?', options: ['We are checking his blood pressure right now.', 'We checked him yesterday.', 'We check him next year.'], correct: 'We are checking his blood pressure right now.' },
  { id: 'gq6', moduleTag: 'MÓDULO 3 (RAP 4 y 5)', question: 'How do you politely suggest an improvement to your colleague?', options: ['I think we should update the digital checklist.', 'You must leave now.', 'Do not speak.'], correct: 'I think we should update the digital checklist.' },
  { id: 'gq7', moduleTag: 'MÓDULO 4 (RAP 6)', question: 'Which modal expresses a direct medical obligation?', options: ['You must take this painkiller every 8 hours.', 'You might take tea.', 'You would run.'], correct: 'You must take this painkiller every 8 hours.' },
  { id: 'gq8', moduleTag: 'MÓDULO 4 (RAP 6)', question: 'What is the final confirmation when evaluating the checklist?', options: ['The vital signs are stable and the checklist is complete.', 'The patient is not ready.', 'The doctor is lost.'], correct: 'The vital signs are stable and the checklist is complete.' },
]

function openGlobalPostTest() {
  globalAnswers.value = {}
  globalPostTestSubmitted.value = false
  showGlobalPostTestModal.value = true
}

function submitGlobalPostTest() {
  let count = 0
  globalQuestions.forEach(q => {
    if (globalAnswers.value[q.id] === q.correct) count++
  })
  globalScore.value = Math.round((count / globalQuestions.length) * 100)
  globalPostTestSubmitted.value = true
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
    m2Notes: m2Notes.value,
    m2NotesSuccess: m2NotesSuccess.value,
    m3Checklist: m3Checklist.value,
    m3ChecklistSuccess: m3ChecklistSuccess.value,
    m4Summary: m4Summary.value,
    m4SummarySuccess: m4SummarySuccess.value,
    m4CheckAnalysis: m4CheckAnalysis.value,
    m4CheckAnalysisSuccess: m4CheckAnalysisSuccess.value,
    voiceRecorded: voiceRecorded.value,
    examPassed: examPassed.value,
    showBadgeAward: showBadgeAward.value,
    examAnswers: examAnswers.value,
  }
  localStorage.setItem(storageKey.value, JSON.stringify(state))
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) {
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
    if (state.m2Notes) m2Notes.value = state.m2Notes
    if (state.m2NotesSuccess !== undefined) m2NotesSuccess.value = state.m2NotesSuccess
    if (state.m3Checklist) m3Checklist.value = state.m3Checklist
    if (state.m3ChecklistSuccess !== undefined) m3ChecklistSuccess.value = state.m3ChecklistSuccess
    if (state.m4Summary) m4Summary.value = state.m4Summary
    if (state.m4SummarySuccess !== undefined) m4SummarySuccess.value = state.m4SummarySuccess
    if (state.m4CheckAnalysis) m4CheckAnalysis.value = state.m4CheckAnalysis
    if (state.m4CheckAnalysisSuccess !== undefined) m4CheckAnalysisSuccess.value = state.m4CheckAnalysisSuccess
    if (state.voiceRecorded !== undefined) voiceRecorded.value = state.voiceRecorded
    if (state.examPassed !== undefined) examPassed.value = state.examPassed
    if (state.showBadgeAward !== undefined) showBadgeAward.value = state.showBadgeAward
    if (state.examAnswers) examAnswers.value = state.examAnswers
  } catch (err) {
    console.error('Error loading progress:', err)
  }
}

watch(courseId, () => {
  loadProgress()
})

onMounted(() => {
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
