<template>
  <div>
    <!-- POST-TEST GLOBAL MODAL -->
    <div v-if="modelValue" class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:p-0 print:bg-white print:static">
      <div class="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl border border-gray-100 print:shadow-none print:border-none print:max-w-none print:p-0">
        
        <!-- Modal Top Bar -->
        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-gray-800">POST-TEST GLOBAL DE EVALUACIÓN</h3>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Cierre de Ruta
                </span>
              </div>
              <p class="text-xs text-gray-500">Evaluación integradora de toda la ruta formativa de enfermería (RAP 1 a RAP 6)</p>
            </div>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- ASSESSMENT QUESTIONNAIRE (Active State) -->
        <div v-if="!globalPostTestSubmitted" class="space-y-6">
          
          <!-- Instructions & Progress Indicator -->
          <div class="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-teal-700 text-lg">info</span>
              <span class="text-gray-700 font-medium leading-relaxed">
                Responde las 10 preguntas representativas de los 4 módulos clínicos. Algunas incluyen audio para evaluar comprensión oral.
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 font-bold bg-white px-3 py-1.5 rounded-xl border border-teal-100 shadow-xs">
              <span class="text-gray-500">Progreso:</span>
              <span class="text-[#006688] font-black">{{ Object.keys(globalAnswers).length }} / {{ globalQuestions.length }}</span>
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-4">
            <div 
              v-for="(q, idx) in globalQuestions" 
              :key="q.id" 
              class="p-5 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 transition-all"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black text-[#006688] bg-[#006688]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {{ q.moduleTag }}
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

              <!-- Optional Audio Clip for Listening Questions -->
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
              :disabled="Object.keys(globalAnswers).length < globalQuestions.length || isSubmittingPostTest"
              class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span v-if="isSubmittingPostTest" class="material-symbols-outlined text-sm animate-spin">sync</span>
              <span v-else class="material-symbols-outlined text-sm">verified</span>
              {{ isSubmittingPostTest ? 'Calificando y certificando...' : 'Calificar y Certificar Post-Test Global' }}
            </button>
          </div>
        </div>

        <!-- POST-TEST RESULTS & PRE/POST CONTRAST DASHBOARD -->
        <div v-else class="space-y-6 animate-fade-in">
          
          <!-- Top Celebratory Badge -->
          <div class="bg-gradient-to-br from-emerald-700 via-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg relative overflow-hidden">
            <div class="w-20 h-20 bg-amber-400/20 text-amber-300 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-300/30">
              <span class="material-symbols-outlined text-4xl">emoji_events</span>
            </div>
            <div class="space-y-1">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black tracking-widest uppercase">
                🎓 Certificación de Ruta Formativa
              </div>
              <h4 class="text-2xl font-black text-white">¡Felicitaciones! Has Superado el POS-TEST GLOBAL</h4>
              <p class="text-xs text-teal-100 max-w-xl mx-auto leading-relaxed">
                Has demostrado competencia técnica comunicativa en inglés clínico desde la admisión y triaje hasta la entrega de turno y las órdenes de alta médica.
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
                <span class="text-[10px] text-teal-100">Resultado final certificado</span>
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
                  <p class="text-xs font-black text-amber-900">Insignia Desbloqueada: "Graduado Bilingüe"</p>
                  <p class="text-[11px] text-amber-700">+150 XP acreditados a tu cuenta académica por culminación de ruta.</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-amber-500 text-2xl">verified</span>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button 
              @click="closeModal" 
              class="w-full sm:w-auto px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl text-gray-600 transition-all cursor-pointer"
            >
              Cerrar Resumen
            </button>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button 
                @click="showCertificateModal = true" 
                class="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">workspace_premium</span>
                Ver Mi Diploma Oficial
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- CERTIFICATE / DIPLOMA MODAL (Imprimible y Descargable, adaptable a pantalla) -->
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
            <span class="text-xs font-black uppercase tracking-wider text-gray-700">Constancia Oficial de Culminación de Ruta</span>
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
              Exportar PDF
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
import { ref, watch } from 'vue'
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

const globalQuestions = [
  {
    id: 1,
    moduleKey: 'm1',
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
    moduleTag: 'MÓDULO 3 · RAP 4',
    title: 'Comunicación en el Entorno Hospitalario (Present Continuous)',
    question: 'A doctor enters the room while you are checking the IV line. You say:',
    options: ['"I am administering the saline solution right now."', '"I administered the solution yesterday."', '"I will be administer."' ],
    correct: '"I am administering the saline solution right now."',
    explanation: 'Presente continuo para acciones en progreso en el momento del turno.'
  },
  {
    id: 7,
    moduleKey: 'm3',
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
    moduleTag: 'MÓDULO 4 · RAP 6',
    title: 'Cierre y Verificación del Checklist de Egreso',
    question: 'What is the standard professional statement to confirm that all discharge criteria have been met?',
    options: ['"The pain level is low, vital signs are stable, and the discharge checklist is complete."', '"The patient wants to go but no checklist is done."', '"The doctor forgot the signature."'],
    correct: '"The pain level is low, vital signs are stable, and the discharge checklist is complete."',
    explanation: 'Confirma la resolución del dolor, estabilidad de constantes vitales y cierre de la lista de verificación.'
  }
]

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

function printCertificate() {
  const rawName = certificateData.value?.studentName || auth.user?.nombre || 'Aprendiz'
  const cleanName = rawName.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_')
  const originalTitle = document.title
  document.title = `Certificado_Nursing_Academy_${cleanName}`
  window.print()
  setTimeout(() => {
    document.title = originalTitle
  }, 1000)
}

function exportToPdf() {
  printCertificate()
}

async function loadExistingResult() {
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

async function submitGlobalPostTest() {
  isSubmittingPostTest.value = true

  let correctCount = 0
  const breakdownCount = { m1: { total: 0, correct: 0 }, m2: { total: 0, correct: 0 }, m3: { total: 0, correct: 0 }, m4: { total: 0, correct: 0 } }

  globalQuestions.forEach(q => {
    const key = q.moduleKey || 'm1'
    if (breakdownCount[key]) breakdownCount[key].total++
    if (globalAnswers.value[q.id] === q.correct) {
      correctCount++
      if (breakdownCount[key]) breakdownCount[key].correct++
    }
  })

  globalScore.value = Math.round((correctCount / globalQuestions.length) * 100)
  preTestBaseline.value = 35 // Línea base diagnóstica inicial del PRE-TEST
  growthDelta.value = Math.max(0, globalScore.value - preTestBaseline.value)

  moduleBreakdown.value = {
    m1: breakdownCount.m1.total ? Math.round((breakdownCount.m1.correct / breakdownCount.m1.total) * 100) : 100,
    m2: breakdownCount.m2.total ? Math.round((breakdownCount.m2.correct / breakdownCount.m2.total) * 100) : 100,
    m3: breakdownCount.m3.total ? Math.round((breakdownCount.m3.correct / breakdownCount.m3.total) * 100) : 100,
    m4: breakdownCount.m4.total ? Math.round((breakdownCount.m4.correct / breakdownCount.m4.total) * 100) : 100,
  }

  const studentName = `${auth.user?.nombre || ''} ${auth.user?.apellido || ''}`.trim() || 'Aprendiz SENA'
  certificateData.value = {
    studentName,
    documentId: auth.user?.cedula || 'N/A',
    programTitle: 'Ruta Formativa de Inglés Técnico Aplicado a la Enfermería Hospitalaria',
    totalHours: '44 Horas Académicas',
    modulesCount: 4,
    rapsCompleted: 'RAP 1 al RAP 6',
    preTestBaseline: preTestBaseline.value,
    finalScore: globalScore.value,
    growthDelta: `+${growthDelta.value}%`,
    awardedBadge: 'Graduado Bilingüe',
    completionDate: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateCode: `SENA-NURS-${auth.user?.id || 1}-${Date.now().toString(36).toUpperCase()}`
  }

  // Sincronizar y persistir con backend si hay sesión
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

  // Guardar en almacenamiento local
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

  globalPostTestSubmitted.value = true
  isSubmittingPostTest.value = false
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
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
