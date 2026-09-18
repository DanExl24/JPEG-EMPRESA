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
      <div 
        v-for="course in filteredCourses" 
        :key="course.id" 
        :class="`rounded-2xl overflow-hidden shadow-sm border transition-all group flex flex-col justify-between relative ${
          course.isLocked && !auth.isAdmin && !auth.isInstructor
            ? 'bg-gray-50/90 border-dashed border-gray-300 opacity-80'
            : 'bg-white border-gray-100 hover:shadow-md'
        }`"
      >
        <!-- Locked Badge Indicator for Learner -->
        <div 
          v-if="course.isLocked && !auth.isAdmin && !auth.isInstructor" 
          class="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs"
        >
          <span class="material-symbols-outlined text-xs">lock</span>
          BLOQUEADO
        </div>

        <div>
          <div :class="`h-36 flex items-center justify-center relative ${course.bg}`">
            <span 
              class="material-symbols-outlined text-6xl opacity-60 transition-transform group-hover:scale-105" 
              :style="`color: ${course.iconColor}`"
            >
              {{ course.icon }}
            </span>
          </div>

          <div class="p-5 pb-3">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span :class="`text-xs font-bold px-2 py-1 rounded-full ${course.categoryBg} ${course.categoryText}`">{{ course.category }}</span>
              <span class="text-xs text-gray-400">{{ course.duration }}</span>
              <span v-if="course.programName" class="text-[10px] font-bold text-[#006688] bg-[#006688]/10 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                {{ course.programName }}
              </span>
              <span v-for="ficha in (course.cohorts || [])" :key="'ficha-' + ficha.id" class="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {{ ficha.cohort_number }}
              </span>
            </div>

            <!-- RAP Badges on Card -->
            <div v-if="course.raps && course.raps.length > 0" class="flex flex-wrap gap-1 mb-2.5">
              <span 
                v-for="rap in course.raps" 
                :key="rap" 
                class="text-[10px] font-extrabold bg-blue-50 text-[#006688] border border-blue-200/70 px-2 py-0.5 rounded-md flex items-center gap-1"
                :title="`Resultado de Aprendizaje: ${rap}`"
              >
                <span class="material-symbols-outlined text-[11px]">verified</span>
                {{ rap }}
              </span>
            </div>

            <h4 class="font-bold text-gray-800 mb-1 leading-snug">{{ course.title }}</h4>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{{ course.description }}</p>
            
            <!-- Progress or Lock Notice for Learner -->
            <div v-if="!auth.isAdmin && !auth.isInstructor" class="mb-3">
              <div v-if="course.isLocked" class="p-2.5 bg-amber-50 border border-amber-200/70 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <span class="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">lock_clock</span>
                <div class="text-[11px] leading-tight">
                  <span class="font-bold">Prerrequisito pendiente:</span>
                  <p class="text-amber-800 mt-0.5">Completa al 100% el módulo <strong>"{{ course.prerequisiteTitle || 'anterior' }}"</strong> para desbloquear este nivel.</p>
                </div>
              </div>
              <div v-else>
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso</span>
                  <span class="font-bold text-[#006688]">{{ course.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-1.5 rounded-full bg-[#006688] transition-all" :style="`width: ${course.progress || 0}%`"></div>
                </div>
              </div>
            </div>

            <div v-else class="mb-3 flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-[#006688]">task</span>
                <span>{{ course.activitiesCount || 0 }} actividades pedagógicas</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 pt-0">
          <div class="flex items-center justify-between border-t border-gray-100 pt-3">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span class="material-symbols-outlined text-sm">group</span>
              {{ course.students || 0 }} estudiantes
            </div>
            
            <template v-if="!auth.isAdmin && !auth.isInstructor">
              <button
                v-if="course.isLocked"
                disabled
                class="px-3 py-1.5 bg-gray-200/70 text-gray-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-not-allowed"
                title="Debes completar el módulo anterior al 100%"
              >
                <span class="material-symbols-outlined text-xs">lock</span>
                Bloqueado
              </button>
              <router-link
                v-else
                :to="`/dashboard/cursos/${course.id}`"
                class="px-3.5 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
              >
                <span>{{ (course.progress || 0) > 0 ? 'Continuar' : 'Iniciar' }}</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </router-link>
            </template>
            
            <div v-else class="flex items-center gap-2">
              <router-link
                :to="`/dashboard/cursos/${course.id}`"
                class="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-[#006688] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Explorar el contenido pedagógico de este curso"
              >
                <span class="material-symbols-outlined text-sm">visibility</span>
                Ver
              </router-link>
              <button
                @click="openEditCourseModal(course)"
                class="text-xs font-semibold text-[#006688] hover:underline flex items-center gap-0.5 cursor-pointer"
                title="Editar este curso"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Editar
              </button>
              <button
                v-if="auth.isAdmin"
                @click="deleteCourse(course)"
                class="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                title="Eliminar este curso"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- CIERRE GLOBAL · POST-TEST (EVALUACIÓN INTEGRADORA DE RUTA) -->
    <!-- ======================================================== -->
    <div class="mt-8">
      <!-- Caso A: Desbloqueado para Admin/Instructor o Aprendiz que completó los módulos y llegó al cierre -->
      <div 
        v-if="canTakeGlobalPostTest" 
        class="bg-gradient-to-r from-teal-900 via-[#004e69] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/30 group animate-fade-in"
      >
        <div class="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-15 transition-opacity">
          <span class="material-symbols-outlined text-9xl">workspace_premium</span>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-yellow-300">workspace_premium</span>
                {{ auth.isAdmin || auth.isInstructor ? 'Cierre Global · Acceso Auditoría' : '¡Cierre de Ruta Desbloqueado!' }}
              </span>
              <span class="text-xs text-cyan-200 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                10 Reactivos Clínicos · RAP-01 al RAP-06
              </span>
            </div>

            <h3 class="text-xl sm:text-2xl font-black tracking-tight text-white">
              POST-TEST GLOBAL — Certificación Nursing Academy
            </h3>

            <p class="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {{ auth.isAdmin || auth.isInstructor 
                ? 'Como administrador o instructor, puedes auditar, revisar y probar en cualquier momento la evaluación final integradora que mide el crecimiento pedagógico de los aprendices y emite el diploma oficial.' 
                : '¡Excelente trabajo! Has completado el recorrido por los módulos formativos y alcanzado la fase de Cierre. Presenta tu evaluación final para medir tu aprendizaje frente al diagnóstico inicial y certificar tus competencias.' 
              }}
            </p>
          </div>

          <div class="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              @click="showGlobalPostTestModal = true"
              class="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">school</span>
              {{ auth.isAdmin || auth.isInstructor ? 'Auditar POST-TEST Global' : 'Presentar POST-TEST Global' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Caso B: Bloqueado para Aprendiz que NO ha llegado al módulo 4 o no ha llegado a su cierre -->
      <div 
        v-else 
        class="bg-gray-50/90 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-gray-300 text-gray-600 shadow-xs relative overflow-hidden"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">lock</span>
                POST-TEST GLOBAL BLOQUEADO
              </span>
              <span class="text-xs text-gray-400 font-semibold">
                Certificación Final de Ruta
              </span>
            </div>

            <h3 class="text-lg sm:text-xl font-bold text-gray-800">
              Evaluación Integradora de Cierre (RAP-01 al RAP-06)
            </h3>

            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              {{ postTestLockReason }}
            </p>

            <div class="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 mt-2">
              <span class="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">info</span>
              <div>
                <span class="font-bold">Condiciones indispensables para desbloquear:</span>
                <ul class="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
                  <li>Haber completado los Módulos 1, 2 y 3 al 100%.</li>
                  <li>Haber ingresado al Módulo 4 (Professional Practice) y alcanzado su fase de Cierre / Evaluación.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="shrink-0">
            <button
              disabled
              class="px-5 py-3 bg-gray-200 text-gray-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
              title="Cumple con los requisitos formativos para desbloquear"
            >
              <span class="material-symbols-outlined text-base">lock</span>
              Requisitos Pendientes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reusable Global Post-Test Modal (Opens directly in Cursos page) -->
    <GlobalPostTestModal v-model="showGlobalPostTestModal" />

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
              <div class="md:col-span-2 space-y-1">
                <label class="text-xs font-bold text-gray-500">Programa Curricular Asociado (Nivel)</label>
                <select v-model="form.programId" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688] cursor-pointer">
                  <option :value="null">Sin programa formativo asignado</option>
                  <option v-for="p in trainingPrograms" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-xs font-bold text-gray-500">Fichas / Cohortes del Curso</label>
                <p class="text-[10px] text-gray-400 -mt-1">Selecciona una o varias fichas; se filtran por el programa elegido.</p>
                <div v-if="cohortOptionsForCourse.length" class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <label
                    v-for="ficha in cohortOptionsForCourse"
                    :key="ficha.id"
                    :class="`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      (form.cohortIds || []).includes(ficha.id)
                        ? 'bg-teal-50 border-teal-400 text-teal-700 font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`"
                  >
                    <input type="checkbox" :value="ficha.id" v-model="form.cohortIds" class="rounded text-[#006688] cursor-pointer" />
                    {{ ficha.cohort_number }}
                  </label>
                </div>
                <p v-else class="text-[11px] text-gray-400 italic">
                  No hay fichas registradas{{ form.programId ? ' para este programa' : '' }}. {{ auth.isAdmin ? 'Créalas en Gestión Curricular.' : 'Solicita al Administrador crearlas en Gestión Curricular.' }}
                </p>
              </div>

              <!-- RAPs Curriculum Linking -->
              <div class="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#006688]">verified</span>
                    Resultados de Aprendizaje (RAPs) del Curso / Módulo
                  </label>
                  <span class="text-[10px] text-gray-400 font-medium">Selecciona los RAPs que desarrolla este módulo</span>
                </div>

                <div v-if="availableRaps.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 bg-gray-50/80 rounded-xl border border-gray-200">
                  <label
                    v-for="rap in availableRaps"
                    :key="rap.id || rap.code"
                    :class="`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      (form.raps || []).includes(rap.code)
                        ? 'bg-blue-50/90 border-[#006688] text-[#006688] font-bold shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`"
                  >
                    <input
                      type="checkbox"
                      :value="rap.code"
                      v-model="form.raps"
                      class="mt-0.5 rounded text-[#006688] focus:ring-[#006688] cursor-pointer"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-black text-[11px] bg-[#006688] text-white px-1.5 py-0.5 rounded">{{ rap.code }}</span>
                        <span v-if="rap.competency?.code" class="text-[9px] text-gray-400 font-semibold truncate">{{ rap.competency.code }}</span>
                      </div>
                      <p class="text-[11px] text-gray-600 mt-1 leading-snug font-normal line-clamp-2">{{ rap.description || rap.name }}</p>
                    </div>
                  </label>
                </div>
                <div v-else class="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-100">
                  No hay RAPs registrados en Gestión Curricular.
                </div>
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
              
              <!-- Editor de ítems de la fase (CRUD) -->
              <div class="space-y-4 animate-fade-in">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-gray-700">Contenido de la fase ({{ activePhaseItems.length }} ítems)</span>
                    <span class="text-[9px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ activePhaseLabel }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      v-if="!showItemForm"
                      @click="importCurrentStructure"
                      type="button"
                      class="px-2.5 py-1 bg-white border border-gray-200 hover:border-[#006688] text-gray-600 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                      title="Convierte los datos actuales de la fase en ítems editables"
                    >
                      <span class="material-symbols-outlined text-xs">move_down</span>
                      Importar plantilla
                    </button>
                    <button
                      v-if="!showItemForm"
                      @click="openAddItem"
                      type="button"
                      class="px-2.5 py-1 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                    >
                      <span class="material-symbols-outlined text-xs">add</span>
                      Agregar ítem
                    </button>
                    <button
                      v-if="!showItemForm && (editingCourse?.structure || activePhaseItems.length)"
                      @click="restoreCurrentPhase"
                      type="button"
                      class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                      title="Elimina la personalización y vuelve al contenido por defecto del módulo"
                    >
                      <span class="material-symbols-outlined text-xs">restart_alt</span>
                      Restaurar fase
                    </button>
                  </div>
                </div>

                <!-- Lista de ítems con orden, visibilidad y CRUD -->
                <div v-if="activePhaseItems.length" class="space-y-2">
                  <div v-for="(item, idx) in activePhaseItems" :key="item.id" class="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div class="min-w-0 flex items-center gap-2">
                      <span class="material-symbols-outlined text-base text-[#006688]">{{ item.icon || 'widgets' }}</span>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-gray-800 truncate">
                          {{ item.title || itemTypeLabel(item.type) }}
                          <span v-if="item.required === false" class="ml-1 text-[9px] font-bold text-gray-400">(opcional)</span>
                          <span v-if="item.visible === false" class="ml-1 text-[9px] font-bold text-amber-600">(oculto)</span>
                        </p>
                        <p class="text-[10px] text-gray-400">{{ itemTypeLabel(item.type) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <button @click="moveItem(idx, -1)" :disabled="idx === 0" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50 disabled:opacity-30" title="Subir"><span class="material-symbols-outlined text-sm">arrow_upward</span></button>
                      <button @click="moveItem(idx, 1)" :disabled="idx === activePhaseItems.length - 1" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50 disabled:opacity-30" title="Bajar"><span class="material-symbols-outlined text-sm">arrow_downward</span></button>
                      <button @click="toggleItemVisible(item)" class="p-1 rounded-lg" :class="item.visible === false ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-[#006688] hover:bg-gray-50'" :title="item.visible === false ? 'Mostrar' : 'Ocultar'"><span class="material-symbols-outlined text-sm">{{ item.visible === false ? 'visibility_off' : 'visibility' }}</span></button>
                      <button v-if="item.defaultKey" @click="restoreItemDefault(item)" class="p-1 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50" title="Restaurar ítem por defecto"><span class="material-symbols-outlined text-sm">restart_alt</span></button>
                      <button @click="openEditItem(item)" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50" title="Editar"><span class="material-symbols-outlined text-sm">edit</span></button>
                      <button @click="removeItem(item)" class="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Eliminar"><span class="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-center py-4 text-[11px] text-gray-400 italic bg-white/60 rounded-xl border border-dashed border-gray-200">
                  Esta fase no tiene ítems editables. Los módulos oficiales muestran su contenido por defecto hasta que importes o agregues ítems.
                </p>

                <!-- Formulario de ítem (crear/editar) -->
                <div v-if="showItemForm" class="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 animate-slide-up">
                  <div class="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span class="text-xs font-bold text-gray-700">{{ itemForm.id ? 'Editar ítem' : 'Nuevo ítem' }} — {{ activePhaseLabel }}</span>
                    <button @click="resetItemForm" type="button" class="text-gray-400 hover:text-gray-600"><span class="material-symbols-outlined text-xs">close</span></button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Tipo de ítem</label>
                      <select v-model="itemForm.type" @change="onItemTypeChange" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                        <option v-for="opt in activePhaseItemTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Título visible (opcional)</label>
                      <input type="text" v-model="itemForm.title" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" />
                    </div>
                    <div class="space-y-1 sm:col-span-2">
                      <label class="text-[10px] font-bold text-gray-500">Instrucción / descripción (opcional)</label>
                      <input type="text" v-model="itemForm.description" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Icono (Material Symbols)</label>
                      <input type="text" v-model="itemForm.icon" placeholder="ej. menu_book" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Color</label>
                      <select v-model="itemForm.color" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold">
                        <option value="">Por defecto</option>
                        <option value="#006688">Azul institucional</option>
                        <option value="#059669">Verde</option>
                        <option value="#d97706">Ámbar</option>
                        <option value="#4f46e5">Índigo</option>
                        <option value="#dc2626">Rojo</option>
                      </select>
                    </div>
                    <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600"><input type="checkbox" v-model="itemForm.visible" class="rounded" /> Visible para el aprendiz</label>
                    <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600"><input type="checkbox" v-model="itemForm.required" class="rounded" /> Obligatorio para avanzar</label>
                  </div>

                  <!-- Campos según tipo de ítem -->
                  <div class="pt-3 border-t border-gray-100 space-y-3">
                    <div v-if="itemForm.type === 'welcome' || itemForm.type === 'video'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Texto / descripción del recurso</label>
                      <textarea v-model="itemForm.payload.text" rows="3" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" :placeholder="itemForm.type === 'video' ? 'Describe el video de bienvenida (el archivo se agrega después)' : 'Texto de bienvenida para el aprendiz'"></textarea>
                    </div>
                    <div v-if="itemForm.type === 'objectives'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Metas de aprendizaje (una por línea)</label>
                      <textarea v-model="itemForm.payload.lines" rows="4" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="Presentarse&#10;Saludar formal e informalmente&#10;Solicitar datos básicos"></textarea>
                    </div>
                    <div v-if="itemForm.type === 'wordorder' || itemForm.type === 'vocabulary' || itemForm.type === 'listening' || itemForm.type === 'spelling'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Elementos (separados por coma)</label>
                      <input type="text" v-model="itemForm.payload.csv" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" :placeholder="itemForm.type === 'wordorder' ? 'The nurse, checks, the, patient\'s, blood pressure' : 'stethoscope, bandage, vitals'" />
                      <p v-if="itemForm.type === 'wordorder'" class="text-[10px] text-gray-400 italic">El aprendiz deberá ordenarlas; escríbelas en el orden correcto.</p>
                    </div>
                    <div v-if="itemForm.type === 'warmup_drag'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Parejas a arrastrar (una por línea, formato "Tarjeta = Destino")</label>
                      <textarea v-model="itemForm.payload.lines" rows="4" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="Morning = Good morning&#10;Afternoon = Good afternoon&#10;Night = Good evening"></textarea>
                      <p class="text-[10px] text-gray-400 italic">El aprendiz arrastra cada tarjeta hacia su destino correcto.</p>
                    </div>
                    <div v-if="itemForm.type === 'grammar'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Oraciones (una por línea, formato "Persona | Verbo | Detalle" o texto libre)</label>
                      <textarea v-model="itemForm.payload.lines" rows="4" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="I | am | a nurse&#10;She | works | at the hospital"></textarea>
                    </div>
                    <div v-if="itemForm.type === 'chat'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Mensajes (uno por línea, formato "Nombre: English = Español")</label>
                      <textarea v-model="itemForm.payload.lines" rows="5" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="Sarah: Hi! Good morning. = ¡Hola! Buenos días.&#10;David: Good morning, Sarah. = Buenos días, Sarah."></textarea>
                    </div>
                    <div v-if="itemForm.type === 'fillblank'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Respuesta correcta</label>
                      <input type="text" v-model="itemForm.payload.answer" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="Ej. prescription" />
                    </div>
                    <div v-if="itemForm.type === 'voice' || itemForm.type === 'profile'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Frase objetivo</label>
                      <input type="text" v-model="itemForm.payload.target" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="The patient is stable." />
                    </div>
                    <div v-if="itemForm.type === 'quiz'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="space-y-1 sm:col-span-2">
                        <label class="text-[10px] font-bold text-gray-500">Pregunta</label>
                        <input type="text" v-model="itemForm.payload.question" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Opción correcta</label>
                        <input type="text" v-model="itemForm.payload.correct" class="w-full px-2.5 py-1.5 border border-green-200 bg-green-50/50 rounded-lg text-xs font-semibold" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Opción incorrecta</label>
                        <input type="text" v-model="itemForm.payload.incorrect" class="w-full px-2.5 py-1.5 border border-red-200 bg-red-50/50 rounded-lg text-xs font-semibold" />
                      </div>
                    </div>
                    <div v-if="itemForm.type === 'match'" class="space-y-1">
                      <label class="text-[10px] font-bold text-gray-500">Parejas (una por línea, formato "Término = Significado")</label>
                      <textarea v-model="itemForm.payload.lines" rows="4" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold" placeholder="Good morning = Buenos días&#10;Good night = Buenas noches"></textarea>
                    </div>
                  </div>

                  <div class="flex justify-end gap-2 pt-1">
                    <button @click="resetItemForm" type="button" class="px-3 py-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
                    <button @click="saveItem" type="button" class="px-4 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white text-[11px] font-bold rounded-lg">Guardar ítem</button>
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
                    v-if="!showAddActivityForm && editingCourse"
                    @click="openAssignActivityModal"
                    type="button"
                    class="px-2.5 py-1 bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-xs">add</span>
                    Asignar Actividad
                  </button>
                  <span v-else-if="!editingCourse" class="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Disponible tras guardar el curso
                  </span>
                </div>

                <!-- Activities list -->
                <div v-if="coursePhaseActivities.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div 
                    v-for="(act, actIdx) in coursePhaseActivities" 
                    :key="act.id"
                    class="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-gray-200 transition-all"
                  >
                    <div class="min-w-0 flex items-center gap-2">
                      <span class="material-symbols-outlined text-base" :style="act.color ? `color:${act.color}` : 'color:#006688'">{{ act.icon || 'extension' }}</span>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-gray-800 truncate">
                          {{ act.title }}
                          <span v-if="act.required === false" class="ml-1 text-[9px] font-bold text-gray-400">(opcional)</span>
                          <span v-if="act.visible === false" class="ml-1 text-[9px] font-bold text-amber-600">(oculta)</span>
                        </p>
                        <p class="text-[10px] text-gray-400 font-medium truncate">{{ act.description || ('Plantilla: ' + act.template) }} · {{ act.points }} pts</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <button @click="moveActivity(actIdx, -1)" :disabled="actIdx === 0" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50 disabled:opacity-30" title="Subir"><span class="material-symbols-outlined text-sm">arrow_upward</span></button>
                      <button @click="moveActivity(actIdx, 1)" :disabled="actIdx === coursePhaseActivities.length - 1" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50 disabled:opacity-30" title="Bajar"><span class="material-symbols-outlined text-sm">arrow_downward</span></button>
                      <button @click="toggleActivityVisible(act)" class="p-1 rounded-lg" :class="act.visible === false ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-[#006688] hover:bg-gray-50'" :title="act.visible === false ? 'Mostrar' : 'Ocultar'"><span class="material-symbols-outlined text-sm">{{ act.visible === false ? 'visibility_off' : 'visibility' }}</span></button>
                      <button @click="openEditActivityForm(act)" class="p-1 rounded-lg text-gray-400 hover:text-[#006688] hover:bg-gray-50" title="Editar actividad"><span class="material-symbols-outlined text-sm">edit</span></button>
                      <button @click="deleteInlineActivity(act.id)" type="button" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all shrink-0" title="Eliminar actividad"><span class="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-[11px] text-gray-400 italic bg-white/50 rounded-xl border border-dashed border-gray-200">
                  No hay actividades configuradas para esta fase. Haz clic en "Asignar Actividad" para añadir la primera.
                </div>

                <!-- Add/Assign Activity Modal / Panel -->
                <div v-if="showAddActivityForm" class="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm animate-slide-up">
                  <!-- Header: Mode Selector (Tabs) if creating/assigning, or Title if editing an existing activity -->
                  <div v-if="!newActivity.id" class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-150 gap-2">
                    <div class="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                      <button 
                        type="button"
                        @click="assignActivityTab = 'link'"
                        :class="assignActivityTab === 'link' ? 'bg-[#006688] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-sm">link</span>
                        Vincular Actividad Existente ({{ availableCatalogActivities.length }})
                      </button>
                      <button 
                        type="button"
                        @click="assignActivityTab = 'create'"
                        :class="assignActivityTab === 'create' ? 'bg-[#006688] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-sm">add_circle</span>
                        Crear Nueva Actividad
                      </button>
                    </div>
                    <button @click="resetNewActivityForm" type="button" class="text-gray-400 hover:text-gray-600 p-1 self-end sm:self-center" title="Cerrar">
                      <span class="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <!-- Header if editing an existing activity -->
                  <div v-else class="flex justify-between items-center pb-2 border-b border-gray-150">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base text-[#006688]">edit_note</span>
                      <span class="text-xs font-bold text-gray-700">Editar Actividad de esta Fase</span>
                    </div>
                    <button @click="resetNewActivityForm" type="button" class="text-gray-400 hover:text-gray-600 p-1" title="Cerrar">
                      <span class="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <!-- ========================================================= -->
                  <!-- TAB 1: VINCULAR ACTIVIDAD EXISTENTE DEL CATÁLOGO         -->
                  <!-- ========================================================= -->
                  <div v-if="assignActivityTab === 'link' && !newActivity.id" class="space-y-3.5">
                    <div class="flex flex-col sm:flex-row gap-2 items-center justify-between">
                      <div class="relative flex-1 w-full">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input 
                          type="text" 
                          v-model="catalogSearchQuery" 
                          placeholder="Buscar por título, plantilla o curso..."
                          class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688] focus:bg-white transition-all"
                        />
                      </div>
                      <select 
                        v-model="catalogTemplateFilter" 
                        class="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#006688]"
                      >
                        <option value="all">Todas las plantillas</option>
                        <option value="sopa">Sopa de Letras</option>
                        <option value="crucigrama">Crucigramas</option>
                        <option value="quiz">Quizzes</option>
                        <option value="preguntas">Opción Múltiple</option>
                        <option value="match">Conectar Significado</option>
                        <option value="fillblank">Completar Oración</option>
                        <option value="listening">Escucha</option>
                        <option value="pronunciation">Pronunciación</option>
                      </select>
                    </div>

                    <p class="text-[11px] text-gray-500 leading-normal">
                      Selecciona cualquier actividad creada previamente en la sección de <strong>Actividades</strong> para vincularla a esta fase (<span class="font-bold text-[#006688]">{{ targetModalPhaseName }}</span>), o pulsa <em>"Usar como Plantilla"</em> para crear una copia adaptada a este módulo.
                    </p>

                    <!-- Catalog List -->
                    <div class="max-h-80 overflow-y-auto pr-1 space-y-2">
                      <div 
                        v-for="act in filteredCatalogActivities" 
                        :key="act.id"
                        class="p-3 bg-gray-50/50 hover:bg-white rounded-xl border border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#006688]/30 hover:shadow-xs"
                      >
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs" :style="`background-color: ${act.color || '#006688'}15; color: ${act.color || '#006688'}`">
                            <span class="material-symbols-outlined text-lg">{{ act.icon || 'extension' }}</span>
                          </div>
                          <div class="min-w-0">
                            <p class="text-xs font-bold text-gray-800 truncate">{{ act.title }}</p>
                            <div class="flex items-center gap-2 mt-0.5 flex-wrap text-[10px]">
                              <span class="font-bold uppercase px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                {{ act.template }}
                              </span>
                              <span class="text-gray-500 font-semibold">{{ act.points }} pts</span>
                              <span v-if="act.isAssignedHere" class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                                ✓ Ya asignada a esta fase
                              </span>
                              <span v-else-if="act.course" class="text-gray-400 font-medium truncate max-w-[200px]">
                                En: {{ act.course }} ({{ act.phase }})
                              </span>
                              <span v-else class="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.2 rounded">
                                Sin curso asignado
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            v-if="!act.isAssignedHere"
                            @click="linkExistingActivityToPhase(act)"
                            :disabled="isLinkingActivity"
                            type="button"
                            class="px-3 py-1.5 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Asignar esta actividad directamente a este módulo y fase"
                          >
                            <span class="material-symbols-outlined text-xs">link</span>
                            Vincular a esta Fase
                          </button>
                          <button
                            @click="cloneActivityAsTemplate(act)"
                            type="button"
                            class="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Usar su contenido como base para crear una actividad nueva para este módulo"
                          >
                            <span class="material-symbols-outlined text-xs">content_copy</span>
                            Usar como Plantilla
                          </button>
                        </div>
                      </div>

                      <div v-if="filteredCatalogActivities.length === 0" class="py-10 text-center text-xs text-gray-400 space-y-1">
                        <span class="material-symbols-outlined text-2xl text-gray-300 block">search_off</span>
                        <p>No se encontraron actividades que coincidan con los filtros.</p>
                      </div>
                    </div>
                  </div>

                  <!-- ========================================================= -->
                  <!-- TAB 2: CREAR NUEVA ACTIVIDAD (O ADAPTAR PLANTILLA)        -->
                  <!-- ========================================================= -->
                  <div v-else class="space-y-4">
                    <!-- Template Selector Banner (Only when creating new, not editing) -->
                    <div v-if="!newActivity.id" class="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[#006688] text-lg shrink-0">auto_awesome</span>
                        <div>
                          <p class="text-xs font-bold text-[#006688]">Usar plantilla de una actividad creada (opcional)</p>
                          <p class="text-[10px] text-gray-500">Precarga palabras, crucigramas o preguntas para adaptarlas a este módulo.</p>
                        </div>
                      </div>
                      <select 
                        :value="selectedTemplateActivityId || ''"
                        @change="cloneActivityAsTemplate($event.target.value)"
                        class="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-[#006688] max-w-xs truncate"
                      >
                        <option value="">-- Plantilla en blanco (desde cero) --</option>
                        <option v-for="act in availableCatalogActivities" :key="act.id" :value="act.id">
                          [{{ act.template }}] {{ act.title }}
                        </option>
                      </select>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Título de la Actividad</label>
                        <input type="text" v-model="newActivity.title" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Vocabulario de Signos Vitales" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Plantilla de Juego</label>
                        <select v-model="newActivity.template" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]">
                          <option v-for="opt in ALL_GAME_TEMPLATES" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                          </option>
                        </select>
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Puntos Otorgados</label>
                        <input type="number" v-model="newActivity.points" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Descripción / instrucción (opcional)</label>
                        <input type="text" v-model="newActivity.description" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Ej. Practica el vocabulario visto en clase" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Icono (Material Symbols)</label>
                        <input type="text" v-model="newActivity.icon" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="ej. extension" />
                      </div>
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-500">Color</label>
                        <select v-model="newActivity.color" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]">
                          <option value="">Por defecto</option>
                          <option value="#006688">Azul institucional</option>
                          <option value="#059669">Verde</option>
                          <option value="#d97706">Ámbar</option>
                          <option value="#4f46e5">Índigo</option>
                          <option value="#dc2626">Rojo</option>
                        </select>
                      </div>
                      <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600"><input type="checkbox" v-model="newActivity.visible" class="rounded" /> Visible para el aprendiz</label>
                      <label class="flex items-center gap-2 text-[11px] font-bold text-gray-600"><input type="checkbox" v-model="newActivity.required" class="rounded" /> Obligatoria para avanzar</label>
                      <p v-if="newActivity.hasStudentSubmissions" class="sm:col-span-2 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                        Esta actividad ya tiene entregas: solo se puede cambiar la presentación, el orden y la visibilidad.
                      </p>
                      
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
                          <input type="text" v-model="newActivity.matchTerm" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
                        </div>
                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-gray-500">Significado en Español</label>
                          <input type="text" v-model="newActivity.matchMeaning" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none" />
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

                      <div v-if="newActivity.template === 'fillblank'" class="sm:col-span-2 space-y-2">
                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-gray-500">Oración con espacio (usa [blank] o __)</label>
                          <input type="text" v-model="newActivity.fillblankSentence" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="The nurse prepares the [blank]." />
                        </div>
                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-gray-500">Palabra o respuesta correcta</label>
                          <input type="text" v-model="newActivity.fillblankAnswer" class="w-full px-2 py-1.5 border border-green-200 bg-green-50/20 rounded-lg text-xs font-semibold focus:outline-none" placeholder="medication" />
                        </div>
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
                        {{ newActivity.id ? 'Guardar Cambios' : 'Guardar y Asignar al Módulo' }}
                      </button>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { generateCrossword } from '../../utils/crosswordGenerator'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'
import { OFFICIAL_STRUCTURES, getOfficialStructure, findOfficialDefault } from '../../data/officialStructures'
import GlobalPostTestModal from '../../components/cursos/GlobalPostTestModal.vue'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const activeFilter = ref('Todos')
const filters = ['Todos', 'En Progreso', 'Completados', 'Nuevos']

// Modal & Form States
const showModal = ref(false)
const showGlobalPostTestModal = ref(false)
const editingCourse = ref(null)
const activeModalPhase = ref('inicio')
const DEFAULT_OFFICIAL_RAPS = [
  { id: 1, code: 'RAP-01', name: 'Intercambiar información personal y social básica en el contexto de atención en salud (Módulo 1 · Fase Análisis)' },
  { id: 2, code: 'RAP-02', name: 'Describir el estado físico del paciente y el entorno hospitalario en inglés técnico (Módulo 2 · Fase Planeación)' },
  { id: 3, code: 'RAP-03', name: 'Relatar antecedentes clínicos y realizar entregas de turno estructuradas en pasado simple (Módulo 2 · Fase Planeación)' },
  { id: 4, code: 'RAP-04', name: 'Explicar procedimientos clínicos rutinarios e interactuar en tiempo presente en el área hospitalaria (Módulo 3 · Fase Ejecución)' },
  { id: 5, code: 'RAP-05', name: 'Proponer mejoras laborales al supervisor y gestionar listas de verificación clínicas (Módulo 3 · Fase Ejecución)' },
  { id: 6, code: 'RAP-06', name: 'Brindar recomendaciones médicas de egreso y evaluar resultados de listas de verificación (Módulo 4 · Fase Evaluación)' }
]

const availableRaps = ref([...DEFAULT_OFFICIAL_RAPS])
const availableCohorts = ref([])
const trainingPrograms = ref([])

const cohortOptionsForCourse = computed(() => {
  const programId = form.value.programId ? parseInt(form.value.programId) : null
  if (!programId) return availableCohorts.value
  return availableCohorts.value.filter(ficha => Number(ficha.program_id) === Number(programId))
})

async function fetchCohorts() {
  try {
    const token = getAuthToken()
    const res = await fetch(`${apiBaseUrl}/api/admin/curriculum/cohorts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      availableCohorts.value = Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (err) {
    console.warn('Backend cohorts unavailable:', err)
  }
}

const newActivity = ref({
  id: null,
  title: '',
  template: 'quiz',
  points: 10,
  description: '',
  icon: '',
  color: '',
  visible: true,
  required: true,
  hasStudentSubmissions: false,
  sopaWords: 'heart, pulse, blood',
  quizQuestion: '',
  quizCorrect: '',
  quizIncorrect: '',
  matchTerm: '',
  matchMeaning: '',
  listeningPhrase: '',
  pronouncePhrase: '',
  fillblankSentence: '',
  fillblankAnswer: '',
  crosswordWords: [{ word: '', clue: '', orientation: 'horizontal' }],
  layoutMode: 'automatic'
})

// Activity Assigner State & Catalog Linking
const assignActivityTab = ref('link') // 'link' | 'create'
const catalogSearchQuery = ref('')
const catalogTemplateFilter = ref('all')
const selectedTemplateActivityId = ref(null)
const isLinkingActivity = ref(false)

const ALL_GAME_TEMPLATES = [
  { value: 'sopa', label: 'Sopa de letras' },
  { value: 'crucigrama', label: 'Crucigramas' },
  { value: 'match', label: 'Conectar significado' },
  { value: 'quiz', label: 'Quizzes' },
  { value: 'preguntas', label: 'Opción múltiple' },
  { value: 'fillblank', label: 'Completar oración' },
  { value: 'listening', label: 'Escucha (Audio)' },
  { value: 'pronunciation', label: 'Pronunciación (Voz)' }
]

const targetModalPhaseName = computed(() => {
  const phaseMapping = {
    inicio: 'Preparación',
    estudio: 'Absorción',
    practica: 'Práctica',
    evaluacion: 'Cierre'
  }
  return phaseMapping[activeModalPhase.value] || 'Preparación'
})

const availableCatalogActivities = computed(() => {
  const currentCourseId = editingCourse.value?.id
  const currentPhase = targetModalPhaseName.value
  return (activities.value || []).map(act => {
    const actCourseId = act.courseId ? Number(act.courseId) : null
    const isAssignedHere = Boolean(currentCourseId && actCourseId === Number(currentCourseId) && act.phase === currentPhase)
    return {
      ...act,
      isAssignedHere
    }
  })
})

const filteredCatalogActivities = computed(() => {
  let list = availableCatalogActivities.value
  if (catalogTemplateFilter.value && catalogTemplateFilter.value !== 'all') {
    list = list.filter(a => a.template === catalogTemplateFilter.value)
  }
  if (catalogSearchQuery.value.trim()) {
    const q = catalogSearchQuery.value.trim().toLowerCase()
    list = list.filter(a => 
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.course && a.course.toLowerCase().includes(q)) ||
      (a.phase && a.phase.toLowerCase().includes(q)) ||
      (a.template && a.template.toLowerCase().includes(q))
    )
  }
  return list
})

function openAssignActivityModal() {
  resetNewActivityForm()
  assignActivityTab.value = 'link'
  catalogSearchQuery.value = ''
  catalogTemplateFilter.value = 'all'
  selectedTemplateActivityId.value = null
  showAddActivityForm.value = true
}

async function linkExistingActivityToPhase(act) {
  if (!editingCourse.value || !act) return
  isLinkingActivity.value = true
  try {
    const token = getAuthToken()
    const targetPhase = targetModalPhaseName.value
    const payload = {
      courseId: editingCourse.value.id,
      course: editingCourse.value.title,
      phase: targetPhase
    }
    const res = await fetch(`${apiBaseUrl}/api/activities/${act.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'No se pudo vincular la actividad a esta fase.')
    }
    await fetchActivities()
    notificationStore.notify({
      type: 'success',
      title: 'Actividad Vinculada',
      message: `"${act.title}" ha sido asignada a la fase ${targetPhase}.`
    })
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Vincular',
      message: err.message || 'No se pudo vincular la actividad.'
    })
  } finally {
    isLinkingActivity.value = false
  }
}

function cloneActivityAsTemplate(actOrId) {
  const act = typeof actOrId === 'object' && actOrId !== null
    ? actOrId 
    : activities.value.find(a => a.id === Number(actOrId))
  
  if (!act) return

  const empty = createEmptyActivity()
  let crosswordWords = empty.crosswordWords
  let layoutMode = 'automatic'
  if (act.crossword1Clue) {
    try {
      const parsed = JSON.parse(act.crossword1Clue)
      layoutMode = parsed.layoutMode || 'automatic'
      if (Array.isArray(parsed.words) && parsed.words.length) {
        crosswordWords = parsed.words.map(w => ({ word: w.word, clue: w.clue, orientation: w.orientation || 'horizontal' }))
      }
    } catch {}
  }

  newActivity.value = {
    ...empty,
    id: null,
    title: `${act.title} (Copia)`,
    template: act.template || 'quiz',
    points: act.points || 10,
    description: act.description || '',
    icon: act.icon || '',
    color: act.color || '',
    visible: act.visible !== false,
    required: act.required !== false,
    hasStudentSubmissions: false,
    sopaWords: act.sopaWords || '',
    quizQuestion: act.quizQuestion || '',
    quizCorrect: act.quizCorrect || '',
    quizIncorrect: act.quizIncorrect || '',
    matchTerm: act.matchTerm || '',
    matchMeaning: act.matchMeaning || '',
    listeningPhrase: act.listeningPhrase || '',
    pronouncePhrase: act.pronouncePhrase || '',
    fillblankSentence: act.fillblankSentence || '',
    fillblankAnswer: act.fillblankAnswer || '',
    crosswordWords,
    layoutMode
  }

  selectedTemplateActivityId.value = act.id
  assignActivityTab.value = 'create'
  showAddActivityForm.value = true

  notificationStore.notify({
    type: 'info',
    title: 'Plantilla Cargada',
    message: `Se cargó la plantilla de "${act.title}". Puedes modificarla y guardarla para este módulo.`
  })
}

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
      { value: 'fillblank', label: 'Completar oración' },
      { value: 'preguntas', label: 'Opción múltiple' }
    ]
  } else if (activeModalPhase.value === 'evaluacion') {
    return [
      { value: 'quiz', label: 'Quizzes' },
      { value: 'fillblank', label: 'Completar oración' },
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

const apiBaseUrl = getApiBaseUrl()
const activities = ref([])

function getAuthToken() {
  const rawToken = auth.token || auth.user?.token
  const token = typeof rawToken === 'string' ? rawToken : (rawToken && typeof rawToken === 'object' && 'value' in rawToken ? rawToken.value : '')
  if (token) return token
  try {
    const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
    return stored ? JSON.parse(stored)?.token : ''
  } catch {
    return ''
  }
}

async function fetchActivities() {
  try {
    const token = getAuthToken()
    const response = await fetch(`${apiBaseUrl}/api/activities`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (response.ok) {
      activities.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching activities:', error)
  }
}

async function fetchCourses() {
  try {
    const token = getAuthToken()
    const res = await fetch(`${apiBaseUrl}/api/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.data || [])
      if (Array.isArray(list) && list.length > 0) {
        courses.value = list.map((c, i) => {
          const fallback = courses.value.find(f => String(f.id) === String(c.id)) || courses.value.find(f => f.title === c.title) || {}
          const studentTotal = c.students !== undefined ? c.students : (c.studentsCount !== undefined ? c.studentsCount : 0)
          const cat = c.category || fallback.category || 'Básico'
          const catBg = cat === 'Profesional' ? 'bg-emerald-100' : cat === 'Avanzado' ? 'bg-amber-100' : cat === 'Intermedio' ? 'bg-indigo-100' : 'bg-teal-100'
          const catText = cat === 'Profesional' ? 'text-emerald-700' : cat === 'Avanzado' ? 'text-amber-700' : cat === 'Intermedio' ? 'text-indigo-700' : 'text-teal-700'
          
          let parsedRaps = []
          if (c.raps) {
            try {
              parsedRaps = Array.isArray(c.raps) ? c.raps : JSON.parse(c.raps)
            } catch {
              parsedRaps = []
            }
          }
          if (!parsedRaps || parsedRaps.length === 0) {
            if (c.slug === 'getting-to-know-other-people' || c.id === 1) parsedRaps = ['RAP-01']
            else if (c.slug === 'work-life-interaction' || c.id === 2) parsedRaps = ['RAP-02', 'RAP-03']
            else if (c.slug === 'workplace-communication' || c.id === 3) parsedRaps = ['RAP-04', 'RAP-05']
            else if (c.slug === 'professional-practice' || c.id === 4) parsedRaps = ['RAP-06']
          }

          return {
            ...fallback,
            ...c,
            id: c.id,
            slug: c.slug || '',
            title: c.title,
            description: c.description,
            duration: c.duration || fallback.duration || '10h',
            category: cat,
            students: studentTotal,
            studentsCount: studentTotal,
            activitiesCount: c.activitiesCount !== undefined ? c.activitiesCount : 0,
            icon: c.icon || fallback.icon || 'medical_services',
            iconColor: c.iconColor || fallback.iconColor || '#006688',
            bg: c.bg || fallback.bg || 'bg-teal-50',
            categoryBg: catBg,
            categoryText: catText,
            programId: c.programId || null,
            programName: c.programName || null,
            cohorts: c.cohorts || [],
            progress: c.progress || 0,
            raps: parsedRaps,
            isLocked: Boolean(c.isLocked),
            prerequisiteTitle: c.prerequisiteTitle || null,
            prerequisiteId: c.prerequisiteId || null
          }
        })
      }
    }
  } catch (err) {
    console.warn('Backend courses unavailable, using fallback courses:', err)
  }
}

async function fetchCurriculumRaps() {
  try {
    const token = getAuthToken()
    let res = await fetch(`${apiBaseUrl}/api/admin/curriculum/raps`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      res = await fetch(`${apiBaseUrl}/api/curriculum/raps`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
    }
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.data || [])
      if (list.length > 0) {
        availableRaps.value = list
        return
      }
    }
  } catch (err) {
    console.warn('Backend curriculum raps unavailable:', err)
  }
  if (!availableRaps.value || availableRaps.value.length === 0) {
    availableRaps.value = [...DEFAULT_OFFICIAL_RAPS]
  }
}

async function fetchTrainingPrograms() {
  try {
    const token = getAuthToken()
    const res = await fetch(`${apiBaseUrl}/api/admin/curriculum/programs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (res.ok) {
      const data = await res.json()
      trainingPrograms.value = Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (err) {
    console.warn('Backend training programs unavailable:', err)
  }
}

onMounted(async () => {
  await fetchCourses()
  await fetchActivities()
  await fetchTrainingPrograms()
  await fetchCurriculumRaps()
  await fetchCohorts()

  const apprenticeId = auth.user?.id || 'guest'
  courses.value.forEach(course => {
    try {
      const key = `nursing_academy_progress_${apprenticeId}_course_${course.id}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.phaseProgress) {
          const sum = Object.values(data.phaseProgress).reduce((a, b) => a + b, 0)
          course.progress = Math.max(course.progress || 0, Math.round(sum / Object.keys(data.phaseProgress).length))
        }
      }
    } catch (e) {
      console.error(e)
    }
  })

  // Sincronizar bloqueo secuencial local si el aprendiz completó módulos en su sesión
  if (!auth.isAdmin && !auth.isInstructor) {
    let prevProg = 100
    let prevTitle = null
    let prevId = null
    courses.value.forEach((course, idx) => {
      if (idx > 0) {
        course.isLocked = prevProg < 100
        course.prerequisiteTitle = prevProg < 100 ? prevTitle : null
        course.prerequisiteId = prevProg < 100 ? prevId : null
      } else {
        course.isLocked = false
      }
      prevProg = course.progress || 0
      prevTitle = course.title
      prevId = course.id
    })
  }
})

// Initial Courses Data State — Módulos Pedagógicos RAP 1, RAP 2/3, RAP 4/5 y RAP 6
const courses = ref([
  {
    id: 1,
    slug: 'getting-to-know-other-people',
    title: 'Getting to Know Other People',
    description: 'Módulo 1 — Fase Análisis · RAP 1. Aprende a saludar, presentarte, dar información personal y comunicarte con pacientes extranjeros en inglés.',
    category: 'Básico',
    categoryBg: 'bg-teal-100',
    categoryText: 'text-teal-700',
    duration: '8h',
    students: 340,
    progress: 0,
    icon: 'medical_services',
    bg: 'bg-teal-50',
    iconColor: '#006688',
    raps: ['RAP-01']
  },
  {
    id: 2,
    slug: 'work-life-interaction',
    title: 'Work Life Interaction',
    description: 'Módulo 2 — Fase Planeación · RAP 2 y 3. Caso Mr. Thomas: Pasado simple, adjetivos descriptivos, partes del cuerpo, notas de enfermería y entrega de turno (Handover).',
    category: 'Intermedio',
    categoryBg: 'bg-indigo-100',
    categoryText: 'text-indigo-700',
    duration: '12h',
    students: 285,
    progress: 0,
    icon: 'assignment_ind',
    bg: 'bg-indigo-50',
    iconColor: '#4f46e5',
    raps: ['RAP-02', 'RAP-03']
  },
  {
    id: 3,
    slug: 'workplace-communication',
    title: 'Workplace Communication',
    description: 'Módulo 3 — Fase Ejecución · RAP 4 y 5. Comunicación con médicos, colegas y visitantes: Presente simple vs. continuo, herramientas médicas, checklist clínico y propuestas de mejora.',
    category: 'Avanzado',
    categoryBg: 'bg-amber-100',
    categoryText: 'text-amber-700',
    duration: '14h',
    students: 195,
    progress: 0,
    icon: 'groups',
    bg: 'bg-amber-50',
    iconColor: '#d97706',
    raps: ['RAP-04', 'RAP-05']
  },
  {
    id: 4,
    slug: 'professional-practice',
    title: 'Professional Practice',
    description: 'Módulo 4 — Fase Evaluación · RAP 6. ¡Mr. Thomas se va a casa! Instrucciones de alta médica, recomendaciones de cuidado en casa con modales y análisis de listas de verificación.',
    category: 'Profesional',
    categoryBg: 'bg-emerald-100',
    categoryText: 'text-emerald-700',
    duration: '10h',
    students: 160,
    progress: 0,
    icon: 'verified_user',
    bg: 'bg-emerald-50',
    iconColor: '#059669',
    raps: ['RAP-06']
  },
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
  programId: null,
  raps: [],
  cohortIds: [],
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

function structureListToCsv(value) {
  if (Array.isArray(value)) return value.join(', ')
  return value || ''
}

// -----------------------------------------------------------------
// Editor de ítems de fase (structure v2)
// -----------------------------------------------------------------
const ITEM_TYPES_BY_PHASE = {
  inicio: [
    { value: 'welcome', label: 'Texto de bienvenida' },
    { value: 'video', label: 'Video introductorio' },
    { value: 'objectives', label: 'Metas de aprendizaje' },
    { value: 'wordorder', label: 'Calentamiento: ordenar palabras' },
    { value: 'warmup_drag', label: 'Calentamiento: arrastrar y soltar' }
  ],
  estudio: [
    { value: 'grammar', label: 'Explicación gramatical' },
    { value: 'vocabulary', label: 'Vocabulario (flashcards)' },
    { value: 'chat', label: 'Conversación / chat' },
    { value: 'listening', label: 'Escucha guiada' }
  ],
  practica: [
    { value: 'fillblank', label: 'Completar respuesta' },
    { value: 'voice', label: 'Práctica de voz' },
    { value: 'profile', label: 'Perfil / presentación' },
    { value: 'match', label: 'Conectar significado' },
    { value: 'spelling', label: 'Deletreo' },
    { value: 'quiz', label: 'Opción múltiple' }
  ],
  evaluacion: [
    { value: 'quiz', label: 'Pregunta de evaluación' },
    { value: 'preguntas', label: 'Cuestionario' }
  ]
}

const PHASE_LABELS = {
  inicio: 'Fase 1: Preparación',
  estudio: 'Fase 2: Absorción',
  practica: 'Fase 3: Práctica',
  evaluacion: 'Fase 4: Evaluación'
}

const structureItems = ref({ inicio: [], estudio: [], practica: [], evaluacion: [] })
const showItemForm = ref(false)
let itemIdCounter = 0

function newItemId() {
  itemIdCounter += 1
  return `item-${Date.now()}-${itemIdCounter}`
}

function emptyItemPayload() {
  return { text: '', lines: '', csv: '', answer: '', target: '', question: '', correct: '', incorrect: '' }
}

function createItemForm(phase) {
  const allowed = ITEM_TYPES_BY_PHASE[phase] || []
  return {
    id: null,
    type: allowed[0]?.value || 'welcome',
    title: '',
    description: '',
    icon: '',
    color: '',
    visible: true,
    required: true,
    payload: emptyItemPayload()
  }
}

const itemForm = ref(createItemForm('inicio'))
const activePhaseItems = computed(() => structureItems.value[activeModalPhase.value] || [])
const activePhaseItemTypes = computed(() => ITEM_TYPES_BY_PHASE[activeModalPhase.value] || [])
const activePhaseLabel = computed(() => PHASE_LABELS[activeModalPhase.value] || '')

function itemTypeLabel(type) {
  for (const options of Object.values(ITEM_TYPES_BY_PHASE)) {
    const found = options.find(option => option.value === type)
    if (found) return found.label
  }
  return type
}

function onItemTypeChange() {
  itemForm.value.payload = emptyItemPayload()
}

function openAddItem() {
  itemForm.value = createItemForm(activeModalPhase.value)
  showItemForm.value = true
}

function openEditItem(item) {
  itemForm.value = JSON.parse(JSON.stringify(item))
  if (!itemForm.value.payload) itemForm.value.payload = emptyItemPayload()
  showItemForm.value = true
}

function resetItemForm() {
  showItemForm.value = false
  itemForm.value = createItemForm(activeModalPhase.value)
}

function saveItem() {
  const item = JSON.parse(JSON.stringify(itemForm.value))
  if (!item.id) item.id = newItemId()
  const list = structureItems.value[activeModalPhase.value] || []
  const index = list.findIndex(existing => existing.id === item.id)
  if (index >= 0) {
    list[index] = item
  } else {
    list.push(item)
  }
  structureItems.value[activeModalPhase.value] = list
  resetItemForm()
}

function removeItem(item) {
  if (!confirm(`¿Eliminar el ítem "${item.title || itemTypeLabel(item.type)}" de esta fase?`)) return
  structureItems.value[activeModalPhase.value] = activePhaseItems.value.filter(existing => existing.id !== item.id)
}

function moveItem(index, direction) {
  const list = [...activePhaseItems.value]
  const target = index + direction
  if (target < 0 || target >= list.length) return
  const temp = list[index]
  list[index] = list[target]
  list[target] = temp
  structureItems.value[activeModalPhase.value] = list
}

function toggleItemVisible(item) {
  item.visible = item.visible === false
}

function parseCsv(value) {
  return String(value || '').split(',').map(entry => entry.trim()).filter(Boolean)
}

function toCsvList(value) {
  if (Array.isArray(value)) return value.map(entry => String(entry).trim()).filter(Boolean)
  return parseCsv(value)
}

function makeItem(type, title, options = {}) {
  return {
    id: newItemId(),
    type,
    title,
    description: options.description || '',
    icon: options.icon || '',
    color: options.color || '',
    visible: options.visible !== false,
    required: options.required !== false,
    payload: { ...emptyItemPayload(), ...(options.payload || {}) }
  }
}

function buildItemsFromCurrentForm() {
  const items = { inicio: [], estudio: [], practica: [], evaluacion: [] }
  if (form.value.f1_welcome?.trim()) {
    items.inicio.push(makeItem('welcome', 'Bienvenida', { icon: 'waving_hand', required: false, payload: { text: form.value.f1_welcome.trim() } }))
  }
  const words = parseCsv(form.value.f1_gameWords)
  if (words.length > 1) {
    items.inicio.push(makeItem('wordorder', 'Calentamiento', { description: 'Ordena las palabras para avanzar', icon: 'sports_esports', payload: { csv: words.join(', ') } }))
  }
  if (form.value.f2_grammar?.trim()) {
    items.estudio.push(makeItem('grammar', 'Explicación', { icon: 'menu_book', payload: { lines: form.value.f2_grammar.trim() } }))
  }
  const vocabulary = parseCsv(form.value.f2_vocabulary)
  if (vocabulary.length) {
    items.estudio.push(makeItem('vocabulary', 'Vocabulario', { description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: vocabulary.join(', ') } }))
  }
  if (form.value.f3_fillBlank?.trim()) {
    items.practica.push(makeItem('fillblank', 'Completar la respuesta', { icon: 'edit_note', payload: { answer: form.value.f3_fillBlank.trim() } }))
  }
  if (form.value.f3_voiceTarget?.trim()) {
    items.practica.push(makeItem('voice', 'Práctica de voz', { icon: 'mic', payload: { target: form.value.f3_voiceTarget.trim() } }))
  }
  if (form.value.f4_q?.trim()) {
    items.evaluacion.push(makeItem('quiz', 'Evaluación final', { icon: 'quiz', payload: { question: form.value.f4_q.trim(), correct: form.value.f4_correct?.trim() || '', incorrect: form.value.f4_incorrect?.trim() || '' } }))
  }
  return items
}

function importCurrentStructure() {
  structureItems.value = buildItemsFromCurrentForm()
  notificationStore.notify({
    type: 'success',
    title: 'Plantilla importada',
    message: 'Los datos actuales ahora son ítems editables. Ajusta, agrega o elimina y guarda el curso.'
  })
}

function structureItemsToV2() {
  const hasItems = Object.values(structureItems.value).some(list => list.length > 0)
  if (!hasItems) return null
  const phaseKeys = { inicio: 'f1', estudio: 'f2', practica: 'f3', evaluacion: 'f4' }
  const payload = { version: 2 }
  for (const phase of ['inicio', 'estudio', 'practica', 'evaluacion']) {
    payload[phaseKeys[phase]] = {
      items: (structureItems.value[phase] || []).map((item, index) => ({ ...item, order: index }))
    }
  }
  return payload
}

function loadStructureIntoItems(structure) {
  const empty = { inicio: [], estudio: [], practica: [], evaluacion: [] }
  if (!structure) return empty
  if (structure.version === 2 || (structure.f1 && Array.isArray(structure.f1.items))) {
    return {
      inicio: structure.f1?.items || [],
      estudio: structure.f2?.items || [],
      practica: structure.f3?.items || [],
      evaluacion: structure.f4?.items || []
    }
  }
  const items = { inicio: [], estudio: [], practica: [], evaluacion: [] }
  if (structure.f1?.welcome) {
    items.inicio.push(makeItem('welcome', 'Bienvenida', { icon: 'waving_hand', required: false, payload: { text: structure.f1.welcome } }))
  }
  const words = toCsvList(structure.f1?.gameWords)
  if (words.length > 1) {
    items.inicio.push(makeItem('wordorder', 'Calentamiento', { description: 'Ordena las palabras para avanzar', icon: 'sports_esports', payload: { csv: words.join(', ') } }))
  }
  if (structure.f2?.grammar) {
    items.estudio.push(makeItem('grammar', 'Explicación', { icon: 'menu_book', payload: { lines: structure.f2.grammar } }))
  }
  const vocabulary = toCsvList(structure.f2?.vocabulary)
  if (vocabulary.length) {
    items.estudio.push(makeItem('vocabulary', 'Vocabulario', { description: 'Escucha y repite cada palabra', icon: 'style', payload: { csv: vocabulary.join(', ') } }))
  }
  if (structure.f3?.fillBlank) {
    items.practica.push(makeItem('fillblank', 'Completar la respuesta', { icon: 'edit_note', payload: { answer: structure.f3.fillBlank } }))
  }
  if (structure.f3?.voiceTarget) {
    items.practica.push(makeItem('voice', 'Práctica de voz', { icon: 'mic', payload: { target: structure.f3.voiceTarget } }))
  }
  if (structure.f4?.question) {
    items.evaluacion.push(makeItem('quiz', 'Evaluación final', { icon: 'quiz', payload: { question: structure.f4.question, correct: structure.f4.correct || '', incorrect: structure.f4.incorrect || '' } }))
  }
  return items
}

function buildStructurePayload() {
  return structureItemsToV2()
}

function seedOfficialPhases() {
  if (!editingCourse.value) return
  const structure = getOfficialStructure(editingCourse.value.slug)
  if (!structure) return
  for (const phase of ['inicio', 'estudio', 'practica', 'evaluacion']) {
    if ((structureItems.value[phase] || []).length > 0) continue
    structureItems.value[phase] = (structure[phase] || []).map((item, index) => ({
      ...JSON.parse(JSON.stringify(item)),
      id: newItemId(),
      origin: 'official',
      order: index
    }))
  }
}

function restoreItemDefault(item) {
  const def = findOfficialDefault(editingCourse.value?.slug, item.defaultKey)
  if (!def) return
  Object.assign(item, JSON.parse(JSON.stringify(def)), { id: item.id, origin: 'official', order: item.order })
  notificationStore.notify({
    type: 'success',
    title: 'Ítem restaurado',
    message: 'El ítem volvió a su contenido por defecto.'
  })
}

function restoreCurrentPhase() {
  if (!confirm('Se restaurará el contenido por defecto de esta fase. ¿Continuar?')) return
  const phase = activeModalPhase.value
  structureItems.value[phase] = []
  showItemForm.value = false
  notificationStore.notify({
    type: 'success',
    title: 'Fase restaurada',
    message: 'Al guardar, la fase volverá a su contenido por defecto.'
  })
}

const coursePhaseActivities = computed(() => {
  if (!editingCourse.value) return []
  const phaseMapping = {
    inicio: 'Preparación',
    estudio: 'Absorción',
    practica: 'Práctica',
    evaluacion: 'Cierre'
  }
  const targetPhase = phaseMapping[activeModalPhase.value]
  return activities.value
    .filter(a => {
      const belongsToCourse = a.courseId
        ? Number(a.courseId) === Number(editingCourse.value.id)
        : a.course === editingCourse.value.title
      return belongsToCourse && a.phase === targetPhase
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0) || a.id - b.id)
})

const showAddActivityForm = ref(false)

function createEmptyActivity() {
  return {
    id: null,
    title: '',
    template: allowedTemplatesForCurrentPhase.value[0]?.value || 'quiz',
    points: 10,
    description: '',
    icon: '',
    color: '',
    visible: true,
    required: true,
    hasStudentSubmissions: false,
    sopaWords: 'heart, pulse, blood',
    quizQuestion: '',
    quizCorrect: '',
    quizIncorrect: '',
    matchTerm: '',
    matchMeaning: '',
    listeningPhrase: '',
    pronouncePhrase: '',
    fillblankSentence: '',
    fillblankAnswer: '',
    crosswordWords: [{ word: '', clue: '', orientation: 'horizontal' }],
    layoutMode: 'automatic'
  }
}

function resetNewActivityForm() {
  newActivity.value = createEmptyActivity()
  showAddActivityForm.value = false
  selectedTemplateActivityId.value = null
  assignActivityTab.value = 'link'
}

function openEditActivityForm(act) {
  const empty = createEmptyActivity()
  let crosswordWords = empty.crosswordWords
  let layoutMode = 'automatic'
  if (act.crossword1Clue) {
    try {
      const parsed = JSON.parse(act.crossword1Clue)
      layoutMode = parsed.layoutMode || 'automatic'
      if (Array.isArray(parsed.words) && parsed.words.length) {
        crosswordWords = parsed.words.map(word => ({ word: word.word, clue: word.clue, orientation: word.orientation || 'horizontal' }))
      }
    } catch {}
  }
  newActivity.value = {
    ...empty,
    id: act.id,
    title: act.title || '',
    template: act.template || 'quiz',
    points: act.points || 10,
    description: act.description || '',
    icon: act.icon || '',
    color: act.color || '',
    visible: act.visible !== false,
    required: act.required !== false,
    hasStudentSubmissions: Boolean(act.hasStudentSubmissions),
    sopaWords: act.sopaWords || '',
    quizQuestion: act.quizQuestion || '',
    quizCorrect: act.quizCorrect || '',
    quizIncorrect: act.quizIncorrect || '',
    matchTerm: act.matchTerm || '',
    matchMeaning: act.matchMeaning || '',
    listeningPhrase: act.listeningPhrase || '',
    pronouncePhrase: act.pronouncePhrase || '',
    fillblankSentence: act.fillblankSentence || '',
    fillblankAnswer: act.fillblankAnswer || '',
    crosswordWords,
    layoutMode
  }
  assignActivityTab.value = 'create'
  showAddActivityForm.value = true
}

async function saveNewActivity() {
  if (!newActivity.value.title.trim() || !editingCourse.value) return
  
  const targetPhase = targetModalPhaseName.value

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
    courseId: editingCourse.value.id,
    phase: targetPhase,
    template: newActivity.value.template,
    points: parseInt(newActivity.value.points) || 10,
    description: newActivity.value.description || null,
    icon: newActivity.value.icon || null,
    color: newActivity.value.color || null,
    visible: newActivity.value.visible !== false,
    required: newActivity.value.required !== false,
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
    pronouncePhrase: newActivity.value.pronouncePhrase,
    fillblankSentence: newActivity.value.fillblankSentence || '',
    fillblankAnswer: newActivity.value.fillblankAnswer || ''
  }

  try {
    const token = getAuthToken()
    const isEdit = Boolean(newActivity.value.id)
    const url = isEdit
      ? `${apiBaseUrl}/api/activities/${newActivity.value.id}`
      : `${apiBaseUrl}/api/activities`
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
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
      title: newActivity.value.id ? 'Error al Actualizar' : 'Error al Crear',
      message: err.message || 'No se pudo guardar la actividad.'
    })
  }
}

async function toggleActivityVisible(act) {
  try {
    const token = getAuthToken()
    const response = await fetch(`${apiBaseUrl}/api/activities/${act.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ visible: act.visible === false })
    })
    if (!response.ok) throw new Error('No se pudo cambiar la visibilidad de la actividad.')
    await fetchActivities()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Actualizar',
      message: err.message || 'No se pudo cambiar la visibilidad.'
    })
  }
}

async function moveActivity(index, direction) {
  const list = [...coursePhaseActivities.value]
  const target = index + direction
  if (target < 0 || target >= list.length) return
  const temp = list[index]
  list[index] = list[target]
  list[target] = temp
  const items = list.map((act, idx) => ({ id: act.id, order: idx }))
  try {
    const token = getAuthToken()
    const response = await fetch(`${apiBaseUrl}/api/activities/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ items })
    })
    if (!response.ok) throw new Error('No se pudo reordenar las actividades.')
    await fetchActivities()
  } catch (err) {
    console.error(err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Reordenar',
      message: err.message || 'No se pudo reordenar las actividades.'
    })
  }
}

async function deleteInlineActivity(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta actividad de la fase?')) return
  try {
    const token = getAuthToken()
    const response = await fetch(`${apiBaseUrl}/api/activities/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
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

// Validación estricta para el POST-TEST Global según los requisitos pedagógicos
const canTakeGlobalPostTest = computed(() => {
  if (auth.isAdmin || auth.isInstructor) return true

  const c1 = courses.value.find(c => c.id === 1)
  const c2 = courses.value.find(c => c.id === 2)
  const c3 = courses.value.find(c => c.id === 3)
  const c4 = courses.value.find(c => c.id === 4)

  const m1Done = (c1?.progress || 0) >= 100
  const m2Done = (c2?.progress || 0) >= 100
  const m3Done = (c3?.progress || 0) >= 100

  // 1) Si no ha completado los 3 módulos anteriores, no ha llegado válidamente al módulo 4
  if (!m1Done || !m2Done || !m3Done) return false

  // 2) Si llegó al módulo 4, verificar que haya alcanzado la fase de Cierre (evaluación)
  // Progreso general en curso 4 >= 75% indica que superó práctica y llegó a evaluación
  if ((c4?.progress || 0) >= 75) return true

  // Consultar estado local guardado para el módulo 4
  const apprenticeId = auth.user?.id || 'guest'
  const m4Key = `nursing_academy_progress_${apprenticeId}_course_4`
  try {
    const raw = localStorage.getItem(m4Key)
    if (raw) {
      const state = JSON.parse(raw)
      if (
        state.currentPhase === 'evaluacion' || 
        state.examPassed || 
        (state.phaseProgress?.practica >= 100) ||
        (state.phaseProgress?.evaluacion > 0)
      ) {
        return true
      }
    }
  } catch {}

  return false
})

const postTestLockReason = computed(() => {
  const c1 = courses.value.find(c => c.id === 1)
  const c2 = courses.value.find(c => c.id === 2)
  const c3 = courses.value.find(c => c.id === 3)

  const m1Done = (c1?.progress || 0) >= 100
  const m2Done = (c2?.progress || 0) >= 100
  const m3Done = (c3?.progress || 0) >= 100

  if (!m1Done || !m2Done || !m3Done) {
    return 'Debes completar secuencialmente los módulos previos (1, 2 y 3) al 100% para llegar al Módulo 4.'
  }

  return 'Has llegado al Módulo 4 pero aún no alcanzas la fase de Cierre (Evaluación). Avanza en las fases de estudio y práctica para habilitar este examen final.'
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
    programId: null,
    raps: [],
    cohortIds: [],
    f1_welcome: 'Welcome to this technical training module.',
    f1_gameWords: 'The nurse, checks, the, patient\'s, blood pressure',
    f2_grammar: 'The nurse checks the patient.',
    f2_vocabulary: 'Stethoscope, Suture, Heart rate',
    f3_fillBlank: 'prescription',
    f3_voiceTarget: 'The patient is stable.',
    f4_q: '¿Qué significa respiration rate?',
    f4_correct: 'Frecuencia respiratoria',
    f4_incorrect: 'Presión arterial',
  }
  structureItems.value = buildItemsFromCurrentForm()
  resetItemForm()
  resetNewActivityForm()
  showModal.value = true
}

function openEditCourseModal(course) {
  editingCourse.value = course
  activeModalPhase.value = 'inicio'
  const structure = course.structure || null
  
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
    programId: course.programId || null,
    raps: (course.raps && course.raps.length > 0)
      ? [...course.raps]
      : (course.slug === 'getting-to-know-other-people' || course.id === 1 ? ['RAP-01']
        : course.slug === 'work-life-interaction' || course.id === 2 ? ['RAP-02', 'RAP-03']
        : course.slug === 'workplace-communication' || course.id === 3 ? ['RAP-04', 'RAP-05']
        : course.slug === 'professional-practice' || course.id === 4 ? ['RAP-06'] : []),
    cohortIds: (course.cohorts || []).map(ficha => ficha.id),
    f1_welcome: structure?.f1?.welcome ?? course.f1_welcome ?? 'Welcome to this technical training module.',
    f1_gameWords: structure ? structureListToCsv(structure.f1?.gameWords) : (course.f1_gameWords || 'The nurse, checks, the, patient\'s, blood pressure'),
    f2_grammar: structure?.f2?.grammar ?? course.f2_grammar ?? 'The nurse checks the patient.',
    f2_vocabulary: structure ? structureListToCsv(structure.f2?.vocabulary) : (course.f2_vocabulary || 'Stethoscope, Suture, Heart rate'),
    f3_fillBlank: structure?.f3?.fillBlank ?? course.f3_fillBlank ?? 'prescription',
    f3_voiceTarget: structure?.f3?.voiceTarget ?? course.f3_voiceTarget ?? 'The patient is stable.',
    f4_q: structure?.f4?.question ?? course.f4_q ?? '¿Qué significa respiration rate?',
    f4_correct: structure?.f4?.correct ?? course.f4_correct ?? 'Frecuencia respiratoria',
    f4_incorrect: structure?.f4?.incorrect ?? course.f4_incorrect ?? 'Presión arterial',
  }
  
  structureItems.value = loadStructureIntoItems(structure)
  seedOfficialPhases()
  resetItemForm()
  resetNewActivityForm()
  showModal.value = true
}

function selectIcon(ico) {
  form.value.icon = ico.name
  form.value.iconColor = ico.color
  form.value.bg = ico.bg
  form.value.categoryText = ico.text
  form.value.categoryBg = ico.catBg
}

async function saveCourse() {
  if (!form.value.title.trim()) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campo Requerido',
      message: 'Por favor ingresa un título para el curso.'
    })
    return
  }

  const isOfficialCourse = ['getting-to-know-other-people', 'work-life-interaction', 'workplace-communication', 'professional-practice'].includes(editingCourse.value?.slug)
  const coursePayload = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    category: form.value.category,
    duration: form.value.duration.trim() || '10h',
    icon: form.value.icon,
    iconColor: form.value.iconColor,
    bg: form.value.bg,
    programId: form.value.programId ? parseInt(form.value.programId) : null,
    structure: isOfficialCourse ? null : buildStructurePayload(),
    raps: form.value.raps || [],
    cohortIds: form.value.cohortIds || []
  }

  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  try {
    if (editingCourse.value && editingCourse.value.id) {
      // Edit Mode
      const res = await fetch(`${apiBaseUrl}/api/courses/${editingCourse.value.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(coursePayload)
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Error (${res.status}) al actualizar el curso en el servidor.`)
      }
      const raw = await res.json()
      const updated = raw.data || raw
      const idx = courses.value.findIndex(c => c.id === editingCourse.value.id)
      if (idx >= 0) {
        courses.value[idx] = { ...courses.value[idx], ...updated }
      }
    } else {
      // Create Mode
      const res = await fetch(`${apiBaseUrl}/api/courses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(coursePayload)
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Error (${res.status}) al crear el curso en el servidor.`)
      }
      const raw = await res.json()
      const created = raw.data || raw
      courses.value.push({
        ...created,
        students: 0,
        studentsCount: 0,
        activitiesCount: 0,
        progress: 0
      })
    }

    notificationStore.notify({
      type: 'success',
      title: 'Curso Guardado',
      message: 'El curso ha sido guardado exitosamente en la base de datos.'
    })
    showModal.value = false
    await fetchCourses()
  } catch (err) {
    console.error('Error al guardar curso en backend:', err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Guardar',
      message: err.message || 'No se pudo guardar el curso en el servidor.'
    })
  }
}

async function deleteCourse(course) {
  if (!auth.isAdmin) {
    notificationStore.notify({
      type: 'error',
      title: 'Acción No Permitida',
      message: 'Solo los administradores tienen permisos para eliminar cursos o módulos.'
    })
    return
  }

  if (!confirm(`¿Estás seguro de que deseas eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`)) {
    return
  }

  const token = getAuthToken()
  try {
    const res = await fetch(`${apiBaseUrl}/api/courses/${course.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.message || `Error (${res.status}) al eliminar el curso.`)
    }
    courses.value = courses.value.filter(c => c.id !== course.id)
    notificationStore.notify({
      type: 'success',
      title: 'Curso Eliminado',
      message: `El curso "${course.title}" fue eliminado exitosamente de la base de datos.`
    })
  } catch (err) {
    console.error('Error al eliminar curso:', err)
    notificationStore.notify({
      type: 'error',
      title: 'Error al Eliminar',
      message: err.message || 'No se pudo eliminar el curso del servidor.'
    })
  }
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
