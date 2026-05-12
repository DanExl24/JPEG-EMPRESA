<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <nav>
        <ul>
          <li v-for="item in menuLinks" :key="item.path">
            <router-link :to="item.path">{{ item.name }}</router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      <header>
        <h1>Panel de Control (Rol: {{ userRole }})</h1>
      </header>
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// 💡 POR AHORA: Cambia este valor a 'instructor' o 'learner' para ver cómo cambia el menú
const userRole = ref('admin')

const menus = {
  admin: [
    { name: 'Resumen', path: '/dashboard/admin/resumen' },
    { name: 'Gestión Usuarios', path: '/dashboard/admin/usuarios' }
  ],
  instructor: [
    { name: 'Mi Tablero', path: '/dashboard/instructor/resumen' }
  ],
  learner: [
    { name: 'Mis Estudios', path: '/dashboard/aprendiz/resumen' }
  ]
}

const menuLinks = computed(() => menus[userRole.value] || [])
</script>

<style scoped>
/* Estilos muy básicos para que notes la separación entre menú y contenido */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar a {
  color: #ecf0f1;
  text-decoration: none;
  display: block;
  padding: 10px 0;
}
.sidebar a.router-link-active {
  font-weight: bold;
  color: #42b983; /* Color verde Vue cuando está activo */
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
header {
  background-color: #ecf0f1;
  padding: 20px;
  border-bottom: 1px solid #bdc3c7;
}
header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}
.content {
  padding: 20px;
}
</style>
