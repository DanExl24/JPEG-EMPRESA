<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-12">
    
    <!-- Top Header -->
    <div class="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Actividades Educativas</h2>
        <p class="text-gray-500 mt-1">
          {{ auth.isAdmin || auth.isInstructor ? 'Crea, configura y edita actividades basadas en plantillas interactivas.' : 'Tus tareas y actividades pendientes.' }}
        </p>
      </div>
      <button 
        v-if="auth.isAdmin || auth.isInstructor" 
        @click="openNewActivityModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
      >
        <span class="material-symbols-outlined text-base">add</span>
        Nueva Actividad
      </button>
    </div>

    <!-- Summary pills -->
    <div class="flex flex-wrap gap-3">
      <div v-for="s in summary" :key="s.label" :class="`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${s.bg} ${s.text}`">
        <span class="material-symbols-outlined text-base">{{ s.icon }}</span>
        {{ s.count }} {{ s.label }}
      </div>
    </div>

    <!-- Activity List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-gray-400">filter_list</span>
          <div class="flex gap-2">
            <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
              :class="`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeFilter === f.value ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`">
              {{ f.label }}
            </button>
          </div>
        </div>
        <div v-if="auth.isAdmin || auth.isInstructor" class="text-xs bg-[#006688]/5 border border-[#006688]/10 text-[#006688] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">lock</span>
          <span>Las actividades resueltas por alumnos están bloqueadas para edición.</span>
        </div>
      </div>

      <div class="divide-y divide-gray-50">
        <div v-for="act in filteredActivities" :key="act.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-gray-50 transition-colors">
          
          <div class="flex items-center gap-4">
            <div :class="`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`">
              <span class="material-symbols-outlined text-lg" :style="`color:${act.iconColor}`">{{ act.icon }}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-bold text-gray-800 text-sm">{{ act.title }}</p>
                <span class="text-[9px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {{ act.templateLabel }}
                </span>
                <span v-if="act.hasStudentSubmissions" class="text-[9px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[10px]">done_all</span>
                  Resuelta
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ act.course }} · Fase: <span class="font-semibold text-gray-700">{{ act.phase }}</span> · Puntos: <span class="font-semibold text-gray-700">{{ act.points }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 shrink-0">
            <span :class="`text-xs font-bold px-2 py-1 rounded-full ${act.statusBg} ${act.statusText}`">{{ act.status }}</span>
            
            <!-- Student Action -->
            <router-link
              v-if="!auth.isAdmin && !auth.isInstructor"
              :to="`/dashboard/cursos/${act.courseId || 1}`"
              class="text-[#006688] hover:text-[#004e69]"
            >
              <span class="material-symbols-outlined text-lg">chevron_right</span>
            </router-link>

            <!-- Instructor Actions -->
            <div v-else class="flex gap-2">
              <button 
                @click="openEditActivityModal(act)"
                :class="`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                  act.hasStudentSubmissions
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688] hover:text-[#006688]'
                }`"
                :disabled="act.hasStudentSubmissions"
                :title="act.hasStudentSubmissions ? 'No se puede editar porque alumnos ya la respondieron' : 'Editar actividad'"
              >
                <span class="material-symbols-outlined text-xs">edit</span>
                Editar
              </button>
              
              <button 
                @click="deleteActivity(act.id)"
                class="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                title="Eliminar actividad"
              >
                <span class="material-symbols-outlined text-xs">delete</span>
                Eliminar
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- Interactive Activity Editor Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-8 max-h-[90vh] animate-slide-up">
        
        <!-- Modal Header -->
        <div class="bg-[#006688] text-white p-6 flex justify-between items-center shrink-0">
          <div class="space-y-1">
            <h3 class="text-lg font-black">{{ editingAct ? 'Configurar Actividad Existente' : 'Diseñar Nueva Actividad Interactiva' }}</h3>
            <p class="text-xs text-cyan-100">HU03: Soporte de plantillas y simulación del aprendiz (Demo)</p>
          </div>
          <button @click="showModal = false" class="text-white hover:text-cyan-200 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Mode selector: Form vs Preview -->
        <div class="bg-gray-50 border-b border-gray-100 p-2 flex gap-1 shrink-0">
          <button 
            @click="previewMode = false"
            :class="`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${!previewMode ? 'bg-white text-[#006688] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
          >
            Configuración de Plantilla
          </button>
          <button 
            @click="previewMode = true"
            :class="`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${previewMode ? 'bg-white text-[#006688] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
          >
            Vista Previa de Aprendiz (Demo)
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">

          <!-- ── TAB 1: FORM CONFIGURATION ── -->
          <div v-if="!previewMode" class="space-y-6">
            
            <!-- General Activity Parameters -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-3.5 bg-[#006688] rounded-full"></span>
                1. Información de Asignación y Evaluación
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-1 md:col-span-2">
                  <label class="text-xs font-bold text-gray-500">Título de la Actividad</label>
                  <input type="text" v-model="form.title" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Puntos a otorgar</label>
                  <input type="number" v-model="form.points" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Curso Asociado</label>
                  <select v-model="form.course" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]">
                    <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Fase Pedagógica (HU02)</label>
                  <select v-model="form.phase" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]">
                    <option value="Preparación">Preparación</option>
                    <option value="Absorción">Absorción</option>
                    <option value="Práctica">Práctica</option>
                    <option value="Cierre">Cierre</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Límite de Intentos</label>
                  <select v-model="form.attempts" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]">
                    <option value="Ilimitados">Ilimitados</option>
                    <option value="1">1 Intento</option>
                    <option value="3">3 Intentos</option>
                    <option value="5">5 Intentos</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Predefined Template Selector -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-3.5 bg-[#006688] rounded-full"></span>
                2. Plantilla de Actividad Técnica
              </h4>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button 
                  v-for="tpl in templateOptions" 
                  :key="tpl.id"
                  @click="form.template = tpl.id"
                  type="button"
                  :class="`p-3 border rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    form.template === tpl.id
                      ? 'border-[#006688] bg-[#006688]/5 text-[#006688]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`"
                >
                  <span class="material-symbols-outlined text-2xl">{{ tpl.icon }}</span>
                  <span class="text-[10px] font-black leading-tight">{{ tpl.label }}</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Fields per Template -->
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Detalles de la plantilla</span>
              
              <!-- Sopa de Letras Fields -->
              <div v-if="form.template === 'sopa'" class="space-y-2">
                <label class="text-xs font-bold text-gray-500">Palabras a buscar (separadas por comas)</label>
                <input type="text" v-model="form.sopaWords" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="heart, suture, stethoscope, pulse" />
              </div>

              <!-- Crucigramas Fields -->
              <div v-if="form.template === 'crucigrama'" class="space-y-3">
                <label class="text-xs font-bold text-gray-500">Definiciones Clave</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="text" v-model="form.crossword1Clue" class="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Pista 1: Instrument to hear heartbeat" />
                  <input type="text" v-model="form.crossword1Word" class="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Palabra 1: stethoscope" />
                </div>
              </div>

              <!-- Quizzes / Preguntas Fields -->
              <div v-if="form.template === 'quiz' || form.template === 'preguntas'" class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Pregunta</label>
                  <input type="text" v-model="form.quizQuestion" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Ej. What is the standard adult heart rate?" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500">Opción Correcta</label>
                    <input type="text" v-model="form.quizCorrect" class="w-full px-3 py-2 border border-green-200 bg-green-50/20 rounded-xl text-xs font-semibold focus:outline-none" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500">Opción Incorrecta</label>
                    <input type="text" v-model="form.quizIncorrect" class="w-full px-3 py-2 border border-red-200 bg-red-50/20 rounded-xl text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
              </div>

              <!-- Conectar Significados Fields -->
              <div v-if="form.template === 'match'" class="space-y-3">
                <label class="text-xs font-bold text-gray-500">Par de Palabras a Relacionar</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="text" v-model="form.matchTerm" class="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Término: Syringe" />
                  <input type="text" v-model="form.matchMeaning" class="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Significado: Instrument used to inject fluids" />
                </div>
              </div>

              <!-- Escucha Fields -->
              <div v-if="form.template === 'listening'" class="space-y-2">
                <label class="text-xs font-bold text-gray-500">Frase a Pronunciar en Audio y Escribir (Dictado)</label>
                <input type="text" v-model="form.listeningPhrase" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Ej. The patient resides in room three" />
              </div>

              <!-- Pronunciación Fields -->
              <div v-if="form.template === 'pronunciation'" class="space-y-2">
                <label class="text-xs font-bold text-gray-500">Texto Guía para Grabación de Voz</label>
                <input type="text" v-model="form.pronouncePhrase" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none" placeholder="Ej. Administer the antibiotic intravenously" />
              </div>

            </div>

            <!-- Feedback Config -->
            <div class="space-y-4 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-3.5 bg-[#006688] rounded-full"></span>
                3. Mensajes de Retroalimentación (Feedback)
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Mensaje de Acierto (Felicitación)</label>
                  <input type="text" v-model="form.successMessage" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500" placeholder="Ej. ¡Excelente! Has respondido correctamente." />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Mensaje de Pista / Refuerzo (Fallo)</label>
                  <input type="text" v-model="form.hintMessage" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500" placeholder="Ej. Pista: Recuerda verificar el historial del paciente." />
                </div>
              </div>
            </div>

          </div>

          <!-- ── TAB 2: LIVE PREVIEW (DEMO) ── -->
          <div v-else class="space-y-6 animate-fade-in">
            <div class="bg-[#006688]/5 border border-[#006688]/20 rounded-2xl p-4 text-xs flex items-center gap-2 text-[#006688]">
              <span class="material-symbols-outlined text-sm">visibility</span>
              <span class="font-semibold">Estás en Modo Previsualización. Así verá y jugará la actividad el aprendiz en su panel de estudio.</span>
            </div>

            <div class="border border-gray-200 rounded-3xl p-6 bg-white space-y-6 min-h-[200px] shadow-sm">
              <div class="space-y-1">
                <span class="text-[9px] uppercase tracking-wider font-extrabold text-[#006688] bg-[#006688]/5 px-2 py-0.5 rounded">
                  Actividad: {{ form.title || 'Nueva Actividad' }}
                </span>
                <p class="text-xs text-gray-400">Puntos otorgados: {{ form.points }} · Intentos Máximos: {{ form.attempts }}</p>
              </div>

              <!-- Playable Word Search Demo -->
              <div v-if="form.template === 'sopa'" class="space-y-4">
                <p class="text-xs text-gray-600 font-bold">Encuentra las siguientes palabras:</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="w in (form.sopaWords || '').split(',')" :key="w" class="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold font-mono">
                    {{ w.trim() }}
                  </span>
                </div>
                <div class="grid grid-cols-4 gap-2 max-w-[200px] mx-auto border border-gray-200 p-2 rounded-xl bg-gray-50">
                  <!-- Simulated Grid -->
                  <div v-for="lettr in 'HEARTPULSESUTUR'.split('')" :key="lettr" class="w-8 h-8 rounded bg-white flex items-center justify-center text-xs font-bold border hover:bg-gray-100 cursor-pointer">
                    {{ lettr }}
                  </div>
                </div>
              </div>

              <!-- Playable Quiz / Preguntas Demo -->
              <div v-if="form.template === 'quiz' || form.template === 'preguntas'" class="space-y-4">
                <div class="text-sm font-bold text-gray-800">{{ form.quizQuestion || '¿Pregunta del Quiz?' }}</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    @click="previewSelectedAnswer = 'correct'"
                    :class="`px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all ${
                      previewSelectedAnswer === 'correct' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`"
                  >
                    {{ form.quizCorrect || 'Opción Correcta' }}
                  </button>
                  <button 
                    @click="previewSelectedAnswer = 'incorrect'"
                    :class="`px-4 py-3 border rounded-xl text-xs font-bold text-left transition-all ${
                      previewSelectedAnswer === 'incorrect' ? 'bg-[#006688] text-white border-[#006688]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`"
                  >
                    {{ form.quizIncorrect || 'Opción Incorrecta' }}
                  </button>
                </div>
              </div>

              <!-- Playable Match Meaning Demo -->
              <div v-if="form.template === 'match'" class="space-y-4">
                <p class="text-xs text-gray-600">Empareja el término con su descripción clínica correcta:</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <button class="w-full p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold text-center">
                      {{ form.matchTerm || 'Término' }}
                    </button>
                  </div>
                  <div class="space-y-2">
                    <button class="w-full p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs font-bold text-center">
                      {{ form.matchMeaning || 'Descripción' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Playable Listening Demo -->
              <div v-if="form.template === 'listening'" class="space-y-4">
                <div class="flex items-center gap-3">
                  <button class="w-10 h-10 rounded-full bg-[#006688] text-white flex items-center justify-center hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-xl">volume_up</span>
                  </button>
                  <span class="text-xs text-gray-400 italic">Haz clic para oír la frase simulada</span>
                </div>
                <input 
                  type="text" 
                  v-model="previewTypedPhrase"
                  class="w-full px-3 py-2 border border-gray-200 focus:outline-none focus:border-[#006688] rounded-xl text-xs font-semibold"
                  placeholder="Escribe la frase que escuchas..."
                />
              </div>

              <!-- Playable Pronunciation Demo -->
              <div v-if="form.template === 'pronunciation'" class="space-y-4">
                <p class="text-xs text-gray-600 font-bold">Lee esta oración en voz alta:</p>
                <p class="text-sm font-semibold text-[#006688] bg-[#006688]/5 p-3 rounded-xl border border-[#006688]/10 text-center">
                  "{{ form.pronouncePhrase || 'Frase a pronunciar' }}"
                </p>
                <div class="flex justify-center">
                  <button class="w-12 h-12 rounded-full bg-[#006688] hover:bg-[#004e69] text-white flex items-center justify-center shadow-md">
                    <span class="material-symbols-outlined text-lg">mic</span>
                  </button>
                </div>
              </div>

              <!-- Action buttons for validation in demo -->
              <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button 
                  @click="validateDemoSubmission"
                  class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl"
                >
                  Verificar Solución
                </button>
                <button 
                  @click="resetDemo"
                  class="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl"
                >
                  Reiniciar Demo
                </button>

                <!-- Feedback alert simulated inside modal -->
                <transition name="fade">
                  <span v-if="demoFeedbackSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                    {{ form.successMessage || '¡Excelente! Correcto.' }}
                  </span>
                  <span v-else-if="demoFeedbackSuccess === false" class="text-amber-600 text-xs font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">info</span>
                    {{ form.hintMessage || 'Pista de ayuda.' }}
                  </span>
                </transition>
              </div>

            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button @click="showModal = false" class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all">Cancelar</button>
          <button @click="saveActivity" class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl shadow transition-all">Publicar Actividad</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const activeFilter = ref('all')
const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Completadas', value: 'done' },
  { label: 'Vencidas', value: 'overdue' },
]

// Reactively managed activities data (with submission lock details)
const activities = ref([
  { id: 1, title: 'Caso Clínico: Insuficiencia Cardíaca', course: 'Cuidados Críticos UCI', courseId: 3, due: '15 May 2026', status: 'Pendiente', statusBg: 'bg-orange-100', statusText: 'text-orange-700', icon: 'description', iconBg: 'bg-orange-50', iconColor: '#f97316', state: 'pending', template: 'quiz', templateLabel: 'Quiz', points: 20, phase: 'Cierre', hasStudentSubmissions: true },
  { id: 2, title: 'Quiz: Farmacología Básica', course: 'Farmacología Clínica', courseId: 2, due: '12 May 2026', status: 'Completada', statusBg: 'bg-green-100', statusText: 'text-green-700', icon: 'quiz', iconBg: 'bg-green-50', iconColor: '#10b981', state: 'done', template: 'quiz', templateLabel: 'Quiz', points: 15, phase: 'Absorción', hasStudentSubmissions: true },
  { id: 3, title: 'Simulación: RCP Avanzado', course: 'Urgencias y Emergencias', courseId: 6, due: '10 May 2026', status: 'Vencida', statusBg: 'bg-red-100', statusText: 'text-red-700', icon: 'favorite', iconBg: 'bg-red-50', iconColor: '#ef4444', state: 'overdue', template: 'pronunciation', templateLabel: 'Pronunciación', points: 25, phase: 'Práctica', hasStudentSubmissions: false },
  { id: 4, title: 'Lectura: Psicología del Paciente', course: 'Salud Mental y Psiquiatría', courseId: 4, due: '20 May 2026', status: 'Pendiente', statusBg: 'bg-orange-100', statusText: 'text-orange-700', icon: 'menu_book', iconBg: 'bg-purple-50', iconColor: '#8b5cf6', state: 'pending', template: 'match', templateLabel: 'Conectar Significados', points: 10, phase: 'Preparación', hasStudentSubmissions: false },
  { id: 5, title: 'Evaluación: Cuidados Neonatales', course: 'Atención Materno-Infantil', courseId: 5, due: '18 May 2026', status: 'Completada', statusBg: 'bg-green-100', statusText: 'text-green-700', icon: 'fact_check', iconBg: 'bg-pink-50', iconColor: '#ec4899', state: 'done', template: 'listening', templateLabel: 'Escucha', points: 30, phase: 'Cierre', hasStudentSubmissions: false },
])

const courseOptions = [
  'Fundamentos de Enfermería',
  'Farmacología Clínica',
  'Cuidados Críticos UCI',
  'Salud Mental y Psiquiatría',
  'Atención Materno-Infantil',
  'Urgencias y Emergencias',
]

const templateOptions = [
  { id: 'sopa', label: 'Sopa de letras', icon: 'grid_on' },
  { id: 'crucigrama', label: 'Crucigramas', icon: 'border_inner' },
  { id: 'quiz', label: 'Quizzes', icon: 'quiz' },
  { id: 'preguntas', label: 'Opción múltiple', icon: 'list_alt' },
  { id: 'match', label: 'Conectar significado', icon: 'compare_arrows' },
  { id: 'listening', label: 'Escucha (Audio)', icon: 'volume_up' },
  { id: 'pronunciation', label: 'Pronunciación (Voz)', icon: 'mic' },
]

// Modal & Editor States
const showModal = ref(false)
const editingAct = ref(null)
const previewMode = ref(false)

const form = ref({
  title: '',
  course: 'Fundamentos de Enfermería',
  phase: 'Práctica',
  template: 'quiz',
  points: 10,
  attempts: 'Ilimitados',
  successMessage: '',
  hintMessage: '',
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
})

// Playable Demo inside Modal States
const previewSelectedAnswer = ref(null)
const previewTypedPhrase = ref('')
const demoFeedbackSuccess = ref(null)

// Compute lists
const filteredActivities = computed(() => {
  if (activeFilter.value === 'all') return activities.value
  return activities.value.filter(a => a.state === activeFilter.value)
})

const summary = computed(() => {
  const pendingCount = activities.value.filter(a => a.state === 'pending').length
  const completedCount = activities.value.filter(a => a.state === 'done').length
  const overdueCount = activities.value.filter(a => a.state === 'overdue').length
  
  return [
    { label: 'Pendientes', count: pendingCount, icon: 'pending', bg: 'bg-orange-100', text: 'text-orange-700' },
    { label: 'Completadas', count: completedCount, icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-700' },
    { label: 'Vencidas', count: overdueCount, icon: 'warning', bg: 'bg-red-100', text: 'text-red-700' },
  ]
})

// Handlers
function openNewActivityModal() {
  editingAct.value = null
  previewMode.value = false
  resetDemo()
  
  form.value = {
    title: 'Nueva Actividad Médica',
    course: 'Fundamentos de Enfermería',
    phase: 'Práctica',
    template: 'quiz',
    points: 10,
    attempts: 'Ilimitados',
    successMessage: '¡Excelente trabajo! Has acertado.',
    hintMessage: 'Refuerzo: Recuerda revisar la terminología de signos vitales.',
    sopaWords: 'heart, pulse, blood',
    crossword1Clue: 'Clue: Main cardiovascular organ',
    crossword1Word: 'heart',
    quizQuestion: '¿Qué mide un esfigmomanómetro?',
    quizCorrect: 'Presión arterial',
    quizIncorrect: 'Ritmo cardíaco',
    matchTerm: 'Intravenous',
    matchMeaning: 'Administración en vena',
    listeningPhrase: 'The patient requires immediate attention',
    pronouncePhrase: 'Check the respiratory rate of the patient',
  }
  
  showModal.value = true
}

function openEditActivityModal(act) {
  // Guard condition (Double-check lockout logic)
  if (act.hasStudentSubmissions) {
    alert('Esta actividad ya fue resuelta por aprendices y no puede ser modificada.')
    return
  }

  editingAct.value = act
  previewMode.value = false
  resetDemo()

  form.value = {
    title: act.title,
    course: act.course,
    phase: act.phase,
    template: act.template,
    points: act.points,
    attempts: act.attemptsLimit || 'Ilimitados',
    successMessage: act.successMessage || '¡Excelente! Has respondido correctamente.',
    hintMessage: act.hintMessage || 'Pista de ayuda.',
    sopaWords: act.sopaWords || 'heart, pulse, blood',
    crossword1Clue: act.crossword1Clue || 'Clue: Main cardiovascular organ',
    crossword1Word: act.crossword1Word || 'heart',
    quizQuestion: act.quizQuestion || '¿Qué mide un esfigmomanómetro?',
    quizCorrect: act.quizCorrect || 'Presión arterial',
    quizIncorrect: act.quizIncorrect || 'Ritmo cardíaco',
    matchTerm: act.matchTerm || 'Intravenous',
    matchMeaning: act.matchMeaning || 'Administración en vena',
    listeningPhrase: act.listeningPhrase || 'The patient requires immediate attention',
    pronouncePhrase: act.pronouncePhrase || 'Check the respiratory rate of the patient',
  }

  showModal.value = true
}

function saveActivity() {
  if (!form.value.title.trim()) return

  // Resolve template icon
  const tplIcon = templateOptions.find(t => t.id === form.value.template)
  const icon = tplIcon ? tplIcon.icon : 'task'
  const templateLabel = tplIcon ? tplIcon.label : 'Actividad'

  if (editingAct.value) {
    const idx = activities.value.findIndex(a => a.id === editingAct.value.id)
    if (idx >= 0) {
      activities.value[idx] = {
        ...activities.value[idx],
        title: form.value.title,
        course: form.value.course,
        phase: form.value.phase,
        template: form.value.template,
        templateLabel,
        points: parseInt(form.value.points) || 10,
        attemptsLimit: form.value.attempts,
        successMessage: form.value.successMessage,
        hintMessage: form.value.hintMessage,
        icon,
        // Keep other data
      }
    }
  } else {
    const newId = activities.value.length ? Math.max(...activities.value.map(a => a.id)) + 1 : 1
    activities.value.push({
      id: newId,
      title: form.value.title,
      course: form.value.course,
      phase: form.value.phase,
      due: 'Próxima semana',
      status: 'Pendiente',
      statusBg: 'bg-orange-100',
      statusText: 'text-orange-700',
      icon,
      iconBg: 'bg-blue-50',
      iconColor: '#006688',
      state: 'pending',
      template: form.value.template,
      templateLabel,
      points: parseInt(form.value.points) || 10,
      attemptsLimit: form.value.attempts,
      successMessage: form.value.successMessage,
      hintMessage: form.value.hintMessage,
      hasStudentSubmissions: false,
    })
  }

  showModal.value = false
}

function deleteActivity(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
    activities.value = activities.value.filter(a => a.id !== id)
  }
}

// Demo Preview simulation
function validateDemoSubmission() {
  if (form.value.template === 'quiz' || form.value.template === 'preguntas') {
    if (previewSelectedAnswer.value === 'correct') {
      demoFeedbackSuccess.value = true
    } else {
      demoFeedbackSuccess.value = false
    }
  } else if (form.value.template === 'listening') {
    const phrase = form.value.listeningPhrase.trim().toLowerCase()
    if (previewTypedPhrase.value.trim().toLowerCase().includes(phrase)) {
      demoFeedbackSuccess.value = true
    } else {
      demoFeedbackSuccess.value = false
    }
  } else {
    // Default success for others when validating
    demoFeedbackSuccess.value = true
  }
}

function resetDemo() {
  previewSelectedAnswer.value = null
  previewTypedPhrase.value = ''
  demoFeedbackSuccess.value = null
}
</script>

<style scoped>
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
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.backdrop-blur-xs {
  backdrop-filter: blur(2px);
}
</style>
