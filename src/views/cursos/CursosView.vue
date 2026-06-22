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

              <!-- Dynamic Activities List for the current Phase -->
              <div class="mt-6 pt-5 border-t border-gray-200/80 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <span class="material-symbols-outlined text-sm text-[#006688]">sports_esports</span>
                    Actividades de Juego / Pruebas en esta Fase ({{ coursePhaseActivities.length }})
                  </div>
                  <button 
                    v-if="!showAddActivityForm"
                    @click="showAddActivityForm = true"
                    type="button"
                    class="px-2.5 py-1 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs">add</span>
                    Asignar Actividad
                  </button>
                </div>

                <!-- Activities list -->
                <div v-if="coursePhaseActivities.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    v-for="act in coursePhaseActivities" 
                    :key="act.id"
                    class="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-gray-200 transition-all"
                  >
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-gray-800 truncate">{{ act.title }}</p>
                      <p class="text-[10px] text-gray-400 font-medium">Plantilla: <span class="capitalize">{{ act.template }}</span> · Puntos: {{ act.points }}</p>
                    </div>
                    <button 
                      @click="deleteInlineActivity(act.id)"
                      type="button"
                      class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0"
                      title="Eliminar actividad"
                    >
                      <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-[11px] text-gray-400 italic bg-white/50 rounded-xl border border-dashed border-gray-200">
                  No hay actividades adicionales creadas para esta fase en este curso.
                </div>

                <!-- Add Activity Inline Form -->
                <div v-if="showAddActivityForm" class="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 animate-slide-up">
                  <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span class="text-xs font-bold text-gray-700">Nueva Actividad para esta Fase</span>
                    <button @click="resetNewActivityForm" type="button" class="text-gray-400 hover:text-gray-600">
                      <span class="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Título de la Actividad</label>
                      <input type="text" v-model="newActivity.title" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Vocabulario de Signos Vitales" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Plantilla de Juego</label>
                      <select v-model="newActivity.template" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]">
                        <option v-for="opt in allowedTemplatesForCurrentPhase" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Puntos Otorgados</label>
                      <input type="number" v-model="newActivity.points" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                    </div>
                    
                    <!-- Dynamic Fields in course inline creator -->
                    <div v-if="newActivity.template === 'sopa'" class="sm:col-span-2 space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Palabras (separadas por comas)</label>
                      <input type="text" v-model="newActivity.sopaWords" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                    </div>

                    <div v-if="newActivity.template === 'crucigrama'" class="sm:col-span-2 space-y-3">
                      <div class="flex justify-between items-center">
                        <label class="text-[10px] font-bold text-gray-500">Palabras y Pistas del Crucigrama</label>
                        <button 
                          @click="newActivity.crosswordWords.push({ word: '', clue: '', orientation: 'horizontal' })"
                          type="button"
                          class="px-2.5 py-1 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-[9px] rounded-lg transition-all flex items-center gap-1"
                        >
                          <span class="material-symbols-outlined text-[10px] font-bold">add</span>
                          Agregar Palabra
                        </button>
                      </div>

                      <!-- Layout Mode Selector -->
                      <div class="bg-white p-3 rounded-2xl border border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span class="text-xs font-bold text-gray-660">Modo de Orientación:</span>
                        <div class="flex gap-4">
                          <label class="flex items-center gap-1.5 text-xs font-bold text-gray-660 cursor-pointer">
                            <input type="radio" value="automatic" v-model="newActivity.layoutMode" class="text-[#006688] focus:ring-[#006688]" />
                            Automático (Recomendado)
                          </label>
                          <label class="flex items-center gap-1.5 text-xs font-bold text-gray-660 cursor-pointer">
                            <input type="radio" value="manual" v-model="newActivity.layoutMode" class="text-[#006688] focus:ring-[#006688]" />
                            Manual (Eliges la dirección)
                          </label>
                        </div>
                      </div>
                      
                      <div v-for="(item, idx) in newActivity.crosswordWords" :key="idx" class="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-150 space-y-3 relative">
                        <button 
                          v-if="newActivity.crosswordWords.length > 1"
                          @click="newActivity.crosswordWords.splice(idx, 1)"
                          type="button"
                          class="absolute top-2.5 right-2.5 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div class="space-y-1">
                            <label class="text-[9px] font-bold text-gray-400">Palabra</label>
                            <input type="text" v-model="item.word" @input="sanitizeWordInput(item)" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold uppercase focus:outline-none focus:border-[#006688]" placeholder="Ej. STETHOSCOPE" />
                            <p class="text-[9px] text-gray-400 font-medium mt-0.5">Solo letras. Máx. 20 caracteres.</p>
                          </div>
                          
                          <div class="space-y-1 sm:col-span-2">
                            <label class="text-[9px] font-bold text-gray-400">Pista / Descripción</label>
                            <input type="text" v-model="item.clue" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Instrumento para escuchar los latidos" />
                          </div>
                        </div>
                        
                        <div v-if="newActivity.layoutMode === 'manual'" class="flex items-center gap-4 pt-1">
                          <span class="text-[9px] font-bold text-gray-400">Orientación:</span>
                          <label class="flex items-center gap-1.5 text-[10px] font-bold text-gray-650 cursor-pointer">
                            <input type="radio" :name="'orientation-' + idx" value="horizontal" v-model="item.orientation" class="text-[#006688] focus:ring-[#006688]" />
                            Horizontal
                          </label>
                          <label class="flex items-center gap-1.5 text-[10px] font-bold text-gray-650 cursor-pointer">
                            <input type="radio" :name="'orientation-' + idx" value="vertical" v-model="item.orientation" class="text-[#006688] focus:ring-[#006688]" />
                            Vertical
                          </label>
                        </div>
                        <div v-else class="flex items-center gap-2 pt-1">
                          <span class="text-[9px] font-bold text-gray-400">Dirección:</span>
                          <span :class="`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${getCalculatedInlineOrientationBadge(idx).bg}`">
                            {{ getCalculatedInlineOrientationBadge(idx).label }}
                          </span>
                        </div>
                      </div>

                      <!-- Warning Banner -->
                      <div v-if="inlineCrosswordLayout && !inlineCrosswordLayout.success && newActivity.crosswordWords.some(w => w.word.trim())" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs space-y-1 mt-2">
                        <div class="flex items-center gap-1.5 font-bold">
                          <span class="material-symbols-outlined text-sm">warning</span>
                          <span>El crucigrama no se puede conectar</span>
                        </div>
                        <p v-if="inlineCrosswordLayout.reason === 'isolated'">
                          La palabra <strong class="uppercase">"{{ inlineCrosswordLayout.errorWord }}"</strong> no comparte ninguna vocal o consonante con las demás palabras. Modifícala o añade palabras intermedias para poder conectarlas.
                        </p>
                        <p v-else>
                          Las palabras no pueden formar un crucigrama cruzado válido con las combinaciones actuales. Modifica alguna palabra o añade letras en común.
                        </p>
                      </div>
                    </div>

                    <div v-if="newActivity.template === 'quiz' || newActivity.template === 'preguntas'" class="sm:col-span-2 space-y-3">
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Pregunta</label>
                        <input type="text" v-model="newActivity.quizQuestion" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="¿Cuál es la pregunta?" />
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-gray-500">Opción Correcta</label>
                          <input type="text" v-model="newActivity.quizCorrect" class="w-full px-2 py-1.5 border border-green-200 bg-green-50/20 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-gray-500">Opción Incorrecta</label>
                          <input type="text" v-model="newActivity.quizIncorrect" class="w-full px-2 py-1.5 border border-red-200 bg-red-50/20 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    <div v-if="newActivity.template === 'match'" class="sm:col-span-2 grid grid-cols-2 gap-2">
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Término en Inglés</label>
                        <input type="text" v-model="newActivity.matchTerm" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Significado en Español</label>
                        <input type="text" v-model="newActivity.matchMeaning" class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                      </div>
                    </div>

                    <div v-if="newActivity.template === 'listening'" class="sm:col-span-2 space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Frase para Reproducir en Inglés</label>
                      <input type="text" v-model="newActivity.listeningPhrase" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                    </div>

                    <div v-if="newActivity.template === 'pronunciation'" class="sm:col-span-2 space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Frase para Pronunciar en Inglés</label>
                      <input type="text" v-model="newActivity.pronouncePhrase" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                    </div>
                  </div>

                  <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button @click="resetNewActivityForm" type="button" class="px-3 py-1.5 border border-gray-200 text-gray-600 font-bold text-[10px] rounded-lg transition-all">Cancelar</button>
                    <button 
                      @click="saveNewActivity" 
                      type="button" 
                      :disabled="newActivity.template === 'crucigrama' && inlineCrosswordLayout && !inlineCrosswordLayout.success && newActivity.crosswordWords.some(w => w.word.trim())"
                      :class="`px-3.5 py-1.5 text-white font-bold text-[10px] rounded-lg shadow transition-all ${
                        newActivity.template === 'crucigrama' && inlineCrosswordLayout && !inlineCrosswordLayout.success && newActivity.crosswordWords.some(w => w.word.trim())
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border-gray-300'
                          : 'bg-[#006688] hover:bg-[#004e69]'
                      }`"
                    >
                      Guardar Actividad
                    </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { generateCrossword } from '../../utils/crosswordGenerator'
import { useNotificationStore } from '../../stores/notification'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const activeFilter = ref('Todos')
const filters = ['Todos', 'En Progreso', 'Completados', 'Nuevos']

// Modal & Form States
const showModal = ref(false)
const editingCourse = ref(null)
const activeModalPhase = ref('inicio')

const newActivity = ref({
  title: '',
  template: 'quiz',
  points: 10,
  sopaWords: 'heart, pulse, blood',
  quizQuestion: '',
  quizCorrect: '',
  quizIncorrect: '',
  matchTerm: '',
  matchMeaning: '',
  listeningPhrase: '',
  pronouncePhrase: '',
  crosswordWords: [{ word: '', clue: '', orientation: 'horizontal' }],
  layoutMode: 'automatic'
})

const allowedTemplatesForCurrentPhase = computed(() => {
  if (activeModalPhase.value === 'inicio') {
    return [
      { value: 'sopa', label: 'Sopa de letras' },
      { value: 'crucigrama', label: 'Crucigramas' },
      { value: 'match', label: 'Conectar significado' }
    ]
  } else if (activeModalPhase.value === 'estudio') {
    return [
      { value: 'listening', label: 'Escucha (Audio)' },
      { value: 'pronunciation', label: 'Pronunciación (Voz)' }
    ]
  } else if (activeModalPhase.value === 'practica') {
    return [
      { value: 'listening', label: 'Escucha (Audio)' },
      { value: 'pronunciation', label: 'Pronunciación (Voz)' },
      { value: 'match', label: 'Conectar significado' },
      { value: 'preguntas', label: 'Opción múltiple' }
    ]
  } else if (activeModalPhase.value === 'evaluacion') {
    return [
      { value: 'quiz', label: 'Quizzes' },
      { value: 'preguntas', label: 'Opción múltiple' }
    ]
  }
  return []
})

watch(activeModalPhase, (newPhase) => {
  const allowed = allowedTemplatesForCurrentPhase.value
  if (allowed.length > 0) {
    newActivity.value.template = allowed[0].value
  }
})

const inlineCrosswordLayout = computed(() => {
  if (newActivity.value.template !== 'crucigrama') return null
  const validWords = newActivity.value.crosswordWords.filter(w => w.word.trim() && w.clue.trim())
  if (validWords.length === 0) return { success: true, words: [], grid: {}, width: 0, height: 0 }
  return generateCrossword(validWords, newActivity.value.layoutMode)
})

function getCalculatedInlineOrientationBadge(idx) {
  const layout = inlineCrosswordLayout.value
  if (!layout) return { label: 'Incompleta', bg: 'bg-gray-100 text-gray-500' }
  
  const wObj = newActivity.value.crosswordWords[idx]
  if (!wObj || !wObj.word.trim()) {
    return { label: 'Incompleta', bg: 'bg-gray-100 text-gray-500' }
  }

  if (!layout.success) {
    if (layout.reason === 'isolated' && layout.errorWord === wObj.word.trim().toUpperCase()) {
      return { label: 'Sin conexión', bg: 'bg-red-100 text-red-700' }
    }
    return { label: 'Pendiente', bg: 'bg-amber-100 text-amber-700' }
  }
  
  const w = layout.words.find(word => word.id === idx)
  if (w && w.orientation) {
    return {
      label: w.orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
      bg: w.orientation === 'horizontal' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
    }
  }
  return { label: 'Incompleta', bg: 'bg-gray-100 text-gray-500' }
}

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const activities = ref([])

async function fetchActivities() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/activities`)
    if (response.ok) {
      activities.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
  }
}

onMounted(fetchActivities)

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

const coursePhaseActivities = computed(() => {
  if (!editingCourse.value) return []
  const phaseMapping = {
    inicio: 'Preparación',
    estudio: 'Absorción',
    practica: 'Práctica',
    evaluacion: 'Cierre'
  }
  const targetPhase = phaseMapping[activeModalPhase.value]
  return activities.value.filter(a => a.course === editingCourse.value.title && a.phase === targetPhase)
})

const showAddActivityForm = ref(false)

function resetNewActivityForm() {
  newActivity.value = {
    title: '',
    template: 'quiz',
    points: 10,
    sopaWords: 'heart, pulse, blood',
    quizQuestion: '',
    quizCorrect: '',
    quizIncorrect: '',
    matchTerm: '',
    matchMeaning: '',
    listeningPhrase: '',
    pronouncePhrase: '',
    crosswordWords: [{ word: '', clue: '', orientation: 'horizontal' }],
    layoutMode: 'automatic'
  }
  showAddActivityForm.value = false
}

async function saveNewActivity() {
  if (!newActivity.value.title.trim() || !editingCourse.value) return
  
  const phaseMapping = {
    inicio: 'Preparación',
    estudio: 'Absorción',
    practica: 'Práctica',
    evaluacion: 'Cierre'
  }
  const targetPhase = phaseMapping[activeModalPhase.value]

  let crossword1Clue = ''
  let crossword1Word = ''
  if (newActivity.value.template === 'crucigrama') {
    const layout = inlineCrosswordLayout.value
    if (!layout || !layout.success) {
      notificationStore.notify({
        type: 'error',
        title: 'Crucigrama Inválido',
        message: 'El crucigrama no es válido. Asegúrate de que todas las palabras se conecten entre sí.'
      })
      return
    }
    const validWords = layout.words.map(w => ({
      word: w.word,
      clue: w.clue,
      orientation: w.orientation,
      x: w.x,
      y: w.y
    }))
    crossword1Clue = JSON.stringify({
      layoutMode: newActivity.value.layoutMode,
      words: validWords
    })
    crossword1Word = validWords.map(w => w.word).join(',')
  }

  const payload = {
    title: newActivity.value.title,
    course: editingCourse.value.title,
    phase: targetPhase,
    template: newActivity.value.template,
    points: parseInt(newActivity.value.points) || 10,
    attemptsLimit: 'Ilimitados',
    successMessage: '¡Excelente trabajo! Has acertado.',
    hintMessage: '',
    sopaWords: newActivity.value.sopaWords,
    crossword1Clue,
    crossword1Word,
    quizQuestion: newActivity.value.quizQuestion,
    quizCorrect: newActivity.value.quizCorrect,
    quizIncorrect: newActivity.value.quizIncorrect,
    matchTerm: newActivity.value.matchTerm,
    matchMeaning: newActivity.value.matchMeaning,
    listeningPhrase: newActivity.value.listeningPhrase,
    pronouncePhrase: newActivity.value.pronouncePhrase
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error al guardar la actividad.')
    }
    await fetchActivities()
    resetNewActivityForm()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Crear',
      message: err.message || 'No se pudo crear la actividad.'
    })
  }
}

async function deleteInlineActivity(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta actividad de la fase?')) return
  try {
    const response = await fetch(`${apiBaseUrl}/api/activities/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error al eliminar la actividad.')
    }
    await fetchActivities()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Eliminar',
      message: err.message || 'No se pudo eliminar la actividad.'
    })
  }
}

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

function sanitizeWordInput(item) {
  if (!item.word) return
  // Solo permitir letras (inglés/español con tildes, diéresis y Ñ/ñ)
  const cleaned = item.word.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '')
  if (item.word.length > 20 || cleaned.length > 20) {
    notificationStore.notify({
      type: 'warning',
      title: 'Límite de caracteres',
      message: 'Una palabra no puede tener más de 20 caracteres.'
    })
    item.word = cleaned.slice(0, 20).toUpperCase()
  } else {
    item.word = cleaned.toUpperCase()
  }
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
