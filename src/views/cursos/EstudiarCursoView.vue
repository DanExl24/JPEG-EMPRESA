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
        
        <!-- RAP Badges in Header -->
        <div v-if="courseRaps && courseRaps.length > 0" class="flex flex-wrap gap-1.5 pt-1">
          <span 
            v-for="rap in courseRaps" 
            :key="rap" 
            class="text-[10px] font-extrabold bg-blue-50 text-[#006688] border border-blue-200/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs"
            :title="`Resultado de Aprendizaje: ${rap}`"
          >
            <span class="material-symbols-outlined text-[13px]">verified</span>
            {{ rap }}
          </span>
        </div>
      </div>

      <!-- Main Progress Tracking / Modo Auditoría Docente -->
      <div v-if="isPrivilegedUser" class="flex flex-col sm:items-end gap-1.5">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006688]/10 border border-[#006688]/30 rounded-xl text-[#006688] shadow-2xs">
          <span class="material-symbols-outlined text-base">admin_panel_settings</span>
          <span class="text-xs font-black uppercase tracking-wider">Modo Auditoría Docente</span>
        </div>
        <span class="text-[11px] text-gray-500 font-medium">Navegación libre: 4 fases 100% accesibles</span>
      </div>
      <div v-else class="w-full sm:w-64 space-y-2">
        <div class="flex justify-between text-xs font-bold text-gray-600">
          <span>Progreso del Módulo</span>
          <span class="text-[#006688]">{{ Math.round(moduleProgress) }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="h-2 rounded-full bg-[#006688] transition-all duration-500 shadow-sm" :style="`width: ${moduleProgress}%`"></div>
        </div>
      </div>
    </div>

    <!-- Prerequisite Sequential Lock Screen for Apprentice -->
    <div v-if="isCourseLocked && !auth.isAdmin && !auth.isInstructor" class="bg-white rounded-3xl border border-amber-200 shadow-md p-8 sm:p-12 text-center space-y-6 animate-fade-in max-w-2xl mx-auto my-6">
      <div class="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <span class="material-symbols-outlined text-4xl">lock</span>
      </div>

      <div class="space-y-2">
        <span class="text-xs font-black tracking-wider uppercase bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          Módulo Bloqueado por Prerrequisito
        </span>
        <h2 class="text-2xl font-black text-gray-800 pt-2">
          {{ currentCourseTitle }}
        </h2>
        <p class="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Para garantizar la continuidad pedagógica y el cumplimiento de los RAPs, debes completar al <strong>100%</strong> el módulo previo antes de ingresar a este nivel.
        </p>
      </div>

      <div class="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-center gap-3 text-left">
        <span class="material-symbols-outlined text-amber-600 text-2xl shrink-0">school</span>
        <div>
          <span class="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Prerrequisito Obligatorio Pendiente:</span>
          <p class="text-sm font-black text-amber-900">{{ prerequisiteCourseTitle || 'Módulo Anterior' }}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <router-link 
          :to="`/dashboard/cursos/${prerequisiteCourseId || 1}`"
          class="w-full sm:w-auto px-6 py-3 bg-[#006688] hover:bg-[#004e69] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Ir al Módulo Prerrequisito
        </router-link>
        <router-link 
          to="/dashboard/cursos"
          class="w-full sm:w-auto px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center"
        >
          Ver Todos los Cursos
        </router-link>
      </div>
    </div>

    <!-- Active Course Content (Rendered only if course is unlocked) -->
    <template v-else>
    <!-- Banner de modo auditor docente / admin -->
    <div v-if="isPrivilegedUser" class="bg-linear-to-r from-teal-50 via-sky-50 to-blue-50 border border-[#006688]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#006688] text-white flex items-center justify-center shrink-0 shadow-sm">
          <span class="material-symbols-outlined text-xl">visibility</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-black text-gray-800 text-sm">Vista de Inspección Pedagógica ({{ auth.isAdmin ? 'Administrador' : 'Instructor' }})</h4>
            <span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#006688] text-white uppercase tracking-wider">Sin Restricciones</span>
          </div>
          <p class="text-xs text-gray-600 mt-0.5">
            Estás visualizando el curso con privilegios docentes. Tienes acceso directo e irrestricto a todas las fases (Inicio, Estudio, Práctica y Cierre), materiales y cuestionarios.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-[#006688] bg-white px-3 py-1.5 rounded-xl border border-sky-200/80 shadow-2xs">
          <span class="material-symbols-outlined text-sm text-green-600">lock_open</span>
          4 Fases Desbloqueadas
        </span>
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
        <span class="font-bold text-gray-700 bg-white border border-gray-100 px-2 py-1 rounded">Cuenta de usuario + LocalStorage</span>
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
            {{ isCustomCourse
              ? 'Momento 1: Revisa la introducción del curso y completa el calentamiento para desbloquear la absorción de conocimiento.'
              : moduleNumber === 4
              ? 'Momento 1: ¡Mr. Thomas se va a casa! Completa el video de alta médica y el juego de calentamiento de verificación de estados clínicos.'
              : moduleNumber === 3
              ? 'Momento 1: ¡Tu turno ha comenzado! Completa el video introductorio y el juego de calentamiento de acciones clínicas y roles hospitalarios.'
              : moduleNumber === 2
              ? 'Momento 1: Acompaña a Mr. Thomas en su hospitalización. Completa el video introductorio y el juego de calentamiento de turnos hospitalarios.' 
              : 'Momento 1: Completa el video introductorio y el juego de calentamiento antes de avanzar a la absorción de conocimiento.' }}
          </p>
        </div>

        <!-- Inicio para cursos personalizados -->
        <div v-if="isCustomCourse" class="space-y-6">
          <div class="bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-6 text-white space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-2xl text-cyan-300">waving_hand</span>
              <h4 class="text-sm font-black">Bienvenida al curso</h4>
            </div>
            <p class="text-xs text-gray-200 leading-relaxed">
              {{ customStructure?.f1?.welcome || 'Bienvenido a este curso. Explora la introducción y completa el calentamiento para comenzar.' }}
            </p>
            <p class="text-[11px] text-cyan-200 font-semibold">
              Meta: comprender los conceptos clave del curso y activar tus conocimientos previos antes de la fase de estudio.
            </p>
          </div>

          <div class="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
              <h4 class="font-bold text-gray-800 text-sm">Warm-Up: Ordena las palabras</h4>
            </div>
            <p class="text-xs text-gray-600">Toca las palabras en el orden correcto para formar la idea principal del curso.</p>

            <div v-if="customWords.length" class="space-y-3">
              <div class="min-h-[56px] flex flex-wrap gap-2 items-center bg-white border-2 border-dashed rounded-2xl p-3" :class="phaseProgress.inicio === 100 ? 'border-green-400 bg-green-50/60' : 'border-gray-200'">
                <template v-if="customWarmupPlaced.length">
                  <span v-for="(word, idx) in customWarmupPlaced" :key="`placed-${idx}`" class="px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 rounded-xl text-xs font-bold">{{ word }}</span>
                </template>
                <span v-else class="text-[11px] text-gray-400 italic px-1">Tus palabras aparecerán aquí…</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(word, idx) in customWarmupPool"
                  :key="`pool-${idx}-${word}`"
                  @click="pickCustomWord(word)"
                  type="button"
                  class="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#006688] hover:text-[#006688] rounded-xl text-xs font-bold transition-all"
                >
                  {{ word }}
                </button>
              </div>

              <p v-if="customWarmupError" class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">{{ customWarmupError }}</p>
              <p v-if="phaseProgress.inicio === 100" class="text-xs font-bold text-green-600 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                ¡Excelente! Ordenaste correctamente el calentamiento.
              </p>
            </div>
            <p v-else class="text-xs text-gray-500 italic">Este curso aún no tiene palabras de calentamiento configuradas.</p>
          </div>

          <div v-if="activitiesForPhase('inicio').length" class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
              <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <router-link v-for="activity in activitiesForPhase('inicio')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                  <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
                </div>
                <span class="material-symbols-outlined text-[#006688]">play_circle</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Welcome Video Section -->
        <div v-if="isOfficialModule" class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="md:col-span-3 space-y-4">
            <div class="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-md">
              <video
                v-if="videoAvailable"
                :src="currentVideoSrc"
                controls
                preload="metadata"
                class="w-full h-full object-cover bg-black"
                @play="videoPlaying = true"
                @pause="videoPlaying = false"
                @ended="onVideoWatched"
              ></video>

              <!-- Pending video placeholder -->
              <div v-if="!videoAvailable" class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 text-white p-6 text-center space-y-3">
                <span class="material-symbols-outlined text-5xl text-white/70">movie</span>
                <p class="font-bold text-sm">Video de bienvenida en producción</p>
                <p class="text-[11px] text-gray-300 max-w-sm leading-relaxed">
                  {{ moduleNumber === 1
                    ? 'Aquí verás qué aprenderás en el módulo y por qué conocer a otras personas es clave en tu entorno laboral. Mientras tanto, puedes confirmar la lectura de los objetivos para habilitar el calentamiento.'
                    : 'Muy pronto encontrarás aquí el video de introducción de este módulo. Mientras tanto, puedes confirmar la lectura de los objetivos para habilitar el calentamiento.' }}
                </p>
              </div>

              <!-- Completed video overlay -->
              <div v-if="videoAvailable && videoCompleted && !videoPlaying" class="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 text-white p-6 text-center space-y-2">
                <span class="material-symbols-outlined text-5xl text-white bg-green-500 rounded-full p-2">check_circle</span>
                <p class="font-bold text-sm">¡Video Completado!</p>
                <button @click="resetVideo" class="text-xs underline text-green-200 hover:text-white mt-1">Ver de nuevo</button>
              </div>
            </div>
          </div>

          <!-- Objectives Panel -->
          <div class="md:col-span-2 space-y-4 flex flex-col justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h4 class="font-black text-gray-800 text-sm">
              ¿Qué aprenderás? — Objetivos {{ currentCourseBadge }}
            </h4>
            
            <!-- Module 4 Objectives -->
            <ul v-if="moduleNumber === 4" class="text-xs text-gray-600 leading-relaxed space-y-1.5 mt-2 list-none">
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">check_circle</span> <span>Dar instrucciones y órdenes de alta médica (<i>Discharge Orders</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">check_circle</span> <span>Usar verbos modales para consejos de salud (<i>You must, You should</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">check_circle</span> <span>Reportar estados y resultados finales (<i>Vitals stable, Pain resolved</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">medication</span> <span>Vocabulario ocupacional (<i>Prescription, Painkiller, Follow-up</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">fact_check</span> <span>Evaluar y cerrar listas de verificación (<i>Nursing Checklist</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">workspace_premium</span> <span>Acceder al <strong>Post-Test Global</strong> de certificación</span></li>
            </ul>

            <!-- Module 3 Objectives -->
            <ul v-else-if="moduleNumber === 3" class="text-xs text-gray-600 leading-relaxed space-y-1.5 mt-2 list-none">
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">check_circle</span> <span>Explicar procedimientos clínicos de rutina (Present Simple)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">check_circle</span> <span>Comunicar acciones en progreso en el momento (Present Continuous)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">check_circle</span> <span>Interactuar cortésmente con familiares y visitantes de pacientes</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">lightbulb</span> <span>Proponer mejoras en el flujo de trabajo laboral (<i>We should..., Let's...</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">home_repair_service</span> <span>Vocabulario técnico de herramientas médicas diarias (<i>Thermometer, Checklist</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">checklist</span> <span>Manejar listas de verificación clínica (<i>Nursing Checklist</i>)</span></li>
            </ul>

            <!-- Module 2 Objectives -->
            <ul v-else-if="moduleNumber === 2" class="text-xs text-gray-600 leading-relaxed space-y-1.5 mt-2 list-none">
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Describir el estado físico de los pacientes y lesiones comunes</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Detallar el entorno hospitalario (habitaciones, camillas, sala de espera)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Identificar partes del cuerpo humano y anatomía básica</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-indigo-600 shrink-0 mt-0.5">history</span> <span>Usar el <strong>Pasado Simple</strong> para relatar antecedentes clínicos (<i>He fell, He had</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">format_list_bulleted</span> <span>Usar <strong>Adjetivos Descriptivos</strong> para el estado actual (<i>He is pale, The room is cold</i>)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">medical_services</span> <span>Realizar una <strong>Entrega de Turno (Shift Handover)</strong> en inglés</span></li>
            </ul>

            <!-- Module 1 Objectives -->
            <ul v-else class="text-xs text-gray-600 leading-relaxed space-y-1.5 mt-2 list-none">
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Saludar y despedirte correctamente en inglés (formal e informal)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Presentarte e introducir a otras personas</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Dar y solicitar datos básicos (nombre, edad, nacionalidad)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Deletrear nombres y apellidos (spelling)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Utilizar números (teléfono, edad)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-[#006688] shrink-0 mt-0.5">check_circle</span> <span>Construir oraciones básicas (Subject + Verb + Complement)</span></li>
              <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">local_hospital</span> <span>Aplicar estas expresiones con pacientes extranjeros</span></li>
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

            <button
              v-if="!introAcknowledged"
              @click="confirmObjectives"
              class="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-black rounded-xl shadow transition-all"
            >
              <span class="material-symbols-outlined text-sm">task_alt</span>
              He leído los objetivos
            </button>
            <span v-else class="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-green-600">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Objetivos confirmados
            </span>
          </div>
        </div>

        <!-- Warm-up Game Section -->
        <div v-if="isOfficialModule" ref="warmupSectionRef" class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">sports_esports</span>
            <h4 class="font-bold text-gray-800 text-sm">
              {{ moduleNumber === 4
                ? 'Warm-Up: Estados de Alta Médica — Arrastra cada estado hacia su criterio de verificación'
                : moduleNumber === 3
                ? 'Warm-Up: Acciones Rutinarias & Roles — Arrastra cada acción hacia su destinatario'
                : moduleNumber === 2 
                ? 'Warm-Up: Hospital Shifts & Handover — Arrastra cada turno hacia su saludo de relevo' 
                : 'Warm-Up: Greetings — Arrastra cada ilustración del día hacia su saludo en inglés' }}
            </h4>
          </div>
          <p class="text-xs text-gray-600">
            {{ moduleNumber === 4
              ? 'Instrucción: Toma la tarjeta del estado clínico y suéltala sobre el indicador de la lista de verificación que le corresponde.'
              : moduleNumber === 3
              ? 'Instrucción: Toma la tarjeta de la acción rutinaria y suéltala sobre la persona o rol hospitalario que le corresponde.'
              : moduleNumber === 2 
              ? 'Instrucción: Toma la tarjeta del turno hospitalario y suéltala sobre la expresión de entrega de turno que le corresponde.' 
              : 'Instrucción: Toma la tarjeta ilustrada (mañana, tarde o noche) y suéltala sobre el saludo "Good morning", "Good afternoon" o "Good evening" que le corresponde.' }}
          </p>

          <div class="relative">
            <!-- Lock Overlay (until video watched or objectives confirmed) -->
            <div v-if="!warmupUnlocked" class="absolute inset-0 z-20 rounded-2xl bg-white/85 backdrop-blur-sm border border-gray-100 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <span class="material-symbols-outlined text-3xl text-gray-400">lock</span>
              <p class="text-sm font-black text-gray-700">Calentamiento bloqueado</p>
              <p class="text-xs text-gray-500 max-w-sm">
                Reproduce el video de bienvenida o confirma la lectura de los objetivos para habilitar automáticamente esta actividad.
              </p>
            </div>

            <div :class="`grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 ${!warmupUnlocked ? 'opacity-40 pointer-events-none select-none' : ''}`">
              
              <!-- Draggable Cards Dock -->
              <div class="space-y-2">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  {{ moduleNumber === 4 ? 'Estados Clínicos Finales' : moduleNumber === 3 ? 'Acciones Rutinarias de Enfermería' : moduleNumber === 2 ? 'Turnos Hospitalarios / Momentos' : 'Tarjetas Ilustradas — Momento del Día' }}
                </span>
                <div class="flex flex-wrap gap-4 min-h-[120px] p-4 bg-white rounded-2xl border border-gray-100">
                  <div 
                    v-for="card in warmupCards" 
                    :key="card.id"
                    v-show="!card.matched"
                    data-warmup-card
                    @pointerdown="startWarmupDrag($event, card)"
                    @click="selectWarmupCard(card)"
                    :style="`transform: translate(${card.x}px, ${card.y}px);`"
                    :class="`select-none cursor-grab active:cursor-grabbing bg-white border shadow-sm hover:shadow-md px-4 py-3 rounded-2xl flex items-center gap-3 touch-none transition-shadow ${card.isResetting ? 'card-reset' : ''} ${
                      selectedWarmupCardId === card.id ? 'border-[#006688] ring-2 ring-[#006688]/30' : 'border-gray-200'
                    }`"
                  >
                    <span v-if="moduleNumber === 1" class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/60" :class="card.bg">
                      <svg v-if="card.illustration === 'morning'" viewBox="0 0 64 64" class="w-11 h-11">
                        <circle cx="32" cy="26" r="12" fill="#fbbf24" />
                        <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
                          <line x1="32" y1="4" x2="32" y2="10" />
                          <line x1="50" y1="8" x2="46" y2="12" />
                          <line x1="14" y1="8" x2="18" y2="12" />
                          <line x1="58" y1="26" x2="52" y2="26" />
                          <line x1="6" y1="26" x2="12" y2="26" />
                        </g>
                        <rect x="4" y="44" width="56" height="16" rx="5" fill="#86efac" />
                      </svg>
                      <svg v-else-if="card.illustration === 'afternoon'" viewBox="0 0 64 64" class="w-11 h-11">
                        <circle cx="32" cy="40" r="12" fill="#fb923c" />
                        <g stroke="#f97316" stroke-width="3" stroke-linecap="round">
                          <line x1="32" y1="20" x2="32" y2="24" />
                          <line x1="48" y1="24" x2="45" y2="27" />
                          <line x1="16" y1="24" x2="19" y2="27" />
                        </g>
                        <rect x="4" y="50" width="56" height="10" rx="5" fill="#fcd34d" />
                      </svg>
                      <svg v-else viewBox="0 0 64 64" class="w-11 h-11">
                        <path d="M42 8a20 20 0 1 0 14 30A22 22 0 0 1 42 8z" fill="#c7d2fe" />
                        <circle cx="16" cy="14" r="2" fill="#fef08a" />
                        <circle cx="27" cy="22" r="1.5" fill="#fef08a" />
                        <circle cx="10" cy="30" r="1.5" fill="#e0e7ff" />
                      </svg>
                    </span>
                    <span v-else class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="card.bg">
                      <span :class="`material-symbols-outlined text-xl ${card.color}`">{{ card.icon }}</span>
                    </span>
                    <div class="text-left">
                      <p class="text-xs font-black text-gray-800 leading-tight">{{ card.label }}</p>
                      <span class="text-[10px] text-gray-400 font-semibold">Arrastrar</span>
                    </div>
                  </div>
                  <p v-if="gameSuccess === true" class="text-xs font-bold text-green-600 flex items-center gap-1 my-auto">
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                    ¡Todas las tarjetas están en su lugar!
                  </p>
                </div>
              </div>

              <!-- Drop Zones -->
              <div class="space-y-2">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  {{ moduleNumber === 4 ? 'Criterio de Checklist (Verificado)' : moduleNumber === 3 ? 'Persona o Rol Hospitalario' : moduleNumber === 2 ? 'Expresiones de Entrega de Turno' : 'Saludos en Inglés' }}
                </span>
                <div class="grid grid-cols-1 gap-3">
                  <div 
                    v-for="pair in warmupPairs" 
                    :key="pair.id"
                    :data-warmup-slot="pair.id"
                    @click="placeSelectedOnSlot(pair.id)"
                    :class="`border-2 border-dashed rounded-2xl p-4 min-h-[92px] flex flex-col items-center justify-center text-center transition-all ${
                      isPairMatched(pair.id)
                        ? 'border-green-400 bg-green-50/70'
                        : selectedWarmupCardId
                          ? 'border-[#006688]/40 bg-white cursor-pointer hover:bg-[#006688]/5'
                          : 'border-gray-200 bg-white/70'
                    }`"
                  >
                    <template v-if="isPairMatched(pair.id)">
                      <span class="material-symbols-outlined text-lg bg-green-500 text-white rounded-full p-0.5 mb-1">check</span>
                      <p class="text-xs font-black text-green-700">{{ pair.right }}</p>
                      <p class="text-[10px] font-bold text-green-600/80">¡Asociación correcta!</p>
                    </template>
                    <template v-else>
                      <p class="text-xs font-black text-gray-700">{{ pair.right }}</p>
                      <p class="text-[10px] text-gray-400 mt-1">Suelta aquí la tarjeta correcta</p>
                    </template>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-200">
                <button 
                  @click="resetWarmupGame"
                  type="button"
                  class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Limpiar Juego
                </button>
                
                <transition name="fade">
                  <span v-if="warmupError" class="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    {{ warmupError }}
                  </span>
                </transition>

                <span v-if="gameSuccess === true" class="text-green-600 text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  ¡Felicitaciones! Completaste el calentamiento.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividades asignadas a esta fase (módulos oficiales) -->
        <div v-if="isOfficialModule && activitiesForPhase('inicio').length" class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
            <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <router-link v-for="activity in activitiesForPhase('inicio')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
              </div>
              <span class="material-symbols-outlined text-[#006688]">play_circle</span>
            </router-link>
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

        <!-- Warm-up Celebration Modal -->
        <div v-if="warmupCelebration" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl p-8 text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto shadow-lg">
              <span class="material-symbols-outlined text-3xl">emoji_events</span>
            </div>
            <div class="space-y-1">
              <h3 class="text-xl font-black text-gray-800">¡Felicitaciones!</h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                {{ isCustomCourse
                  ? 'Completaste el calentamiento inicial. Activaste tus conocimientos previos y desbloqueaste el Momento 2.'
                  : 'Completaste el calentamiento sobre saludos e información personal. Activaste tus conocimientos previos y desbloqueaste el Momento 2.' }}
              </p>
            </div>
            <button @click="goToMomento2" class="w-full flex items-center justify-center gap-1 px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow transition-all">
              Ir al Momento 2 (Absorción)
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
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
            {{ isCustomCourse
              ? 'Momento 2: Explora la explicación clave del curso y práctica la pronunciación para prepararte para la fase práctica.'
              : moduleNumber === 4
              ? 'Momento 2: Aprende a estructurar órdenes y consejos médicos con verbos modales (Medical Advice) y a reportar resultados finales de la lista de verificación (Reporting Results).'
              : moduleNumber === 3
              ? 'Momento 2: Explora el Presente Simple (rutinas) vs. Presente Continuo (acciones ahora), fórmulas de sugerencias de mejora, flashcards de herramientas médicas y el diálogo de atención.'
              : moduleNumber === 2 
              ? 'Momento 2: Explora el Pasado Simple vs. Adjetivos Descriptivos, interactúa con las flashcards de anatomía/hospital y analiza el Storybook de entrega de turno.' 
              : 'Momento 2: Aprende la estructura Persona + Acción + Detalle, practica el alfabeto, los números y tus datos de contacto, y observa una conversación real entre colegas que se conocen por primera vez.' }}
          </p>
        </div>

        <!-- Estudio para cursos personalizados -->
        <template v-if="isCustomCourse">
          <div class="space-y-6">
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-[#006688]">menu_book</span>
                <h4 class="font-bold text-gray-800 text-sm">2.1 Explicación — Idea clave</h4>
              </div>
              <p class="text-sm font-bold text-gray-800 bg-white border border-gray-100 rounded-2xl p-4 leading-relaxed">
                {{ customStructure?.f2?.grammar || 'El instructor aún no ha configurado la explicación de esta fase.' }}
              </p>
              <button
                @click="completeCustomGrammar"
                :disabled="phaseProgress.estudio === 100"
                :class="`px-4 py-2 text-xs font-bold rounded-xl transition-all ${phaseProgress.estudio === 100 ? 'bg-green-100 text-green-700 cursor-default' : 'bg-[#006688] hover:bg-[#004e69] text-white'}`"
              >
                {{ phaseProgress.estudio === 100 ? 'Explicación vista' : 'Marcar explicación como vista' }}
              </button>
            </div>

            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-[#006688]">record_voice_over</span>
                <h4 class="font-bold text-gray-800 text-sm">2.2 Práctica de escucha — Pronuncia la idea clave</h4>
              </div>
              <template v-if="customSpeakingTarget">
                <p class="text-sm font-semibold text-gray-800">"{{ customSpeakingTarget }}"</p>
                <div class="flex flex-wrap gap-2">
                  <button @click="playCustomSpeakingTarget" class="px-3 py-2 bg-white border border-gray-200 hover:border-[#006688] text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">volume_up</span> Escuchar
                  </button>
                  <button
                    @click="startCustomSpeaking"
                    :disabled="customRecognizing"
                    class="px-3 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 disabled:opacity-60"
                  >
                    <span class="material-symbols-outlined text-sm">mic</span>
                    {{ customRecognizing ? 'Escuchando…' : 'Grabar mi voz' }}
                  </button>
                  <button @click="confirmCustomSpeaking" class="px-3 py-2 bg-white border border-gray-200 hover:border-[#006688] text-gray-700 text-xs font-bold rounded-xl transition-all">
                    Ya practiqué (confirmar)
                  </button>
                </div>
                <p v-if="customSpeakingPrompt" class="text-[11px] text-gray-500 italic">Escuchado: "{{ customSpeakingPrompt }}"</p>
                <p v-if="customProfileError" class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">{{ customProfileError }}</p>
                <p v-if="customProfileSuccess" class="text-xs font-bold text-green-600 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span> ¡Práctica de voz completada!
                </p>
              </template>
              <p v-else class="text-xs text-gray-500 italic">Sin frase de práctica configurada.</p>
            </div>
          </div>

          <div v-if="activitiesForPhase('estudio').length" class="space-y-3 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
              <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <router-link v-for="activity in activitiesForPhase('estudio')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                  <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
                </div>
                <span class="material-symbols-outlined text-[#006688]">play_circle</span>
              </router-link>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-100">
            <button @click="goToPhase('inicio')" class="flex items-center gap-1 px-4 py-2.5 text-xs border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all">
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
        </template>

        <!-- ========================================== -->
        <!-- MÓDULO 1 — HU17: ABSORCIÓN DE CONOCIMIENTO -->
        <!-- ========================================== -->
        <template v-else-if="moduleNumber === 1">
          <!-- Stepper secuencial de secciones -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              v-for="(sec, sIdx) in m1StudySections"
              :key="sec.id"
              type="button"
              @click="goToM1Section(sec.id)"
              :disabled="!isM1SectionUnlocked(sec.id)"
              :class="`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                m1StudySection === sec.id
                  ? 'bg-[#006688] text-white border-[#006688] shadow-md'
                  : isM1SectionUnlocked(sec.id)
                    ? 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]'
                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`"
            >
              <span class="material-symbols-outlined text-xl">
                {{ isM1SectionUnlocked(sec.id) ? (m1StudyDone[sec.id] ? 'check_circle' : sec.icon) : 'lock' }}
              </span>
              <span class="flex-1">
                <span class="block text-[10px] font-black uppercase tracking-widest opacity-70">Sección {{ sIdx + 1 }}</span>
                <span class="block text-xs font-bold">{{ sec.name }}</span>
              </span>
            </button>
          </div>

          <!-- 2.1 PÍLDORA DE GRAMÁTICA -->
          <div v-if="m1StudySection === 'grammar'" class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">table_chart</span>
              <h4 class="font-bold text-gray-800 text-sm">2.1 Píldora de Gramática — Persona + Acción + Detalle (Basic Sentence Structure)</h4>
            </div>
            <p class="text-xs text-gray-600">
              Toda oración en inglés se construye con tres bloques: <strong>Persona</strong> (quién), <strong>Acción</strong> (qué hace o cómo está) y <strong>Detalle</strong> (la información que completa la idea). Observa la tabla, los colores y escucha cada ejemplo del entorno laboral.
            </p>

            <!-- Tabla clara de estructura -->
            <div class="overflow-x-auto rounded-2xl border border-gray-100">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-[#006688] text-white">
                    <th class="px-4 py-3 text-left font-black">Persona (Subject)</th>
                    <th class="px-4 py-3 text-left font-black">Acción (Verb)</th>
                    <th class="px-4 py-3 text-left font-black">Detalle (Complement)</th>
                    <th class="px-4 py-3 text-center font-black">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rIdx) in m1GrammarRows" :key="rIdx" class="border-b border-gray-100 last:border-0 bg-white">
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-black">{{ row.subject }}</span></td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 font-black">{{ row.verb }}</span></td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded-lg bg-green-100 text-green-700 font-bold">{{ row.complement }}</span></td>
                    <td class="px-4 py-3 text-center">
                      <button @click="speakEnglish(row.full)" class="text-[#006688] hover:bg-[#006688]/10 p-1.5 rounded-lg" title="Escuchar oración">
                        <span class="material-symbols-outlined text-base">volume_up</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Oraciones coloreadas con filtros de leyenda -->
            <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div v-for="(row, rIdx) in m1GrammarRows" :key="rIdx" class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-800">
                    <span :class="`px-0.5 rounded ${getGrammarHighlightClass('subject')}`">{{ row.subject }} </span>
                    <span :class="`px-0.5 rounded ${getGrammarHighlightClass('verb')}`">{{ row.verb }} </span>
                    <span :class="`px-0.5 rounded ${getGrammarHighlightClass('complement')}`">{{ row.complement }}</span>
                  </p>
                  <p class="text-[10px] text-gray-500 italic mt-0.5">{{ row.spanish }}</p>
                </div>
                <button @click="speakEnglish(row.full)" class="text-[#006688] hover:bg-[#006688]/10 p-1.5 rounded-lg shrink-0" title="Escuchar oración">
                  <span class="material-symbols-outlined text-base">volume_up</span>
                </button>
              </div>

              <div class="flex flex-wrap justify-center gap-2 pt-2 border-t border-gray-200">
                <button
                  v-for="leg in m1GrammarLegend"
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

            <!-- Desglose del verbo To Be -->
            <div class="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 space-y-3">
              <div class="flex items-center gap-2 border-b border-teal-200 pb-2">
                <span class="material-symbols-outlined text-teal-700 text-lg">spellcheck</span>
                <span class="text-xs font-black text-teal-900 uppercase tracking-wide">El Verbo To Be — I am / You are</span>
              </div>
              <p class="text-[11px] text-teal-800 font-medium">El verbo <strong>To Be</strong> cambia según la persona. Memoriza estas formas básicas y escucha cada ejemplo:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div v-for="(tb, tIdx) in m1ToBeTable" :key="tIdx" class="bg-white p-3 rounded-xl border border-teal-100 shadow-xs flex items-center justify-between gap-2">
                  <div>
                    <p class="text-xs font-bold text-gray-800">
                      <span class="text-blue-700 font-black">{{ tb.pronoun }}</span>
                      <span class="text-orange-600 font-black mx-1">{{ tb.form }}</span>
                      <span class="text-green-700 font-semibold">{{ tb.complement }}</span>
                    </p>
                    <p class="text-[10px] text-gray-500 italic mt-0.5">{{ tb.spanish }}</p>
                  </div>
                  <button @click="speakEnglish(tb.full)" class="text-teal-700 hover:bg-teal-50 p-1.5 rounded-lg shrink-0" title="Escuchar">
                    <span class="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="completeM1Section('grammar')"
                :class="`flex items-center gap-1 px-5 py-3 text-xs font-black rounded-xl shadow transition-all ${
                  m1StudyDone.grammar ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#006688] hover:bg-[#004e69] text-white'
                }`"
              >
                <span class="material-symbols-outlined text-sm">{{ m1StudyDone.grammar ? 'check_circle' : 'arrow_forward' }}</span>
                {{ m1StudyDone.grammar ? 'Sección 2.1 completada' : 'Entendido, ir al Laboratorio de Vocabulario' }}
              </button>
            </div>
          </div>

          <!-- 2.2 LABORATORIO DE VOCABULARIO -->
          <div v-else-if="m1StudySection === 'vocabulary'" class="space-y-6">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-[#006688]">style</span>
                <h4 class="font-bold text-gray-800 text-sm">2.2 Laboratorio de Vocabulario — Alfabeto, Números, Saludos y Contacto</h4>
              </div>
              <span class="text-xs bg-[#006688]/5 text-[#006688] font-bold px-3 py-1 rounded-full">
                Escuchados: {{ m1HeardCount }} / {{ m1AllVocabItems.length }}
              </span>
            </div>
            <p class="text-xs text-gray-600">
              Pulsa el botón de sonido de cada tarjeta y repite en voz alta. Puedes reproducir cada audio tantas veces como necesites: no hay límite de intentos.
            </p>

            <!-- Categorías -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in m1VocabCategories"
                :key="cat.id"
                @click="m1ActiveCategory = cat.id"
                :class="`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  m1ActiveCategory === cat.id ? 'bg-[#006688] text-white border-[#006688] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-[#006688]'
                }`"
              >
                <span class="material-symbols-outlined text-base">{{ cat.icon }}</span>
                {{ cat.label }}
                <span :class="`text-[10px] px-1.5 py-0.5 rounded-full font-black ${m1ActiveCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`">
                  {{ cat.items.filter(i => i.played).length }}/{{ cat.items.length }}
                </span>
              </button>
            </div>

            <!-- Tarjetas de audio -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="item in m1ActiveVocabItems"
                :key="item.id"
                class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-[#006688] transition-all flex flex-col justify-between gap-3"
              >
                <div class="space-y-1.5">
                  <div class="flex items-start justify-between gap-1">
                    <span class="text-sm font-black text-gray-800 break-words">{{ item.word }}</span>
                    <span v-if="item.played" class="text-green-600 material-symbols-outlined text-sm bg-green-50 rounded-full p-0.5 border border-green-200 shrink-0">check_circle</span>
                  </div>
                  <div class="inline-flex items-center gap-1 text-[10px] font-bold text-[#006688] bg-[#006688]/8 px-2 py-0.5 rounded-md">
                    <span class="text-[9px] text-gray-400 font-bold uppercase">Pron:</span>
                    <span>{{ item.pronunciation }}</span>
                  </div>
                  <p class="text-[11px] text-gray-600 font-medium leading-snug">{{ item.translation }}</p>
                </div>
                <button
                  @click="playM1VocabAudio(item)"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] text-xs font-bold transition-all w-full justify-center"
                >
                  <span class="material-symbols-outlined text-base">{{ playingVocabId === item.id ? 'graphic_eq' : 'volume_up' }}</span>
                  <span>{{ playingVocabId === item.id ? 'Reproduciendo...' : 'Escuchar' }}</span>
                </button>
              </div>
            </div>

            <!-- Dictado aplicado al entorno laboral -->
            <div class="space-y-3 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-lg text-[#006688]">record_voice_over</span>
                <h5 class="font-bold text-gray-800 text-xs">Aplicación laboral — Dictar un correo y un teléfono</h5>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="d in m1DictationExamples" :key="d.id" class="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-[#006688]">{{ d.icon }}</span>
                    <span class="text-xs font-black text-gray-700">{{ d.title }}</span>
                  </div>
                  <p class="text-xs font-semibold text-gray-800">{{ d.phrase }}</p>
                  <p class="text-[11px] font-mono bg-white border border-gray-100 rounded-lg px-2 py-1 text-[#006688] break-words">{{ d.breakdown }}</p>
                  <p class="text-[10px] text-gray-500 italic">{{ d.spanish }}</p>
                  <div class="flex flex-wrap gap-2 pt-1">
                    <button @click="speakEnglish(d.phrase)" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006688]/10 hover:bg-[#006688]/20 text-[#006688] text-[10px] font-bold">
                      <span class="material-symbols-outlined text-sm">volume_up</span> Frase completa
                    </button>
                    <button @click="speakEnglish(d.spelling, 0.7)" class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold">
                      <span class="material-symbols-outlined text-sm">slow_motion_video</span> Deletreo lento
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p v-if="!isM1VocabComplete" class="text-[11px] text-gray-500">
                Escucha todas las tarjetas para habilitar la conversación ({{ m1HeardCount }} / {{ m1AllVocabItems.length }}).
              </p>
              <p v-else class="text-[11px] text-green-600 font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">check_circle</span> ¡Vocabulario completo! Continúa con la conversación.
              </p>
              <button
                @click="completeM1Section('vocabulary')"
                :disabled="!isM1VocabComplete"
                :class="`flex items-center gap-1 px-5 py-3 text-xs font-black rounded-xl shadow transition-all ${
                  isM1VocabComplete ? 'bg-[#006688] hover:bg-[#004e69] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`"
              >
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
                {{ m1StudyDone.vocabulary ? 'Sección 2.2 completada' : 'Continuar a la Conversación' }}
              </button>
            </div>
          </div>

          <!-- 2.3 EXPLICACIÓN DINÁMICA (CHAT) -->
          <div v-else class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">forum</span>
              <h4 class="font-bold text-gray-800 text-sm">2.3 Explicación Dinámica — Conversación Guiada: Sarah &amp; David</h4>
            </div>
            <p class="text-xs text-gray-600">
              Lee la conversación mensaje a mensaje. Sarah y David se conocen por primera vez en el hospital y comparten su nombre, edad, país, correo y teléfono. Usa el botón de audio para escuchar cada mensaje.
            </p>

            <!-- Chat estilo celular -->
            <div class="max-w-md mx-auto">
              <div class="bg-gray-900 rounded-[2rem] p-3 shadow-xl">
                <div class="bg-slate-50 rounded-[1.4rem] overflow-hidden">
                  <div class="bg-[#006688] text-white px-4 py-3 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                      <span class="material-symbols-outlined text-base">groups</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs font-black">Clinic Chat</p>
                      <p class="text-[10px] text-white/70">Sarah &amp; David · En línea</p>
                    </div>
                    <span class="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>

                  <div class="p-4 space-y-3 h-[360px] overflow-y-auto bg-slate-100">
                    <p v-if="m1ChatVisibleCount === 0" class="text-center text-[11px] text-gray-400 pt-24">
                      Pulsa "Iniciar conversación" para leer el diálogo.
                    </p>
                    <div
                      v-for="(msg, mIdx) in visibleM1ChatMessages"
                      :key="mIdx"
                      :class="`flex gap-2 max-w-[88%] ${msg.alignLeft ? 'mr-auto' : 'ml-auto flex-row-reverse'}`"
                    >
                      <div :class="`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm ${msg.avatarBg}`">
                        <span class="material-symbols-outlined text-sm">{{ msg.avatarIcon }}</span>
                      </div>
                      <div :class="`p-3 rounded-2xl text-xs shadow-sm border leading-relaxed ${msg.alignLeft ? 'bg-white text-gray-800 rounded-tl-none border-gray-100' : 'bg-emerald-50/90 text-gray-800 rounded-tr-none border-emerald-100'}`">
                        <div class="flex items-center justify-between gap-3 mb-1">
                          <span class="font-bold text-[9px] uppercase tracking-widest text-gray-400">{{ msg.speaker }}</span>
                          <button @click="speakEnglish(msg.english)" class="text-[#006688] hover:text-[#004e69]" title="Escuchar mensaje">
                            <span class="material-symbols-outlined text-sm">volume_up</span>
                          </button>
                        </div>
                        <p v-if="msg.parts" class="font-semibold text-gray-900">
                          <span v-for="(part, pIdx) in msg.parts" :key="pIdx" :class="`px-0.5 rounded ${getGrammarHighlightClass(part.type)}`">{{ part.text }}</span>
                        </p>
                        <p v-else class="font-semibold text-gray-900">{{ msg.english }}</p>
                        <p class="text-gray-500 mt-1 italic text-[10px]">{{ msg.spanish }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="p-3 bg-white border-t border-gray-100 flex items-center justify-between gap-2">
                    <span class="text-[10px] font-bold text-gray-400">Mensajes: {{ m1ChatVisibleCount }} / {{ m1ChatMessages.length }}</span>
                    <button
                      v-if="m1ChatVisibleCount < m1ChatMessages.length"
                      @click="nextM1ChatMessage"
                      class="flex items-center gap-1 px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-[11px] font-black rounded-xl shadow-sm"
                    >
                      <span class="material-symbols-outlined text-sm">{{ m1ChatVisibleCount === 0 ? 'chat' : 'arrow_forward' }}</span>
                      {{ m1ChatVisibleCount === 0 ? 'Iniciar conversación' : 'Siguiente mensaje' }}
                    </button>
                    <span v-else class="flex items-center gap-1 text-[11px] font-bold text-green-600">
                      <span class="material-symbols-outlined text-sm">check_circle</span> Conversación completada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Felicitación y desbloqueo del Momento 3 -->
            <div v-if="m1StudyDone.chat" class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
              <span class="material-symbols-outlined text-4xl text-green-600">celebration</span>
              <h5 class="text-sm font-black text-green-800">¡Felicitaciones! Completaste la Fase de Absorción de Conocimiento</h5>
              <p class="text-xs text-green-700 max-w-lg mx-auto leading-relaxed">
                Ya comprendes la estructura básica de las oraciones, reconoces el alfabeto, los números y tus datos de contacto, y sabes cómo presentarte. El <strong>Momento 3: Práctica y Aplicación</strong> está desbloqueado.
              </p>
              <button @click="goToPhase('practica')" class="inline-flex items-center gap-1 px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow">
                <span class="material-symbols-outlined text-sm">arrow_forward</span> Ir al Momento 3: Práctica
              </button>
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
        </template>

        <template v-else>
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

          <!-- Vocabulary Flashcard Grid (Clean Icons & Modern Medical UI) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="v in activeVocabList" 
              :key="v.id" 
              class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-[#006688] transition-all flex flex-col justify-between group"
            >
              <div class="space-y-2">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex items-center gap-2.5">
                    <div :class="`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${v.iconBg || 'bg-[#006688]/10 text-[#006688] border-[#006688]/20'}`">
                      <span class="material-symbols-outlined text-lg">{{ v.icon || 'medical_services' }}</span>
                    </div>
                    <span class="text-sm font-black text-gray-800 tracking-tight leading-tight">
                      {{ v.word }}
                    </span>
                  </div>
                  <span v-if="v.played" class="text-green-600 material-symbols-outlined text-sm bg-green-50 rounded-full p-0.5 border border-green-200">check_circle</span>
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
              <div :class="`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm border border-white/20 ${bubble.avatarBg || 'bg-[#006688]'}`">
                <span class="material-symbols-outlined text-base">{{ bubble.avatarIcon || 'person' }}</span>
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
        </template>

        <div v-if="isOfficialModule && activitiesForPhase('estudio').length" class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
            <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <router-link v-for="activity in activitiesForPhase('estudio')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
              </div>
              <span class="material-symbols-outlined text-[#006688]">play_circle</span>
            </router-link>
          </div>
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
            {{ isCustomCourse
              ? 'Momento 3: Practica el vocabulario, completa la respuesta clave y graba tu evidencia oral como preparación para la evaluación final.'
              : moduleNumber === 4
              ? 'Completa el Discharge Summary escuchando las órdenes del médico, analiza el resultado de la lista de verificación y graba tus recomendaciones de alta.'
              : moduleNumber === 3
              ? 'Completa el Nursing Checklist digital, escucha las instrucciones del Dr. Smith y graba tu evidencia oral en dos misiones.'
              : moduleNumber === 2 
              ? 'Completa las notas de enfermería escuchando el reporte médico, describe la habitación de Mr. Thomas y graba tu entrega de turno (Handover Report).' 
              : 'Completa el perfil personal, realiza los deletreos y graba tu presentación personal como evidencia de aprendizaje.' }}
          </p>
        </div>

        <!-- Práctica para cursos personalizados -->
        <div v-if="isCustomCourse" class="space-y-6">
          <div v-if="customVocabulary.length" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-[#006688]">style</span>
                <h4 class="font-bold text-gray-800 text-sm">3.1 Vocabulario — Escucha y repite</h4>
              </div>
              <span class="text-[11px] font-bold text-gray-500">Escuchados: {{ customVocabHeard.length }} / {{ customVocabulary.length }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="word in customVocabulary"
                :key="word"
                @click="playCustomVocab(word)"
                class="flex items-center justify-between gap-2 px-3 py-2.5 bg-white border rounded-xl text-xs font-bold transition-all"
                :class="customVocabHeard.includes(word) ? 'border-green-300 text-green-700' : 'border-gray-200 text-gray-700 hover:border-[#006688]'"
              >
                <span>{{ word }}</span>
                <span class="material-symbols-outlined text-sm">{{ customVocabHeard.includes(word) ? 'check_circle' : 'volume_up' }}</span>
              </button>
            </div>
          </div>

          <div v-if="customFillAnswer" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">edit_note</span>
              <h4 class="font-bold text-gray-800 text-sm">3.2 Completar la respuesta</h4>
            </div>
            <p class="text-xs text-gray-600">Escribe la respuesta correcta configurada para este curso.</p>
            <div class="flex flex-col sm:flex-row gap-2">
              <input v-model="customFillInput" @keyup.enter="checkCustomFill" type="text" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#006688]" placeholder="Escribe aquí tu respuesta" />
              <button @click="checkCustomFill" class="px-4 py-2 bg-[#006688] hover:bg-[#004e69] text-white text-xs font-bold rounded-xl transition-all">Comprobar</button>
            </div>
            <p v-if="customFillError" class="text-xs font-bold text-red-600">{{ customFillError }}</p>
            <p v-if="isCustomFillCorrect" class="text-xs font-bold text-green-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">check_circle</span> ¡Respuesta correcta!
            </p>
          </div>

          <div v-if="customVoiceTarget" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">mic</span>
              <h4 class="font-bold text-gray-800 text-sm">3.3 Práctica de voz</h4>
            </div>
            <p class="text-xs text-gray-600">Escucha y repite en voz alta la frase del curso:</p>
            <p class="text-sm font-bold text-gray-800 bg-white border border-gray-100 rounded-2xl p-4">{{ customVoiceTarget }}</p>
            <div class="flex flex-wrap gap-2">
              <button @click="speakEnglish(customVoiceTarget)" class="px-3 py-2 bg-white border border-gray-200 hover:border-[#006688] text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">volume_up</span> Escuchar
              </button>
              <button
                @click="markCustomVoice"
                :class="`px-3 py-2 text-xs font-bold rounded-xl transition-all ${customVoiceDone ? 'bg-green-100 text-green-700' : 'bg-[#006688] hover:bg-[#004e69] text-white'}`"
              >
                {{ customVoiceDone ? 'Practicado' : 'Marcar como practicado' }}
              </button>
            </div>
          </div>

          <div v-if="!customVocabulary.length && !customFillAnswer && !customVoiceTarget" class="text-xs text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4">
            El instructor aún no ha configurado actividades de práctica para este curso.
          </div>

          <p v-if="phaseProgress.practica === 100" class="text-xs font-bold text-green-600 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span> ¡Práctica completada!
          </p>

          <div v-if="activitiesForPhase('practica').length" class="space-y-3 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
              <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <router-link v-for="activity in activitiesForPhase('practica')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                  <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
                </div>
                <span class="material-symbols-outlined text-[#006688]">play_circle</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- MODULE 4 PRACTICE 1: Discharge Summary Form with Audio -->
        <div v-if="isOfficialModule && moduleNumber === 4" class="space-y-4">
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
                  Revisa los datos tecleados.
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- MODULE 4 PRACTICE 2: Checklist Analysis with Dropdowns -->
        <div v-if="isOfficialModule && moduleNumber === 4" class="space-y-4 pt-4 border-t border-gray-100">
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
                <span class="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold"><span class="material-symbols-outlined text-sm">stethoscope</span> Vitals OK</span>
                <span class="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold"><span class="material-symbols-outlined text-sm">sentiment_satisfied</span> Pain low</span>
                <span class="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-lg text-xs font-bold"><span class="material-symbols-outlined text-sm">draw</span> Signed</span>
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
        <div v-else-if="isOfficialModule && moduleNumber === 3" class="space-y-4">
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
        <div v-else-if="isOfficialModule && moduleNumber === 2" class="space-y-4">
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
        <div v-else-if="isOfficialModule" class="space-y-4">
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
              <span class="flex items-center gap-1 font-bold mb-1">
                <span class="material-symbols-outlined text-sm">record_voice_over</span>
                <span>Guión modelo de pronunciación:</span>
              </span>
              {{ moduleNumber === 4
                ? '"Good morning Mr. Thomas. You must take your painkiller every 8 hours with water and you should rest your arm for 3 days. Head nurse, the patient\'s vital signs are stable and the discharge checklist is complete."'
                : moduleNumber === 3
                ? '"Good afternoon. We are checking Mr. Thomas\'s vital signs right now. He is resting well. Also, colleague, I think we should update the digital checklist for room 204 to streamline our workflow. Let\'s do it today."'
                : moduleNumber === 2 
                ? '"Good morning supervisor. Mr. Thomas is in room 204. Yesterday, he fell at the hotel. Today, he has a bandage on his arm and vitals are stable."' 
                : '"Good morning. My name is John. My last name is Smith. S-M-I-T-H. My phone number is 312 456 7890. Nice to meet you."' }}
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

        <div v-if="isOfficialModule && activitiesForPhase('practica').length" class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
            <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <router-link v-for="activity in activitiesForPhase('practica')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
              </div>
              <span class="material-symbols-outlined text-[#006688]">play_circle</span>
            </router-link>
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

        <!-- Evaluación para cursos personalizados -->
        <div v-if="isCustomCourse" class="space-y-6">
          <div v-if="!customExamPassed" class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">quiz</span>
              <h4 class="font-bold text-gray-800 text-sm">4.1 Evaluación final del curso</h4>
            </div>
            <p class="text-sm font-bold text-gray-800">
              {{ customExamQuestion || 'El instructor aún no ha configurado la pregunta de evaluación.' }}
            </p>
            <div v-if="customExamOptions.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="option in customExamOptions"
                :key="option"
                @click="customExamChoice = option"
                :class="`px-4 py-3 rounded-xl text-xs font-bold border transition-all text-left ${
                  customExamChoice === option
                    ? 'bg-[#006688] text-white border-[#006688]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#006688]'
                }`"
              >
                {{ option }}
              </button>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="submitCustomExam"
                :disabled="!customExamChoice || !customExamOptions.length"
                class="px-6 py-3 bg-[#006688] hover:bg-[#004e69] text-white font-black text-xs rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow"
              >
                Entregar Evaluación
              </button>
              <span v-if="customExamSubmitted && !customExamPassed" class="text-xs font-bold text-red-600 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">cancel</span>
                Respuesta incorrecta. Inténtalo de nuevo.
              </span>
            </div>
          </div>

          <div v-else class="bg-green-50 border border-green-200 rounded-3xl p-8 text-center space-y-6">
            <div class="flex justify-center">
              <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                <span class="material-symbols-outlined text-3xl font-bold">celebration</span>
              </div>
            </div>
            <div class="space-y-1">
              <h4 class="text-xl font-black text-green-800">🎉 ¡Has completado el {{ currentCourseTitle }}!</h4>
              <p class="text-xs text-green-700">Evaluación final completada con éxito. ¡Felicitaciones por tu avance profesional!</p>
            </div>
            <div class="inline-flex gap-2">
              <button
                @click="resetCustomExamForReview"
                class="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition-all"
              >
                Re-presentar Evaluación (Prueba)
              </button>
              <router-link to="/dashboard/cursos" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                Volver a la Lista de Cursos
              </router-link>
            </div>
          </div>

          <div v-if="activitiesForPhase('evaluacion').length" class="space-y-3 pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
              <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <router-link v-for="activity in activitiesForPhase('evaluacion')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                  <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
                </div>
                <span class="material-symbols-outlined text-[#006688]">play_circle</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Badge Success Notification -->
        <div v-if="isOfficialModule && examPassed && showBadgeAward" class="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-6 text-center space-y-4 shadow-md animate-bounce">
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
        <div v-if="isOfficialModule && !examPassed" class="space-y-6">
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

          <div class="flex flex-wrap items-center gap-3">
            <button 
              @click="submitExam" 
              :disabled="Object.keys(examAnswers).length < 6"
              class="px-6 py-3 bg-[#006688] hover:bg-[#004e69] text-white font-black text-xs rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow"
            >
              Entregar Evaluación
            </button>

            <button
              v-if="isPrivilegedUser"
              @click="autoFillExamForAudit"
              type="button"
              class="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
              title="Rellenar todas las respuestas correctas para auditar la pantalla de aprobación"
            >
              <span class="material-symbols-outlined text-sm">auto_fix_high</span>
              Autocompletar (Auditoría)
            </button>

            <span v-if="examScoreMessage" class="text-xs font-bold text-red-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">cancel</span>
              {{ examScoreMessage }}
            </span>
          </div>
        </div>

        <!-- Final Passed Screen -->
        <div v-if="isOfficialModule && examPassed" class="bg-green-50 border border-green-200 rounded-3xl p-8 text-center space-y-6">
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

        <div v-if="isOfficialModule && activitiesForPhase('evaluacion').length" class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-[#006688]">extension</span>
            <h4 class="font-bold text-gray-800 text-sm">Actividades asignadas a esta fase</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <router-link v-for="activity in activitiesForPhase('evaluacion')" :key="activity.id" :to="`/dashboard/actividades/${activity.id}`" class="bg-white border border-gray-100 hover:border-[#006688] rounded-xl p-3 flex items-center justify-between gap-3 transition-all">
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 truncate">{{ activity.title }}</p>
                <p class="text-[10px] text-gray-400 font-medium capitalize">{{ activity.template }} · {{ activity.points }} pts</p>
              </div>
              <span class="material-symbols-outlined text-[#006688]">play_circle</span>
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

    <!-- POST-TEST GLOBAL REUSABLE COMPONENT -->
    <GlobalPostTestModal v-model="showGlobalPostTestModal" />

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'
import GlobalPostTestModal from '../../components/cursos/GlobalPostTestModal.vue'

const route = useRoute()
const auth = useAuthStore()
const notificationStore = useNotificationStore()

const isPrivilegedUser = computed(() => Boolean(auth.isAdmin || auth.isInstructor))

// Course Route State
const courseId = computed(() => route.params.courseId || '1')

const OFFICIAL_MODULE_SLUGS = {
  'getting-to-know-other-people': 1,
  'work-life-interaction': 2,
  'workplace-communication': 3,
  'professional-practice': 4
}

const OFFICIAL_COURSES = {
  1: {
    title: 'Getting to Know Other People',
    subtitle: 'Módulo 1 — Fase Análisis · RAP 1 (Inglés Técnico Aplicado a la Enfermería)',
    badge: 'Fase Análisis · RAP 1'
  },
  2: {
    title: 'Work Life Interaction',
    subtitle: 'Módulo 2 — Fase Planeación · RAP 2 y 3 (Caso Clínico Mr. Thomas)',
    badge: 'Fase Planeación · RAP 2 y 3'
  },
  3: {
    title: 'Workplace Communication',
    subtitle: 'Módulo 3 — Fase Ejecución · RAP 4 y 5 (Comunicación con Médicos, Colegas y Familiares)',
    badge: 'Fase Ejecución · RAP 4 y 5'
  },
  4: {
    title: 'Professional Practice',
    subtitle: 'Módulo 4 — Fase Evaluación · RAP 6 (Instrucciones de Alta, Cuidado en Casa y Evaluación de Checklist)',
    badge: 'Fase Evaluación · RAP 6'
  }
}

// Course Details, Lock Status and RAPs
const courseDetails = ref(null)
const courseLoaded = ref(false)
const isCourseLocked = ref(false)
const prerequisiteCourseTitle = ref('')
const prerequisiteCourseId = ref(null)

const courseRaps = computed(() => {
  if (courseDetails.value?.raps && courseDetails.value.raps.length > 0) {
    return courseDetails.value.raps
  }
  if (moduleNumber.value === 1) return ['RAP-01']
  if (moduleNumber.value === 2) return ['RAP-02', 'RAP-03']
  if (moduleNumber.value === 3) return ['RAP-04', 'RAP-05']
  if (moduleNumber.value === 4) return ['RAP-06']
  return []
})

async function checkCourseLockAndDetails() {
  resetCustomState()
  try {
    const token = auth.token || ''
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    const res = await fetch(`${apiBaseUrl}/api/courses/${courseId.value}`, { headers })
    if (res.ok) {
      const payload = await res.json()
      const course = payload?.data || payload
      courseDetails.value = course
      if (!auth.isAdmin && !auth.isInstructor && course.isLocked) {
        isCourseLocked.value = true
        prerequisiteCourseTitle.value = course.prerequisiteTitle || 'el módulo previo'
        prerequisiteCourseId.value = course.prerequisiteId || (Number(courseId.value) - 1)
        return
      }
    }
  } catch (err) {
    console.warn('Could not check course lock from backend:', err)
  }

  // Comprobación de seguridad local en caso de desconexión o progreso en cliente
  if (!auth.isAdmin && !auth.isInstructor && moduleNumber.value > 1) {
    const prevModuleId = moduleNumber.value - 1
    const apprenticeId = auth.user?.id || 'guest'
    const prevKey = `nursing_academy_progress_${apprenticeId}_course_${prevModuleId}`
    try {
      const raw = localStorage.getItem(prevKey)
      let prevProg = 0
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.phaseProgress) {
          const sum = Object.values(parsed.phaseProgress).reduce((a, b) => a + b, 0)
          prevProg = Math.round(sum / Object.keys(parsed.phaseProgress).length)
        }
      }
      if (prevProg < 100 && (courseDetails.value?.isLocked ?? true)) {
        isCourseLocked.value = true
        prerequisiteCourseTitle.value = courseDetails.value?.prerequisiteTitle || `Módulo ${prevModuleId}`
        prerequisiteCourseId.value = courseDetails.value?.prerequisiteId || prevModuleId
        return
      }
    } catch {}
  }

  isCourseLocked.value = false
  courseLoaded.value = true
  initCustomWarmup()
}
const moduleNumber = computed(() => {
  if (courseLoaded.value) {
    const slug = courseDetails.value?.slug
    return (slug && OFFICIAL_MODULE_SLUGS[slug]) || 0
  }
  const id = String(courseId.value)
  if (id === '4' || id === '6') return 4
  if (id === '3' || id === '5') return 3
  if (id === '2') return 2
  return 1
})

const isOfficialModule = computed(() => moduleNumber.value >= 1)
const isCustomCourse = computed(() => courseLoaded.value && moduleNumber.value === 0)
const customStructure = computed(() => courseDetails.value?.structure || null)

const currentCourseTitle = computed(() => {
  if (isCustomCourse.value) return courseDetails.value?.title || 'Curso'
  return OFFICIAL_COURSES[moduleNumber.value]?.title || 'Getting to Know Other People'
})

const currentCourseSubtitle = computed(() => {
  if (isCustomCourse.value) return courseDetails.value?.description || 'Curso personalizado'
  return OFFICIAL_COURSES[moduleNumber.value]?.subtitle || OFFICIAL_COURSES[1].subtitle
})

const currentCourseBadge = computed(() => {
  if (isCustomCourse.value) return courseDetails.value?.category || 'Curso Personalizado'
  return OFFICIAL_COURSES[moduleNumber.value]?.badge || OFFICIAL_COURSES[1].badge
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
// Phase 1 State (HU16: video de bienvenida, objetivos y warm-up drag & drop)
// -----------------------------------------------------------------
const videoPlaying = ref(false)
const videoCompleted = ref(false)
const videoAvailable = ref(false)
const introAcknowledged = ref(false)
const objectivesConfirmed = ref(false)
const warmupSectionRef = ref(null)
const warmupError = ref(null)
const warmupCelebration = ref(false)
let warmupErrorTimer = null

const currentVideoSrc = computed(() => `/videos/m${moduleNumber.value}-welcome.mp4`)

const warmupUnlocked = computed(() => isPrivilegedUser.value || introAcknowledged.value || phaseProgress.value.inicio === 100)
const isGameCompleted = computed(() => isPrivilegedUser.value || phaseProgress.value.inicio === 100)
const gameSuccess = ref(null)

async function checkVideoAsset() {
  try {
    const res = await fetch(currentVideoSrc.value, { method: 'HEAD' })
    const contentType = res.headers.get('content-type') || ''
    videoAvailable.value = res.ok && contentType.startsWith('video')
  } catch {
    videoAvailable.value = false
  }
}

function scrollToWarmup() {
  nextTick(() => {
    window.setTimeout(() => {
      warmupSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  })
}

function unlockWarmup() {
  introAcknowledged.value = true
  persistLocalState()
  scrollToWarmup()
}

function onVideoWatched() {
  videoPlaying.value = false
  videoCompleted.value = true
  unlockWarmup()
  saveProgress()
}

function resetVideo() {
  videoCompleted.value = false
  videoPlaying.value = false
  persistLocalState()
}

function confirmObjectives() {
  objectivesConfirmed.value = true
  unlockWarmup()
  saveProgress()
}

const warmupPairs = computed(() => {
  if (moduleNumber.value === 4) {
    return [
      { id: 'vitals', label: 'Vital signs stable', right: 'Pulse & BP Normal (Check)', icon: 'monitor_heart', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { id: 'pain', label: 'Pain resolved', right: 'Pain Scale < 2/10 (Check)', icon: 'healing', color: 'text-teal-600', bg: 'bg-teal-50' },
      { id: 'discharge', label: 'Ready for discharge', right: 'Medical Orders Signed (Check)', icon: 'verified_user', color: 'text-[#006688]', bg: 'bg-[#006688]/10' },
    ]
  }
  if (moduleNumber.value === 3) {
    return [
      { id: 'vitals', label: 'Check vital signs & blood pressure', right: 'Patient in bed (Paciente)', icon: 'vital_signs', color: 'text-rose-600', bg: 'bg-rose-50' },
      { id: 'procedure', label: 'Explain current procedure politely', right: 'Visitor / Family (Familia)', icon: 'record_voice_over', color: 'text-amber-600', bg: 'bg-amber-50' },
      { id: 'checklist', label: 'Propose checklist improvements', right: 'Nurse Manager / Doctor (Supervisor)', icon: 'checklist', color: 'text-[#006688]', bg: 'bg-[#006688]/10' },
    ]
  }
  if (moduleNumber.value === 2) {
    return [
      { id: 'morning', label: 'Morning Shift (07:00 AM)', right: 'Good morning, Nurse', icon: 'light_mode', color: 'text-amber-600', bg: 'bg-amber-50' },
      { id: 'afternoon', label: 'Afternoon Shift (03:00 PM)', right: 'Good afternoon, Team', icon: 'wb_twilight', color: 'text-orange-600', bg: 'bg-orange-50' },
      { id: 'night', label: 'Night Shift (11:00 PM)', right: 'Good evening, Shift', icon: 'dark_mode', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ]
  }
  return [
    { id: 'morning', label: 'Morning', right: 'Good morning', icon: 'wb_sunny', color: 'text-amber-600', bg: 'bg-gradient-to-b from-sky-200 to-amber-100', illustration: 'morning' },
    { id: 'afternoon', label: 'Afternoon', right: 'Good afternoon', icon: 'wb_twilight', color: 'text-orange-600', bg: 'bg-gradient-to-b from-orange-200 to-rose-100', illustration: 'afternoon' },
    { id: 'night', label: 'Night', right: 'Good evening', icon: 'dark_mode', color: 'text-indigo-600', bg: 'bg-gradient-to-b from-indigo-900 to-slate-900', illustration: 'night' },
  ]
})

const warmupCards = ref([])
const selectedWarmupCardId = ref(null)
const activeWarmupCard = ref(null)
let warmupInitialPointerX = 0
let warmupInitialPointerY = 0
let warmupInitialCardX = 0
let warmupInitialCardY = 0

function buildWarmupCards() {
  warmupCards.value = warmupPairs.value.map(pair => ({
    ...pair,
    matched: false,
    x: 0,
    y: 0,
    isResetting: false,
  }))
  selectedWarmupCardId.value = null
}

function isPairMatched(pairId) {
  return Boolean(warmupCards.value.find(card => card.id === pairId)?.matched)
}

function startWarmupDrag(event, card) {
  if (!warmupUnlocked.value || card.matched) return
  activeWarmupCard.value = card
  warmupInitialPointerX = event.clientX
  warmupInitialPointerY = event.clientY
  warmupInitialCardX = card.x
  warmupInitialCardY = card.y
  window.addEventListener('pointermove', onWarmupDragMove)
  window.addEventListener('pointerup', onWarmupDragEnd)
}

function onWarmupDragMove(event) {
  if (!activeWarmupCard.value) return
  activeWarmupCard.value.x = warmupInitialCardX + (event.clientX - warmupInitialPointerX)
  activeWarmupCard.value.y = warmupInitialCardY + (event.clientY - warmupInitialPointerY)
}

function onWarmupDragEnd(event) {
  if (!activeWarmupCard.value) return
  window.removeEventListener('pointermove', onWarmupDragMove)
  window.removeEventListener('pointerup', onWarmupDragEnd)

  const card = activeWarmupCard.value
  activeWarmupCard.value = null

  const slots = document.querySelectorAll('[data-warmup-slot]')
  let droppedSlotId = null
  slots.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
      droppedSlotId = el.getAttribute('data-warmup-slot')
    }
  })

  if (!droppedSlotId) {
    returnCardToOrigin(card, false)
    return
  }

  evaluateWarmupDrop(card.id, droppedSlotId)
}

function selectWarmupCard(card) {
  if (!warmupUnlocked.value || card.matched) return
  if (activeWarmupCard.value) return
  selectedWarmupCardId.value = card.id
}

function placeSelectedOnSlot(slotId) {
  if (!selectedWarmupCardId.value) return
  evaluateWarmupDrop(selectedWarmupCardId.value, slotId)
}

function evaluateWarmupDrop(cardId, slotId) {
  const card = warmupCards.value.find(c => c.id === cardId)
  if (!card || card.matched || !warmupUnlocked.value) return
  selectedWarmupCardId.value = null

  if (cardId === slotId) {
    card.matched = true
    card.x = 0
    card.y = 0
    warmupError.value = null
    checkWarmupCompletion()
  } else {
    showWarmupWarning('Esa no es la pareja correcta. La tarjeta volvió a su lugar, inténtalo de nuevo.')
    returnCardToOrigin(card, true)
  }
}

function returnCardToOrigin(card, animate) {
  if (animate) {
    card.isResetting = true
    window.setTimeout(() => { card.isResetting = false }, 350)
  }
  card.x = 0
  card.y = 0
}

function showWarmupWarning(message) {
  warmupError.value = message
  gameSuccess.value = false
  if (warmupErrorTimer) clearTimeout(warmupErrorTimer)
  warmupErrorTimer = window.setTimeout(() => { warmupError.value = null }, 3000)
}

function checkWarmupCompletion() {
  if (warmupCards.value.length > 0 && warmupCards.value.every(card => card.matched)) {
    gameSuccess.value = true
    phaseProgress.value.inicio = 100
    warmupCelebration.value = true
    saveProgress()
  }
}

function goToMomento2() {
  warmupCelebration.value = false
  goToPhase('estudio')
}

function resetWarmupGame() {
  selectedWarmupCardId.value = null
  warmupError.value = null
  warmupCelebration.value = false
  warmupCards.value.forEach(card => {
    card.matched = false
    card.x = 0
    card.y = 0
    card.isResetting = false
  })
  gameSuccess.value = null
  phaseProgress.value.inicio = 0
  persistLocalState()
}

function restoreWarmupCompleted() {
  warmupCards.value.forEach(card => { card.matched = true })
  gameSuccess.value = true
  introAcknowledged.value = true
}

buildWarmupCards()

watch(moduleNumber, () => {
  buildWarmupCards()
  gameSuccess.value = phaseProgress.value.inicio === 100 ? true : null
  checkVideoAsset()
})

// -----------------------------------------------------------------
// Cursos personalizados creados desde "Editar Estructura del Curso"
// -----------------------------------------------------------------
const courseActivities = ref([])
const customWarmupPool = ref([])
const customWarmupPlaced = ref([])
const customWarmupError = ref(null)
const customVocabHeard = ref([])
const customFillInput = ref('')
const customFillError = ref(null)
const customVoiceDone = ref(false)
const customExamChoice = ref(null)
const customExamSubmitted = ref(false)
const customExamPassed = ref(false)
const customSpeakingPrompt = ref('')
const customProfilePrompt = ref('')
const customProfileName = ref('')
const customProfileError = ref(null)
const customProfileSuccess = ref(false)
const customRecognizing = ref(false)
const customExtraHeard = ref([])
let customRecognition = null

const PHASE_ACTIVITY_LABELS = {
  inicio: 'Preparación',
  estudio: 'Absorción',
  practica: 'Práctica',
  evaluacion: 'Cierre'
}

function toList(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean)
  return []
}

const customWords = computed(() => toList(customStructure.value?.f1?.gameWords))
const customVocabulary = computed(() => toList(customStructure.value?.f2?.vocabulary))
const customSpeakingTarget = computed(() => customWords.value.length > 0 ? customWords.value.join(' ') : customVocabulary.value.join(', '))
const customFillAnswer = computed(() => String(customStructure.value?.f3?.fillBlank || '').trim())
const customVoiceTarget = computed(() => String(customStructure.value?.f3?.voiceTarget || '').trim())
const customExamQuestion = computed(() => String(customStructure.value?.f4?.question || '').trim())
const customExamCorrect = computed(() => String(customStructure.value?.f4?.correct || '').trim())
const customExamIncorrect = computed(() => String(customStructure.value?.f4?.incorrect || '').trim())
const isCustomFillCorrect = computed(() => {
  if (!customFillAnswer.value) return false
  return customFillInput.value.trim().toLowerCase() === customFillAnswer.value.toLowerCase()
})
const customExamOptions = computed(() => {
  const options = [customExamCorrect.value, customExamIncorrect.value].filter(Boolean)
  return options.sort(() => Math.random() - 0.5)
})

function shuffleList(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

function initCustomWarmup() {
  customWarmupPlaced.value = []
  customWarmupError.value = null
  customWarmupPool.value = shuffleList(customWords.value)
}

function pickCustomWord(word) {
  if (phaseProgress.value.inicio === 100) return
  const expected = customWords.value[customWarmupPlaced.value.length]
  if (word !== expected) {
    customWarmupError.value = `Orden incorrecto: "${word}" no es la siguiente palabra.`
    window.setTimeout(() => { customWarmupError.value = null }, 3000)
    return
  }
  customWarmupError.value = null
  customWarmupPlaced.value.push(word)
  if (customWarmupPlaced.value.length === customWords.value.length) {
    customWarmupPool.value = []
    phaseProgress.value.inicio = 100
    gameSuccess.value = true
    warmupCelebration.value = true
    saveProgress()
  }
}

function playCustomVocab(word) {
  speakEnglish(word)
  if (!customVocabHeard.value.includes(word)) {
    customVocabHeard.value.push(word)
  }
  checkCustomEstudioCompletion()
}

function playCustomSpeakingTarget() {
  if (!customSpeakingTarget.value) return
  speakEnglish(customSpeakingTarget.value)
  if (!customExtraHeard.value.includes(customSpeakingTarget.value)) {
    customExtraHeard.value.push(customSpeakingTarget.value)
  }
  checkCustomEstudioCompletion()
}

function checkCustomEstudioCompletion() {
  if (phaseProgress.value.estudio === 100) return
  const baseHeard = customVocabulary.value.length === 0 || customVocabulary.value.every(item => customVocabHeard.value.includes(item))
  const extraHeard = !customSpeakingTarget.value || customExtraHeard.value.includes(customSpeakingTarget.value)
  if (baseHeard && extraHeard) {
    phaseProgress.value.estudio = 100
    saveProgress()
  }
}

function startCustomSpeaking() {
  if (customRecognizing.value) return
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    customProfileError.value = 'Tu navegador no soporta reconocimiento de voz. Usa la confirmación manual.'
    return
  }
  customProfileError.value = null
  customRecognition = new SpeechRecognition()
  customRecognition.lang = 'en-US'
  customRecognition.interimResults = false
  customRecognition.maxAlternatives = 1
  customRecognition.onresult = event => {
    const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ')
    evaluateCustomSpeaking(transcript)
  }
  customRecognition.onerror = () => {
    customRecognizing.value = false
    customProfileError.value = 'No pudimos escuchar tu voz. Inténtalo de nuevo o usa la confirmación manual.'
  }
  customRecognition.onend = () => { customRecognizing.value = false }
  customRecognizing.value = true
  customRecognition.start()
}

function evaluateCustomSpeaking(transcript) {
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
  const given = normalize(transcript)
  const target = normalize(customProfilePrompt.value)
  customSpeakingPrompt.value = String(transcript || '').trim()
  const matches = target.length > 0 && target.every(word => given.includes(word))
  if (matches) {
    customProfileSuccess.value = true
    customProfileError.value = null
    checkCustomEstudioCompletion()
  } else {
    customProfileError.value = 'La frase no coincide con la meta. Inténtalo otra vez o usa la confirmación manual.'
  }
}

function confirmCustomSpeaking() {
  customProfileSuccess.value = true
  customProfileError.value = null
  checkCustomEstudioCompletion()
}

function resetCustomState() {
  customWarmupPool.value = []
  customWarmupPlaced.value = []
  customWarmupError.value = null
  customVocabHeard.value = []
  customExtraHeard.value = []
  customFillInput.value = ''
  customFillError.value = null
  customVoiceDone.value = false
  customExamChoice.value = null
  customExamSubmitted.value = false
  customExamPassed.value = false
  customSpeakingPrompt.value = ''
  customProfilePrompt.value = ''
  customProfileName.value = ''
  customProfileError.value = null
  customProfileSuccess.value = false
  customRecognizing.value = false
  gameSuccess.value = null
}

function completeCustomGrammar() {
  if (phaseProgress.value.estudio !== 100) {
    phaseProgress.value.estudio = 100
    saveProgress()
  }
}

function checkCustomFill() {
  if (!customFillAnswer.value) return
  if (isCustomFillCorrect.value) {
    customFillError.value = null
    checkCustomPracticeCompletion()
  } else {
    customFillError.value = 'Respuesta incorrecta. Inténtalo de nuevo.'
  }
}

function markCustomVoice() {
  customVoiceDone.value = true
  checkCustomPracticeCompletion()
}

function checkCustomPracticeCompletion() {
  const fillOk = !customFillAnswer.value || isCustomFillCorrect.value
  const voiceOk = !customVoiceTarget.value || customVoiceDone.value
  if (fillOk && voiceOk) {
    phaseProgress.value.practica = 100
    saveProgress()
  }
}

function submitCustomExam() {
  customExamSubmitted.value = true
  if (customExamChoice.value && customExamChoice.value === customExamCorrect.value) {
    customExamPassed.value = true
    phaseProgress.value.evaluacion = 100
    saveProgress()
  }
}

function resetCustomExamForReview() {
  customExamPassed.value = false
  customExamSubmitted.value = false
  customExamChoice.value = null
  phaseProgress.value.evaluacion = 0
  saveProgress()
}

function activitiesForPhase(phaseId) {
  return courseActivities.value.filter(activity => {
    const belongsToCourse = activity.courseId
      ? Number(activity.courseId) === Number(courseId.value)
      : activity.course === courseDetails.value?.title
    return belongsToCourse && activity.phase === PHASE_ACTIVITY_LABELS[phaseId]
  })
}

async function fetchCourseActivities() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/activities`)
    if (res.ok) {
      const data = await res.json()
      courseActivities.value = Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (err) {
    console.warn('Course activities unavailable:', err)
  }
}

// -----------------------------------------------------------------
// Phase 2 State: Grammar Pill, Vocabulary Flashcards, Storybook
// -----------------------------------------------------------------
const activeGrammarFilters = ref(['subject', 'verb', 'complement'])

// -----------------------------------------------------------------
// MÓDULO 1 — HU17: Absorción de Conocimiento (secciones secuenciales)
// -----------------------------------------------------------------
const m1StudySections = [
  { id: 'grammar', name: 'Gramática', icon: 'palette' },
  { id: 'vocabulary', name: 'Vocabulario', icon: 'style' },
  { id: 'chat', name: 'Conversación', icon: 'forum' },
]

const m1StudySection = ref('grammar')
const m1StudyDone = ref({ grammar: false, vocabulary: false, chat: false })
const m1ChatVisibleCount = ref(0)

// 2.1 Gramática — Persona + Acción + Detalle
const m1GrammarRows = [
  { subject: 'I', verb: 'am', complement: 'a nurse at this hospital.', spanish: 'Soy enfermero(a) en este hospital.', full: 'I am a nurse at this hospital.' },
  { subject: 'You', verb: 'are', complement: 'a nursing assistant.', spanish: 'Eres auxiliar de enfermería.', full: 'You are a nursing assistant.' },
  { subject: 'He', verb: 'is', complement: 'a patient in room 204.', spanish: 'Él es un paciente de la habitación 204.', full: 'He is a patient in room 204.' },
  { subject: 'She', verb: 'is', complement: 'my work colleague.', spanish: 'Ella es mi compañera de trabajo.', full: 'She is my work colleague.' },
  { subject: 'We', verb: 'are', complement: 'the night shift team.', spanish: 'Somos el equipo del turno de noche.', full: 'We are the night shift team.' },
  { subject: 'They', verb: 'are', complement: 'nurses from Canada.', spanish: 'Ellos son enfermeros de Canadá.', full: 'They are nurses from Canada.' },
]

const m1GrammarLegend = [
  { id: 'subject', label: 'Persona (Subject)', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dotBg: 'bg-blue-500' },
  { id: 'verb', label: 'Acción (Verb)', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dotBg: 'bg-orange-500' },
  { id: 'complement', label: 'Detalle (Complement)', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dotBg: 'bg-green-500' },
]

const m1ToBeTable = [
  { pronoun: 'I', form: 'am', complement: 'a nurse.', full: 'I am a nurse.', spanish: 'Yo soy enfermero(a).' },
  { pronoun: 'You', form: 'are', complement: 'a nursing assistant.', full: 'You are a nursing assistant.', spanish: 'Tú eres auxiliar de enfermería.' },
  { pronoun: 'He', form: 'is', complement: 'a patient.', full: 'He is a patient.', spanish: 'Él es un paciente.' },
  { pronoun: 'She', form: 'is', complement: 'my colleague.', full: 'She is my colleague.', spanish: 'Ella es mi colega.' },
  { pronoun: 'We', form: 'are', complement: 'a team.', full: 'We are a team.', spanish: 'Nosotros somos un equipo.' },
  { pronoun: 'They', form: 'are', complement: 'nurses.', full: 'They are nurses.', spanish: 'Ellos son enfermeros.' },
]

// 2.2 Vocabulario — Alfabeto, Números, Saludos y Contacto
const M1_ALPHABET = [
  ['A', '[éi]'], ['B', '[bi]'], ['C', '[si]'], ['D', '[di]'], ['E', '[i]'], ['F', '[ef]'],
  ['G', '[yi]'], ['H', '[éich]'], ['I', '[ái]'], ['J', '[dchéi]'], ['K', '[kéi]'], ['L', '[el]'],
  ['M', '[em]'], ['N', '[en]'], ['O', '[óu]'], ['P', '[pi]'], ['Q', '[kiu]'], ['R', '[ar]'],
  ['S', '[es]'], ['T', '[ti]'], ['U', '[iú]'], ['V', '[vi]'], ['W', '[dábliu]'], ['X', '[eks]'],
  ['Y', '[uái]'], ['Z', '[zi]'],
]

const m1AlphabetItems = ref(M1_ALPHABET.map(([letter, pronunciation]) => ({
  id: `m1_alpha_${letter}`,
  word: letter,
  pronunciation,
  translation: `Letra "${letter}" del alfabeto`,
  category: 'Abecedario',
  icon: 'abc',
  iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  played: false,
})))

const M1_NUMBERS = [
  ['Zero', '0', '[zí-rou]'], ['One', '1', '[uán]'], ['Two', '2', '[tú]'], ['Three', '3', '[zrí]'],
  ['Four', '4', '[for]'], ['Five', '5', '[fáiv]'], ['Six', '6', '[siks]'], ['Seven', '7', '[sé-ven]'],
  ['Eight', '8', '[éit]'], ['Nine', '9', '[náin]'], ['Ten', '10', '[ten]'], ['Eleven', '11', '[i-lé-ven]'],
  ['Twelve', '12', '[tuélv]'], ['Thirteen', '13', '[zer-tín]'], ['Fourteen', '14', '[for-tín]'],
  ['Fifteen', '15', '[fif-tín]'], ['Sixteen', '16', '[siks-tín]'], ['Seventeen', '17', '[se-ven-tín]'],
  ['Eighteen', '18', '[éi-tín]'], ['Nineteen', '19', '[nain-tín]'], ['Twenty', '20', '[tuén-ti]'],
  ['Thirty', '30', '[zér-ti]'], ['Forty', '40', '[fór-ti]'], ['Fifty', '50', '[fíf-ti]'],
  ['Sixty', '60', '[síks-ti]'], ['Seventy', '70', '[sé-ven-ti]'], ['Eighty', '80', '[éi-ti]'],
  ['Ninety', '90', '[náin-ti]'], ['One hundred', '100', '[uán ján-dred]'],
]

const m1NumberItems = ref(M1_NUMBERS.map(([word, value, pronunciation]) => ({
  id: `m1_num_${value}`,
  word,
  pronunciation,
  translation: `Número ${value}`,
  category: 'Números',
  icon: 'pin',
  iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  played: false,
})))

const M1_GREETINGS = [
  ['Hello', '[je-lóu]', 'Hola (saludo general)'],
  ['Hi', '[jái]', 'Hola (saludo informal entre colegas)'],
  ['Good morning', '[gud mór-ning]', 'Buenos días (hasta 12:00 m)'],
  ['Good afternoon', '[gud áf-ter-nun]', 'Buenas tardes (12:00 m – 6:00 pm)'],
  ['Good evening', '[gud ív-ning]', 'Buenas noches (al llegar)'],
  ['Nice to meet you', '[náis tu mít iu]', 'Mucho gusto en conocerte'],
  ['How are you?', '[jáu ar iu]', '¿Cómo estás?'],
  ['See you later', '[si yu léi-ter]', 'Hasta luego'],
  ['Goodbye', '[gud-bái]', 'Adiós (despedida formal)'],
]

const m1GreetingItems = ref(M1_GREETINGS.map(([word, pronunciation, translation], idx) => ({
  id: `m1_greet_${idx}`,
  word,
  pronunciation,
  translation,
  category: 'Saludos',
  icon: 'waving_hand',
  iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
  played: false,
})))

const M1_CONTACT = [
  ['Name', '[néim]', 'Nombre personal'],
  ['Last name', '[last néim]', 'Apellido'],
  ['Age', '[éidch]', 'Edad en años'],
  ['Nationality', '[na-shon-á-li-ti]', 'Nacionalidad u origen'],
  ['Phone number', '[fóun nám-ber]', 'Número de teléfono'],
  ['Email address', '[í-meil a-drés]', 'Dirección de correo electrónico'],
  ['At sign (@)', '[at sáin]', 'Arroba dentro de un correo'],
  ['Dot (.)', '[dot]', 'Punto dentro de un correo o página web'],
  ['Hyphen (-)', '[jái-fen]', 'Guion para separar datos'],
  ['Spelling', '[spé-ling]', 'Deletreo de letras'],
]

const m1ContactItems = ref(M1_CONTACT.map(([word, pronunciation, translation], idx) => ({
  id: `m1_contact_${idx}`,
  word,
  pronunciation,
  translation,
  category: 'Contacto',
  icon: 'contact_page',
  iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
  played: false,
})))

const m1VocabCategories = computed(() => [
  { id: 'alphabet', label: 'Abecedario', icon: 'abc', items: m1AlphabetItems.value },
  { id: 'numbers', label: 'Números', icon: 'pin', items: m1NumberItems.value },
  { id: 'greetings', label: 'Saludos y Despedidas', icon: 'waving_hand', items: m1GreetingItems.value },
  { id: 'contact', label: 'Datos de Contacto', icon: 'contact_page', items: m1ContactItems.value },
])

const m1ActiveCategory = ref('alphabet')
const m1ActiveVocabItems = computed(() => m1VocabCategories.value.find(c => c.id === m1ActiveCategory.value)?.items || [])
const m1AllVocabItems = computed(() => m1VocabCategories.value.flatMap(c => c.items))
const m1HeardCount = computed(() => m1AllVocabItems.value.filter(i => i.played).length)
const isM1VocabComplete = computed(() => isPrivilegedUser.value || (m1AllVocabItems.value.length > 0 && m1HeardCount.value === m1AllVocabItems.value.length))

// Aplicación laboral: dictado de correo y teléfono
const m1DictationExamples = [
  {
    id: 'email',
    icon: 'alternate_email',
    title: 'Dictar un correo electrónico',
    phrase: 'My email is laura.gomez@clinic.com',
    breakdown: 'laura . gomez @ clinic . com',
    spelling: 'L A U R A dot G O M E Z at C L I N I C dot com',
    spanish: 'Mi correo es laura.gomez@clinic.com',
  },
  {
    id: 'phone',
    icon: 'call',
    title: 'Dictar un número de teléfono',
    phrase: 'My phone number is 555 2048',
    breakdown: 'five five five - two zero four eight',
    spelling: 'five, five, five, two, zero, four, eight',
    spanish: 'Mi número de teléfono es 555 2048',
  },
]

// 2.3 Conversación guiada estilo chat (nombre, edad, país, contacto)
const m1ChatMessages = [
  {
    speaker: 'Nurse Sarah', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true,
    english: 'Hi! Good morning. I am Sarah.',
    spanish: '¡Hola! Buenos días. Soy Sarah.',
    parts: [
      { text: 'Hi! Good morning. ', type: null },
      { text: 'I ', type: 'subject' }, { text: 'am ', type: 'verb' }, { text: 'Sarah.', type: 'complement' },
    ],
  },
  {
    speaker: 'Nurse David', avatarIcon: 'person', avatarBg: 'bg-indigo-600', alignLeft: false,
    english: 'Good morning, Sarah. I am David. Nice to meet you.',
    spanish: 'Buenos días, Sarah. Soy David. Mucho gusto.',
    parts: [
      { text: 'Good morning, Sarah. ', type: null },
      { text: 'I ', type: 'subject' }, { text: 'am ', type: 'verb' }, { text: 'David.', type: 'complement' },
      { text: ' Nice to meet you.', type: null },
    ],
  },
  {
    speaker: 'Nurse Sarah', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true,
    english: 'Nice to meet you too. Are you a new nurse here?',
    spanish: 'Mucho gusto también. ¿Eres nuevo aquí como enfermero?',
  },
  {
    speaker: 'Nurse David', avatarIcon: 'person', avatarBg: 'bg-indigo-600', alignLeft: false,
    english: 'Yes, I am. I am a nurse at this hospital. I am from Canada.',
    spanish: 'Sí. Soy enfermero en este hospital. Soy de Canadá.',
    parts: [
      { text: 'Yes, ', type: null },
      { text: 'I ', type: 'subject' }, { text: 'am', type: 'verb' }, { text: '. ', type: null },
      { text: 'I ', type: 'subject' }, { text: 'am ', type: 'verb' }, { text: 'a nurse at this hospital.', type: 'complement' },
      { text: ' I am from Canada.', type: null },
    ],
  },
  {
    speaker: 'Nurse Sarah', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true,
    english: 'Welcome to the team! How old are you?',
    spanish: '¡Bienvenido al equipo! ¿Cuántos años tienes?',
  },
  {
    speaker: 'Nurse David', avatarIcon: 'person', avatarBg: 'bg-indigo-600', alignLeft: false,
    english: 'I am twenty-nine years old. And you?',
    spanish: 'Tengo veintinueve años. ¿Y tú?',
  },
  {
    speaker: 'Nurse Sarah', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true,
    english: 'I am thirty-two. My email is sarah.jones@clinic.com.',
    spanish: 'Tengo treinta y dos. Mi correo es sarah.jones@clinic.com.',
  },
  {
    speaker: 'Nurse David', avatarIcon: 'person', avatarBg: 'bg-indigo-600', alignLeft: false,
    english: 'Great. My phone number is 555 2048. See you later!',
    spanish: 'Genial. Mi número de teléfono es 555 2048. ¡Hasta luego!',
  },
  {
    speaker: 'Nurse Sarah', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true,
    english: 'See you later! Goodbye.',
    spanish: '¡Hasta luego! Adiós.',
  },
]

const visibleM1ChatMessages = computed(() => m1ChatMessages.slice(0, m1ChatVisibleCount.value))

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

// Vocabulary Lists (Sleek Material Icons & Pronunciation Guides)
const m2VocabList = ref([
  { id: 'm2_v1', word: 'Head', pronunciation: '[jed]', translation: 'Cabeza (Anatomía)', category: 'Anatomía', icon: 'psychology', iconBg: 'bg-purple-50 text-purple-600 border-purple-100', played: false },
  { id: 'm2_v2', word: 'Arm', pronunciation: '[arm]', translation: 'Brazo (Anatomía)', category: 'Anatomía', icon: 'front_hand', iconBg: 'bg-blue-50 text-blue-600 border-blue-100', played: false },
  { id: 'm2_v3', word: 'Leg', pronunciation: '[leg]', translation: 'Pierna (Anatomía)', category: 'Anatomía', icon: 'accessible', iconBg: 'bg-teal-50 text-teal-600 border-teal-100', played: false },
  { id: 'm2_v4', word: 'Chest', pronunciation: '[chest]', translation: 'Pecho / Tórax', category: 'Anatomía', icon: 'favorite', iconBg: 'bg-rose-50 text-rose-600 border-rose-100', played: false },
  { id: 'm2_v5', word: 'Waiting room', pronunciation: '[wéi-ting rum]', translation: 'Sala de espera hospitalaria', category: 'Entorno', icon: 'chair', iconBg: 'bg-amber-50 text-amber-600 border-amber-100', played: false },
  { id: 'm2_v6', word: 'Stretcher', pronunciation: '[stré-cher]', translation: 'Camilla de traslado', category: 'Entorno', icon: 'airline_seat_flat', iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', played: false },
  { id: 'm2_v7', word: 'Hospital room', pronunciation: '[jós-pi-tal rum]', translation: 'Habitación de hospital (Room 204)', category: 'Entorno', icon: 'hotel', iconBg: 'bg-sky-50 text-sky-600 border-sky-100', played: false },
  { id: 'm2_v8', word: 'Bandage', pronunciation: '[bán-didch]', translation: 'Vendaje elástico de protección', category: 'Tratamiento', icon: 'healing', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', played: false },
  { id: 'm2_v9', word: 'Fracture', pronunciation: '[frák-chur]', translation: 'Fractura ósea confirmada', category: 'Diagnóstico', icon: 'personal_injury', iconBg: 'bg-red-50 text-red-600 border-red-100', played: false },
  { id: 'm2_v10', word: 'Swollen', pronunciation: '[suó-len]', translation: 'Hinchado / Inflamado', category: 'Signo clínico', icon: 'radio_button_checked', iconBg: 'bg-orange-50 text-orange-600 border-orange-100', played: false },
  { id: 'm2_v11', word: 'Pale', pronunciation: '[péil]', translation: 'Pálido (Aspecto físico)', category: 'Signo clínico', icon: 'contrast', iconBg: 'bg-gray-50 text-gray-600 border-gray-200', played: false },
  { id: 'm2_v12', word: 'Dizzy', pronunciation: '[dí-zi]', translation: 'Mareado / Inestable', category: 'Síntoma', icon: 'sync_problem', iconBg: 'bg-yellow-50 text-yellow-600 border-yellow-100', played: false },
])

const m3VocabList = ref([
  { id: 'm3_v1', word: 'Thermometer', pronunciation: '[zer-mó-me-ter]', translation: 'Termómetro clínico', category: 'Herramienta', icon: 'device_thermostat', iconBg: 'bg-red-50 text-red-600 border-red-100', played: false },
  { id: 'm3_v2', word: 'Stethoscope', pronunciation: '[sté-zo-scoup]', translation: 'Estetoscopio de auscultación', category: 'Herramienta', icon: 'stethoscope', iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100', played: false },
  { id: 'm3_v3', word: 'Blood pressure monitor', pronunciation: '[blad pré-shur mó-ni-tor]', translation: 'Monitor de presión arterial', category: 'Herramienta', icon: 'monitor_heart', iconBg: 'bg-rose-50 text-rose-600 border-rose-100', played: false },
  { id: 'm3_v4', word: 'Checklist', pronunciation: '[chék-list]', translation: 'Lista de verificación clínica', category: 'Formato', icon: 'checklist', iconBg: 'bg-amber-50 text-amber-600 border-amber-100', played: false },
  { id: 'm3_v5', word: 'Syringe', pronunciation: '[se-ríndch]', translation: 'Jeringa médica descartable', category: 'Herramienta', icon: 'vaccines', iconBg: 'bg-blue-50 text-blue-600 border-blue-100', played: false },
  { id: 'm3_v6', word: 'Pulse oximeter', pronunciation: '[pals ok-sí-me-ter]', translation: 'Pulsioxímetro de saturación', category: 'Herramienta', icon: 'sensors', iconBg: 'bg-purple-50 text-purple-600 border-purple-100', played: false },
  { id: 'm3_v7', word: 'IV Drip', pronunciation: '[ái-vi drip]', translation: 'Suero / Bomba de infusión', category: 'Equipo', icon: 'water_drop', iconBg: 'bg-sky-50 text-sky-600 border-sky-100', played: false },
  { id: 'm3_v8', word: 'Administer', pronunciation: '[ad-mí-nis-ter]', translation: 'Administrar medicamentos', category: 'Acción', icon: 'medication', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', played: false },
  { id: 'm3_v9', word: 'Monitor', pronunciation: '[mó-ni-tor]', translation: 'Monitorear signos vitales', category: 'Acción', icon: 'vital_signs', iconBg: 'bg-teal-50 text-teal-600 border-teal-100', played: false },
  { id: 'm3_v10', word: 'Disinfect', pronunciation: '[dis-in-féct]', translation: 'Desinfectar instrumental', category: 'Acción', icon: 'cleaning_services', iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', played: false },
  { id: 'm3_v11', word: 'Explain', pronunciation: '[ex-pléin]', translation: 'Explicar procedimientos', category: 'Acción', icon: 'record_voice_over', iconBg: 'bg-blue-50 text-blue-600 border-blue-100', played: false },
  { id: 'm3_v12', word: 'Gauze', pronunciation: '[goz]', translation: 'Gasa estéril de curación', category: 'Material', icon: 'healing', iconBg: 'bg-amber-50 text-amber-600 border-amber-100', played: false },
])

const m4VocabList = ref([
  { id: 'm4_v1', word: 'Discharge', pronunciation: '[dis-chárdch]', translation: 'Alta médica / Egreso hospitalario', category: 'Egreso', icon: 'door_open', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', played: false },
  { id: 'm4_v2', word: 'Prescription', pronunciation: '[pris-críp-shon]', translation: 'Receta médica autorizada', category: 'Tratamiento', icon: 'receipt_long', iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', played: false },
  { id: 'm4_v3', word: 'Painkiller', pronunciation: '[péin-ki-ler]', translation: 'Analgésico para el dolor', category: 'Medicamento', icon: 'medication', iconBg: 'bg-rose-50 text-rose-600 border-rose-100', played: false },
  { id: 'm4_v4', word: 'Follow-up appointment', pronunciation: '[fó-lou-ap a-póint-ment]', translation: 'Cita de control y seguimiento', category: 'Atención', icon: 'event_available', iconBg: 'bg-sky-50 text-sky-600 border-sky-100', played: false },
  { id: 'm4_v5', word: 'Recovery', pronunciation: '[ri-kó-ve-ri]', translation: 'Recuperación clínica del paciente', category: 'Evolución', icon: 'health_and_safety', iconBg: 'bg-teal-50 text-teal-600 border-teal-100', played: false },
  { id: 'm4_v6', word: 'Outcomes', pronunciation: '[áut-cams]', translation: 'Resultados y desenlaces del cuidado', category: 'Evaluación', icon: 'trending_up', iconBg: 'bg-blue-50 text-blue-600 border-blue-100', played: false },
  { id: 'm4_v7', word: 'Dosage', pronunciation: '[dóu-sidch]', translation: 'Dosis y posología indicada', category: 'Tratamiento', icon: 'vaccines', iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100', played: false },
  { id: 'm4_v8', word: 'Home care', pronunciation: '[jóum quer]', translation: 'Cuidado y reposo en el hogar', category: 'Egreso', icon: 'home_health', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', played: false },
  { id: 'm4_v9', word: 'Wound care', pronunciation: '[wund quer]', translation: 'Cuidado e higiene de la herida', category: 'Curación', icon: 'healing', iconBg: 'bg-amber-50 text-amber-600 border-amber-100', played: false },
  { id: 'm4_v10', word: 'Precautions', pronunciation: '[pri-có-shons]', translation: 'Precauciones de seguridad', category: 'Recomendación', icon: 'security', iconBg: 'bg-yellow-50 text-yellow-600 border-yellow-100', played: false },
  { id: 'm4_v11', word: 'Side effects', pronunciation: '[sáid i-fécts]', translation: 'Efectos secundarios a vigilar', category: 'Seguridad', icon: 'troubleshoot', iconBg: 'bg-purple-50 text-purple-600 border-purple-100', played: false },
  { id: 'm4_v12', word: 'Signed orders', pronunciation: '[sáind ór-ders]', translation: 'Órdenes médicas firmadas', category: 'Documento', icon: 'draw', iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', played: false },
])

const activeVocabList = computed(() => {
  if (moduleNumber.value === 4) return m4VocabList.value
  if (moduleNumber.value === 3) return m3VocabList.value
  if (moduleNumber.value === 2) return m2VocabList.value
  return m1AllVocabItems.value
})

const playingVocabId = ref(null)

// Dialogues
const m2Dialogue = [
  { speaker: 'Nurse Andrea', avatarIcon: 'person', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Good morning, Nurse Carlos. How is Mr. Thomas?', spanish: 'Buenos días, Carlos. ¿Cómo está Mr. Thomas?' },
  { speaker: 'Nurse Carlos', avatarIcon: 'person', avatarBg: 'bg-indigo-600', alignLeft: false, english: 'He fell yesterday. He has a bandage and is resting.', spanish: 'Se cayó ayer. Tiene un vendaje y está descansando.' },
]

const m3Dialogue = [
  { speaker: 'Emma (Visitor)', avatarIcon: 'family_restroom', avatarBg: 'bg-purple-600', alignLeft: true, english: 'Excuse me, nurse. How is my father doing?', spanish: 'Disculpe, enfermero. ¿Cómo está mi padre?' },
  { speaker: 'Nurse (You)', avatarIcon: 'medical_services', avatarBg: 'bg-[#006688]', alignLeft: false, english: 'We are checking his blood pressure right now. He is resting well.', spanish: 'Estamos tomando su presión ahora. Está descansando bien.' },
]

const m4Dialogue = [
  { speaker: 'Nurse (You)', avatarIcon: 'medical_services', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Good morning, Mr. Thomas! Good news: you are ready for discharge today.', spanish: '¡Buenos días, Sr. Thomas! Buenas noticias: está listo para el alta médica hoy.' },
  { speaker: 'Mr. Thomas (Patient)', avatarIcon: 'elderly', avatarBg: 'bg-emerald-700', alignLeft: false, english: 'Wonderful news! What are my instructions for home care?', spanish: '¡Maravillosa noticia! ¿Cuáles son mis instrucciones para el cuidado en casa?' },
  { speaker: 'Nurse (You)', avatarIcon: 'medical_services', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Mr. Thomas, you must take this painkiller every 8 hours. You should keep your arm rested for 3 days.', spanish: 'Sr. Thomas, debe tomar este analgésico cada 8 horas. Debería descansar el brazo por 3 días.' },
  { speaker: 'Mr. Thomas (Patient)', avatarIcon: 'elderly', avatarBg: 'bg-emerald-700', alignLeft: false, english: 'Understood. When is my follow-up appointment?', spanish: 'Entendido. ¿Cuándo es mi cita de control?' },
  { speaker: 'Nurse (You)', avatarIcon: 'medical_services', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Your follow-up appointment is next Monday at 10:00 AM with Dr. Miller.', spanish: 'Su cita de control es el próximo lunes a las 10:00 AM con el Dr. Miller.' },
  { speaker: 'Head Nurse', avatarIcon: 'health_and_safety', avatarBg: 'bg-teal-700', alignLeft: false, english: 'Nurse, is the final checklist complete for room 204?', spanish: 'Enfermero, ¿la lista de verificación final de la habitación 204 está completa?' },
  { speaker: 'Nurse (You)', avatarIcon: 'medical_services', avatarBg: 'bg-[#006688]', alignLeft: true, english: 'Yes, Head Nurse. Vitals are stable, pain is resolved and medical orders are signed. He is ready.', spanish: 'Sí, jefa de enfermería. Los signos están estables, el dolor resuelto y las órdenes firmadas. Está listo.' },
]

const activeDialogue = computed(() => {
  if (moduleNumber.value === 4) return m4Dialogue
  if (moduleNumber.value === 3) return m3Dialogue
  return m2Dialogue
})

const isStudyCompleted = computed(() => isPrivilegedUser.value || phaseProgress.value.estudio === 100)

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
  if (moduleNumber.value === 1) {
    syncM1StudyProgress()
    saveProgress()
    return
  }
  const allPlayed = activeVocabList.value.every(v => v.played)
  if (allPlayed) {
    phaseProgress.value.estudio = 100
    saveProgress()
  }
}

// -----------------------------------------------------------------
// MÓDULO 1 — HU17: Secciones de absorción (gating, audio y chat)
// -----------------------------------------------------------------
function playM1VocabAudio(item) {
  playingVocabId.value = item.id
  speakEnglish(item.word)
  setTimeout(() => {
    playingVocabId.value = null
    if (!item.played) {
      item.played = true
      persistLocalState()
    }
  }, 900)
}

function isM1SectionUnlocked(sectionId) {
  if (isPrivilegedUser.value) return true
  if (sectionId === 'grammar') return true
  if (sectionId === 'vocabulary') return m1StudyDone.value.grammar
  return m1StudyDone.value.vocabulary
}

function goToM1Section(sectionId) {
  if (!isM1SectionUnlocked(sectionId)) return
  m1StudySection.value = sectionId
  persistLocalState()
}

function syncM1StudyProgress() {
  const done = m1StudyDone.value
  const completed = (done.grammar ? 1 : 0) + (done.vocabulary ? 1 : 0) + (done.chat ? 1 : 0)
  phaseProgress.value.estudio = Math.round((completed / m1StudySections.length) * 100)
}

function completeM1Section(section) {
  if (section === 'grammar') {
    m1StudyDone.value.grammar = true
    if (m1StudySection.value === 'grammar') m1StudySection.value = 'vocabulary'
  } else if (section === 'vocabulary') {
    if (!m1StudyDone.value.grammar) return
    m1StudyDone.value.vocabulary = true
    if (m1StudySection.value === 'vocabulary') m1StudySection.value = 'chat'
  } else if (section === 'chat') {
    if (!m1StudyDone.value.vocabulary) return
    m1StudyDone.value.chat = true
  }
  syncM1StudyProgress()
  saveProgress()
}

function nextM1ChatMessage() {
  if (m1ChatVisibleCount.value >= m1ChatMessages.length) return
  m1ChatVisibleCount.value += 1
  if (m1ChatVisibleCount.value >= m1ChatMessages.length && !m1StudyDone.value.chat) {
    completeM1Section('chat')
  } else {
    persistLocalState()
  }
}

function validateStudyPhase() {
  if (!isStudyCompleted.value) return
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

const isPracticeCompleted = computed(() => isPrivilegedUser.value || phaseProgress.value.practica === 100)

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

function autoFillExamForAudit() {
  activeExamQuestions.value.forEach(q => {
    examAnswers.value[q.id] = q.correct
  })
  submitExam()
}

// -----------------------------------------------------------------
// POST-TEST GLOBAL INTEGRATOR (All 4 Modules + Pre/Post Contrast)
// -----------------------------------------------------------------
const showGlobalPostTestModal = ref(false)
const showCertificateModal = ref(false)
const globalPostTestSubmitted = ref(false)
const isSubmittingPostTest = ref(false)
const globalAnswers = ref({})
const globalScore = ref(0)
const preTestBaseline = ref(35)
const growthDelta = ref(0)
const moduleBreakdown = ref({ m1: 0, m2: 0, m3: 0, m4: 0 })
const certificateData = ref(null)

const globalQuestions = [
  {
    id: 'gq1',
    moduleKey: 'm1',
    moduleTag: 'MÓDULO 1 · RAP 1',
    title: 'Presentación y Saludos Clínicos',
    question: 'A British patient arrives at the hospital emergency room at 08:30 AM. Which formal greeting should the nurse use?',
    options: ['Good morning, sir. Welcome to our hospital.', 'Good evening, sir. See you later.', 'Good night, mister.'],
    correct: 'Good morning, sir. Welcome to our hospital.',
    explanation: 'Para la atención matutina en triaje u hospitalización se emplea "Good morning".'
  },
  {
    id: 'gq2',
    moduleKey: 'm1',
    moduleTag: 'MÓDULO 1 · RAP 1',
    title: 'Estructura Básica Oracional (Grammar Pill)',
    question: 'Listen to the clinical sentence and identify the correct syntactic structure (Subject + Verb + Complement):',
    audioText: 'The nurse prepares the daily medication.',
    hasAudio: true,
    options: ['The nurse (S) + prepares (V) + the daily medication (C)', 'Prepares (V) + the nurse (S) + medication (C)', 'The medication (C) + prepares (V) + nurse (S)'],
    correct: 'The nurse (S) + prepares (V) + the daily medication (C)',
    explanation: 'El orden estándar en inglés técnico es Sujeto (The nurse) + Verbo (prepares) + Complemento (the daily medication).'
  },
  {
    id: 'gq3',
    moduleKey: 'm2',
    moduleTag: 'MÓDULO 2 · RAP 2 y 3',
    title: 'Antecedentes y Pasado Simple (Mr. Thomas)',
    question: 'How do you correctly report Mr. Thomas\'s admission event using Past Simple verbs?',
    options: ['Yesterday, Mr. Thomas fell at the hotel and had an arm injury.', 'Yesterday, Mr. Thomas falls and is having injury.', 'Yesterday, Mr. Thomas will fall at the hotel.'],
    correct: 'Yesterday, Mr. Thomas fell at the hotel and had an arm injury.',
    explanation: 'Para hechos ocurridos en el pasado se usan las formas irregulares "fell" (caer) y "had" (tener).'
  },
  {
    id: 'gq4',
    moduleKey: 'm2',
    moduleTag: 'MÓDULO 2 · RAP 2 y 3',
    title: 'Adjetivos Descriptivos y Signos Actuales',
    question: 'Which sentence accurately describes the patient\'s current state in Room 204?',
    options: ['He is pale, feels dizzy, and his right arm is swollen.', 'He is run quickly and happily.', 'He was surgery next week.'],
    correct: 'He is pale, feels dizzy, and his right arm is swollen.',
    explanation: '"Pale" (pálido), "dizzy" (mareado) y "swollen" (hinchado) son adjetivos descriptivos del estado actual.'
  },
  {
    id: 'gq5',
    moduleKey: 'm2',
    moduleTag: 'MÓDULO 2 · RAP 2 y 3',
    title: 'Comprensión de Entrega de Turno (Handover Report)',
    question: 'Listen to the handover audio snippet and select the correct report summary:',
    audioText: 'Handover report: Mr. Thomas in room 204 has vital signs stable and resting in bed.',
    hasAudio: true,
    options: ['Mr. Thomas in room 204 has stable vital signs and is resting.', 'Mr. Thomas was discharged this morning.', 'Mr. Thomas has acute emergency in room 101.'],
    correct: 'Mr. Thomas in room 204 has stable vital signs and is resting.',
    explanation: 'El reporte de entrega confirma signos estables y reposo en la habitación 204.'
  },
  {
    id: 'gq6',
    moduleKey: 'm3',
    moduleTag: 'MÓDULO 3 · RAP 4 y 5',
    title: 'Acciones en Progreso Clínico (Present Continuous)',
    question: 'Mr. Thomas\'s daughter asks what the nurse is doing right now. How should the nurse answer in Present Continuous?',
    options: ['"We are checking his blood pressure and monitoring his heart rate right now."', '"We checked his pressure yesterday morning."', '"We check him next Monday."'],
    correct: '"We are checking his blood pressure and monitoring his heart rate right now."',
    explanation: 'El Presente Continuo (am/is/are + -ing) comunica lo que se está ejecutando en el momento presente.'
  },
  {
    id: 'gq7',
    moduleKey: 'm3',
    moduleTag: 'MÓDULO 3 · RAP 4 y 5',
    title: 'Propuesta de Mejora al Supervisor (Polite Suggestions)',
    question: 'How do you politely suggest an improvement to the Nurse Manager regarding the vital signs checklist?',
    options: ['"I think we should digitize the nursing checklist to reduce charting time."', '"You must change the paper immediately."', '"Stop using checklists right now."'],
    correct: '"I think we should digitize the nursing checklist to reduce charting time."',
    explanation: 'La fórmula de cortesía colaborativa es "I think we should..." (Creo que deberíamos...).'
  },
  {
    id: 'gq8',
    moduleKey: 'm3',
    moduleTag: 'MÓDULO 3 · RAP 4 y 5',
    title: 'Instrumental y Herramientas Hospitalarias',
    question: 'Which instrument is primarily used to listen to pulmonary and cardiovascular heart sounds?',
    options: ['Stethoscope', 'Thermometer', 'Wheelchair'],
    correct: 'Stethoscope',
    explanation: 'El estetoscopio (Stethoscope) es el instrumento utilizado para la auscultación cardíaca y pulmonar.'
  },
  {
    id: 'gq9',
    moduleKey: 'm4',
    moduleTag: 'MÓDULO 4 · RAP 6',
    title: 'Órdenes de Alta y Modales Médicos (Discharge Advice)',
    question: 'When giving discharge instructions to Mr. Thomas, which modal verb expresses a mandatory clinical necessity?',
    options: ['"You must take this antibiotic every 8 hours with meals."', '"You might take water."', '"You could dance tomorrow."'],
    correct: '"You must take this antibiotic every 8 hours with meals."',
    explanation: '"Must" expresa prescripción médica obligatoria e imperativa.'
  },
  {
    id: 'gq10',
    moduleKey: 'm4',
    moduleTag: 'MÓDULO 4 · RAP 6',
    title: 'Cierre y Verificación del Checklist de Egreso',
    question: 'What is the standard professional statement to confirm that all discharge criteria have been met?',
    options: ['"The pain level is low, vital signs are stable, and the discharge checklist is complete."', '"The patient wants to go but no checklist is done."', '"The doctor forgot the signature."'],
    correct: '"The pain level is low, vital signs are stable, and the discharge checklist is complete."',
    explanation: 'Confirma la resolución del dolor, estabilidad de constantes vitales y cierre de la lista de verificación.'
  }
]

async function openGlobalPostTest() {
  if (!auth.isAdmin && !auth.isInstructor) {
    const isModule4 = Number(moduleNumber.value) === 4
    const hasReachedCierre = currentPhase.value === 'evaluacion' || (phaseProgress.value.practica >= 100) || examPassed.value || (phaseProgress.value.evaluacion > 0)
    
    if (!isModule4 || !hasReachedCierre) {
      notificationStore.notify({
        type: 'warning',
        title: 'Acceso Restringido al POST-TEST',
        message: 'No puedes presentar el POST-TEST Global hasta haber llegado al Módulo 4 y completado sus fases previas hasta el Cierre.'
      })
      return
    }
  }

  showGlobalPostTestModal.value = true
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
    m1: Math.round((breakdownCount.m1.correct / (breakdownCount.m1.total || 1)) * 100),
    m2: Math.round((breakdownCount.m2.correct / (breakdownCount.m2.total || 1)) * 100),
    m3: Math.round((breakdownCount.m3.correct / (breakdownCount.m3.total || 1)) * 100),
    m4: Math.round((breakdownCount.m4.correct / (breakdownCount.m4.total || 1)) * 100),
  }

  // Generar datos locales para certificado de respaldo
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
        // Incrementar XP en el store local si aplica
        if (auth.user) {
          auth.user.xp = (auth.user.xp || 0) + 150
        }
      }
    } catch (err) {
      console.warn('Persistencia de Post-Test en backend completada con respaldo local:', err)
    }
  }

  // Guardar en almacenamiento local
  try {
    const key = `nursing_academy_post_test_${auth.user?.id || 'guest'}`
    localStorage.setItem(key, JSON.stringify({
      score: globalScore.value,
      preTestBaseline: preTestBaseline.value,
      delta: growthDelta.value,
      moduleBreakdown: moduleBreakdown.value,
      certificateData: certificateData.value,
      completedAt: new Date().toISOString()
    }))
  } catch {}

  globalPostTestSubmitted.value = true
  isSubmittingPostTest.value = false
}

function printCertificate() {
  window.print()
}

// -----------------------------------------------------------------
// Phase Navigation & Locks
// -----------------------------------------------------------------
function isPhaseLocked(phaseId) {
  if (isPrivilegedUser.value) return false
  if (phaseId === 'inicio') return false
  if (phaseId === 'estudio') return phaseProgress.value.inicio < 100
  if (phaseId === 'practica') return phaseProgress.value.estudio < 100
  if (phaseId === 'evaluacion') return phaseProgress.value.practica < 100
  return true
}

function goToPhase(phaseId) {
  if (!isPhaseLocked(phaseId)) {
    currentPhase.value = phaseId
    persistLocalState()
  }
}

function toggleSimulatedMediaFailure() {
  simulatedMediaFailure.value = !simulatedMediaFailure.value
  mediaWarningMessage.value = simulatedMediaFailure.value 
    ? 'Fallo al inicializar codec de audio/video. El módulo continuará en modo texto.' 
    : null
}

function getGrammarHighlightClass(type) {
  if (!type || !activeGrammarFilters.value.includes(type)) return ''
  if (type === 'subject') return 'bg-blue-100 text-blue-700 border-b border-blue-400 font-bold'
  if (type === 'verb') return 'bg-orange-100 text-orange-700 border-b border-orange-400 font-bold'
  if (type === 'complement') return 'bg-green-100 text-green-700 border-b border-green-400 font-bold'
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

const apiBaseUrl = getApiBaseUrl()

function buildProgressState() {
  return {
    currentPhase: currentPhase.value,
    phaseProgress: phaseProgress.value,
    videoCompleted: videoCompleted.value,
    introAcknowledged: introAcknowledged.value,
    objectivesConfirmed: objectivesConfirmed.value,
    gameSuccess: gameSuccess.value,
    warmupMatched: warmupCards.value.filter(c => c.matched).map(c => c.id),
    vocabPlayed: activeVocabList.value.map(v => ({ id: v.id, played: v.played })),
    m1Study: {
      section: m1StudySection.value,
      grammar: m1StudyDone.value.grammar,
      vocabulary: m1StudyDone.value.vocabulary,
      chat: m1StudyDone.value.chat,
      chatRead: m1ChatVisibleCount.value,
    },
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
}

function persistLocalState() {
  localStorage.setItem(storageKey.value, JSON.stringify(buildProgressState()))
}

async function saveProgress() {
  persistLocalState()

  // Persist to backend database if authenticated
  if (auth.token) {
    try {
      await fetch(`${apiBaseUrl}/api/courses/${courseId.value}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          phase: currentPhase.value,
          phasePercentage: Math.round(phaseProgress.value[currentPhase.value] || 0)
        })
      })
    } catch (err) {
      console.warn('Backend progress update failed, local storage preserved:', err)
    }
  }
}

async function loadProgress() {
  try {
    await checkCourseLockAndDetails()

    const raw = localStorage.getItem(storageKey.value)
    const hadLocal = Boolean(raw)
    if (!raw) {
      phaseProgress.value = { inicio: 0, estudio: 0, practica: 0, evaluacion: 0 }
      currentPhase.value = 'inicio'
      videoCompleted.value = false
      introAcknowledged.value = false
      objectivesConfirmed.value = false
      gameSuccess.value = null
      buildWarmupCards()
      voiceRecorded.value = false
      examPassed.value = false
      showBadgeAward.value = false
      examAnswers.value = {}
      m1StudySection.value = 'grammar'
      m1StudyDone.value = { grammar: false, vocabulary: false, chat: false }
      m1ChatVisibleCount.value = 0
    } else {
      const state = JSON.parse(raw)
      if (state.currentPhase) currentPhase.value = state.currentPhase
      if (state.phaseProgress) phaseProgress.value = state.phaseProgress
      if (state.videoCompleted !== undefined) videoCompleted.value = state.videoCompleted
      if (state.introAcknowledged !== undefined) introAcknowledged.value = state.introAcknowledged
      if (state.objectivesConfirmed !== undefined) objectivesConfirmed.value = state.objectivesConfirmed
      if (state.gameSuccess !== undefined) gameSuccess.value = state.gameSuccess
      buildWarmupCards()
      if (Array.isArray(state.warmupMatched)) {
        const matchedIds = state.warmupMatched
        warmupCards.value.forEach(card => { card.matched = matchedIds.includes(card.id) })
      } else if (Array.isArray(state.matchedPairs)) {
        // Migración desde el emparejamiento por clics
        warmupCards.value.forEach(card => { card.matched = state.matchedPairs.includes(card.label) })
      }
      if ((state.phaseProgress?.inicio || 0) >= 100) {
        restoreWarmupCompleted()
      }
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

      // Módulo 1 (HU17): restaurar secciones exploradas de la absorción
      if (state.m1Study && typeof state.m1Study === 'object') {
        if (state.m1Study.section) m1StudySection.value = state.m1Study.section
        m1StudyDone.value = {
          grammar: Boolean(state.m1Study.grammar),
          vocabulary: Boolean(state.m1Study.vocabulary),
          chat: Boolean(state.m1Study.chat),
        }
        m1ChatVisibleCount.value = Number(state.m1Study.chatRead) || 0
      } else if ((state.phaseProgress?.estudio || 0) >= 100) {
        // Migración: versiones previas completaban la fase al escuchar todo el vocabulario
        m1StudyDone.value = { grammar: true, vocabulary: true, chat: true }
        m1ChatVisibleCount.value = m1ChatMessages.length
      } else if ((state.phaseProgress?.estudio || 0) > 0) {
        m1StudyDone.value.grammar = true
        m1ChatVisibleCount.value = m1ChatMessages.length
      }
    }

    // Restaurar el progreso de la cuenta solo si no hay estado local en este navegador
    if (auth.token && !hadLocal) {
      const res = await fetch(`${apiBaseUrl}/api/courses/${courseId.value}/progress`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      if (res.ok) {
        const payload = await res.json()
        const dbProgress = payload?.data || payload
        if (dbProgress && dbProgress.phaseProgress) {
          phaseProgress.value = { ...phaseProgress.value, ...dbProgress.phaseProgress }
          if (dbProgress.currentPhase) currentPhase.value = dbProgress.currentPhase
          if ((dbProgress.phaseProgress.inicio || 0) >= 100) {
            restoreWarmupCompleted()
          }
        }
      }
    }

    // Cursos personalizados: reconstruir el estado visual desde el progreso de fases
    if (isCustomCourse.value) {
      if (phaseProgress.value.inicio === 100) {
        customWarmupPlaced.value = [...customWords.value]
        customWarmupPool.value = []
        gameSuccess.value = true
      }
      if (phaseProgress.value.estudio === 100) {
        customVocabHeard.value = [...customVocabulary.value]
        customExtraHeard.value = customSpeakingTarget.value ? [customSpeakingTarget.value] : []
        customProfileSuccess.value = true
      }
      if (phaseProgress.value.practica === 100) {
        customFillInput.value = customFillAnswer.value
        customVoiceDone.value = Boolean(customVoiceTarget.value)
      }
      if (phaseProgress.value.evaluacion === 100) {
        customExamPassed.value = true
        customExamChoice.value = customExamCorrect.value
        customExamSubmitted.value = true
      }
    }

    // Módulo 1: recalcular el % de la fase de estudio según las secciones completadas
    if (moduleNumber.value === 1) {
      syncM1StudyProgress()
      persistLocalState()
    }
  } catch (err) {
    console.error('Error loading progress:', err)
  }
}

watch(courseId, async () => {
  courseLoaded.value = false
  courseDetails.value = null
  await checkCourseLockAndDetails()
  checkVideoAsset()
  await loadProgress()
  fetchCourseActivities()
})

onMounted(async () => {
  checkVideoAsset()
  await checkCourseLockAndDetails()
  await loadProgress()
  fetchCourseActivities()

  // Si proviene del enlace de acceso directo al POST-TEST Global (?postTest=true)
  if (route.query.postTest === 'true') {
    if (auth.isAdmin || auth.isInstructor) {
      openGlobalPostTest()
    } else {
      const isModule4 = Number(moduleNumber.value) === 4
      const hasReachedCierre = currentPhase.value === 'evaluacion' || (phaseProgress.value.practica >= 100) || examPassed.value || (phaseProgress.value.evaluacion > 0)
      if (isModule4 && hasReachedCierre && !isCourseLocked.value) {
        openGlobalPostTest()
      } else {
        notificationStore.notify({
          type: 'warning',
          title: 'POST-TEST Global Bloqueado',
          message: 'Debes completar los módulos 1 a 3 y alcanzar la fase de Cierre del Módulo 4 antes de presentar este examen integrador.'
        })
      }
    }
  }
})
</script>

<style scoped>
.linear {
  transition-timing-function: linear;
}
.card-reset {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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

@media print {
  body * {
    visibility: hidden;
  }
  #printableCertificate,
  #printableCertificate * {
    visibility: visible;
  }
  #printableCertificate {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 24px;
    border: 3px double #d97706;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
