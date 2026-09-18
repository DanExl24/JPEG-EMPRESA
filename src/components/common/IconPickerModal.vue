<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm"
        @click.self="close"
      >
        <div 
          class="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-sky-50/50 via-white to-sky-50/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-[#006688]/10 text-[#006688] flex items-center justify-center font-bold">
                <span class="material-symbols-outlined text-2xl">category</span>
              </div>
              <div>
                <h3 class="text-base font-black text-gray-900 leading-tight">
                  {{ title || 'Selector de Iconos' }}
                </h3>
                <p class="text-xs text-gray-500">
                  {{ subtitle || 'Selecciona un icono visual para esta opción o actividad' }}
                </p>
              </div>
            </div>

            <button 
              type="button" 
              @click="close"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <!-- Search & Category Filters -->
          <div class="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
            <!-- Search Input -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                search
              </span>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Buscar por nombre (ej: sol, enfermero, pastilla, reloj, corazón, estetoscopio)..."
                class="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/10 focus:outline-none transition-all shadow-sm"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''"
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">cancel</span>
              </button>
            </div>

            <!-- Categories Tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button 
                v-for="cat in categories" 
                :key="cat.id"
                type="button"
                @click="selectedCategory = cat.id"
                :class="`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
                  selectedCategory === cat.id 
                    ? 'bg-[#006688] text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`"
              >
                <span class="material-symbols-outlined text-xs">{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
                <span class="text-[10px] opacity-70">({{ getCategoryCount(cat.id) }})</span>
              </button>
            </div>
          </div>

          <!-- Icon Grid Content -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
            <div v-if="filteredIcons.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              <button 
                v-for="icon in filteredIcons" 
                :key="icon.name"
                type="button"
                @click="selectIcon(icon.name)"
                :class="`group p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer relative ${
                  tempSelected === icon.name 
                    ? 'border-[#006688] bg-sky-50/80 shadow-md ring-2 ring-[#006688]/20 scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-[#006688]/40 hover:bg-gray-50/80 hover:shadow-sm'
                }`"
                :title="`${icon.label} (${icon.name})`"
              >
                <!-- Active Badge -->
                <span 
                  v-if="tempSelected === icon.name" 
                  class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#006688] ring-2 ring-white"
                ></span>

                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  :class="tempSelected === icon.name ? 'bg-[#006688] text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-sky-100 group-hover:text-[#006688]'"
                >
                  <span class="material-symbols-outlined text-2xl">{{ icon.name }}</span>
                </div>

                <div class="w-full">
                  <p class="text-[11px] font-bold text-gray-800 truncate leading-tight">
                    {{ icon.label }}
                  </p>
                  <p class="text-[9px] text-gray-400 font-mono truncate">
                    {{ icon.name }}
                  </p>
                </div>
              </button>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-10 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <span class="material-symbols-outlined text-2xl">search_off</span>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-700">No se encontraron iconos</p>
                <p class="text-[11px] text-gray-400">Intenta con otro término de búsqueda o ingresa el código exacto abajo</p>
              </div>
            </div>

            <!-- Custom Icon Name Input Option -->
            <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
              <div class="flex items-center gap-2 flex-1 w-full">
                <div class="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-[#006688]">
                  <span class="material-symbols-outlined text-xl">{{ customIconInput || 'stars' }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    ¿Deseas otro icono de Material Symbols?
                  </label>
                  <input 
                    v-model="customIconInput" 
                    type="text" 
                    placeholder="Escribe el nombre del icono (ej: science, monitor, emergency)"
                    class="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-mono text-gray-800 focus:border-[#006688] focus:outline-none"
                    @keyup.enter="applyCustomIcon"
                  />
                </div>
              </div>
              <button 
                type="button" 
                @click="applyCustomIcon"
                :disabled="!customIconInput.trim()"
                class="w-full sm:w-auto px-3.5 py-1.5 bg-gray-800 hover:bg-black text-white font-bold rounded-xl text-xs transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
              >
                Usar este
              </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 font-medium">Seleccionado:</span>
              <div v-if="tempSelected" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200">
                <span class="material-symbols-outlined text-sm text-[#006688]">{{ tempSelected }}</span>
                <span class="text-xs font-bold text-gray-800">{{ getIconLabel(tempSelected) }}</span>
                <span class="text-[10px] font-mono text-gray-400">({{ tempSelected }})</span>
              </div>
              <span v-else class="text-xs italic text-gray-400">Ninguno</span>
            </div>

            <div class="flex items-center gap-2">
              <button 
                v-if="tempSelected"
                type="button" 
                @click="clearIcon"
                class="px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 font-semibold cursor-pointer"
              >
                Quitar Icono
              </button>
              <button 
                type="button" 
                @click="close"
                class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                @click="confirmSelection"
                class="px-4 py-1.5 rounded-xl bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-sm">check</span>
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface IconItem {
  name: string
  label: string
  category: 'clinical' | 'time' | 'people' | 'actions' | 'equipment'
  tags: string[]
}

const props = defineProps<{
  modelValue?: string
  isOpen: boolean
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:isOpen', value: boolean): void
  (e: 'select', value: string): void
  (e: 'close'): void
}>()

const searchQuery = ref('')
const selectedCategory = ref<'all' | 'clinical' | 'time' | 'people' | 'actions' | 'equipment'>('all')
const tempSelected = ref(props.modelValue || '')
const customIconInput = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    tempSelected.value = props.modelValue || ''
    customIconInput.value = ''
    searchQuery.value = ''
  }
})

watch(() => props.modelValue, (newVal) => {
  tempSelected.value = newVal || ''
})

const categories = [
  { id: 'all' as const, label: 'Todos', icon: 'grid_view' },
  { id: 'clinical' as const, label: 'Salud & Clínica', icon: 'local_hospital' },
  { id: 'time' as const, label: 'Horas & Rutinas', icon: 'wb_sunny' },
  { id: 'people' as const, label: 'Personas & Roles', icon: 'badge' },
  { id: 'actions' as const, label: 'Acciones & Tareas', icon: 'task_alt' },
  { id: 'equipment' as const, label: 'Objetos & Equipos', icon: 'medical_services' },
]

const iconsCatalog: IconItem[] = [
  // HORAS Y TIEMPO (Cruciales para Saludos Diarios y Rutinas)
  { name: 'wb_sunny', label: 'Sol de Mañana', category: 'time', tags: ['mañana', 'morning', 'sol', 'amanecer', 'día', 'saludo'] },
  { name: 'light_mode', label: 'Sol de Mediodía / Tarde', category: 'time', tags: ['tarde', 'afternoon', 'sol', 'luz', 'calor'] },
  { name: 'bedtime', label: 'Luna y Estrellas', category: 'time', tags: ['noche', 'evening', 'night', 'luna', 'dormir', 'sueño'] },
  { name: 'nights_stay', label: 'Guardia Nocturna', category: 'time', tags: ['guardia', 'turno nocturno', 'noche', 'luna', 'hospital'] },
  { name: 'schedule', label: 'Reloj / Horario', category: 'time', tags: ['hora', 'tiempo', 'reloj', 'turno', 'minutos'] },
  { name: 'alarm', label: 'Alarma de Turno', category: 'time', tags: ['alarma', 'despertador', 'recordatorio', 'medicación'] },
  { name: 'hourglass_top', label: 'Espera / Temporizador', category: 'time', tags: ['tiempo', 'espera', 'arena', 'duración'] },
  { name: 'today', label: 'Día de Hoy', category: 'time', tags: ['hoy', 'fecha', 'calendario', 'día'] },
  { name: 'calendar_month', label: 'Calendario Mensual', category: 'time', tags: ['calendario', 'mes', 'citas', 'programación'] },
  { name: 'update', label: 'Ronda / Actualización', category: 'time', tags: ['ronda', 'actualizar', 'reloj', 'revisión'] },

  // PERSONAS Y ROLES (Saludos, Enfermeros, Pacientes)
  { name: 'badge', label: 'Tarjeta / Carnet', category: 'people', tags: ['enfermero', 'nurse', 'identificación', 'carnet', 'badge', 'presentación'] },
  { name: 'handshake', label: 'Apretón de Manos', category: 'people', tags: ['saludo', 'gusto en conocerte', 'meet', 'trato', 'acuerdo'] },
  { name: 'waving_hand', label: 'Saludar con la Mano', category: 'people', tags: ['hola', 'adiós', 'saludo', 'wave', 'despedida'] },
  { name: 'person', label: 'Paciente / Persona', category: 'people', tags: ['paciente', 'persona', 'usuario', 'individuo'] },
  { name: 'elderly', label: 'Adulto Mayor', category: 'people', tags: ['anciano', 'abuelo', 'geriatría', 'adulto mayor'] },
  { name: 'child_care', label: 'Pediatría / Niño', category: 'people', tags: ['bebé', 'niño', 'infantil', 'pediatría'] },
  { name: 'pregnant_woman', label: 'Maternidad', category: 'people', tags: ['embarazo', 'madre', 'obstetricia', 'parto'] },
  { name: 'group', label: 'Equipo Médico', category: 'people', tags: ['equipo', 'enfermeros', 'médicos', 'personal'] },
  { name: 'support_agent', label: 'Asistencia / Admisión', category: 'people', tags: ['recepción', 'ayuda', 'admisión', 'soporte'] },
  { name: 'record_voice_over', label: 'Hablar / Pronunciar', category: 'people', tags: ['hablar', 'voz', 'diálogo', 'comunicación'] },
  { name: 'hearing', label: 'Escuchar / Audición', category: 'people', tags: ['oído', 'escuchar', 'fonética', 'audio'] },
  { name: 'chat', label: 'Conversación Clínica', category: 'people', tags: ['charla', 'comunicación', 'mensaje', 'interrogatorio'] },
  { name: 'sentiment_satisfied', label: 'Paciente Satisfecho', category: 'people', tags: ['feliz', 'bienestar', 'alivio', 'salud'] },
  { name: 'thumb_up', label: 'Aprobación / OK', category: 'people', tags: ['bien', 'correcto', 'positivo', 'éxito'] },
  { name: 'help', label: 'Signo de Ayuda', category: 'people', tags: ['ayuda', 'pregunta', 'socorro', 'asistencia', 'help'] },

  // SALUD Y CLÍNICA (Términos médicos, Procedimientos)
  { name: 'local_hospital', label: 'Hospital / Clínica', category: 'clinical', tags: ['hospital', 'centro', 'clínica', 'urgencias'] },
  { name: 'stethoscope', label: 'Estetoscopio', category: 'clinical', tags: ['estetoscopio', 'auscultación', 'sonidos', 'médico'] },
  { name: 'medical_services', label: 'Maletín Médico', category: 'clinical', tags: ['maletín', 'primeros auxilios', 'servicios', 'doctor'] },
  { name: 'medication', label: 'Medicamento / Pastillas', category: 'clinical', tags: ['medicina', 'pastilla', 'fármaco', 'dosis', 'tratamiento'] },
  { name: 'vaccines', label: 'Vacunas / Inyecciones', category: 'clinical', tags: ['vacuna', 'jeringa', 'inyección', 'inmunización'] },
  { name: 'monitor_heart', label: 'Monitor Cardíaco', category: 'clinical', tags: ['corazón', 'pulso', 'ritmo', 'ecg', 'cardíaco'] },
  { name: 'healing', label: 'Vendaje / Curación', category: 'clinical', tags: ['curación', 'venda', 'herida', 'gasa', 'recuperación'] },
  { name: 'emergency', label: 'Emergencia / Cruz', category: 'clinical', tags: ['urgencia', 'cruz roja', 'alerta', 'emergencias'] },
  { name: 'clinical_notes', label: 'Historia Clínica', category: 'clinical', tags: ['registro', 'notas', 'epicrisis', 'expediente'] },
  { name: 'bloodtype', label: 'Tipo de Sangre', category: 'clinical', tags: ['sangre', 'hemoglobina', 'transfusión', 'laboratorio'] },
  { name: 'thermostat', label: 'Termómetro', category: 'clinical', tags: ['temperatura', 'fiebre', 'grados', 'termómetro'] },
  { name: 'clean_hands', label: 'Lavado de Manos', category: 'clinical', tags: ['higiene', 'lavado', 'desinfección', 'manos', 'asepsia'] },
  { name: 'sanitizer', label: 'Gel Antibacterial', category: 'clinical', tags: ['alcohol', 'desinfectante', 'gel', 'limpieza'] },
  { name: 'masks', label: 'Mascarilla / Tapabocas', category: 'clinical', tags: ['mascarilla', 'tapabocas', 'protección', 'epp'] },
  { name: 'personal_injury', label: 'Paciente con Lesión', category: 'clinical', tags: ['trauma', 'lesión', 'caída', 'dolor'] },
  { name: 'health_and_safety', label: 'Bioseguridad', category: 'clinical', tags: ['escudo', 'seguridad', 'protección', 'protocolo'] },

  // EQUIPOS Y OBJETOS HOSPITALARIOS
  { name: 'bed', label: 'Cama de Hospital', category: 'equipment', tags: ['cama', 'camilla', 'habitación', 'hospitalización'] },
  { name: 'wheelchair_pickup', label: 'Silla de Ruedas', category: 'equipment', tags: ['silla', 'movilidad', 'traslado', 'paciente'] },
  { name: 'accessible', label: 'Discapacidad / Rampa', category: 'equipment', tags: ['accesibilidad', 'movilidad', 'cuidado'] },
  { name: 'biotechnology', label: 'Microscopio / Laboratorio', category: 'equipment', tags: ['laboratorio', 'análisis', 'muestras', 'microscopio'] },
  { name: 'science', label: 'Probeta / Bioquímica', category: 'equipment', tags: ['química', 'fármacos', 'laboratorio', 'reactivos'] },
  { name: 'visibility', label: 'Examen Visual / Ojo', category: 'equipment', tags: ['ojo', 'visión', 'oftalmología', 'pupilas'] },
  { name: 'shield', label: 'Escudo Protector', category: 'equipment', tags: ['defensa', 'protección', 'barrera'] },
  { name: 'pan_tool', label: 'Mano / Arrastrar', category: 'equipment', tags: ['mano', 'arrastrar', 'contacto', 'palma'] },

  // ACCIONES, EVALUACIÓN Y GAMIFICACIÓN
  { name: 'check_circle', label: 'Verificado / Correcto', category: 'actions', tags: ['check', 'aprobado', 'correcto', 'bien'] },
  { name: 'task_alt', label: 'Tarea Completada', category: 'actions', tags: ['tarea', 'lista', 'completado', 'éxito'] },
  { name: 'fact_check', label: 'Chequeo de Datos', category: 'actions', tags: ['auditoría', 'revisión', 'inspección'] },
  { name: 'assignment', label: 'Hoja de Asignación', category: 'actions', tags: ['protocolo', 'papel', 'documento', 'tarea'] },
  { name: 'quiz', label: 'Pregunta / Cuestionario', category: 'actions', tags: ['trivia', 'test', 'evaluación', 'pregunta'] },
  { name: 'priority_high', label: 'Atención Prioritaria', category: 'actions', tags: ['alerta', 'peligro', 'cuidado', 'prioridad'] },
  { name: 'lightbulb', label: 'Idea / Pista Clínica', category: 'actions', tags: ['bombillo', 'idea', 'pista', 'conocimiento'] },
  { name: 'star', label: 'Puntaje / Estrella', category: 'actions', tags: ['estrella', 'favorito', 'puntos', 'premio'] },
  { name: 'trophy', label: 'Trofeo / Medalla', category: 'actions', tags: ['campeón', 'victoria', 'trofeo', 'logro'] },
  { name: 'military_tech', label: 'Insignia de Honor', category: 'actions', tags: ['insignia', 'honor', 'rango', 'mérito'] },
  { name: 'bolt', label: 'Rapidez / Energía', category: 'actions', tags: ['energía', 'rápido', 'contrar不了', 'velocidad'] },
  { name: 'psychology', label: 'Juicio Clínico', category: 'actions', tags: ['cerebro', 'pensamiento', 'diagnóstico', 'mente'] },
  { name: 'sports_esports', label: 'Juego Interactivo', category: 'actions', tags: ['videojuego', 'dinámica', 'mando', 'juego'] },
  { name: 'school', label: 'Formación / Escuela', category: 'actions', tags: ['graduación', 'aprendizaje', 'sena', 'universidad'] },
  { name: 'menu_book', label: 'Manual de Enfermería', category: 'actions', tags: ['libro', 'guía', 'estudio', 'lectura'] },
]

function getCategoryCount(catId: string) {
  if (catId === 'all') return iconsCatalog.length
  return iconsCatalog.filter(i => i.category === catId).length
}

function getIconLabel(name: string): string {
  const found = iconsCatalog.find(i => i.name === name)
  return found ? found.label : name
}

const filteredIcons = computed(() => {
  let list = iconsCatalog

  if (selectedCategory.value !== 'all') {
    list = list.filter(i => i.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(i => 
      i.name.toLowerCase().includes(q) ||
      i.label.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  return list
})

function selectIcon(iconName: string) {
  tempSelected.value = iconName
}

function applyCustomIcon() {
  const clean = customIconInput.value.trim().toLowerCase().replace(/\s+/g, '_')
  if (clean) {
    tempSelected.value = clean
  }
}

function clearIcon() {
  tempSelected.value = ''
  emit('update:modelValue', '')
  emit('select', '')
  emit('close')
}

function confirmSelection() {
  emit('update:modelValue', tempSelected.value)
  emit('select', tempSelected.value)
  emit('close')
}

function close() {
  emit('close')
  emit('update:isOpen', false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-up {
  animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
