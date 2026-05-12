import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LoginView from '../views/LoginView.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: LoginView },
  
  // Ruta Base del Dashboard Dinámico
  {
    path: '/dashboard',
    component: DashboardLayout,
    redirect: '/dashboard/admin/resumen', // 👈 REDIRECCIÓN AÑADIDA para que no quede en blanco
    children: [
      // --- Vistas de Admin ---
      { path: 'admin/resumen', component: () => import('../views/admin/AdminResumen.vue') },
      { path: 'admin/usuarios', component: () => import('../views/admin/AdminUsuarios.vue') },
      
      // --- Vistas de Instructor ---
      { path: 'instructor/resumen', component: () => import('../views/instructor/InstructorResumen.vue') },
      
      // --- Vistas de Aprendiz ---
      { path: 'aprendiz/resumen', component: () => import('../views/learner/LearnerResumen.vue') }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})