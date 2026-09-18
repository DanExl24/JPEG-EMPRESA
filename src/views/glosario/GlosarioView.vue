<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">

    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-6 text-white shadow-md">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <div>
            <h2 class="text-2xl font-black">Glosario Clínico</h2>
            <p class="text-emerald-100 text-sm mt-0.5">Definiciones detalladas de conceptos clínicos y médicos</p>
          </div>
        </div>

        <!-- Admin / Instructor Add Button -->
        <button 
          v-if="canManage"
          @click="openAddModal"
          class="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 rounded-xl text-xs font-black hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <span class="material-symbols-outlined text-base">add</span>
          Agregar Concepto
        </button>
      </div>

      <div class="mt-4 relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar concepto, área o definición..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>
    </div>

    <!-- Interactive Filter Toolbar -->
    <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
      
      <!-- Filter Row 1: Clinical Specialties / Areas (Horizontal Scrollable Chips) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-black text-gray-700 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-emerald-600 text-base">category</span>
            Especialidades Médicas:
          </span>
          <span class="text-[11px] font-bold text-gray-400">
            {{ presentAreasWithCount.length }} áreas registradas
          </span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-2.5 custom-green-scrollbar">
          <button
            @click="selectedArea = 'all'"
            :class="`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedArea === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
            }`"
          >
            <span>Todas</span>
            <span :class="`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedArea === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`">
              {{ glossaryTerms.length }}
            </span>
          </button>

          <button
            v-for="area in presentAreasWithCount"
            :key="area.name"
            @click="selectedArea = selectedArea === area.name ? 'all' : area.name"
            :class="`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedArea === area.name
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
            }`"
          >
            <span>{{ area.name }}</span>
            <span :class="`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedArea === area.name ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`">
              {{ area.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filter Row 2: Alphabet Index (A-Z) -->
      <div class="pt-3 border-t border-gray-100 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-black text-gray-700 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-teal-600 text-base">spellcheck</span>
            Índice Alfabético:
          </span>
          <button
            v-if="activeLetter"
            @click="activeLetter = null"
            class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-0.5"
          >
            <span class="material-symbols-outlined text-xs">close</span>
            Mostrar todo el abecedario
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5 items-center">
          <button
            @click="activeLetter = null"
            :class="`px-2.5 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeLetter === null
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-gray-50 text-gray-500 border border-gray-200/70 hover:bg-gray-100'
            }`"
          >
            Todas
          </button>

          <button
            v-for="letter in alphabet"
            :key="letter"
            @click="activeLetter = activeLetter === letter ? null : letter"
            :class="`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeLetter === letter
                ? 'bg-emerald-600 text-white shadow-sm scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
            }`"
          >
            {{ letter }}
          </button>
        </div>
      </div>

      <!-- Filter Row 3: Content Types, Sort & View Actions -->
      <div class="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <!-- Content Attributes Filters -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="font-bold text-gray-500 mr-1">Contenido:</span>
          <button
            @click="contentFilter = 'all'"
            :class="`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              contentFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`"
          >
            Todos
          </button>

          <button
            @click="contentFilter = contentFilter === 'with_example' ? 'all' : 'with_example'"
            :class="`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              contentFilter === 'with_example'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100'
            }`"
            title="Mostrar solo términos que incluyen ejemplo o contexto clínico"
          >
            <span class="material-symbols-outlined text-xs">clinical_notes</span>
            <span>Con Caso Clínico</span>
            <span class="text-[10px] opacity-75 font-semibold">({{ termsWithExampleCount }})</span>
          </button>

          <button
            @click="contentFilter = contentFilter === 'with_related' ? 'all' : 'with_related'"
            :class="`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              contentFilter === 'with_related'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200/80 hover:bg-indigo-100'
            }`"
            title="Mostrar solo conceptos con términos relacionados"
          >
            <span class="material-symbols-outlined text-xs">hub</span>
            <span>Con Relacionados</span>
            <span class="text-[10px] opacity-75 font-semibold">({{ termsWithRelatedCount }})</span>
          </button>
        </div>

        <!-- Sorting & Global Actions -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
            <span class="material-symbols-outlined text-gray-400 text-sm">sort</span>
            <select
              v-model="sortBy"
              class="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="alpha_asc">Alfabético: A → Z</option>
              <option value="alpha_desc">Alfabético: Z → A</option>
              <option value="area">Por Especialidad</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>

          <button
            @click="expanded.size === filteredTerms.length ? collapseAll() : expandAll()"
            class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
            :title="expanded.size === filteredTerms.length ? 'Colapsar todas las tarjetas' : 'Expandir todas las tarjetas'"
          >
            <span class="material-symbols-outlined text-xs">
              {{ expanded.size === filteredTerms.length ? 'unfold_less' : 'unfold_more' }}
            </span>
            <span>{{ expanded.size === filteredTerms.length ? 'Colapsar' : 'Expandir' }}</span>
          </button>

          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="Restablecer todos los filtros"
          >
            <span class="material-symbols-outlined text-xs">restart_alt</span>
            <span>Limpiar</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Active Filters Summary Banner -->
    <div class="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-gray-500 px-1">
      <div class="flex items-center gap-2 flex-wrap">
        <span>Mostrando <span class="text-emerald-700 font-black">{{ filteredTerms.length }}</span> de {{ glossaryTerms.length }} conceptos</span>
        <span v-if="selectedArea !== 'all'" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] border border-emerald-200 flex items-center gap-1">
          Área: {{ selectedArea }}
          <button @click="selectedArea = 'all'" class="hover:text-emerald-900 cursor-pointer">×</button>
        </span>
        <span v-if="activeLetter" class="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[11px] border border-teal-200 flex items-center gap-1">
          Letra: {{ activeLetter }}
          <button @click="activeLetter = null" class="hover:text-teal-900 cursor-pointer">×</button>
        </span>
        <span v-if="contentFilter !== 'all'" class="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[11px] border border-purple-200 flex items-center gap-1">
          {{ contentFilter === 'with_example' ? 'Con Caso Clínico' : 'Con Relacionados' }}
          <button @click="contentFilter = 'all'" class="hover:text-purple-900 cursor-pointer">×</button>
        </span>
        <span v-if="searchQuery.trim()" class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] border border-amber-200 flex items-center gap-1">
          Búsqueda: "{{ searchQuery }}"
          <button @click="searchQuery = ''" class="hover:text-amber-900 cursor-pointer">×</button>
        </span>
      </div>

      <button
        v-if="hasActiveFilters"
        @click="resetFilters"
        class="text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1"
      >
        <span>Restablecer vista</span>
      </button>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading && glossaryTerms.length === 0" class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin"></div>
      <p class="text-xs font-bold text-gray-400">Cargando glosario clínico...</p>
    </div>

    <!-- Glossary list -->
    <div v-else class="space-y-3">
      <div
        v-for="term in filteredTerms"
        :key="term.id || term.term"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
      >
        <button
          class="w-full flex items-center justify-between gap-4 p-5 text-left"
          @click="toggle(term.term)"
        >
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <span class="text-lg font-black text-emerald-600">{{ (term.term || '?')[0].toUpperCase() }}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-black text-gray-800 truncate text-base">{{ term.term }}</p>
                <button
                  @click.stop="speak(term.term)"
                  class="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                  title="Pronunciar término clínico"
                >
                  <span class="material-symbols-outlined text-sm block">volume_up</span>
                </button>
              </div>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-md">{{ term.area }}</span>
                <span v-if="term.example" class="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded flex items-center gap-0.5" title="Tiene caso clínico">
                  <span class="material-symbols-outlined text-[11px]">clinical_notes</span> Caso
                </span>
                <span v-if="term.related && term.related.length" class="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded flex items-center gap-0.5" title="Tiene términos relacionados">
                  <span class="material-symbols-outlined text-[11px]">hub</span> {{ term.related.length }} rel.
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <!-- Action buttons for admin / instructor -->
            <div v-if="canManage" class="flex items-center gap-1 mr-1" @click.stop>
              <button
                @click.stop="openEditModal(term)"
                class="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                title="Editar concepto"
              >
                <span class="material-symbols-outlined text-base block">edit</span>
              </button>
              <button
                @click.stop="deleteTerm(term)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Eliminar concepto"
              >
                <span class="material-symbols-outlined text-base block">delete</span>
              </button>
            </div>
            <span class="material-symbols-outlined text-gray-400 shrink-0 transition-transform" :style="expanded.has(term.term) ? 'transform:rotate(180deg)' : ''">expand_more</span>
          </div>
        </button>
        <div v-if="expanded.has(term.term)" class="px-5 pb-5 space-y-3 border-t border-gray-50 animate-fade-in">
          <p class="text-sm text-gray-700 leading-relaxed">{{ term.definition }}</p>
          <div v-if="term.related && term.related.length" class="flex flex-wrap gap-2 items-center">
            <span class="text-xs font-bold text-gray-400">Relacionados:</span>
            <span 
              v-for="r in term.related" 
              :key="r" 
              @click.stop="searchQuery = r"
              class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
              title="Filtrar por este término relacionado"
            >
              {{ r }}
            </span>
          </div>
          <div v-if="term.example" class="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Contexto clínico / Aplicación</p>
              <button
                @click="speak(term.example)"
                class="text-[11px] text-gray-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                title="Escuchar contexto clínico"
              >
                <span class="material-symbols-outlined text-xs">volume_up</span> Escuchar
              </button>
            </div>
            <p class="text-xs text-gray-600 italic leading-relaxed">"{{ term.example }}"</p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!loading && filteredTerms.length === 0" class="text-center text-gray-400 py-12 font-semibold text-sm">
      No se encontraron términos para "{{ searchQuery }}"
    </p>

    <!-- CRUD Form Modal for Admin / Instructor -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
      <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-xl">{{ editingTerm ? 'edit_note' : 'post_add' }}</span>
            <h3 class="font-black text-base">{{ editingTerm ? 'Editar Concepto Clínico' : 'Nuevo Concepto Clínico' }}</h3>
          </div>
          <button @click="showModal = false" class="text-white/80 hover:text-white rounded-lg p-1 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-xl block">close</span>
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="saveTerm" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <!-- Term -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700">Término / Concepto <span class="text-red-500">*</span></label>
            <input
              v-model="form.term"
              type="text"
              required
              placeholder="Ej. Anamnesis, Taquicardia, Catéter..."
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <!-- Area / Specialty -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700">Área Médica / Especialidad <span class="text-red-500">*</span></label>
            <input
              v-model="form.area"
              list="glossary-areas"
              type="text"
              required
              placeholder="Ej. Cardiología, Semiología, Procedimientos..."
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <datalist id="glossary-areas">
              <option v-for="area in availableAreas" :key="area" :value="area" />
            </datalist>
          </div>

          <!-- Definition -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700">Definición Clínica <span class="text-red-500">*</span></label>
            <textarea
              v-model="form.definition"
              required
              rows="3"
              placeholder="Descripción detallada del concepto clínico y su relevancia médica..."
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-y"
            ></textarea>
          </div>

          <!-- Related Concepts -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700">Conceptos Relacionados <span class="text-gray-400 font-normal">(separados por coma)</span></label>
            <input
              v-model="form.related"
              type="text"
              placeholder="Ej. Historia clínica, Exploración física, ECG"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <!-- Example / Clinical Context -->
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-700">Contexto Clínico / Ejemplo de Aplicación</label>
            <textarea
              v-model="form.example"
              rows="2"
              placeholder="Ej. El paciente presenta taquicardia sinusal con FC de 115 bpm..."
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-y"
            ></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ saving ? 'Guardando...' : (editingTerm ? 'Actualizar Concepto' : 'Crear Concepto') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const searchQuery = ref('')
const activeLetter = ref(null)
const selectedArea = ref('all')
const contentFilter = ref('all') // 'all' | 'with_example' | 'with_related'
const sortBy = ref('alpha_asc') // 'alpha_asc' | 'alpha_desc' | 'area' | 'newest'
const expanded = ref(new Set())
const loading = ref(false)
const saving = ref(false)

const canManage = computed(() => auth.isAdmin || auth.isInstructor)

// Modal State
const showModal = ref(false)
const editingTerm = ref(null)
const form = ref({
  term: '',
  area: '',
  definition: '',
  related: '',
  example: ''
})

function toggle(term) {
  if (expanded.value.has(term)) {
    expanded.value.delete(term)
  } else {
    expanded.value.add(term)
  }
}

const DEFAULT_GLOSSARY = [
  { id: 1, term: 'Anamnesis', area: 'Evaluación clínica', definition: 'Historia clínica obtenida a través de la entrevista al paciente o sus familiares. Incluye antecedentes personales, familiares, hábitos y motivo de consulta. Es el primer paso en la evaluación de un paciente.', related: ['Historia clínica', 'Exploración física'], example: 'Una anamnesis completa reveló antecedentes de hipertensión arterial no tratada.' },
  { id: 2, term: 'Asepsia', area: 'Control de infecciones', definition: 'Ausencia de microorganismos patógenos en un área o material. Se logra mediante técnicas estériles, uso de guantes, mascarillas y desinfección de superficies. Fundamental en procedimientos invasivos.', related: ['Antisepsia', 'Esterilización', 'Desinfección'], example: 'Se mantiene asepsia estricta durante la inserción del catéter venoso central.' },
  { id: 3, term: 'Bradicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca inferior a 60 latidos por minuto en adultos. Puede ser fisiológica (atletas) o patológica. Los síntomas incluyen mareo, síncope y fatiga.', related: ['Taquicardia', 'Arritmia', 'ECG'], example: 'El paciente presenta bradicardia sinusal con FC de 45 lpm y síncope episódico.' },
  { id: 4, term: 'Catéter', area: 'Procedimientos', definition: 'Tubo flexible de diferentes materiales (plástico, silicona) que se introduce en cavidades, vasos o conductos del cuerpo para drenar, inyectar fluidos o realizar mediciones.', related: ['Vía intravenosa', 'Sonda vesical', 'Cateterismo cardíaco'], example: 'Se colocó un catéter de Foley para monitorizar el gasto urinario.' },
  { id: 5, term: 'Disnea', area: 'Respiratorio', definition: 'Sensación subjetiva de dificultad respiratoria o falta de aire. Puede clasificarse por severidad (leve, moderada, severa) y origen (cardíaca, pulmonar, psicógena). Signo de múltiples patologías.', related: ['Taquipnea', 'Hipoxia', 'EPOC'], example: 'El paciente presenta disnea de esfuerzo ante actividades moderadas como subir escaleras.' },
  { id: 6, term: 'Edema', area: 'Fisiopatología', definition: 'Acumulación anormal de líquido en los tejidos corporales. Puede ser localizado (traumático) o generalizado (sistémico). Se clasifica con la escala "godet" según el grado de compresión.', related: ['Anasarca', 'Linfedema', 'Insuficiencia cardíaca'], example: 'El paciente presenta edema con godet +2 en ambos miembros inferiores.' },
  { id: 7, term: 'Flebitis', area: 'Complicaciones', definition: 'Inflamación de una vena, generalmente por irritación mecánica o química. Se manifiesta con dolor, eritema, calor y a veces induración a lo largo del trayecto venoso.', related: ['Tromboflebitis', 'Extravasación', 'Flebotomía'], example: 'Se observó flebitis grado 2 en el sitio de inserción del catéter periférico.' },
  { id: 8, term: 'Glicemia', area: 'Endocrinología', definition: 'Concentración de glucosa en la sangre. Los valores normales en ayunas son 70–100 mg/dL. Valores alterados indican hipoglucemia o hiperglucemia, que pueden ser emergencias médicas.', related: ['Insulina', 'Diabetes mellitus', 'Cetoacidosis'], example: 'Glicemia capilar postprandial: 185 mg/dL. Se ajusta dosis de insulina.' },
  { id: 9, term: 'Hipoxia', area: 'Urgencias', definition: 'Reducción del aporte de oxígeno a los tejidos. Puede ser hipoxémica (baja saturación), anémica (escasa hemoglobina), isquémica (reducción del flujo) o histotóxica (imposibilidad de usar O₂ celular).', related: ['Cianosis', 'SpO₂', 'Hipercapnia'], example: 'Hipoxia severa con SpO₂ 82% requirió intubación orotraqueal de emergencia.' },
  { id: 10, term: 'Isquemia', area: 'Cardiología', definition: 'Disminución del flujo sanguíneo a un tejido, provocando déficit de oxígeno y nutrientes. Si es prolongada puede causar necrosis (infarto). La isquemia miocárdica se manifiesta como angina de pecho.', related: ['Infarto', 'Angina', 'Trombosis'], example: 'El electrocardiograma evidenció isquemia subendocárdica en cara inferior.' },
  { id: 11, term: 'Leucocitosis', area: 'Hematología', definition: 'Aumento del número de leucocitos en sangre por encima de 11.000/μL. Frecuentemente indica infección bacteriana, inflamación o stress. Puede ser fisiológica (ejercicio, embarazo) o patológica.', related: ['Neutrofilia', 'Infección', 'Hemograma'], example: 'Hemograma revela leucocitosis de 18.000/μL con predominio neutrofílico compatible con infección.' },
  { id: 12, term: 'Metástasis', area: 'Oncología', definition: 'Diseminación de células cancerosas desde el tumor primario hacia otros órganos o tejidos distantes, a través del sistema linfático o sanguíneo.', related: ['Neoplasia', 'Quimioterapia', 'Biopsia'], example: 'La TC de tórax reveló metástasis pulmonares bilaterales en paciente con cáncer colorrectal.' },
  { id: 13, term: 'Necrosis', area: 'Fisiopatología', definition: 'Muerte de células o tejidos debido a isquemia, infección, trauma u otras causas patológicas. Implica destrucción celular irreversible y desencadena inflamación local.', related: ['Gangrena', 'Úlcera', 'Isquemia'], example: 'Se observó necrosis tisular en la herida con bordes irregulares y tejido negro.' },
  { id: 14, term: 'Oliguria', area: 'Renal', definition: 'Producción de orina inferior a 400 mL en 24 horas (o < 0.5 mL/kg/h). Es signo de insuficiencia renal aguda, deshidratación severa o shock. Requiere evaluación urgente.', related: ['Anuria', 'Insuficiencia renal', 'Diuresis'], example: 'Diuresis horaria de 15 mL/h. Se diagnosticó oliguria en contexto de sepsis.' },
  { id: 15, term: 'Presión venosa central', area: 'Monitorización', definition: 'Medición de la presión en la aurícula derecha o vena cava superior. Refleja la precarga cardíaca. Valores normales: 2–8 mmHg. Se mide mediante catéter venoso central.', related: ['Catéter central', 'Precarga', 'Shock'], example: 'PVC de 2 mmHg sugiere hipovolemia. Se inicia reposición hídrica guiada.' },
  { id: 16, term: 'Sepsis', area: 'Urgencias', definition: 'Respuesta sistémica disfuncional del organismo a una infección que pone en riesgo la vida. Se caracteriza por fiebre/hipotermia, taquicardia, taquipnea y disfunción orgánica. Emergencia médica.', related: ['Shock séptico', 'SRIS', 'Bacteriemia'], example: 'Criterios de sepsis: fiebre 39°C, FC 120 lpm, FR 24 rpm, lactato 3.2 mmol/L.' },
  { id: 17, term: 'Taquicardia', area: 'Cardiología', definition: 'Frecuencia cardíaca superior a 100 latidos por minuto en adultos en reposo. Puede ser sinusal (fisiológica) o patológica. Causas incluyen ansiedad, fiebre, anemia, arritmias.', related: ['Bradicardia', 'Fibrilación auricular', 'ECG'], example: 'Taquicardia sinusal FC 118 lpm en paciente con fiebre de 38.8°C.' },
  { id: 18, term: 'Úlcera por presión', area: 'Cuidados', definition: 'Lesión de la piel y tejidos subyacentes causada por presión prolongada sobre prominencias óseas. Se clasifica en 4 estadios según profundidad. La prevención es prioritaria en pacientes inmovilizados.', related: ['Escaras', 'Movilización', 'Apósitos'], example: 'Úlcera por presión estadio II en región sacra. Se inicia protocolo de cambios posturales cada 2 horas.' },
]

const glossaryTerms = ref([...DEFAULT_GLOSSARY])

function getToken() {
  if (auth.token) return auth.token
  if (auth.user?.token) return auth.user.token
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function fetchGlossary() {
  loading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/content/glossary`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (res.ok) {
      const responseData = await res.json()
      const list = Array.isArray(responseData) ? responseData : (responseData.data || [])
      if (list.length > 0) {
        glossaryTerms.value = list.map(item => ({
          ...item,
          related: Array.isArray(item.related)
            ? item.related
            : (typeof item.related === 'string' ? JSON.parse(item.related || '[]') : [])
        }))
      }
    }
  } catch (error) {
    console.error('Error al cargar glosario desde backend:', error)
  } finally {
    loading.value = false
  }
}

const alphabet = computed(() => {
  const letters = [...new Set(glossaryTerms.value.map(t => (t.term || '?')[0].toUpperCase()))].sort()
  return letters
})

const availableAreas = computed(() => {
  const set = new Set(glossaryTerms.value.map(t => t.area).filter(Boolean))
  const defaults = ['Cardiología', 'Semiología', 'Procedimientos', 'Respiratorio', 'Neumología', 'Fisiopatología', 'Urgencias', 'Enfermería Clínica', 'Hematología', 'Cuidados Críticos']
  defaults.forEach(a => set.add(a))
  return Array.from(set).sort()
})

const presentAreasWithCount = computed(() => {
  const map = new Map()
  glossaryTerms.value.forEach(t => {
    if (t.area) {
      map.set(t.area, (map.get(t.area) || 0) + 1)
    }
  })
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const termsWithExampleCount = computed(() => {
  return glossaryTerms.value.filter(t => Boolean(t.example && t.example.trim())).length
})

const termsWithRelatedCount = computed(() => {
  return glossaryTerms.value.filter(t => Array.isArray(t.related) && t.related.length > 0).length
})

const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value.trim() || 
    activeLetter.value || 
    selectedArea.value !== 'all' || 
    contentFilter.value !== 'all' ||
    sortBy.value !== 'alpha_asc'
  )
})

function resetFilters() {
  searchQuery.value = ''
  activeLetter.value = null
  selectedArea.value = 'all'
  contentFilter.value = 'all'
  sortBy.value = 'alpha_asc'
}

function expandAll() {
  filteredTerms.value.forEach(t => expanded.value.add(t.term))
}

function collapseAll() {
  expanded.value.clear()
}

function speak(text) {
  if (!text || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  utterance.rate = 0.92
  window.speechSynthesis.speak(utterance)
}

const filteredTerms = computed(() => {
  let terms = [...glossaryTerms.value]

  // Filtro por búsqueda textual (término, definición, área, ejemplos o relacionados)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    terms = terms.filter(t =>
      (t.term || '').toLowerCase().includes(q) ||
      (t.definition || '').toLowerCase().includes(q) ||
      (t.area || '').toLowerCase().includes(q) ||
      (Array.isArray(t.related) && t.related.some(r => r.toLowerCase().includes(q))) ||
      (t.example || '').toLowerCase().includes(q)
    )
  }

  // Filtro por letra inicial
  if (activeLetter.value) {
    terms = terms.filter(t => (t.term || '?')[0].toUpperCase() === activeLetter.value)
  }

  // Filtro por Especialidad / Área Médica
  if (selectedArea.value !== 'all') {
    terms = terms.filter(t => t.area === selectedArea.value)
  }

  // Filtro por tipo de contenido
  if (contentFilter.value === 'with_example') {
    terms = terms.filter(t => Boolean(t.example && t.example.trim()))
  } else if (contentFilter.value === 'with_related') {
    terms = terms.filter(t => Array.isArray(t.related) && t.related.length > 0)
  }

  // Ordenamiento interactivo
  if (sortBy.value === 'alpha_asc') {
    terms.sort((a, b) => (a.term || '').localeCompare(b.term || ''))
  } else if (sortBy.value === 'alpha_desc') {
    terms.sort((a, b) => (b.term || '').localeCompare(a.term || ''))
  } else if (sortBy.value === 'area') {
    terms.sort((a, b) => (a.area || '').localeCompare(b.area || '') || (a.term || '').localeCompare(b.term || ''))
  } else if (sortBy.value === 'newest') {
    terms.sort((a, b) => (b.id || 0) - (a.id || 0))
  }

  return terms
})

function openAddModal() {
  editingTerm.value = null
  form.value = {
    term: '',
    area: availableAreas.value[0] || 'Cardiología',
    definition: '',
    related: '',
    example: ''
  }
  showModal.value = true
}

function openEditModal(term) {
  editingTerm.value = term
  form.value = {
    term: term.term || '',
    area: term.area || '',
    definition: term.definition || '',
    related: Array.isArray(term.related) ? term.related.join(', ') : (term.related || ''),
    example: term.example || ''
  }
  showModal.value = true
}

async function saveTerm() {
  saving.value = true
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const relatedArray = form.value.related
    ? form.value.related.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const payload = {
    term: form.value.term?.trim(),
    area: form.value.area?.trim(),
    definition: form.value.definition?.trim(),
    related: relatedArray,
    example: form.value.example?.trim() || null
  }

  let method = 'POST'
  let url = `${apiBaseUrl}/api/content/glossary`
  if (editingTerm.value && editingTerm.value.id) {
    method = 'PUT'
    url += `/${editingTerm.value.id}`
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Error al guardar el concepto en el glosario.')
    }

    notificationStore.notify({
      type: 'success',
      title: editingTerm.value ? 'Concepto actualizado' : 'Concepto creado',
      message: editingTerm.value
        ? `El concepto "${payload.term}" se actualizó correctamente.`
        : `El concepto "${payload.term}" fue agregado al glosario.`
    })

    showModal.value = false
    await fetchGlossary()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'Ocurrió un error al procesar la solicitud.'
    })
  } finally {
    saving.value = false
  }
}

async function deleteTerm(term) {
  const confirmed = confirm(`¿Estás seguro de eliminar el concepto "${term.term}" del glosario?`)
  if (!confirmed) return

  const token = getToken()
  try {
    if (term.id) {
      const res = await fetch(`${apiBaseUrl}/api/content/glossary/${term.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Error al eliminar el concepto.')
      }
    } else {
      // Si era solo local, remover del array local
      glossaryTerms.value = glossaryTerms.value.filter(t => t.term !== term.term)
    }

    notificationStore.notify({
      type: 'success',
      title: 'Concepto eliminado',
      message: `El concepto "${term.term}" fue eliminado permanentemente.`
    })

    await fetchGlossary()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error',
      message: err.message || 'No se pudo eliminar el concepto.'
    })
  }
}

onMounted(() => {
  fetchGlossary()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s ease-out forwards;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.backdrop-blur-xs {
  backdrop-filter: blur(2px);
}

/* Scrollbar Verde Armónico para Chips de Especialidad */
.custom-green-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #f0fdf4;
}

.custom-green-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-green-scrollbar::-webkit-scrollbar-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.custom-green-scrollbar::-webkit-scrollbar-track {
  background: #f0fdf4; /* emerald-50 suave */
  border-radius: 9999px;
}

.custom-green-scrollbar::-webkit-scrollbar-thumb {
  background: #10b981; /* emerald-500 */
  border-radius: 9999px;
  border: 1px solid #d1fae5;
  transition: background-color 0.2s ease;
}

.custom-green-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #059669; /* emerald-600 */
}
</style>
