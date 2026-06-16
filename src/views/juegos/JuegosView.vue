<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <!-- ── GRID SCREEN: GAMES HUB ── -->
    <div v-if="!activeGame" class="space-y-6 animate-fade-in">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Juegos Educativos</h2>
        <p class="text-gray-500 mt-1">Aprende jugando con dinámicas interactivas y gamificadas para calentar motores.</p>
      </div>

      <!-- Featured Game: Warm-up Drag Match -->
      <div class="bg-gradient-to-r from-[#006688] to-indigo-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div class="space-y-3">
          <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">Nuevo Calentamiento</span>
          <h3 class="text-2xl sm:text-3xl font-black">Warm-up Drag Match (Calentamiento)</h3>
          <p class="text-cyan-100 text-sm max-w-lg leading-relaxed">
            Asocia las imágenes clínicas y los iconos de comunicación diaria con sus expresiones en inglés correspondientes en este juego de arrastrar y soltar.
          </p>
          <div class="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">sports_esports</span> 4 Rondas Rápidas</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">emoji_events</span> +100 Puntos</span>
          </div>
          <button 
            @click="startGame('drag_match')"
            class="mt-4 px-6 py-3 bg-white text-[#006688] font-black rounded-xl text-xs hover:bg-cyan-50 transition-all shadow-sm active:scale-95 flex items-center gap-1"
          >
            Comenzar Calentamiento
            <span class="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        </div>
        <span class="material-symbols-outlined text-9xl opacity-20 hidden md:block">pan_tool</span>
      </div>

      <!-- Games Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div 
          v-for="game in games" 
          :key="game.id" 
          @click="startGame(game.key)"
          class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div :class="`h-28 flex items-center justify-center ${game.bg}`">
              <span class="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform" :style="`color:${game.iconColor}`">{{ game.icon }}</span>
            </div>
            <div class="p-5">
              <div class="flex items-center justify-between mb-2">
                <span :class="`text-xs font-bold px-2 py-1 rounded-full ${game.diffBg} ${game.diffText}`">{{ game.difficulty }}</span>
                <span class="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <span class="material-symbols-outlined text-sm">emoji_events</span>
                  +{{ game.pts }} pts
                </span>
              </div>
              <h4 class="font-bold text-gray-800 mb-1">{{ game.name }}</h4>
              <p class="text-xs text-gray-500 leading-relaxed">{{ game.desc }}</p>
            </div>
          </div>
          <div class="px-5 pb-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
            <div class="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <span class="material-symbols-outlined text-sm">timer</span>
              {{ game.duration }}
            </div>
            <button class="px-4 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-colors">
              Jugar
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- ── PLAY SCREEN: WARM-UP DRAG MATCH (HU06) ── -->
    <div v-else-if="activeGame === 'drag_match'" class="space-y-6 animate-fade-in">
      
      <!-- Play Header -->
      <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <button @click="quitGame" class="flex items-center justify-center p-2 rounded-xl border hover:bg-gray-50 text-gray-600 transition-all">
            <span class="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div>
            <h3 class="font-black text-gray-800 text-lg">Warm-up Drag Match</h3>
            <p class="text-xs text-gray-500">Sesión de Calentamiento de Comunicación Médica</p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <!-- Rounds progress indicators -->
          <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
            <span>Ronda {{ currentRoundIndex + 1 }} de 4</span>
            <div class="flex gap-1 ml-2">
              <span 
                v-for="rIndex in 4" 
                :key="rIndex"
                :class="`w-3 h-3 rounded-full ${
                  rIndex <= currentRoundIndex 
                    ? 'bg-[#006688]' 
                    : 'bg-gray-200'
                }`"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Play Zone Container -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8 min-h-[450px] flex flex-col justify-between">
        
        <!-- Game Playback Area -->
        <div v-if="!gameFinished" class="space-y-8">
          
          <!-- Round Info -->
          <div class="border-b border-gray-100 pb-4 text-center sm:text-left">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Tema de la Ronda</h4>
            <h3 class="text-lg font-black text-[#006688] mt-1">{{ currentRound.theme }}</h3>
          </div>

          <!-- Upper deck: Drag cards -->
          <div class="space-y-3">
            <p class="text-xs text-gray-500 font-bold text-center">Arrastra las imágenes hacia su texto correspondiente:</p>
            
            <div class="flex justify-center flex-wrap gap-4 min-h-[120px] items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
              <div 
                v-for="card in currentRoundCards" 
                :key="card.id"
                v-show="!card.matched"
                :id="card.id"
                :class="[
                  'draggable-card bg-white border-2 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center gap-2 cursor-grab select-none z-20 touch-none w-28 h-28 transition-transform hover:scale-105 active:cursor-grabbing',
                  card.isResetting ? 'card-reset' : ''
                ]"
                :style="`transform: translate(${card.x}px, ${card.y}px)`"
                @pointerdown="startDrag($event, card)"
                @pointermove="onDrag($event)"
                @pointerup="endDrag($event, card)"
              >
                <!-- SVG/Icon representation -->
                <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <span :class="['material-symbols-outlined text-3xl', card.color]">{{ card.icon }}</span>
                </div>
                <span class="text-[10px] font-black text-gray-700 truncate w-full text-center">{{ card.label }}</span>
              </div>
              <span v-if="currentRoundCards.every(c => c.matched)" class="text-green-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                <span class="material-symbols-outlined">check_circle</span>
                ¡Excelente! Todas las imágenes emparejadas.
              </span>
            </div>
          </div>

          <!-- Lower deck: Drop targets -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              v-for="target in currentRoundTargets" 
              :key="target.match"
              :data-match="target.match"
              class="drop-target border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] bg-gray-50/50 transition-all text-center relative"
              :class="[
                target.matchedCard ? 'border-green-500 bg-green-50/20' : 'hover:border-[#006688]/30',
                activeDragCard ? 'border-[#006688]/20 bg-cyan-50/10' : ''
              ]"
            >
              <!-- Target Text -->
              <div v-if="!target.matchedCard" class="space-y-1">
                <span class="text-[9px] font-black uppercase tracking-wider text-[#006688] bg-[#006688]/5 px-2 py-0.5 rounded-full">Soltar aquí</span>
                <p class="text-base font-black text-gray-800 mt-2">"{{ target.match }}"</p>
              </div>

              <!-- Matched Card view -->
              <div v-else class="animate-zoom-in flex flex-col items-center gap-2">
                <span :class="['material-symbols-outlined text-4xl', target.matchedCard.color]">{{ target.matchedCard.icon }}</span>
                <p class="text-xs font-bold text-gray-700">{{ target.matchedCard.label }}</p>
                <div class="flex items-center gap-1 text-xs font-black text-green-700 bg-green-100/50 px-2 py-0.5 rounded-full border border-green-200">
                  <span class="material-symbols-outlined text-xs bg-green-500 text-white rounded-full p-0.5">check</span>
                  {{ target.match }}
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Finished Screen -->
        <div v-else class="text-center space-y-6 py-8 animate-fade-in max-w-md mx-auto">
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg relative border-4 border-white animate-bounce">
              <span class="material-symbols-outlined text-white text-5xl">emoji_events</span>
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-black text-gray-800">¡Calentamiento Completado!</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Has emparejado con éxito todas las imágenes con sus términos de saludos y comunicación clínica en inglés técnico.
            </p>
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 inline-block mt-2 font-bold text-amber-700 text-sm">
              🏆 Recompensa: +100 puntos de Experiencia
            </div>
          </div>
          <div class="flex gap-2 justify-center pt-2">
            <button @click="resetGame" class="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all shadow-sm">
              Jugar de Nuevo
            </button>
            <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl transition-all shadow">
              Volver al Centro de Juegos
            </button>
          </div>
        </div>

        <!-- Next Round Navigation Footer -->
        <div v-if="!gameFinished" class="flex justify-between items-center border-t border-gray-50 pt-4 mt-4">
          <span class="text-xs text-gray-400 font-medium">Arrastra y empareja las 3 tarjetas para avanzar.</span>
          <button 
            @click="nextRound" 
            :disabled="!isRoundCompleted"
            :class="`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ${
              isRoundCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`"
          >
            {{ currentRoundIndex === 3 ? 'Finalizar Calentamiento' : 'Siguiente Ronda' }}
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>


    <!-- ── PLACEHOLDER SCREEN FOR OTHER GAMES ── -->
    <div v-else class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6 animate-fade-in max-w-md mx-auto">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl">construction</span>
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-black text-gray-800">Módulo en Desarrollo</h3>
        <p class="text-xs text-gray-500 leading-relaxed">
          El juego "{{ selectedGameName }}" está siendo optimizado para integrarse con la base de datos de los aprendices. Por ahora, juega el mini-juego de calentamiento de arrastrar y soltar.
        </p>
      </div>
      <button @click="quitGame" class="px-5 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-xl transition-all shadow-sm">
        Ir a Calentamiento
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

// Static Hub list of Games
const games = [
  { id: 1, key: 'drag_match', name: 'Warm-up Drag Match', desc: 'Asocia iconos clínicos y de saludos con sus expresiones en inglés.', icon: 'pan_tool', bg: 'bg-blue-50', iconColor: '#3b82f6', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 100, duration: '3 min' },
  { id: 2, key: 'trivia', name: 'Trivia Médica', desc: 'Preguntas rápidas de conocimiento clínico y farmacológico.', icon: 'quiz', bg: 'bg-emerald-50', iconColor: '#10b981', difficulty: 'Fácil', diffBg: 'bg-green-100', diffText: 'text-green-700', pts: 50, duration: '5 min' },
  { id: 3, key: 'anatomy', name: 'Anatomy Explorer', desc: 'Identifica estructuras anatómicas en modelos interactivos.', icon: 'biotech', bg: 'bg-red-50', iconColor: '#ef4444', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 80, duration: '10 min' },
  { id: 4, key: 'drug_match', name: 'Drug Match', desc: 'Empareja medicamentos con sus indicaciones y efectos.', icon: 'medication', bg: 'bg-orange-50', iconColor: '#f97316', difficulty: 'Medio', diffBg: 'bg-yellow-100', diffText: 'text-yellow-700', pts: 70, duration: '7 min' },
  { id: 5, key: 'emergency', name: 'Caso de Emergencia', desc: 'Toma decisiones clínicas en simulaciones de emergencia.', icon: 'emergency', bg: 'bg-purple-50', iconColor: '#8b5cf6', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 150, duration: '15 min' },
  { id: 6, key: 'diagnosis', name: 'Diagnóstico Rápido', desc: 'Identifica diagnósticos a partir de síntomas presentados.', icon: 'stethoscope', bg: 'bg-pink-50', iconColor: '#ec4899', difficulty: 'Difícil', diffBg: 'bg-red-100', diffText: 'text-red-700', pts: 120, duration: '12 min' },
]

// Router/Tab active game State
const activeGame = ref(null)
const selectedGameName = ref('')

// -------------------------------------------------------------
// HTML5 POINTER EVENTS DRAG AND DROP MATCH STATE (HU06)
// -------------------------------------------------------------
const currentRoundIndex = ref(0)
const gameFinished = ref(false)

// Defining the 4 rounds of 3 cards each ( saludos y vocabulario clínico )
const rounds = [
  {
    id: 1,
    theme: 'Saludos Diarios y Horas del Día (Daily Greetings)',
    items: [
      { id: 'r1-1', label: 'Sol de Mañana', icon: 'wb_sunny', color: 'text-amber-500', match: 'Good morning' },
      { id: 'r1-2', label: 'Sol de Tarde', icon: 'light_mode', color: 'text-orange-500', match: 'Good afternoon' },
      { id: 'r1-3', label: 'Luna y Estrellas', icon: 'bedtime', color: 'text-indigo-400', match: 'Good evening' }
    ]
  },
  {
    id: 2,
    theme: 'Presentaciones y Recepción en Clínica (Introductions)',
    items: [
      { id: 'r2-1', label: 'Tarjeta del Enfermero', icon: 'badge', color: 'text-blue-500', match: 'I am your nurse' },
      { id: 'r2-2', label: 'Apretón de Manos', icon: 'handshake', color: 'text-teal-500', match: 'Nice to meet you' },
      { id: 'r2-3', label: 'Signo de Ayuda', icon: 'help', color: 'text-purple-500', match: 'How can I help you?' }
    ]
  },
  {
    id: 3,
    theme: 'Reporte de Síntomas del Paciente (Symptoms)',
    items: [
      { id: 'r3-1', label: 'Termómetro Elevado', icon: 'thermostat', color: 'text-red-500', match: 'High fever' },
      { id: 'r3-2', label: 'Rayo de Dolor', icon: 'bolt', color: 'text-yellow-500', match: 'Acute pain' },
      { id: 'r3-3', label: 'Espiral de Mareo', icon: 'cyclone', color: 'text-indigo-500', match: 'Dizziness' }
    ]
  },
  {
    id: 4,
    theme: 'Material y Herramientas Clínicas (Clinical Equipment)',
    items: [
      { id: 'r4-1', label: 'Estetoscopio', icon: 'stethoscope', color: 'text-[#006688]', match: 'Stethoscope' },
      { id: 'r4-2', label: 'Jeringa', icon: 'medication', color: 'text-emerald-500', match: 'Syringe' },
      { id: 'r4-3', label: 'Venda Médica', icon: 'healing', color: 'text-pink-500', match: 'Bandage' }
    ]
  }
]

// Current active round cards & drop targets
const currentRoundCards = ref([])
const currentRoundTargets = ref([])

const currentRound = computed(() => rounds[currentRoundIndex.value])
const isRoundCompleted = computed(() => currentRoundCards.value.length > 0 && currentRoundCards.value.every(c => c.matched))

// Drag offsets
const activeDragCard = ref(null)
let initialPointerX = 0
let initialPointerY = 0
let initialCardX = 0
let initialCardY = 0

// Game activation
function startGame(key) {
  activeGame.value = key
  const selected = games.find(g => g.key === key)
  selectedGameName.value = selected ? selected.name : ''
  
  if (key === 'drag_match') {
    currentRoundIndex.value = 0
    gameFinished.value = false
    loadRound()
  }
}

function quitGame() {
  activeGame.value = null
}

function loadRound() {
  const roundData = rounds[currentRoundIndex.value]
  
  // Set up cards in upper deck
  currentRoundCards.value = roundData.items.map(item => ({
    ...item,
    x: 0,
    y: 0,
    matched: false,
    isResetting: false
  }))
  
  // Shuffling targets in lower deck (avoid rendering same order as cards)
  const targets = roundData.items.map(item => ({
    match: item.match,
    matchedCard: null
  }))
  
  currentRoundTargets.value = [...targets].sort(() => Math.random() - 0.5)
}

function nextRound() {
  if (currentRoundIndex.value < 3) {
    currentRoundIndex.value++
    loadRound()
  } else {
    gameFinished.value = true
  }
}

function resetGame() {
  currentRoundIndex.value = 0
  gameFinished.value = false
  loadRound()
}

// -------------------------------------------------------------
// Drag & Drop Mechanics logic (PointerEvents)
// -------------------------------------------------------------
function startDrag(event, card) {
  if (card.matched) return
  activeDragCard.value = card
  card.isResetting = false
  
  // Initial coordinates
  initialPointerX = event.clientX
  initialPointerY = event.clientY
  initialCardX = card.x
  initialCardY = card.y
  
  // Lock pointer to element
  event.target.setPointerCapture(event.pointerId)
}

function onDrag(event) {
  if (!activeDragCard.value) return
  const card = activeDragCard.value
  
  // Offsets
  const deltaX = event.clientX - initialPointerX
  const deltaY = event.clientY - initialPointerY
  
  card.x = initialCardX + deltaX
  card.y = initialCardY + deltaY
}

function endDrag(event, card) {
  if (!activeDragCard.value) return
  activeDragCard.value = null
  
  // Release lock
  event.target.releasePointerCapture(event.pointerId)
  
  // Coordinate drop target detection
  const dropX = event.clientX
  const dropY = event.clientY
  
  const elements = document.elementsFromPoint(dropX, dropY)
  let dropTargetElement = null
  
  for (const el of elements) {
    if (el.classList.contains('drop-target')) {
      dropTargetElement = el
      break
    }
  }
  
  if (dropTargetElement) {
    const matchText = dropTargetElement.getAttribute('data-match')
    if (matchText === card.match) {
      // SUCCESS!
      card.matched = true
      
      const target = currentRoundTargets.value.find(t => t.match === matchText)
      if (target) {
        target.matchedCard = card
      }
    } else {
      // INCORRECT MATCH - Slide back
      slideBack(card)
    }
  } else {
    // DROPPED OUTSIDE - Slide back
    slideBack(card)
  }
}

function slideBack(card) {
  card.isResetting = true
  card.x = 0
  card.y = 0
  setTimeout(() => {
    card.isResetting = false
  }, 300)
}
</script>

<style scoped>
.draggable-card {
  user-select: none;
}
.card-reset {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-zoom-in {
  animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes zoomIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
