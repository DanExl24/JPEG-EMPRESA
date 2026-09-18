<template>
  <div>
    <!-- POST-TEST GLOBAL MODAL -->
    <div v-if="modelValue" class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in print:p-0 print:bg-white print:static">
      <div class="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl border border-gray-100 print:shadow-none print:border-none print:max-w-none print:p-0">
        
        <!-- Modal Top Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
              <span class="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-black text-gray-800">POST-TEST GLOBAL DE EVALUACIÓN</h3>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Cierre de Ruta
                </span>
                <span v-if="isStaff" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">admin_panel_settings</span>
                  Modo Auditoría Docente
                </span>
              </div>
              <p class="text-xs text-gray-500">
                {{ isStaff 
                  ? 'Panel curricular para auditar, gestionar reactivos por RAP y simular la emisión del certificado.' 
                  : 'Evaluación integradora de toda la ruta formativa de enfermería (RAP 1 a RAP 6)' 
                }}
              </p>
            </div>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer self-end sm:self-auto">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- ======================================================== -->
        <!-- STAFF VIEW: TABS FOR QUESTIONS MANAGEMENT & SIMULATION   -->
        <!-- ======================================================== -->
        <div v-if="isStaff" class="flex items-center gap-2 border-b border-gray-100 pb-2">
          <button 
            @click="activeStaffTab = 'questions'"
            :class="`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStaffTab === 'questions'
                ? 'bg-[#006688] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`"
          >
            <span class="material-symbols-outlined text-base">format_list_bulleted</span>
            Gestión de Reactivos y RAPs ({{ questionsList.length }})
          </button>

          <button 
            @click="activeStaffTab = 'simulation'"
            :class="`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStaffTab === 'simulation'
                ? 'bg-[#006688] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`"
          >
            <span class="material-symbols-outlined text-base">science</span>
            Simulación y Certificado de Prueba
          </button>
        </div>

        <!-- ======================================================== -->
        <!-- TAB 1: CURRICULUM QUESTIONS & RAPS MANAGER (STAFF ONLY)  -->
        <!-- ======================================================== -->
        <div v-if="isStaff && activeStaffTab === 'questions'" class="space-y-6 animate-fade-in">
          <!-- Control Actions Header -->
          <div class="bg-gradient-to-r from-purple-50 via-blue-50 to-teal-50 p-4 rounded-2xl border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div class="space-y-0.5">
              <span class="font-black text-gray-800 flex items-center gap-1.5 text-sm">
                <span class="material-symbols-outlined text-purple-700 text-base">tune</span>
                Configuración del Banco de Reactivos Integradores
              </span>
              <p class="text-gray-600 text-xs">
                Asocia cada reactivo a su Resultado de Aprendizaje (RAP), define las opciones y marca cuál es la respuesta correcta/verdadera.
              </p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <button 
                @click="openAddQuestionModal" 
                class="px-3.5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">add</span>
                Nueva Pregunta
              </button>
              <button 
                @click="resetToDefaultQuestions" 
                class="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Restablecer los 10 reactivos clínicos originales estándar"
              >
                <span class="material-symbols-outlined text-sm">restart_alt</span>
                Restablecer Banco
              </button>
            </div>
          </div>

          <!-- RAP Filters -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-bold text-gray-500 mr-1">Filtrar por RAP:</span>
            <button 
              v-for="rapFilter in rapFilterOptions" 
              :key="rapFilter"
              @click="selectedRapFilter = rapFilter"
              :class="`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedRapFilter === rapFilter 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`"
            >
              {{ rapFilter }}
            </button>
          </div>

          <!-- Questions Cards List -->
          <div class="space-y-4">
            <div 
              v-for="(q, idx) in filteredQuestionsForStaff" 
              :key="q.id" 
              class="p-5 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-200 space-y-3 transition-all relative"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-black text-[#006688] bg-[#006688]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {{ q.moduleTag }}
                  </span>
                  <span class="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {{ q.rap || 'RAP Vinculado' }}
                  </span>
                  <span class="text-xs font-bold text-gray-600">· {{ q.title }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <button 
                    @click="openEditQuestionModal(q)" 
                    class="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#006688] border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    title="Editar reactivo, RAP y respuestas"
                  >
                    <span class="material-symbols-outlined text-xs">edit</span>
                    Editar
                  </button>
                  <button 
                    @click="deleteQuestion(q.id)" 
                    class="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    title="Eliminar este reactivo"
                  >
                    <span class="material-symbols-outlined text-xs">delete</span>
                  </button>
                </div>
              </div>

              <!-- Question Enunciation -->
              <p class="text-sm font-bold text-gray-800 leading-snug">
                {{ idx + 1 }}. {{ q.question }}
              </p>

              <!-- Audio Snippet Preview (if configured) -->
              <div v-if="q.hasAudio" class="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600 text-sm">hearing</span>
                  <span class="italic text-gray-700">"{{ q.audioText }}"</span>
                </div>
                <button 
                  @click="speakEnglish(q.audioText, 0.85)"
                  class="px-2.5 py-1 bg-[#006688] text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span class="material-symbols-outlined text-xs">volume_up</span>
                  Escuchar
                </button>
              </div>

              <!-- Options with Explicit True/Correct Marker -->
              <div class="space-y-1.5 pt-1">
                <div 
                  v-for="(opt, optIdx) in q.options" 
                  :key="optIdx"
                  :class="`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                    opt === q.correct
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span :class="`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      opt === q.correct ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-300'
                    }`">
                      {{ opt === q.correct ? '✓' : (optIdx + 1) }}
                    </span>
                    <span class="truncate">{{ opt }}</span>
                  </div>

                  <span 
                    :class="`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      opt === q.correct 
                        ? 'bg-emerald-200/80 text-emerald-900 flex items-center gap-1' 
                        : 'bg-gray-100 text-gray-400'
                    }`"
                  >
                    <span v-if="opt === q.correct" class="material-symbols-outlined text-[11px]">verified</span>
                    {{ opt === q.correct ? 'Respuesta Correcta' : 'Distractor' }}
                  </span>
                </div>
              </div>

              <!-- Pedagogical Explanation -->
              <div class="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-1.5">
                <span class="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">lightbulb</span>
                <div>
                  <span class="font-bold">Justificación Pedagógica:</span>
                  <span class="ml-1 text-amber-800">{{ q.explanation }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Staff Switch Button -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button 
              @click="closeModal" 
              class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-600 transition-all cursor-pointer"
            >
              Cerrar Auditoría
            </button>
            <button 
              @click="activeStaffTab = 'simulation'"
              class="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span class="material-symbols-outlined text-sm">science</span>
              Ir a Simulación de Evaluación
            </button>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- TAB 2 / LEARNER VIEW: POST-TEST EXECUTION / SIMULATION   -->
        <!-- ======================================================== -->
        <div v-else-if="!globalPostTestSubmitted" class="space-y-6 animate-fade-in">
          
          <!-- Staff Simulation Helper Bar -->
          <div v-if="isStaff" class="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div class="flex items-center gap-2 text-purple-900 font-bold">
                <span class="material-symbols-outlined text-purple-700 text-base">science</span>
                <span>Modo de Prueba Simulada (No consume datos de aprendices ni otorga XP real):</span>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button 
                  @click="runFastSimulation(100)"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Simular calificación sobresaliente"
                >
                  <span class="material-symbols-outlined text-xs">bolt</span>
                  Simular 100%
                </button>
                <button 
                  @click="runFastSimulation(80)"
                  class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Simular calificación competente"
                >
                  <span class="material-symbols-outlined text-xs">bolt</span>
                  Simular 80%
                </button>
              </div>
            </div>
          </div>

          <!-- Instructions & Progress Indicator -->
          <div class="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-teal-700 text-lg">info</span>
              <span class="text-gray-700 font-medium leading-relaxed">
                {{ isStaff 
                  ? 'Resuelve interactivamente el examen de prueba o utiliza las opciones de simulación rápida arriba.' 
                  : 'Responde las 10 preguntas representativas de los 4 módulos clínicos. Algunas incluyen audio para evaluar comprensión oral.' 
                }}
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-bold bg-white px-3 py-1.5 rounded-xl border border-teal-100 shadow-xs">
              <span class="text-gray-500">Progreso:</span>
              <span class="text-[#006688] font-black">{{ Object.keys(globalAnswers).length }} / {{ questionsList.length }}</span>
            </div>
          </div>

          <!-- Questions List for Exam/Simulation -->
          <div class="space-y-4">
            <div 
              v-for="(q, idx) in questionsList" 
              :key="q.id" 
              class="p-5 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 transition-all"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-black text-[#006688] bg-[#006688]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {{ q.moduleTag }}
                  </span>
                  <span v-if="q.rap" class="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {{ q.rap }}
                  </span>
                  <span class="text-xs font-bold text-gray-500">· {{ q.title }}</span>
                </div>
                <span v-if="globalAnswers[q.id]" class="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-xs">check</span> Respondida
                </span>
              </div>

              <!-- Question Text -->
              <p class="text-sm font-bold text-gray-800 leading-snug">
                {{ idx + 1 }}. {{ q.question }}
              </p>

              <!-- Audio Clip if configured -->
              <div v-if="q.hasAudio" class="p-3 bg-white rounded-xl border border-blue-100 flex items-center justify-between gap-3 shadow-xs">
                <div class="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <span class="material-symbols-outlined text-base text-blue-600">hearing</span>
                  <span>Audio Clínico Simulado:</span>
                  <span class="italic text-gray-600 font-medium">"{{ q.audioText }}"</span>
                </div>
                <button 
                  @click="speakEnglish(q.audioText, 0.85)"
                  class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">volume_up</span>
                  Escuchar Audio
                </button>
              </div>

              <!-- Options Grid -->
              <div class="grid grid-cols-1 gap-2 pt-1">
                <button 
                  v-for="opt in q.options" 
                  :key="opt"
                  @click="globalAnswers[q.id] = opt"
                  :class="`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    globalAnswers[q.id] === opt 
                      ? 'bg-[#006688] text-white border-[#006688] shadow-sm' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`"
                >
                  <span :class="`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                    globalAnswers[q.id] === opt ? 'border-white bg-white text-[#006688]' : 'border-gray-300 text-gray-400'
                  }`">
                    {{ globalAnswers[q.id] === opt ? '✓' : '' }}
                  </span>
                  <span class="leading-relaxed">{{ opt }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <button 
              @click="closeModal" 
              class="w-full sm:w-auto px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-600 transition-all cursor-pointer"
            >
              Cerrar por ahora
            </button>
            <button 
              @click="submitGlobalPostTest" 
              :disabled="Object.keys(globalAnswers).length < questionsList.length || isSubmittingPostTest"
              class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span v-if="isSubmittingPostTest" class="material-symbols-outlined text-sm animate-spin">sync</span>
              <span v-else class="material-symbols-outlined text-sm">verified</span>
              {{ isStaff ? 'Calificar Simulación y Generar Certificado de Prueba' : 'Calificar y Certificar Post-Test Global' }}
            </button>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- RESULTS & CONTRAST DASHBOARD (ACTIVE AFTER SUBMISSION)   -->
        <!-- ======================================================== -->
        <div v-else class="space-y-6 animate-fade-in">
          
          <!-- Staff Simulation Notice Banner -->
          <div v-if="isStaff" class="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-2 text-xs text-purple-950">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-purple-700 text-base">info</span>
              <span class="font-bold">Modo Simulación: Este resultado es una auditoría interna de prueba. No se alteró la base de datos de estudiantes ni tus puntos XP.</span>
            </div>
            <button 
              @click="resetSimulation" 
              class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0"
            >
              Reiniciar Simulación
            </button>
          </div>

          <!-- Top Celebratory Badge -->
          <div class="bg-gradient-to-br from-emerald-700 via-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg relative overflow-hidden">
            <div class="w-20 h-20 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-300/30">
              <span class="material-symbols-outlined text-4xl">emoji_events</span>
            </div>
            <div class="space-y-1">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black tracking-widest uppercase">
                🎓 Certificación de Ruta Formativa
              </div>
              <h4 class="text-2xl font-black text-white">
                {{ isStaff ? 'Auditoría Culminada · Simulación del POST-TEST GLOBAL' : '¡Felicitaciones! Has Superado el POS-TEST GLOBAL' }}
              </h4>
              <p class="text-xs text-teal-100 max-w-xl mx-auto leading-relaxed">
                {{ isStaff 
                  ? 'Se han validado los reactivos pedagógicos de todos los RAPs clínicos y verificado la emisión formal del diploma.' 
                  : 'Has demostrado competencia técnica comunicativa en inglés clínico desde la admisión y triaje hasta la entrega de turno y las órdenes de alta médica.' 
                }}
              </p>
            </div>

            <!-- Pre-Test vs Post-Test Comparative Metric Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-2xl mx-auto">
              <div class="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 text-center">
                <span class="text-[10px] uppercase font-bold text-teal-200 block">Diagnóstico Inicial (PRE-TEST)</span>
                <span class="text-2xl font-black text-gray-200 mt-1 block">{{ preTestBaseline }}%</span>
                <span class="text-[10px] text-teal-200">Línea base de entrada</span>
              </div>
              <div class="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 text-center">
                <span class="text-[10px] uppercase font-bold text-amber-300 block">Evaluación Final (POST-TEST)</span>
                <span class="text-2xl font-black text-yellow-300 mt-1 block">{{ globalScore }}%</span>
                <span class="text-[10px] text-teal-100">{{ isStaff ? 'Puntaje de prueba' : 'Resultado certificado' }}</span>
              </div>
              <div class="bg-emerald-500/20 backdrop-blur-xs p-4 rounded-2xl border border-emerald-400/40 text-center">
                <span class="text-[10px] uppercase font-black text-emerald-300 block">Crecimiento Pedagógico</span>
                <span class="text-2xl font-black text-emerald-300 mt-1 block">+{{ growthDelta }}%</span>
                <span class="text-[10px] text-emerald-200 font-bold">Ganancia de competencia</span>
              </div>
            </div>
          </div>

          <!-- Module-by-Module Competency Breakdown (RAP 1 to RAP 6) -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h5 class="text-sm font-black text-gray-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#006688] text-base">analytics</span>
              Desglose de Dominio por Resultados de Aprendizaje (RAP)
            </h5>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- M1 -->
              <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1.5">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-gray-700">Módulo 1 · RAP 1 (Saludos & Admisión)</span>
                  <span class="text-[#006688]">{{ moduleBreakdown.m1 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-[#006688] h-2 rounded-full transition-all" :style="`width: ${moduleBreakdown.m1}%`"></div>
                </div>
              </div>
              <!-- M2 -->
              <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1.5">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-gray-700">Módulo 2 · RAP 2 y 3 (Mr. Thomas & Handover)</span>
                  <span class="text-indigo-600">{{ moduleBreakdown.m2 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all" :style="`width: ${moduleBreakdown.m2}%`"></div>
                </div>
              </div>
              <!-- M3 -->
              <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1.5">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-gray-700">Módulo 3 · RAP 4 y 5 (Rutinas & Instrumental)</span>
                  <span class="text-amber-600">{{ moduleBreakdown.m3 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-amber-500 h-2 rounded-full transition-all" :style="`width: ${moduleBreakdown.m3}%`"></div>
                </div>
              </div>
              <!-- M4 -->
              <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1.5">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-gray-700">Módulo 4 · RAP 6 (Alta Médica & Checklists)</span>
                  <span class="text-emerald-600">{{ moduleBreakdown.m4 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-emerald-600 h-2 rounded-full transition-all" :style="`width: ${moduleBreakdown.m4}%`"></div>
                </div>
              </div>
            </div>

            <!-- Gamification Bonus Banner -->
            <div class="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🎓</span>
                <div>
                  <p class="text-xs font-black text-amber-900">
                    {{ isStaff ? 'Insignia Digital Asociada: "Graduado Bilingüe"' : 'Insignia Desbloqueada: "Graduado Bilingüe"' }}
                  </p>
                  <p class="text-[11px] text-amber-700">
                    {{ isStaff 
                      ? 'Los aprendices obtienen +150 XP al completar esta evaluación y emitir su diploma.' 
                      : '+150 XP acreditados a tu cuenta académica por culminación de ruta.' 
                    }}
                  </p>
                </div>
              </div>
              <span class="material-symbols-outlined text-amber-500 text-2xl">verified</span>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button 
              @click="isStaff ? resetSimulation() : closeModal()" 
              class="w-full sm:w-auto px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-600 transition-all cursor-pointer"
            >
              {{ isStaff ? 'Volver a Gestionar Reactivos' : 'Cerrar Resumen' }}
            </button>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button 
                @click="showCertificateModal = true" 
                class="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">workspace_premium</span>
                {{ isStaff ? 'Ver Certificado Simulado' : 'Ver Mi Diploma Oficial' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ======================================================== -->
    <!-- EDIT / ADD QUESTION MODAL FOR STAFF                      -->
    <!-- ======================================================== -->
    <div v-if="showQuestionEditorModal" class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-[60] animate-fade-in overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#006688] text-xl">edit_note</span>
            <h4 class="text-base font-black text-gray-800">
              {{ isCreatingQuestion ? 'Agregar Nuevo Reactivo Clínico' : 'Editar Reactivo Pedagógico' }}
            </h4>
          </div>
          <button @click="showQuestionEditorModal = false" class="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveQuestionForm" class="space-y-4 text-xs">
          <!-- Módulo y RAP selector -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Módulo Formativo:</label>
              <select v-model="editForm.moduleKey" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-[#006688]">
                <option value="m1">Módulo 1 · Analysis Phase</option>
                <option value="m2">Módulo 2 · Planning Phase</option>
                <option value="m3">Módulo 3 · Execution Phase</option>
                <option value="m4">Módulo 4 · Evaluation Phase</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 mb-1">Resultado de Aprendizaje (RAP):</label>
              <select v-model="editForm.rap" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-[#006688]">
                <option value="RAP 1">RAP 1 (Saludos & Admisión Hospitalaria)</option>
                <option value="RAP 2">RAP 2 (Antecedentes & Caso Clínico Mr. Thomas)</option>
                <option value="RAP 3">RAP 3 (Entrega de Turno & Comprensión Oral)</option>
                <option value="RAP 4">RAP 4 (Rutinas, Instrumental & Present Continuous)</option>
                <option value="RAP 5">RAP 5 (Propuestas de Mejora & Trabajo en Equipo)</option>
                <option value="RAP 6">RAP 6 (Instrucciones de Alta & Checklists)</option>
              </select>
            </div>
          </div>

          <!-- Título temático -->
          <div>
            <label class="block font-bold text-gray-700 mb-1">Título de Competencia / Tema:</label>
            <input 
              v-model="editForm.title" 
              type="text" 
              required 
              placeholder="Ej: Interacción Inicial y Saludos Formales" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-[#006688]"
            />
          </div>

          <!-- Enunciado de la pregunta -->
          <div>
            <label class="block font-bold text-gray-700 mb-1">Enunciado de la Pregunta en Inglés:</label>
            <textarea 
              v-model="editForm.question" 
              rows="2" 
              required 
              placeholder="Ej: How should a nurse professionally greet a new foreign patient during clinical admission?" 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-[#006688]"
            ></textarea>
          </div>

          <!-- Audio Opcional -->
          <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-blue-900">
              <input type="checkbox" v-model="editForm.hasAudio" class="rounded text-[#006688]" />
              <span>¿Incluye prueba de comprensión oral con Audio Clínico?</span>
            </label>
            <div v-if="editForm.hasAudio" class="space-y-1">
              <label class="text-[11px] font-semibold text-blue-800 block">Texto del audio (Se pronunciará en inglés):</label>
              <input 
                v-model="editForm.audioText" 
                type="text" 
                placeholder="Ej: Mr. Thomas received 500 milligrams of oral analgesics at eight o'clock." 
                class="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <!-- Opciones y Marcación de la Correcta -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-gray-800">Opciones de Respuesta (Marca la casilla de la CORRECTA):</label>
              <span class="text-[11px] text-gray-500 font-semibold">Selecciona la opción verdadera</span>
            </div>

            <div v-for="(opt, idx) in editForm.options" :key="idx" class="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
              <input 
                type="radio" 
                name="correctOptionRadio" 
                :value="idx" 
                v-model="editForm.correctIndex" 
                class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                title="Marcar como respuesta correcta"
              />
              <input 
                v-model="editForm.options[idx]" 
                type="text" 
                required 
                :placeholder="`Opción ${idx + 1}`" 
                :class="`flex-1 p-2 rounded-lg text-xs border font-medium ${
                  editForm.correctIndex === idx ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-gray-200'
                }`"
              />
              <span 
                :class="`text-[10px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ${
                  editForm.correctIndex === idx ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-400'
                }`"
              >
                {{ editForm.correctIndex === idx ? 'Correcta ✓' : 'Distractor' }}
              </span>
            </div>
          </div>

          <!-- Justificación / Explicación -->
          <div>
            <label class="block font-bold text-gray-700 mb-1">Justificación Pedagógica / Retroalimentación:</label>
            <input 
              v-model="editForm.explanation" 
              type="text" 
              required 
              placeholder="Ej: Saludo formal y respetuoso estándar según protocolo hospitalario." 
              class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:border-[#006688]"
            />
          </div>

          <!-- Botones de Acción del Formulario -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button 
              type="button" 
              @click="showQuestionEditorModal = false" 
              class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl font-black shadow-md cursor-pointer transition-all"
            >
              Guardar Reactivo
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- CERTIFICATE / DIPLOMA MODAL (Imprimible y Descargable)   -->
    <!-- ======================================================== -->
    <div 
      v-if="showCertificateModal" 
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-[70] animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
      @click.self="showCertificateModal = false"
    >
      <div class="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] my-auto flex flex-col shadow-2xl relative border border-amber-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:max-h-none print:p-0">
        
        <!-- Header: Siempre visible en la parte superior (Hidden during print) -->
        <div class="flex justify-between items-center px-6 py-3.5 border-b border-gray-100 shrink-0 bg-white print:hidden">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-xl">workspace_premium</span>
            <span class="text-xs font-black uppercase tracking-wider text-gray-700">
              {{ isStaff ? 'Constancia Oficial de Culminación de Ruta (Simulación de Auditoría)' : 'Constancia Oficial de Culminación de Ruta' }}
            </span>
          </div>
          <button 
            @click="showCertificateModal = false" 
            class="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border border-gray-200 shadow-2xs"
            title="Cerrar certificado"
          >
            <span class="material-symbols-outlined text-base">close</span>
            <span>Cerrar</span>
          </button>
        </div>

        <!-- Scrollable Middle Body (Garantiza adaptación perfecta en cualquier resolución) -->
        <div class="overflow-y-auto p-4 sm:p-6 flex-1 bg-amber-50/20">
          <!-- CERTIFICATE BODY (PRINTABLE AREA) -->
          <div id="printableCertificate" class="p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-300 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 text-center space-y-4 sm:space-y-5 relative overflow-hidden shadow-sm bg-white">
            
            <!-- Watermark -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span class="material-symbols-outlined text-[240px]">local_hospital</span>
            </div>

            <!-- Header Logos & Branding -->
            <div class="flex items-center justify-between border-b border-amber-200/80 pb-3 relative z-10">
              <div class="text-left">
                <span class="text-xs sm:text-sm font-black tracking-widest text-[#006688] uppercase block">SENA · ADSO</span>
                <span class="text-[10px] text-gray-500 font-semibold">Servicio Nacional de Aprendizaje</span>
              </div>
              <div class="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 shadow-xs">
                <span class="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div class="text-right">
                <span class="text-xs sm:text-sm font-black tracking-widest text-emerald-700 uppercase block">NURSING ACADEMY</span>
                <span class="text-[10px] text-gray-500 font-semibold">Formación Bilingüe Hospitalaria</span>
              </div>
            </div>

            <!-- Main Title -->
            <div class="space-y-1.5 relative z-10">
              <p class="text-[11px] font-black uppercase tracking-widest text-amber-800">Constancia de Competencia Académica</p>
              <h3 class="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-wide">
                CERTIFICADO DE FINALIZACIÓN
              </h3>
              <p class="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
                Se certifica que el aprendiz ha culminado con éxito todos los requerimientos académicos, formativos y de evaluación de la:
              </p>
              <p class="text-xs sm:text-sm font-black text-[#006688] uppercase tracking-wide">
                {{ certificateData?.programTitle || 'Ruta Formativa de Inglés Técnico Aplicado a la Enfermería Hospitalaria' }}
              </p>
            </div>

            <!-- Student Name -->
            <div class="py-2 relative z-10 border-y border-amber-200/60 max-w-lg mx-auto space-y-0.5">
              <span class="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Otorgado a:</span>
              <h4 class="text-xl sm:text-2xl font-black text-gray-900 capitalize">
                {{ certificateData?.studentName || (auth.user?.nombre + ' ' + auth.user?.apellido) }}
              </h4>
              <p class="text-xs text-gray-500 font-medium">Documento de Identidad: {{ certificateData?.documentId || auth.user?.cedula || 'N/A' }}</p>
            </div>

            <!-- Metrics summary -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs relative z-10 max-w-xl mx-auto pt-1">
              <div class="p-2 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span class="text-[9px] uppercase font-bold text-gray-400 block">Intensidad</span>
                <span class="font-black text-gray-800">{{ certificateData?.totalHours || '44 Horas' }}</span>
              </div>
              <div class="p-2 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span class="text-[9px] uppercase font-bold text-gray-400 block">Alcance</span>
                <span class="font-black text-gray-800">{{ certificateData?.rapsCompleted || 'RAP 1 al RAP 6' }}</span>
              </div>
              <div class="p-2 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span class="text-[9px] uppercase font-bold text-gray-400 block">Calificación Final</span>
                <span class="font-black text-emerald-700">{{ certificateData?.finalScore || globalScore }}%</span>
              </div>
              <div class="p-2 bg-white rounded-xl border border-gray-200/80 shadow-2xs">
                <span class="text-[9px] uppercase font-bold text-gray-400 block">Crecimiento Net</span>
                <span class="font-black text-emerald-600">{{ certificateData?.growthDelta || ('+' + growthDelta + '%') }}</span>
              </div>
            </div>

            <!-- Signatures & Validation -->
            <div class="pt-4 flex items-end justify-between text-left text-xs border-t border-amber-200/80 relative z-10">
              <div class="space-y-1">
                <div class="w-28 sm:w-32 border-b border-gray-400"></div>
                <p class="font-bold text-gray-800 text-[11px]">Instructor Responsable</p>
                <p class="text-[10px] text-gray-400">Comité Académico SENA</p>
              </div>
              <div class="text-right space-y-0.5">
                <p class="text-[10px] font-bold text-gray-500">Fecha de Emisión: {{ certificateData?.completionDate || '17 de Septiembre, 2026' }}</p>
                <p class="text-[9px] font-mono text-gray-400">Cód. Verificación: {{ certificateData?.certificateCode || 'SENA-NURS-VERIFIED' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Acciones siempre visibles en la parte inferior (Print, Export & Close) -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-gray-100 bg-white shrink-0 print:hidden">
          <button 
            @click="showCertificateModal = false" 
            class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-600 transition-all cursor-pointer"
          >
            Volver
          </button>
          
          <div class="flex items-center gap-2">
            <!-- Botón Exportar PDF -->
            <button 
              @click="exportToPdf" 
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Guardar o descargar como documento PDF"
            >
              <span class="material-symbols-outlined text-base">picture_as_pdf</span>
              Exportar a PDF
            </button>

            <!-- Botón Imprimir -->
            <button 
              @click="printCertificate" 
              class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
              title="Abrir cuadro de diálogo de impresión"
            >
              <span class="material-symbols-outlined text-base">print</span>
              Imprimir Diploma
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getApiBaseUrl } from '../../lib/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()
const apiBaseUrl = getApiBaseUrl()

// Staff Recognition (Admin / Instructor)
const isStaff = computed(() => Boolean(auth.isAdmin || auth.isInstructor))
const activeStaffTab = ref('questions') // 'questions' | 'simulation'

// State
const globalPostTestSubmitted = ref(false)
const isSubmittingPostTest = ref(false)
const globalAnswers = ref({})
const globalScore = ref(0)
const preTestBaseline = ref(35)
const growthDelta = ref(0)
const moduleBreakdown = ref({ m1: 0, m2: 0, m3: 0, m4: 0 })
const showCertificateModal = ref(false)
const certificateData = ref(null)

// Filtering for Staff
const selectedRapFilter = ref('Todos')
const rapFilterOptions = ['Todos', 'RAP 1', 'RAP 2', 'RAP 3', 'RAP 4', 'RAP 5', 'RAP 6']

// Standard Clinical Questions (Base Default Bank)
const DEFAULT_GLOBAL_QUESTIONS = [
  {
    id: 1,
    moduleKey: 'm1',
    rap: 'RAP 1',
    moduleTag: 'MÓDULO 1 · RAP 1',
    title: 'Interacción Inicial y Saludos Formales',
    question: 'How should a nurse professionally greet a new foreign patient during clinical admission?',
    options: ['"Hello, I am nurse John. How can I help you today?"', '"Hey, what is your problem?"', '"You stay there."'],
    correct: '"Hello, I am nurse John. How can I help you today?"',
    explanation: 'Saludo formal y respetuoso estándar según protocolo hospitalario.'
  },
  {
    id: 2,
    moduleKey: 'm1',
    rap: 'RAP 1',
    moduleTag: 'MÓDULO 1 · RAP 1',
    title: 'Estructura Oracional Básica',
    question: 'Select the sentence with correct English clinical word order (Subject + Verb + Complement):',
    options: ['"The nurse checks the vital signs."', '"Checks the nurse vital signs."', '"Vital signs the nurse checks."'],
    correct: '"The nurse checks the vital signs."',
    explanation: 'Estructura afirmativa en tiempo presente en inglés.'
  },
  {
    id: 3,
    moduleKey: 'm2',
    rap: 'RAP 2',
    moduleTag: 'MÓDULO 2 · RAP 2',
    title: 'Antecedentes y Pasado Simple (Caso Mr. Thomas)',
    question: 'When asking about the cause of Mr. Thomas\'s injury in the emergency room, which question is grammatically correct?',
    options: ['"Did you fall yesterday?"', '"Do you fell yesterday?"', '"Were you fall yesterday?"'],
    correct: '"Did you fall yesterday?"',
    explanation: 'Pregunta en pasado simple con auxiliar Did + infinitivo.'
  },
  {
    id: 4,
    moduleKey: 'm2',
    rap: 'RAP 2',
    moduleTag: 'MÓDULO 2 · RAP 2',
    title: 'Descripción Física y Adjetivos Clínicos',
    question: 'Mr. Thomas reports feeling dizzy, pale, and having pain in his left shoulder. What does "dizzy" mean?',
    options: ['Mareado / Vértigo', 'Fiebre alta', 'Dolor estomacal'],
    correct: 'Mareado / Vértigo',
    explanation: '"Dizzy" describe la sensación de mareo o inestabilidad.'
  },
  {
    id: 5,
    moduleKey: 'm2',
    rap: 'RAP 3',
    moduleTag: 'MÓDULO 2 · RAP 3',
    title: 'Entrega de Turno (Handover Listening)',
    question: 'Listen to the handover audio snippet and identify what Mr. Thomas received at 08:00:',
    hasAudio: true,
    audioText: 'Mr. Thomas received 500 milligrams of oral analgesics at eight o\'clock.',
    options: ['500mg of oral analgesics', 'An intravenous antibiotic', 'A physical therapy session'],
    correct: '500mg of oral analgesics',
    explanation: 'El audio especifica 500mg de analgésico por vía oral.'
  },
  {
    id: 6,
    moduleKey: 'm3',
    rap: 'RAP 4',
    moduleTag: 'MÓDULO 3 · RAP 4',
    title: 'Comunicación en el Entorno Hospitalario (Present Continuous)',
    question: 'A doctor enters the room while you are checking the IV line. You say:',
    options: ['"I am administering the saline solution right now."', '"I administered the solution yesterday."', '"I will be administer."'],
    correct: '"I am administering the saline solution right now."',
    explanation: 'Presente continuo para acciones en progreso en el momento del turno.'
  },
  {
    id: 7,
    moduleKey: 'm3',
    rap: 'RAP 4',
    moduleTag: 'MÓDULO 3 · RAP 4',
    title: 'Herramientas y Equipo Médico',
    question: 'Which instrument is primarily used to listen to heartbeat and lung sounds?',
    options: ['Stethoscope', 'Scalpel', 'Sphygmomanometer'],
    correct: 'Stethoscope',
    explanation: 'El estetoscopio ausculta ruidos cardiacos y pulmonares.'
  },
  {
    id: 8,
    moduleKey: 'm3',
    rap: 'RAP 5',
    moduleTag: 'MÓDULO 3 · RAP 5',
    title: 'Propuestas de Mejora y Trabajo en Equipo',
    question: 'How do you politely suggest an improvement to your head nurse?',
    options: ['"I recommend updating the digital handover log for better team synchronization."', '"You must change the schedule now."', '"The team is working badly."'],
    correct: '"I recommend updating the digital handover log for better team synchronization."',
    explanation: 'Comunicación asertiva y profesional con supervisores.'
  },
  {
    id: 9,
    moduleKey: 'm4',
    rap: 'RAP 6',
    moduleTag: 'MÓDULO 4 · RAP 6',
    title: 'Instrucciones de Alta Médica (Modals)',
    question: 'Which instruction expresses an obligatory medical order for home care?',
    options: ['"You must take the antibiotic every eight hours with food."', '"You might take water if you want."', '"You could walk ten kilometers."'],
    correct: '"You must take the antibiotic every eight hours with food."',
    explanation: '"Must" denota obligación y prescripción médica estricta.'
  },
  {
    id: 10,
    moduleKey: 'm4',
    rap: 'RAP 6',
    moduleTag: 'MÓDULO 4 · RAP 6',
    title: 'Cierre y Verificación del Checklist de Egreso',
    question: 'What is the standard professional statement to confirm that all discharge criteria have been met?',
    options: ['"The pain level is low, vital signs are stable, and the discharge checklist is complete."', '"The patient wants to go but no checklist is done."', '"The doctor forgot the signature."'],
    correct: '"The pain level is low, vital signs are stable, and the discharge checklist is complete."',
    explanation: 'Confirma la resolución del dolor, estabilidad de constantes vitales y cierre de la lista de verificación.'
  }
]

// Reactive questions loaded from localStorage or default bank
function loadSavedQuestions() {
  try {
    const saved = localStorage.getItem('nursing_academy_post_test_custom_questions')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_GLOBAL_QUESTIONS))
}

const questionsList = ref(loadSavedQuestions())

function persistQuestions() {
  try {
    localStorage.setItem('nursing_academy_post_test_custom_questions', JSON.stringify(questionsList.value))
  } catch {}
}

function resetToDefaultQuestions() {
  if (confirm('¿Deseas restablecer las preguntas al banco estándar de 10 reactivos clínicos?')) {
    questionsList.value = JSON.parse(JSON.stringify(DEFAULT_GLOBAL_QUESTIONS))
    persistQuestions()
  }
}

// Staff Question Filter
const filteredQuestionsForStaff = computed(() => {
  if (selectedRapFilter.value === 'Todos') return questionsList.value
  return questionsList.value.filter(q => q.rap === selectedRapFilter.value)
})

// Question Editor State
const showQuestionEditorModal = ref(false)
const isCreatingQuestion = ref(false)
const editForm = ref({
  id: 0,
  moduleKey: 'm1',
  rap: 'RAP 1',
  moduleTag: 'MÓDULO 1 · RAP 1',
  title: '',
  question: '',
  options: ['', '', ''],
  correctIndex: 0,
  explanation: '',
  hasAudio: false,
  audioText: ''
})

function openAddQuestionModal() {
  isCreatingQuestion.value = true
  editForm.value = {
    id: Date.now(),
    moduleKey: 'm1',
    rap: 'RAP 1',
    moduleTag: 'MÓDULO 1 · RAP 1',
    title: '',
    question: '',
    options: ['', '', ''],
    correctIndex: 0,
    explanation: '',
    hasAudio: false,
    audioText: ''
  }
  showQuestionEditorModal.value = true
}

function openEditQuestionModal(q) {
  isCreatingQuestion.value = false
  const correctIdx = q.options.indexOf(q.correct)
  editForm.value = {
    id: q.id,
    moduleKey: q.moduleKey || 'm1',
    rap: q.rap || 'RAP 1',
    moduleTag: q.moduleTag || 'MÓDULO 1 · RAP 1',
    title: q.title || '',
    question: q.question || '',
    options: [...q.options],
    correctIndex: correctIdx >= 0 ? correctIdx : 0,
    explanation: q.explanation || '',
    hasAudio: Boolean(q.hasAudio),
    audioText: q.audioText || ''
  }
  showQuestionEditorModal.value = true
}

function saveQuestionForm() {
  const modNum = editForm.value.moduleKey.replace('m', '')
  const moduleTag = `MÓDULO ${modNum} · ${editForm.value.rap}`
  const chosenCorrect = editForm.value.options[editForm.value.correctIndex] || editForm.value.options[0]

  const questionPayload = {
    id: editForm.value.id,
    moduleKey: editForm.value.moduleKey,
    rap: editForm.value.rap,
    moduleTag,
    title: editForm.value.title.trim(),
    question: editForm.value.question.trim(),
    options: editForm.value.options.map(o => o.trim()),
    correct: chosenCorrect.trim(),
    explanation: editForm.value.explanation.trim(),
    hasAudio: editForm.value.hasAudio,
    audioText: editForm.value.hasAudio ? editForm.value.audioText.trim() : ''
  }

  if (isCreatingQuestion.value) {
    questionsList.value.push(questionPayload)
  } else {
    const idx = questionsList.value.findIndex(q => q.id === editForm.value.id)
    if (idx >= 0) {
      questionsList.value[idx] = questionPayload
    }
  }

  persistQuestions()
  showQuestionEditorModal.value = false
}

function deleteQuestion(id) {
  if (questionsList.value.length <= 1) {
    alert('Debe haber al menos 1 reactivo en la evaluación.')
    return
  }
  if (confirm('¿Eliminar este reactivo de la evaluación global?')) {
    questionsList.value = questionsList.value.filter(q => q.id !== id)
    persistQuestions()
  }
}

// Speech synthesis for audio questions
function speakEnglish(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

function closeModal() {
  emit('update:modelValue', false)
}

function resetSimulation() {
  globalAnswers.value = {}
  globalPostTestSubmitted.value = false
  isSubmittingPostTest.value = false
  activeStaffTab.value = 'questions'
}

// Staff Fast Simulation
function runFastSimulation(targetPct = 100) {
  globalAnswers.value = {}
  const total = questionsList.value.length
  const correctCount = Math.round((targetPct / 100) * total)

  questionsList.value.forEach((q, idx) => {
    if (idx < correctCount) {
      globalAnswers.value[q.id] = q.correct
    } else {
      const distractor = q.options.find(opt => opt !== q.correct) || q.options[0]
      globalAnswers.value[q.id] = distractor
    }
  })

  calculateAndSetResults(true)
}

// Calculate scores, contrast and diploma
function calculateAndSetResults(isSimulationMode = false) {
  let correctCount = 0
  const breakdownCount = { 
    m1: { total: 0, correct: 0 }, 
    m2: { total: 0, correct: 0 }, 
    m3: { total: 0, correct: 0 }, 
    m4: { total: 0, correct: 0 } 
  }

  questionsList.value.forEach(q => {
    const key = q.moduleKey || 'm1'
    if (breakdownCount[key]) breakdownCount[key].total++
    if (globalAnswers.value[q.id] === q.correct) {
      correctCount++
      if (breakdownCount[key]) breakdownCount[key].correct++
    }
  })

  globalScore.value = Math.round((correctCount / questionsList.value.length) * 100)
  preTestBaseline.value = 35 // Diagnóstico de entrada
  growthDelta.value = Math.max(0, globalScore.value - preTestBaseline.value)

  moduleBreakdown.value = {
    m1: breakdownCount.m1.total ? Math.round((breakdownCount.m1.correct / breakdownCount.m1.total) * 100) : 100,
    m2: breakdownCount.m2.total ? Math.round((breakdownCount.m2.correct / breakdownCount.m2.total) * 100) : 100,
    m3: breakdownCount.m3.total ? Math.round((breakdownCount.m3.correct / breakdownCount.m3.total) * 100) : 100,
    m4: breakdownCount.m4.total ? Math.round((breakdownCount.m4.correct / breakdownCount.m4.total) * 100) : 100,
  }

  const rawStaffName = `${auth.user?.nombre || ''} ${auth.user?.apellido || ''}`.trim() || 'Instructor / Admin'
  const studentName = isSimulationMode 
    ? `${rawStaffName} (Auditoría Simulada)`
    : rawStaffName || 'Aprendiz SENA'

  certificateData.value = {
    studentName,
    documentId: auth.user?.cedula || (isSimulationMode ? 'AUDIT-TEST-001' : 'N/A'),
    programTitle: 'Ruta Formativa de Inglés Técnico Aplicado a la Enfermería Hospitalaria',
    totalHours: '44 Horas Académicas',
    modulesCount: 4,
    rapsCompleted: 'RAP 1 al RAP 6',
    preTestBaseline: preTestBaseline.value,
    finalScore: globalScore.value,
    growthDelta: `+${growthDelta.value}%`,
    awardedBadge: isSimulationMode ? 'Graduado Bilingüe (Simulación)' : 'Graduado Bilingüe',
    completionDate: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateCode: isSimulationMode ? `SENA-SIM-${Date.now().toString(36).toUpperCase()}` : `SENA-NURS-${auth.user?.id || 1}-${Date.now().toString(36).toUpperCase()}`
  }

  globalPostTestSubmitted.value = true
}

async function submitGlobalPostTest() {
  isSubmittingPostTest.value = true

  // Si es Instructor o Admin: Simular sin alterar la base de datos ni otorgar XP
  if (isStaff.value) {
    calculateAndSetResults(true)
    isSubmittingPostTest.value = false
    return
  }

  // Si es Aprendiz: Calcular y persistir en base de datos real
  calculateAndSetResults(false)

  if (auth.token) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses/post-test/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          finalScore: globalScore.value,
          preTestBaseline: preTestBaseline.value,
          answers: globalAnswers.value,
          moduleBreakdown: moduleBreakdown.value
        })
      })

      if (res.ok) {
        const json = await res.json()
        const data = json?.data || json
        if (data.certificateData) {
          certificateData.value = data.certificateData
        }
        if (auth.user) {
          auth.user.xp = (auth.user.xp || 0) + 150
        }
      }
    } catch (err) {
      console.warn('Persistencia de Post-Test en backend con respaldo local:', err)
    }
  }

  // Guardar en almacenamiento local del aprendiz
  try {
    const apprenticeId = auth.user?.id || 'guest'
    localStorage.setItem(`nursing_academy_post_test_${apprenticeId}`, JSON.stringify({
      score: globalScore.value,
      delta: growthDelta.value,
      preTestBaseline: preTestBaseline.value,
      moduleBreakdown: moduleBreakdown.value,
      certificateData: certificateData.value,
      completedAt: new Date().toISOString()
    }))
  } catch {}

  isSubmittingPostTest.value = false
}

// Print and PDF export via isolated iframe
function printCertificate() {
  const certElem = document.getElementById('printableCertificate')
  if (!certElem) return

  const rawName = certificateData.value?.studentName || auth.user?.nombre || 'Aprendiz'
  const cleanName = rawName.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_')

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  document.body.appendChild(iframe)

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('\n')

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Certificado_Nursing_Academy_${cleanName}</title>
      ${styles}
      <style>
        @page {
          size: A4 landscape;
          margin: 6mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 8px;
          background: #ffffff !important;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 98vh;
        }
        #printableCertificate {
          width: 100%;
          max-width: 1020px;
          margin: 0 auto;
          box-shadow: none !important;
          border: 4px double #f59e0b !important;
          background: #ffffff !important;
        }
      </style>
    </head>
    <body>
      ${certElem.outerHTML}
    </body>
    </html>
  `)
  doc.close()

  iframe.contentWindow.focus()
  setTimeout(() => {
    iframe.contentWindow.print()
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }, 4000)
  }, 400)
}

function exportToPdf() {
  printCertificate()
}

async function loadExistingResult() {
  if (isStaff.value) {
    // Para staff siempre arranca en limpio en su pestaña de preguntas
    activeStaffTab.value = 'questions'
    globalPostTestSubmitted.value = false
    return
  }

  if (auth.token) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/courses/post-test/result`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      if (res.ok) {
        const json = await res.json()
        const data = json?.data || json
        if (data && data.score !== undefined) {
          globalScore.value = data.score
          preTestBaseline.value = data.preTestBaseline || 35
          growthDelta.value = data.delta || (data.score - preTestBaseline.value)
          moduleBreakdown.value = data.moduleBreakdown || { m1: 100, m2: 100, m3: 100, m4: 100 }
          certificateData.value = data.certificateData || null
          globalPostTestSubmitted.value = true
          return
        }
      }
    } catch {
      // Continuar con presentación regular
    }
  }
  globalPostTestSubmitted.value = false
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    questionsList.value = loadSavedQuestions()
    globalAnswers.value = {}
    isSubmittingPostTest.value = false
    loadExistingResult()
  }
})
</script>

<style scoped>
@media print {
  @page {
    size: A4 landscape;
    margin: 8mm;
  }
}
</style>
