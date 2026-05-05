<script setup>
const nurseImg = '/nurse.png'
const cardiologiaImg = '/cardiologia.png'
const farmacologiaImg = '/farmacologia.png'
const comunicacionImg = '/comunicacion.png'
</script>

<template>
  <div class="min-h-screen bg-white font-quicksand">

    <!-- NAVBAR -->
    <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
        </div>
        <div class="leading-tight">
          <span class="font-bold text-gray-900 text-base">Nurse</span>
          <span class="font-bold text-violet-600 text-base">Play</span>
        </div>
      </div>

      <!-- Nav links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="#" class="hover:text-violet-600 transition-colors">Cómo funciona</a>
        <a href="#" class="hover:text-violet-600 transition-colors">Juegos</a>
        <a href="#" class="hover:text-violet-600 transition-colors">Precios</a>
        <a href="#" class="hover:text-violet-600 transition-colors">Recursos</a>
      </div>

      <!-- CTA -->
      <button class="border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
        Iniciar sesión
      </button>
    </nav>

    <!-- HERO -->
    <section class="bg-slate-100 overflow-hidden">
      <div class="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-8 min-h-[580px]">

        <!-- Left: text -->
        <div class="flex-1 z-10">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-600 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <svg class="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
            Gamified Learning
          </div>

          <!-- Heading -->
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Aprende<br>
            enfermería en<br>
            inglés <span class="text-violet-600">jugando</span>
          </h1>

          <p class="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
            Domina términos médicos, protocolos clínicos y comunicación con pacientes mediante actividades interactivas diseñadas por expertos en educación sanitaria.
          </p>

          <!-- Buttons -->
          <div class="flex items-center gap-4 mb-8">
            <button class="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              Empezar ahora
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="border border-gray-300 bg-white hover:border-violet-600 text-gray-700 hover:text-violet-600 font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              Probar juegos
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </button>
          </div>

          <!-- Social proof -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-rose-300 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-white">A</div>
              <div class="w-8 h-8 rounded-full bg-sky-400 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-white">B</div>
              <div class="w-8 h-8 rounded-full bg-amber-400 border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-white">C</div>
            </div>
            <span class="text-sm text-gray-600"><strong>+2,400</strong> estudiantes activos esta semana</span>
            <span class="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              NEW RECORD
            </span>
          </div>
        </div>

        <!-- Right: nurse image -->
        <div class="flex-1 flex justify-center items-center">
          <img
            :src="nurseImg"
            alt="Enfermera NursePlay"
            class="h-[500px] object-contain drop-shadow-xl"
          />
        </div>
      </div>
    </section>

    <!-- ACTIVIDADES DESTACADAS -->
    <section class="max-w-6xl mx-auto px-8 py-16">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold text-gray-900">Actividades Destacadas</h2>
        <a href="#" class="text-violet-600 text-sm font-semibold hover:underline flex items-center gap-1">
          Ver todo el catálogo
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
      <p class="text-gray-500 text-sm mb-10 max-w-lg">
        Explora diferentes formas de mejorar tus habilidades clínicas mientras te diviertes. Retos rápidos diseñados para encajar en tu jornada.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- Card 1: Crucigramas -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-44 bg-violet-100 flex items-center justify-center p-4">
            <div class="grid gap-1 font-mono text-xs font-bold">
              <div class="flex gap-1">
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">H</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">E</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">A</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">R</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">T</div>
              </div>
              <div class="flex gap-1">
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">L</div>
                <div class="w-7 h-7 bg-violet-600 rounded"></div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">G</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">G</div>
                <div class="w-7 h-7 bg-violet-600 rounded"></div>
              </div>
              <div class="flex gap-1">
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">L</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">I</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">V</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">E</div>
                <div class="w-7 h-7 bg-white border border-violet-300 flex items-center justify-center text-violet-700 rounded">R</div>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 mb-1">Crucigramas médicos</h3>
            <p class="text-gray-500 text-xs mb-4 leading-relaxed">
              Refuerza anatomía y terminología técnica completando paneles interactivos.
            </p>
            <button class="w-full border border-violet-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 text-violet-600 text-sm font-semibold py-2 rounded-lg transition-colors">
              Jugar
            </button>
          </div>
        </div>

        <!-- Card 2: Quiz -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-44 bg-green-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl p-3 shadow-sm w-full max-w-xs">
              <p class="text-xs font-semibold text-gray-700 mb-3">Which vital sign is measured using a stethoscope?</p>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <span class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-xs">A</span>
                  Blood pressure
                </div>
                <div class="flex items-center gap-2 text-xs bg-green-100 text-green-700 font-semibold rounded-lg px-2 py-1">
                  <span class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">B</span>
                  Heart rate
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <span class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-xs">C</span>
                  Respiratory rate
                </div>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 mb-1">Quiz interactivos</h3>
            <p class="text-gray-500 text-xs mb-4 leading-relaxed">
              Pon a prueba tus conocimientos diagnósticos con preguntas de opción múltiple.
            </p>
            <button class="w-full border border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500 text-green-600 text-sm font-semibold py-2 rounded-lg transition-colors">
              Jugar
            </button>
          </div>
        </div>

        <!-- Card 3: Relacionar términos -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-44 bg-amber-50 flex items-center justify-center p-4">
            <div class="w-full flex items-center justify-between gap-2 text-xs">
              <div class="space-y-2">
                <div class="bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-lg whitespace-nowrap">Fever</div>
                <div class="bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-lg whitespace-nowrap">Chest pain</div>
                <div class="bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-lg whitespace-nowrap">Nausea</div>
                <div class="bg-amber-100 text-amber-800 font-semibold px-2 py-1 rounded-lg whitespace-nowrap">Fatigue</div>
              </div>
              <div class="flex flex-col items-center gap-3 text-amber-300">
                <span>—</span><span>—</span><span>—</span><span>—</span>
              </div>
              <div class="space-y-2">
                <div class="bg-white border border-amber-200 text-gray-600 px-2 py-1 rounded-lg text-xs whitespace-nowrap">Pneumonia</div>
                <div class="bg-white border border-amber-200 text-gray-600 px-2 py-1 rounded-lg text-xs whitespace-nowrap">Myocardial</div>
                <div class="bg-white border border-amber-200 text-gray-600 px-2 py-1 rounded-lg text-xs whitespace-nowrap">Gastroenteritis</div>
                <div class="bg-white border border-amber-200 text-gray-600 px-2 py-1 rounded-lg text-xs whitespace-nowrap">Anemia</div>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 mb-1">Relacionar términos</h3>
            <p class="text-gray-500 text-xs mb-4 leading-relaxed">
              Conecta síntomas con patologías y tratamientos en tiempos récord.
            </p>
            <button class="w-full border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-amber-600 text-sm font-semibold py-2 rounded-lg transition-colors">
              Jugar
            </button>
          </div>
        </div>

        <!-- Card 4: Completar frases -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-44 bg-gray-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl p-3 shadow-sm w-full">
              <p class="text-xs text-gray-700 leading-relaxed mb-3">
                The patient is experiencing <span class="border-b-2 border-violet-400 px-3 text-violet-600 font-semibold">_____</span> shortness of breath and <span class="border-b-2 border-violet-400 px-3 text-violet-600 font-semibold">_____</span> pain.
              </p>
              <div class="flex flex-wrap gap-1">
                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">mild</span>
                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">acute</span>
                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">chronic</span>
                <span class="bg-violet-600 text-white px-2 py-1 rounded text-xs">severe</span>
              </div>
            </div>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 mb-1">Completar frases</h3>
            <p class="text-gray-500 text-xs mb-4 leading-relaxed">
              Aprende a redactar reportes clínicos rellenando los huecos correctamente.
            </p>
            <button class="w-full border border-gray-200 hover:bg-gray-700 hover:text-white hover:border-gray-700 text-gray-600 text-sm font-semibold py-2 rounded-lg transition-colors">
              Jugar
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- FEATURES STRIP -->
    <section class="border-t border-gray-100 py-10">
      <div class="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Aprendizaje</p>
            <p class="text-gray-500 text-xs">basado en juegos</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Contenido creado por</p>
            <p class="text-gray-500 text-xs">enfermeros expertos</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Mejora continua</p>
            <p class="text-gray-500 text-xs">y motivadora</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">Perfecto para</p>
            <p class="text-gray-500 text-xs">cualquier horario</p>
          </div>
        </div>

      </div>
    </section>

    <!-- PROFILE + RANKING -->
    <section class="max-w-6xl mx-auto px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Profile card -->
        <div class="bg-violet-600 rounded-2xl p-6 text-white">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-violet-400 border-4 border-violet-300 flex items-center justify-center text-2xl">
              👩‍⚕️
            </div>
            <div>
              <p class="font-bold text-lg">¡Hola, Sarah!</p>
              <p class="text-xs text-violet-200">Rango: Nurse Resident</p>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="font-bold">Nivel 24</span>
              <span class="text-violet-200 text-xs">2,400 XP</span>
            </div>
            <div class="w-full bg-violet-500 rounded-full h-2">
              <div class="bg-white h-2 rounded-full" style="width: 62%"></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-violet-700 bg-opacity-50 rounded-xl p-3 text-center">
              <div class="text-xl mb-1">🏅</div>
              <p class="text-xs text-violet-200">18 MEDALLAS</p>
            </div>
            <div class="bg-violet-700 bg-opacity-50 rounded-xl p-3 text-center">
              <div class="text-xl mb-1">⚡</div>
              <p class="text-xs text-violet-200">8 ÍTEMS</p>
            </div>
          </div>

          <button class="w-full bg-white text-violet-700 font-semibold text-sm py-3 rounded-xl hover:bg-violet-50 transition-colors">
            Ver mi perfil completo
          </button>
        </div>

        <!-- Ranking Global -->
        <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Ranking Global</h3>
            <div class="flex gap-2">
              <button class="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg">Semanal</button>
              <button class="text-xs font-semibold text-gray-500 hover:text-violet-600 px-3 py-1 rounded-lg transition-colors">Histórico</button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="text-gray-400 font-bold text-sm w-4">1</span>
              <div class="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">JW</div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 text-sm">Julian Walters</p>
                <p class="text-gray-400 text-xs">Nurse Specialist</p>
              </div>
              <span class="font-bold text-gray-800 text-sm">15,840</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-400 font-bold text-sm w-4">2</span>
              <div class="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-sm font-bold text-rose-700">ER</div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 text-sm">Elena Rodriguez</p>
                <p class="text-gray-400 text-xs">Medical Student</p>
              </div>
              <span class="font-bold text-gray-800 text-sm">14,210</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-400 font-bold text-sm w-4">3</span>
              <div class="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold text-green-700">MT</div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 text-sm">Mark Thompson</p>
                <p class="text-gray-400 text-xs">Care Assistant</p>
              </div>
              <span class="font-bold text-gray-800 text-sm">12,900</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TUS CURSOS -->
    <section class="max-w-6xl mx-auto px-8 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Tus Cursos</h2>
      <p class="text-gray-500 text-sm mb-8">Continúa donde lo dejaste y domina nuevas especialidades.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- Cardiología -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-40 bg-gradient-to-br from-blue-400 to-blue-700 relative flex items-center justify-center">
            <span class="absolute top-3 left-3 bg-blue-900 bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-lg">INTERMEDIO</span>
            <img :src="cardiologiaImg" alt="" class="w-full h-full object-cover">
          </div>
          <div class="p-5">
            <h4 class="font-bold text-gray-900 mb-3">Cardiología en Inglés</h4>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span><span>65%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div class="bg-violet-500 h-2 rounded-full" style="width: 65%"></div>
            </div>
            <button class="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              Continuar
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <!-- Farmacología -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-40 bg-gradient-to-br from-gray-600 to-gray-900 relative flex items-center justify-center">
            <span class="absolute top-3 left-3 bg-gray-800 bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded-lg">AVANZADO</span>
            <img :src="farmacologiaImg" alt="" class="w-full h-full object-cover">
          </div>
          <div class="p-5">
            <h4 class="font-bold text-gray-900 mb-3">Farmacología Aplicada</h4>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span><span>52%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div class="bg-green-500 h-2 rounded-full" style="width: 52%"></div>
            </div>
            <button class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              Continuar
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <!-- Comunicación -->
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="h-40 bg-gradient-to-br from-sky-400 to-sky-700 relative flex items-center justify-center">
            <span class="absolute top-3 left-3 bg-sky-900 bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-lg">BÁSICO</span>
            <img :src="comunicacionImg" alt="" class="w-full h-full object-cover">
          </div>
          <div class="p-5">
            <h4 class="font-bold text-gray-900 mb-3">Comunicación con Pacientes</h4>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span><span>88%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div class="bg-violet-500 h-2 rounded-full" style="width: 88%"></div>
            </div>
            <button class="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              Continuar
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- FEATURES 3 COL -->
    <section class="max-w-6xl mx-auto px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div class="flex flex-col items-start gap-3">
          <div class="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <h3 class="font-bold text-gray-900">Aprender jugando</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            Olvídate de las clases aburridas. Nuestra metodología gamificada te mantiene motivado y comprometido con tu aprendizaje diario.
          </p>
        </div>

        <div class="flex flex-col items-start gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="font-bold text-gray-900">Seguimiento en tiempo real</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            Visualiza tu progreso, identifica tus áreas de mejora y recibe recomendaciones personalizadas basadas en tu desempeño.
          </p>
        </div>

        <div class="flex flex-col items-start gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="font-bold text-gray-900">Comunidad Global</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            Conéctate con otros profesionales de enfermería de todo el mundo y compite sanamente en nuestros rankings globales.
          </p>
        </div>

      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="mx-8 mb-12 rounded-3xl bg-gray-900 text-white text-center py-20 px-8">
      <h2 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        Únete y mejora tu<br>inglés médico hoy
      </h2>
      <p class="text-gray-400 text-sm mb-8">
        Miles de enfermeros ya están transformando su carrera. ¿Estás listo para el siguiente nivel?
      </p>
      <button class="bg-violet-500 hover:bg-violet-400 text-white font-semibold px-8 py-3 rounded-full transition-colors">
        Registrarse ahora gratis
      </button>
    </section>

    <!-- FOOTER -->
    <footer class="border-t border-gray-100 px-8 py-6 flex items-center justify-between text-sm text-gray-400">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
        </div>
        <span class="font-bold text-gray-700 text-sm">NursePlay</span>
      </div>
      <p class="text-xs hidden md:block">© 2026 NursePlay. Precision in Nursing Education.</p>
      <div class="flex gap-4 text-xs">
        <a href="#" class="hover:text-violet-600 transition-colors">Privacidad</a>
        <a href="#" class="hover:text-violet-600 transition-colors">Términos</a>
        <a href="#" class="hover:text-violet-600 transition-colors">Contacto</a>
      </div>
    </footer>

  </div>
</template>
