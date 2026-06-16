<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Cursos</h2>
        <p class="text-gray-500 mt-1">
          {{ auth.isAdmin || auth.isInstructor ? 'Gestiona todos los cursos y estandariza los módulos de aprendizaje.' : 'Explora y continúa tu aprendizaje.' }}
        </p>
      </div>
      <button 
        v-if="auth.isAdmin || auth.isInstructor" 
        @click="openNewCourseModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
      >
        <span class="material-symbols-outlined text-base">add</span>
        Nuevo Curso
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <button v-for="filter in filters" :key="filter" @click="activeFilter = filter"
        :class="`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter ? 'bg-[#006688] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#006688]'}`">
        {{ filter }}
      </button>
    </div>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="course in filteredCourses" :key="course.id" class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
        <div :class="`h-36 flex items-center justify-center ${course.bg}`">
          <span class="material-symbols-outlined text-6xl opacity-60" :style="`color: ${course.iconColor}`">{{ course.icon }}</span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span :class="`text-xs font-bold px-2 py-1 rounded-full ${course.categoryBg} ${course.categoryText}`">{{ course.category }}</span>
            <span class="text-xs text-gray-400">{{ course.duration }}</span>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">{{ course.title }}</h4>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ course.description }}</p>
          
          <div v-if="!auth.isAdmin && !auth.isInstructor" class="mb-3">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{{ course.progress || 0 }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="h-1.5 rounded-full bg-[#006688] transition-all" :style="`width: ${course.progress || 0}%`"></div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span class="material-symbols-outlined text-sm">group</span>
              {{ course.students }} estudiantes
            </div>
            
            <router-link
              v-if="!auth.isAdmin && !auth.isInstructor"
              :to="`/dashboard/cursos/${course.id}`"
              class="text-xs font-semibold text-[#006688] hover:underline"
            >
              Continuar
            </router-link>
            
            <button
              v-else
              @click="openEditCourseModal(course)"
              class="text-xs font-semibold text-[#006688] hover:underline"
            >
              Editar Estructura
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Course & Standardized Modules Editor Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-8 max-h-[90vh] animate-slide-up">
        
        <!-- Modal Header -->
        <div class="bg-[#006688] text-white p-6 flex justify-between items-center shrink-0">
          <div class="space-y-1">
            <h3 class="text-lg font-black">{{ editingCourse ? 'Editar Estructura del Curso' : 'Crear Nuevo Curso Técnico' }}</h3>
            <p class="text-xs text-cyan-100">HU02: Estandarización y consistencia pedagógica de módulos de aprendizaje</p>
          </div>
          <button @click="showModal = false" class="text-white hover:text-cyan-200 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          
          <!-- Standard Mandatory Banner -->
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span class="material-symbols-outlined text-amber-600 mt-0.5">verified</span>
            <div class="text-xs space-y-1">
              <h4 class="font-bold text-amber-800 uppercase tracking-wider">Estructura Pedagógica Obligatoria Activa</h4>
              <p class="text-amber-700 leading-relaxed">
                Este sistema fuerza a todos los cursos creados a estructurarse obligatoriamente bajo las <strong>4 fases secuenciales</strong> (Inicio, Estudio, Práctica, Evaluación). Puedes personalizar el contenido interno, pero no omitir ninguna fase para garantizar la integridad pedagógica.
              </p>
            </div>
          </div>

          <!-- Section 1: Basic Information -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-1.5 h-3.5 bg-[#006688] rounded-full"></span>
              1. Información General del Curso
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Título del Curso</label>
                <input type="text" v-model="form.title" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Farmacología Avanzada" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Duración Estimada</label>
                <input type="text" v-model="form.duration" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. 16h" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Categoría</label>
                <select v-model="form.category" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]">
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Especialidad">Especialidad</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-gray-500">Estilo Visual (Icono)</label>
                <div class="flex gap-2">
                  <button 
                    v-for="ico in iconOptions" 
                    :key="ico.name"
                    @click="selectIcon(ico)"
                    type="button"
                    :class="`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${form.icon === ico.name ? 'border-[#006688] bg-[#006688]/10 text-[#006688] scale-105' : 'border-gray-200 text-gray-400'}`"
                    :title="ico.name"
                  >
                    <span class="material-symbols-outlined text-sm">{{ ico.name }}</span>
                  </button>
                </div>
              </div>
              <div class="md:col-span-2 space-y-1">
                <label class="text-xs font-bold text-gray-500">Descripción Corta</label>
                <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Resumen corto del curso..."></textarea>
              </div>
            </div>
          </div>

          <!-- Section 2: Module Content Customization -->
          <div class="space-y-4 pt-4 border-t border-gray-100">
            <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-1.5 h-3.5 bg-[#006688] rounded-full"></span>
              2. Personalizar Fases del Módulo de Aprendizaje
            </h4>

            <!-- Phase Tabs -->
            <div class="flex border-b border-gray-200 text-xs">
              <button 
                v-for="phase in modalPhases" 
                :key="phase.id"
                @click="activeModalPhase = phase.id"
                type="button"
                :class="`px-4 py-2 font-bold border-b-2 transition-all ${
                  activeModalPhase === phase.id 
                    ? 'border-[#006688] text-[#006688]' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`"
              >
                {{ phase.name }}
              </button>
            </div>

            <!-- Modal Phase Content Panels -->
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              
              <!-- F1: Inicio -->
              <div v-if="activeModalPhase === 'inicio'" class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-black text-gray-700">Fase 1: Preparación (Warm-up)</span>
                  <span class="text-[9px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Obligatorio</span>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Mensaje/Texto de Bienvenida</label>
                  <input type="text" v-model="form.f1_welcome" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Bienvenido al módulo de enfermería básica." />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Palabras desordenadas para el Calentamiento (separadas por comas)</label>
                  <input type="text" v-model="form.f1_gameWords" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. checks, The nurse, the, patient's, blood pressure" />
                  <p class="text-[10px] text-gray-400 italic">El estudiante deberá ordenarlas para avanzar a la fase de estudio.</p>
                </div>
              </div>

              <!-- F2: Estudio -->
              <div v-if="activeModalPhase === 'estudio'" class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-black text-gray-700">Fase 2: Absorción (Teoría y Vocabulario)</span>
                  <span class="text-[9px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Obligatorio</span>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Explicación Gramatical (Color-coded)</label>
                  <textarea v-model="form.f2_grammar" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Oración de ejemplo para colorear..."></textarea>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Vocabulario Técnico de Escucha (separado por comas)</label>
                  <input type="text" v-model="form.f2_vocabulary" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Stethoscope, Intravenous, Suture" />
                </div>
              </div>

              <!-- F3: Práctica -->
              <div v-if="activeModalPhase === 'practica'" class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-black text-gray-700">Fase 3: Práctica Activa (Ejercicios y Voz)</span>
                  <span class="text-[9px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Obligatorio</span>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Texto para Rellenar Blanco (Fill-in-the-blank)</label>
                  <input type="text" v-model="form.f3_fillBlank" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Respuesta correcta obligatoria" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-gray-500">Oración de Grabación de Voz (Límite 1 min)</label>
                  <input type="text" v-model="form.f3_voiceTarget" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Oración a pronunciar" />
                </div>
              </div>

              <!-- F4: Cierre -->
              <div v-if="activeModalPhase === 'evaluacion'" class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-black text-gray-700">Fase 4: Evaluación Final (Examen)</span>
                  <span class="text-[9px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Obligatorio</span>
                </div>
                <div class="p-3 bg-white rounded-xl border border-gray-100 space-y-3">
                  <span class="text-[10px] font-bold text-gray-400">PREGUNTA DE EVALUACIÓN</span>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-500">Enunciado de la Pregunta</label>
                    <input type="text" v-model="form.f4_q" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Opción Correcta</label>
                      <input type="text" v-model="form.f4_correct" class="w-full px-2 py-1.5 border border-green-200 bg-green-50/50 rounded-lg text-xs font-semibold focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Opción Incorrecta</label>
                      <input type="text" v-model="form.f4_incorrect" class="w-full px-2 py-1.5 border border-red-200 bg-red-50/50 rounded-lg text-xs font-semibold focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button @click="showModal = false" class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all">Cancelar</button>
          <button @click="saveCourse" class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl shadow transition-all">Guardar Módulo</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const activeFilter = ref('Todos')
const filters = ['Todos', 'En Progreso', 'Completados', 'Nuevos']

// Initial Courses Data State
const courses = ref([
  { id: 1, title: 'Fundamentos de Enfermería', description: 'Bases esenciales para el ejercicio profesional de la enfermería clínica.', category: 'Básico', categoryBg: 'bg-blue-100', categoryText: 'text-blue-700', duration: '12h', students: 340, progress: 75, icon: 'medical_services', bg: 'bg-blue-50', iconColor: '#3b82f6' },
  { id: 2, title: 'Farmacología Clínica', description: 'Principios de medicamentos, dosificación y administración segura.', category: 'Intermedio', categoryBg: 'bg-orange-100', categoryText: 'text-orange-700', duration: '18h', students: 215, progress: 30, icon: 'medication', bg: 'bg-orange-50', iconColor: '#f97316' },
  { id: 3, title: 'Cuidados Críticos UCI', description: 'Atención intensiva a pacientes en estado crítico y monitoreo.', category: 'Avanzado', categoryBg: 'bg-red-100', categoryText: 'text-red-700', duration: '24h', students: 98, progress: 10, icon: 'monitor_heart', bg: 'bg-red-50', iconColor: '#ef4444' },
  { id: 4, title: 'Salud Mental y Psiquiatría', description: 'Abordaje integral del paciente con trastornos mentales.', category: 'Intermedio', categoryBg: 'bg-purple-100', categoryText: 'text-purple-700', duration: '15h', students: 178, progress: 0, icon: 'psychology', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { id: 5, title: 'Atención Materno-Infantil', description: 'Cuidados durante el embarazo, parto y el recién nacido.', category: 'Especialidad', categoryBg: 'bg-pink-100', categoryText: 'text-pink-700', duration: '20h', students: 262, progress: 100, icon: 'child_care', bg: 'bg-pink-50', iconColor: '#ec4899' },
  { id: 6, title: 'Urgencias y Emergencias', description: 'Protocolos de actuación ante situaciones de emergencia médica.', category: 'Avanzado', categoryBg: 'bg-red-100', categoryText: 'text-red-700', duration: '16h', students: 143, progress: 55, icon: 'emergency', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
])

const iconOptions = [
  { name: 'medical_services', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', catBg: 'bg-blue-100' },
  { name: 'medication', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', catBg: 'bg-orange-100' },
  { name: 'monitor_heart', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', catBg: 'bg-red-100' },
  { name: 'psychology', color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', catBg: 'bg-purple-100' },
  { name: 'child_care', color: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-700', catBg: 'bg-pink-100' },
  { name: 'emergency', color: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-700', catBg: 'bg-yellow-100' },
]

const modalPhases = [
  { id: 'inicio', name: 'F1: Inicio' },
  { id: 'estudio', name: 'F2: Estudio' },
  { id: 'practica', name: 'F3: Práctica' },
  { id: 'evaluacion', name: 'F4: Evaluación' },
]

// Modal & Form States
const showModal = ref(false)
const editingCourse = ref(null)
const activeModalPhase = ref('inicio')

const form = ref({
  title: '',
  description: '',
  category: 'Básico',
  duration: '',
  icon: 'medical_services',
  iconColor: '#3b82f6',
  bg: 'bg-blue-50',
  categoryBg: 'bg-blue-100',
  categoryText: 'text-blue-700',
  f1_welcome: '',
  f1_gameWords: '',
  f2_grammar: '',
  f2_vocabulary: '',
  f3_fillBlank: '',
  f3_voiceTarget: '',
  f4_q: '',
  f4_correct: '',
  f4_incorrect: '',
})

// Filter computation
const filteredCourses = computed(() => {
  if (activeFilter.value === 'Todos') return courses.value
  if (activeFilter.value === 'En Progreso') return courses.value.filter(c => c.progress > 0 && c.progress < 100)
  if (activeFilter.value === 'Completados') return courses.value.filter(c => c.progress === 100)
  if (activeFilter.value === 'Nuevos') return courses.value.filter(c => c.progress === 0 || !c.progress)
  return courses.value
})

// Handlers
function openNewCourseModal() {
  editingCourse.value = null
  activeModalPhase.value = 'inicio'
  form.value = {
    title: '',
    description: '',
    category: 'Básico',
    duration: '10h',
    icon: 'medical_services',
    iconColor: '#3b82f6',
    bg: 'bg-blue-50',
    categoryBg: 'bg-blue-100',
    categoryText: 'text-blue-700',
    f1_welcome: 'Welcome to this technical training module.',
    f1_gameWords: 'checks, The nurse, the, patient\'s, blood pressure',
    f2_grammar: 'The nurse checks the patient.',
    f2_vocabulary: 'Stethoscope, Suture, Heart rate',
    f3_fillBlank: 'prescription',
    f3_voiceTarget: 'The patient is stable.',
    f4_q: '¿Qué significa respiration rate?',
    f4_correct: 'Frecuencia respiratoria',
    f4_incorrect: 'Presión arterial',
  }
  showModal.value = true
}

function openEditCourseModal(course) {
  editingCourse.value = course
  activeModalPhase.value = 'inicio'
  
  // Fill form with current data (or defaults if missing)
  form.value = {
    title: course.title,
    description: course.description,
    category: course.category,
    duration: course.duration,
    icon: course.icon,
    iconColor: course.iconColor,
    bg: course.bg,
    categoryBg: course.categoryBg,
    categoryText: course.categoryText,
    f1_welcome: course.f1_welcome || 'Welcome to this technical training module.',
    f1_gameWords: course.f1_gameWords || 'checks, The nurse, the, patient\'s, blood pressure',
    f2_grammar: course.f2_grammar || 'The nurse checks the patient.',
    f2_vocabulary: course.f2_vocabulary || 'Stethoscope, Suture, Heart rate',
    f3_fillBlank: course.f3_fillBlank || 'prescription',
    f3_voiceTarget: course.f3_voiceTarget || 'The patient is stable.',
    f4_q: course.f4_q || '¿Qué significa respiration rate?',
    f4_correct: course.f4_correct || 'Frecuencia respiratoria',
    f4_incorrect: course.f4_incorrect || 'Presión arterial',
  }
  
  showModal.value = true
}

function selectIcon(ico) {
  form.value.icon = ico.name
  form.value.iconColor = ico.color
  form.value.bg = ico.bg
  form.value.categoryText = ico.text
  form.value.categoryBg = ico.catBg
}

function saveCourse() {
  if (!form.value.title.trim()) return

  if (editingCourse.value) {
    // Edit Mode: update in array
    const idx = courses.value.findIndex(c => c.id === editingCourse.value.id)
    if (idx >= 0) {
      courses.value[idx] = {
        ...courses.value[idx],
        title: form.value.title,
        description: form.value.description,
        category: form.value.category,
        duration: form.value.duration,
        icon: form.value.icon,
        iconColor: form.value.iconColor,
        bg: form.value.bg,
        categoryText: form.value.categoryText,
        categoryBg: form.value.categoryBg,
        f1_welcome: form.value.f1_welcome,
        f1_gameWords: form.value.f1_gameWords,
        f2_grammar: form.value.f2_grammar,
        f2_vocabulary: form.value.f2_vocabulary,
        f3_fillBlank: form.value.f3_fillBlank,
        f3_voiceTarget: form.value.f3_voiceTarget,
        f4_q: form.value.f4_q,
        f4_correct: form.value.f4_correct,
        f4_incorrect: form.value.f4_incorrect,
      }
    }
  } else {
    // Add Mode: push to array
    const newId = courses.value.length ? Math.max(...courses.value.map(c => c.id)) + 1 : 1
    courses.value.push({
      id: newId,
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      duration: form.value.duration,
      icon: form.value.icon,
      iconColor: form.value.iconColor,
      bg: form.value.bg,
      categoryText: form.value.categoryText,
      categoryBg: form.value.categoryBg,
      students: 0,
      progress: 0,
      f1_welcome: form.value.f1_welcome,
      f1_gameWords: form.value.f1_gameWords,
      f2_grammar: form.value.f2_grammar,
      f2_vocabulary: form.value.f2_vocabulary,
      f3_fillBlank: form.value.f3_fillBlank,
      f3_voiceTarget: form.value.f3_voiceTarget,
      f4_q: form.value.f4_q,
      f4_correct: form.value.f4_correct,
      f4_incorrect: form.value.f4_incorrect,
    })
  }

  showModal.value = false
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
