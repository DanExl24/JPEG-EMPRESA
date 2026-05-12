<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Cursos</h2>
        <p class="text-gray-500 mt-1">{{ auth.isAdmin ? 'Gestiona todos los cursos de la plataforma.' : 'Explora y continúa tu aprendizaje.' }}</p>
      </div>
      <button v-if="auth.isAdmin || auth.isInstructor" class="flex items-center gap-2 px-4 py-2 bg-[#006688] text-white rounded-xl text-sm font-semibold hover:bg-[#004e69] transition-colors">
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
      <div v-for="course in courses" :key="course.id" class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
        <div :class="`h-36 flex items-center justify-center ${course.bg}`">
          <span class="material-symbols-outlined text-6xl opacity-60" :style="`color: ${course.iconColor}`">{{ course.icon }}</span>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span :class="`text-xs font-bold px-2 py-1 rounded-full ${course.categoryBg} ${course.categoryText}`">{{ course.category }}</span>
            <span class="text-xs text-gray-400">{{ course.duration }}</span>
          </div>
          <h4 class="font-bold text-gray-800 mb-1">{{ course.title }}</h4>
          <p class="text-xs text-gray-500 mb-3">{{ course.description }}</p>
          <div v-if="!auth.isAdmin" class="mb-3">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{{ course.progress }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="h-1.5 rounded-full bg-[#006688] transition-all" :style="`width: ${course.progress}%`"></div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span class="material-symbols-outlined text-sm">group</span>
              {{ course.students }} estudiantes
            </div>
            <button class="text-xs font-semibold text-[#006688] hover:underline">
              {{ auth.isAdmin || auth.isInstructor ? 'Editar' : 'Continuar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const activeFilter = ref('Todos')
const filters = ['Todos', 'En Progreso', 'Completados', 'Nuevos']

const courses = [
  { id: 1, title: 'Fundamentos de Enfermería', description: 'Bases esenciales para el ejercicio profesional de la enfermería clínica.', category: 'Básico', categoryBg: 'bg-blue-100', categoryText: 'text-blue-700', duration: '12h', students: 340, progress: 75, icon: 'medical_services', bg: 'bg-blue-50', iconColor: '#3b82f6' },
  { id: 2, title: 'Farmacología Clínica', description: 'Principios de medicamentos, dosificación y administración segura.', category: 'Intermedio', categoryBg: 'bg-orange-100', categoryText: 'text-orange-700', duration: '18h', students: 215, progress: 30, icon: 'medication', bg: 'bg-orange-50', iconColor: '#f97316' },
  { id: 3, title: 'Cuidados Críticos UCI', description: 'Atención intensiva a pacientes en estado crítico y monitoreo.', category: 'Avanzado', categoryBg: 'bg-red-100', categoryText: 'text-red-700', duration: '24h', students: 98, progress: 10, icon: 'monitor_heart', bg: 'bg-red-50', iconColor: '#ef4444' },
  { id: 4, title: 'Salud Mental y Psiquiatría', description: 'Abordaje integral del paciente con trastornos mentales.', category: 'Intermedio', categoryBg: 'bg-purple-100', categoryText: 'text-purple-700', duration: '15h', students: 178, progress: 0, icon: 'psychology', bg: 'bg-purple-50', iconColor: '#8b5cf6' },
  { id: 5, title: 'Atención Materno-Infantil', description: 'Cuidados durante el embarazo, parto y el recién nacido.', category: 'Especialidad', categoryBg: 'bg-pink-100', categoryText: 'text-pink-700', duration: '20h', students: 262, progress: 100, icon: 'child_care', bg: 'bg-pink-50', iconColor: '#ec4899' },
  { id: 6, title: 'Urgencias y Emergencias', description: 'Protocolos de actuación ante situaciones de emergencia médica.', category: 'Avanzado', categoryBg: 'bg-red-100', categoryText: 'text-red-700', duration: '16h', students: 143, progress: 55, icon: 'emergency', bg: 'bg-yellow-50', iconColor: '#f59e0b' },
]
</script>
