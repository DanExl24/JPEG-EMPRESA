<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#006688] text-3xl">manage_accounts</span>
          Gestión de Usuarios
        </h2>
        <p class="text-gray-500 text-sm mt-1">
          Administra los accesos, roles, credenciales y estado de todos los miembros de la plataforma.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          title="Actualizar lista de usuarios"
        >
          <span
            class="material-symbols-outlined text-base"
            :class="{ 'animate-spin': loading }"
            >refresh</span
          >
          <span class="hidden sm:inline">Refrescar</span>
        </button>

        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#006688] text-white rounded-xl text-sm font-semibold hover:bg-[#004e69] active:scale-95 transition-all shadow-md shadow-[#006688]/20"
        >
          <span class="material-symbols-outlined text-lg">person_add</span>
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="s in summary"
        :key="s.label"
        class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            :class="`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`"
          >
            <span
              class="material-symbols-outlined text-xl"
              :style="`color:${s.iconColor}`"
              >{{ s.icon }}</span
            >
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
            {{ s.percentage }}%
          </span>
        </div>
        <p class="text-2xl font-black text-gray-800 tracking-tight">{{ s.count }}</p>
        <p class="text-xs font-medium text-gray-500 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <!-- Users Table & Controls -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Filters and Search -->
      <div class="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-gray-50/50">
        <div class="w-full md:flex-1 relative">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
            >search</span
          >
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre, correo o cédula..."
            class="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-sm outline-none border border-gray-200 focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/20 transition-all"
          />
          <button
            v-if="search"
            @click="search = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            title="Limpiar búsqueda"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <!-- Filtro por Rol -->
          <div class="relative flex-1 sm:flex-initial">
            <select
              v-model="filterRole"
              class="w-full sm:w-44 pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="instructor">Instructores</option>
              <option value="aprendiz">Aprendices</option>
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
          </div>

          <!-- Filtro por Ficha / Cohorte -->
          <div class="relative flex-1 sm:flex-initial">
            <select
              v-model="filterCohort"
              class="w-full sm:w-48 pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#006688] focus:ring-2 focus:ring-[#006688]/20 appearance-none transition-all cursor-pointer truncate"
            >
              <option value="">Todas las fichas</option>
              <option v-for="ficha in availableCohorts" :key="'filter-c-' + ficha.id" :value="ficha.id">
                Ficha {{ ficha.cohort_number }}
              </option>
            </select>
            <span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">expand_more</span>
          </div>

          <div class="text-xs font-semibold text-gray-500 whitespace-nowrap bg-white px-3 py-2 rounded-xl border border-gray-200">
            Total: <span class="text-[#006688] font-bold">{{ filteredUsers.length }}</span>
          </div>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 text-left border-b border-gray-100">
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Usuario
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Documento
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Rol
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Ficha / Formación
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Cursos
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Gamificación
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                Estado
              </th>
              <th class="text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5 text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <!-- Loading Skeleton -->
          <tbody v-if="loading && users.length === 0" class="divide-y divide-gray-50">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                  <div class="space-y-1.5">
                    <div class="w-32 h-3.5 bg-gray-200 rounded"></div>
                    <div class="w-40 h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4"><div class="w-20 h-4 bg-gray-200 rounded"></div></td>
              <td class="px-5 py-4"><div class="w-16 h-5 bg-gray-200 rounded-full"></div></td>
              <td class="px-5 py-4"><div class="w-24 h-5 bg-gray-200 rounded-md"></div></td>
              <td class="px-5 py-4"><div class="w-12 h-4 bg-gray-200 rounded"></div></td>
              <td class="px-5 py-4"><div class="w-16 h-4 bg-gray-200 rounded"></div></td>
              <td class="px-5 py-4"><div class="w-14 h-4 bg-gray-200 rounded"></div></td>
              <td class="px-5 py-4 text-right"><div class="w-16 h-8 bg-gray-200 rounded-lg ml-auto"></div></td>
            </tr>
          </tbody>

          <!-- Real Users List -->
          <tbody v-else-if="filteredUsers.length > 0" class="divide-y divide-gray-50">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-slate-50/80 transition-colors group"
            >
              <!-- Usuario (Avatar, Nombre, Correo) -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    :class="`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-black/5 shadow-sm ${user.avatarBg || 'bg-blue-50'}`"
                    :style="`color:${user.avatarColor || '#006688'}`"
                  >
                    {{ user.initials || 'U' }}
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <p class="text-sm font-bold text-gray-800 group-hover:text-[#006688] transition-colors">
                        {{ user.name }}
                      </p>
                      <span
                        v-if="user.id === auth.user?.id"
                        class="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md"
                        >Tú</span
                      >
                    </div>
                    <p class="text-xs text-gray-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Documento Cédula -->
              <td class="px-5 py-4 text-sm font-mono font-medium text-gray-600">
                <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <span class="material-symbols-outlined text-[13px] text-gray-400">badge</span>
                  {{ user.cedula || 'N/A' }}
                </span>
              </td>

              <!-- Rol -->
              <td class="px-5 py-4">
                <span
                  :class="`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${user.roleBg || 'bg-gray-100'} ${user.roleText || 'text-gray-700'} shadow-sm`"
                >
                  <span class="material-symbols-outlined text-xs">
                    {{ user.role === 'admin' ? 'admin_panel_settings' : user.role === 'instructor' ? 'school' : 'person' }}
                  </span>
                  {{ user.roleLabel || user.role }}
                </span>
              </td>

              <!-- Ficha / Formación -->
              <td class="px-5 py-4">
                <!-- Aprendiz -->
                <template v-if="user.role === 'aprendiz'">
                  <span
                    v-if="user.cohortNumber"
                    class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs"
                    :title="`Programa: ${user.programName || 'Formación SENA'}`"
                  >
                    <span class="material-symbols-outlined text-xs text-teal-600">groups</span>
                    Ficha {{ user.cohortNumber }}
                  </span>
                  <span v-else class="text-xs text-gray-400 italic">
                    Sin ficha
                  </span>
                </template>

                <!-- Instructor -->
                <template v-else-if="user.role === 'instructor'">
                  <div v-if="user.cohortCount > 0" class="flex flex-col gap-0.5">
                    <span
                      class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs w-fit cursor-default"
                      :title="(user.instructedCohorts || []).map(c => `Ficha ${c.cohort_number} (${c.programName || 'SENA'})`).join('\n')"
                    >
                      <span class="material-symbols-outlined text-xs text-indigo-600">school</span>
                      {{ user.cohortCount }} {{ user.cohortCount === 1 ? 'ficha' : 'fichas' }}
                    </span>
                    <span class="text-[10px] text-gray-400 font-medium truncate max-w-[160px]">
                      {{ (user.instructedCohorts || []).map(c => c.cohort_number).join(', ') }}
                    </span>
                  </div>
                  <span v-else class="text-xs text-gray-400 italic">
                    Sin fichas
                  </span>
                </template>

                <!-- Admin -->
                <template v-else>
                  <span class="text-xs text-gray-300 font-mono pl-2">—</span>
                </template>
              </td>

              <!-- Cursos -->
              <td class="px-5 py-4 text-sm text-gray-600 font-medium">
                <span class="inline-flex items-center gap-1 text-xs text-gray-600">
                  <span class="material-symbols-outlined text-sm text-gray-400">book</span>
                  {{ user.courses }} {{ user.courses === 1 ? 'curso' : 'cursos' }}
                </span>
              </td>

              <!-- Gamificación XP -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg">
                  <span class="material-symbols-outlined text-sm text-amber-500">military_tech</span>
                  {{ user.xp || 0 }} XP
                </span>
              </td>

              <!-- Estado -->
              <td class="px-5 py-4">
                <span
                  :class="`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="user.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'"
                  ></span>
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openEditModal(user)"
                    class="p-2 rounded-xl text-gray-400 hover:text-[#006688] hover:bg-blue-50/80 transition-all"
                    title="Editar usuario"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="openDeleteModal(user)"
                    :disabled="user.id === auth.user?.id"
                    :class="[
                      'p-2 rounded-xl transition-all',
                      user.id === auth.user?.id
                        ? 'opacity-25 cursor-not-allowed text-gray-300'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    ]"
                    :title="user.id === auth.user?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Empty State -->
          <tbody v-else>
            <tr>
              <td colspan="7" class="px-5 py-12 text-center">
                <div class="max-w-sm mx-auto flex flex-col items-center">
                  <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <span class="material-symbols-outlined text-3xl">person_search</span>
                  </div>
                  <h4 class="text-base font-bold text-gray-800">No se encontraron usuarios</h4>
                  <p class="text-xs text-gray-500 mt-1">
                    {{
                      search || filterRole
                        ? 'Ningún usuario coincide con los filtros aplicados.'
                        : 'Aún no hay usuarios registrados en el sistema.'
                    }}
                  </p>
                  <button
                    v-if="search || filterRole"
                    @click="resetFilters"
                    class="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== MODAL CREAR USUARIO ==================== -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-[#006688]/10 text-[#006688] flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">person_add</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-800">Crear Nuevo Usuario</h3>
              <p class="text-xs text-gray-400">Registra un nuevo miembro asignando rol y credenciales</p>
            </div>
          </div>
          <button
            @click="closeCreateModal"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleCreateUser" class="p-6 space-y-4">
          <!-- Selector de Rol -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Rol del Usuario <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="createForm.rol = 'APRENDIZ'"
                :class="[
                  'py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  createForm.rol === 'APRENDIZ'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">person</span>
                Aprendiz
              </button>
              <button
                type="button"
                @click="createForm.rol = 'INSTRUCTOR'"
                :class="[
                  'py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  createForm.rol === 'INSTRUCTOR'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">school</span>
                Instructor
              </button>
              <button
                type="button"
                @click="createForm.rol = 'ADMIN'"
                :class="[
                  'py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  createForm.rol === 'ADMIN'
                    ? 'border-red-500 bg-red-50/70 text-red-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
                Administrador
              </button>
            </div>
          </div>

          <!-- Asignación de Ficha para Aprendiz -->
          <div v-if="createForm.rol === 'APRENDIZ'" class="space-y-1.5 p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl animate-fade-in">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-700">groups</span>
                Ficha de Formación (Cohorte)
              </label>
              <span class="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                SENA
              </span>
            </div>
            <select
              v-model="createForm.cohortId"
              class="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-medium cursor-pointer"
            >
              <option :value="null">-- Sin asignar ficha por ahora --</option>
              <optgroup
                v-for="group in cohortsGroupedByProgram"
                :key="'create-grp-' + group.programName"
                :label="group.programName"
              >
                <option
                  v-for="ficha in group.cohorts"
                  :key="'create-f-' + ficha.id"
                  :value="ficha.id"
                >
                  Ficha {{ ficha.cohort_number }} ({{ group.programName }})
                </option>
              </optgroup>
            </select>
            <p class="text-[11px] text-emerald-800/80">
              El aprendiz quedará formalmente matriculado y vinculado a esta ficha.
            </p>
          </div>

          <!-- Asignación de Múltiples Fichas para Instructor -->
          <div v-if="createForm.rol === 'INSTRUCTOR'" class="space-y-2 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl animate-fade-in">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-blue-700">school</span>
                Fichas donde imparte clase ({{ createForm.cohortIds.length }})
              </label>
              <span class="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full">
                Múltiples fichas
              </span>
            </div>
            <p class="text-[11px] text-blue-800/80">
              Selecciona todas las fichas de formación en las que este instructor repartirá clase:
            </p>
            <div v-if="availableCohorts.length > 0" class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              <label
                v-for="ficha in availableCohorts"
                :key="'create-inst-f-' + ficha.id"
                class="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-gray-200 hover:border-[#006688] cursor-pointer transition-all shadow-2xs"
              >
                <input
                  type="checkbox"
                  :value="ficha.id"
                  v-model="createForm.cohortIds"
                  class="rounded text-[#006688] focus:ring-[#006688] w-4 h-4 cursor-pointer"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-gray-800">Ficha {{ ficha.cohort_number }}</span>
                    <span v-if="ficha.program?.name" class="text-[10px] font-medium text-gray-400 truncate">· {{ ficha.program.name }}</span>
                  </div>
                </div>
              </label>
            </div>
            <p v-else class="text-xs text-gray-400 italic">No hay fichas creadas aún en el currículo.</p>
          </div>

          <!-- Nombres y Apellidos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Nombres <span class="text-red-500">*</span>
              </label>
              <input
                v-model="createForm.nombre"
                type="text"
                placeholder="Ej: Laura Camila"
                required
                class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Apellidos <span class="text-red-500">*</span>
              </label>
              <input
                v-model="createForm.apellido"
                type="text"
                placeholder="Ej: Montoya Restrepo"
                required
                class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
              />
            </div>
          </div>

          <!-- Cédula / Documento -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Documento de Identidad / Cédula <span class="text-red-500">*</span>
            </label>
            <input
              v-model="createForm.cedula"
              type="text"
              placeholder="Ej: 1020304050"
              required
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
            />
          </div>

          <!-- Correo Electrónico -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Correo Electrónico <span class="text-red-500">*</span>
            </label>
            <input
              v-model="createForm.correo"
              type="email"
              placeholder="usuario@nursingacademy.edu.co"
              required
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            />
          </div>

          <!-- Contraseña y Generador -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Contraseña <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="generateRandomPasswordForCreate"
                class="text-xs font-semibold text-[#006688] hover:text-[#004e69] flex items-center gap-1 transition-colors"
              >
                <span class="material-symbols-outlined text-sm">auto_fix_high</span>
                Generar segura
              </button>
            </div>
            <div class="relative">
              <input
                v-model="createForm.password"
                :type="createForm.showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres (1 mayúscula y 1 especial)"
                required
                class="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
              />
              <button
                type="button"
                @click="createForm.showPassword = !createForm.showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-base">
                  {{ createForm.showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-1">
              Debe contener al menos 8 caracteres, una mayúscula y un símbolo (@#$%&*!._-).
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span
                v-if="actionLoading"
                class="material-symbols-outlined text-base animate-spin"
                >progress_activity</span
              >
              <span v-else class="material-symbols-outlined text-base">check</span>
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== MODAL EDITAR USUARIO ==================== -->
    <div
      v-if="showEditModal && editForm.id"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-[#006688]/10 text-[#006688] flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-xl">edit</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-800">Editar Usuario</h3>
              <p class="text-xs text-gray-400">Modifica los datos del usuario #{{ editForm.id }}</p>
            </div>
          </div>
          <button
            @click="closeEditModal"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleUpdateUser" class="p-6 space-y-4">
          <!-- Cédula (Referencia informativa) -->
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-gray-400 text-lg">badge</span>
              <div>
                <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Documento / Cédula</p>
                <p class="text-sm font-mono font-bold text-gray-700">{{ editForm.cedula || 'Sin documento' }}</p>
              </div>
            </div>
            <span class="text-[11px] bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
              No editable
            </span>
          </div>

          <!-- Selector de Rol -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Rol del Usuario <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="editForm.rol = 'APRENDIZ'"
                :class="[
                  'py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  editForm.rol === 'APRENDIZ'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">person</span>
                Aprendiz
              </button>
              <button
                type="button"
                @click="editForm.rol = 'INSTRUCTOR'"
                :class="[
                  'py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  editForm.rol === 'INSTRUCTOR'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">school</span>
                Instructor
              </button>
              <button
                type="button"
                @click="editForm.rol = 'ADMIN'"
                :class="[
                  'py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all',
                  editForm.rol === 'ADMIN'
                    ? 'border-red-500 bg-red-50/70 text-red-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
                Admin
              </button>
            </div>
          </div>

          <!-- Asignación de Ficha para Aprendiz (Edición) -->
          <div v-if="editForm.rol === 'APRENDIZ'" class="space-y-1.5 p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl animate-fade-in">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-700">groups</span>
                Ficha de Formación (Cohorte)
              </label>
              <span class="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                SENA
              </span>
            </div>
            <select
              v-model="editForm.cohortId"
              class="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-medium cursor-pointer"
            >
              <option :value="null">-- Sin ficha asignada --</option>
              <optgroup
                v-for="group in cohortsGroupedByProgram"
                :key="'edit-grp-' + group.programName"
                :label="group.programName"
              >
                <option
                  v-for="ficha in group.cohorts"
                  :key="'edit-f-' + ficha.id"
                  :value="ficha.id"
                >
                  Ficha {{ ficha.cohort_number }} ({{ group.programName }})
                </option>
              </optgroup>
            </select>
            <p class="text-[11px] text-emerald-800/80">
              Puedes reasignar o desvincular al aprendiz de su ficha actual.
            </p>
          </div>

          <!-- Asignación de Múltiples Fichas para Instructor (Edición) -->
          <div v-if="editForm.rol === 'INSTRUCTOR'" class="space-y-2 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl animate-fade-in">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-blue-700">school</span>
                Fichas donde imparte clase ({{ editForm.cohortIds.length }})
              </label>
              <span class="text-[10px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full">
                Múltiples fichas
              </span>
            </div>
            <p class="text-[11px] text-blue-800/80">
              Modifica las fichas de formación en las que este instructor imparte formación:
            </p>
            <div v-if="availableCohorts.length > 0" class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              <label
                v-for="ficha in availableCohorts"
                :key="'edit-inst-f-' + ficha.id"
                class="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-gray-200 hover:border-[#006688] cursor-pointer transition-all shadow-2xs"
              >
                <input
                  type="checkbox"
                  :value="ficha.id"
                  v-model="editForm.cohortIds"
                  class="rounded text-[#006688] focus:ring-[#006688] w-4 h-4 cursor-pointer"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-gray-800">Ficha {{ ficha.cohort_number }}</span>
                    <span v-if="ficha.program?.name" class="text-[10px] font-medium text-gray-400 truncate">· {{ ficha.program.name }}</span>
                  </div>
                </div>
              </label>
            </div>
            <p v-else class="text-xs text-gray-400 italic">No hay fichas creadas aún en el currículo.</p>
          </div>

          <!-- Nombres y Apellidos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Nombres <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.nombre"
                type="text"
                required
                class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Apellidos <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.apellido"
                type="text"
                required
                class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
              />
            </div>
          </div>

          <!-- Correo Electrónico -->
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Correo Electrónico <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editForm.correo"
              type="email"
              required
              class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            />
          </div>

          <!-- Nueva Contraseña (Opcional) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nueva Contraseña <span class="text-gray-400 font-normal lowercase">(opcional)</span>
              </label>
              <button
                type="button"
                @click="generateRandomPasswordForEdit"
                class="text-xs font-semibold text-[#006688] hover:text-[#004e69] flex items-center gap-1 transition-colors"
              >
                <span class="material-symbols-outlined text-sm">auto_fix_high</span>
                Generar segura
              </button>
            </div>
            <div class="relative">
              <input
                v-model="editForm.password"
                :type="editForm.showPassword ? 'text' : 'password'"
                placeholder="Dejar en blanco para mantener la actual"
                class="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all font-mono"
              />
              <button
                type="button"
                @click="editForm.showPassword = !editForm.showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-base">
                  {{ editForm.showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 mt-1">
              Si se especifica, debe tener al menos 8 caracteres, 1 mayúscula y 1 carácter especial.
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              @click="closeEditModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#006688]/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span
                v-if="actionLoading"
                class="material-symbols-outlined text-base animate-spin"
                >progress_activity</span
              >
              <span v-else class="material-symbols-outlined text-base">save</span>
              Actualizar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== MODAL ELIMINAR USUARIO ==================== -->
    <div
      v-if="showDeleteModal && userToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h3 class="text-lg font-bold text-gray-800">¿Eliminar este usuario?</h3>
          <p class="text-sm text-gray-500 mt-1">
            Esta acción eliminará permanentemente a <span class="font-bold text-gray-700">{{ userToDelete.name }}</span> ({{ userToDelete.email }}).
          </p>

          <div class="mt-4 p-3 bg-red-50/80 border border-red-100 rounded-xl text-xs text-red-700 text-left space-y-1">
            <div class="flex items-center gap-1.5 font-bold">
              <span class="material-symbols-outlined text-sm">info</span>
              Registros eliminados en cascada:
            </div>
            <p>• Progreso académico y calificaciones.</p>
            <p>• Entregas y evaluaciones de actividades.</p>
            <p>• Insignias y puntajes de juegos.</p>
          </div>

          <div class="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              @click="closeDeleteModal"
              class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmDeleteUser"
              :disabled="actionLoading"
              class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <span
                v-if="actionLoading"
                class="material-symbols-outlined text-base animate-spin"
                >progress_activity</span
              >
              <span v-else class="material-symbols-outlined text-base">delete_forever</span>
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import { getApiBaseUrl } from '../../lib/api'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const apiBaseUrl = getApiBaseUrl()

const search = ref('')
const filterRole = ref('')
const filterCohort = ref('')
const loading = ref(false)
const actionLoading = ref(false)

const STORAGE_KEY = 'nursed.users.list'

const users = ref([])
const availableCohorts = ref([])

// Modals state
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)

// Create Form State
const createForm = reactive({
  rol: 'APRENDIZ',
  nombre: '',
  apellido: '',
  cedula: '',
  correo: '',
  password: '',
  showPassword: false,
  cohortId: null,
  cohortIds: []
})

// Edit Form State
const editForm = reactive({
  id: null,
  nombre: '',
  apellido: '',
  cedula: '',
  correo: '',
  rol: 'APRENDIZ',
  password: '',
  showPassword: false,
  cohortId: null,
  cohortIds: []
})

function getToken() {
  const stored = localStorage.getItem('nursed.auth.user') || sessionStorage.getItem('nursed.auth.user')
  return stored ? JSON.parse(stored)?.token : null
}

async function fetchCohorts() {
  try {
    const token = getToken()
    let res = await fetch(`${apiBaseUrl}/api/admin/curriculum/cohorts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      res = await fetch(`${apiBaseUrl}/api/curriculum/cohorts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
    }
    if (res.ok) {
      const data = await res.json()
      availableCohorts.value = Array.isArray(data) ? data : (data?.data || [])
    }
  } catch (err) {
    console.warn('Error fetching cohorts:', err)
  }
}

const cohortsGroupedByProgram = computed(() => {
  const map = new Map()
  for (const c of availableCohorts.value) {
    const pName = c.program?.name || 'Programa de Formación General'
    if (!map.has(pName)) {
      map.set(pName, [])
    }
    map.get(pName).push(c)
  }
  return Array.from(map.entries()).map(([programName, cohorts]) => ({
    programName,
    cohorts
  }))
})

// Password Generator complying with backend requirements (length >= 8, 1 uppercase, 1 special @#$%&*!._-)
function generateSecurePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const nums = '23456789'
  const special = '@#$%&*!._-'

  let pw = ''
  pw += upper[Math.floor(Math.random() * upper.length)]
  pw += lower[Math.floor(Math.random() * lower.length)]
  pw += nums[Math.floor(Math.random() * nums.length)]
  pw += special[Math.floor(Math.random() * special.length)]

  const pool = upper + lower + nums + special
  for (let i = 0; i < 6; i++) {
    pw += pool[Math.floor(Math.random() * pool.length)]
  }

  return pw.split('').sort(() => 0.5 - Math.random()).join('')
}

function generateRandomPasswordForCreate() {
  const pw = generateSecurePassword()
  createForm.password = pw
  createForm.showPassword = true
}

function generateRandomPasswordForEdit() {
  const pw = generateSecurePassword()
  editForm.password = pw
  editForm.showPassword = true
}

// Fetch users from API
async function fetchUsers() {
  loading.value = true
  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/admin/users`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (res.ok) {
      const responseData = await res.json()
      const list = responseData.data || responseData
      if (Array.isArray(list)) {
        users.value = list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      console.warn('Error al obtener usuarios:', errData.message || res.statusText)
    }
  } catch (error) {
    console.error('Error al conectar con backend:', error)
    // Fallback to local storage if network issues
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached && users.value.length === 0) {
      try {
        users.value = JSON.parse(cached)
      } catch (e) {
        console.warn('Error parseando caché local:', e)
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      users.value = JSON.parse(cached)
    } catch (e) {
      console.warn('Error al cargar usuarios de caché:', e)
    }
  }
  fetchCohorts()
  fetchUsers()
})

// Summary cards calculation
const summary = computed(() => {
  const total = users.value.length
  const admins = users.value.filter((u) => u.role === 'admin').length
  const instructors = users.value.filter((u) => u.role === 'instructor').length
  const apprentices = users.value.filter((u) => u.role === 'aprendiz').length

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0)

  return [
    {
      label: 'Total Usuarios',
      count: total,
      percentage: 100,
      icon: 'group',
      bg: 'bg-blue-50',
      iconColor: '#3b82f6',
    },
    {
      label: 'Administradores',
      count: admins,
      percentage: getPercent(admins),
      icon: 'admin_panel_settings',
      bg: 'bg-red-50',
      iconColor: '#ef4444',
    },
    {
      label: 'Instructores',
      count: instructors,
      percentage: getPercent(instructors),
      icon: 'school',
      bg: 'bg-purple-50',
      iconColor: '#8b5cf6',
    },
    {
      label: 'Aprendices',
      count: apprentices,
      percentage: getPercent(apprentices),
      icon: 'person',
      bg: 'bg-emerald-50',
      iconColor: '#10b981',
    },
  ]
})

// Filtered and Searched Users
const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()
  const cFilter = filterCohort.value ? Number(filterCohort.value) : null
  return users.value.filter((u) => {
    const matchSearch =
      !query ||
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.cedula && String(u.cedula).includes(query))
    const matchRole = !filterRole.value || u.role === filterRole.value
    let matchCohort = true
    if (cFilter) {
      if (u.role === 'aprendiz') {
        matchCohort = Number(u.cohortId) === cFilter
      } else if (u.role === 'instructor') {
        matchCohort = Array.isArray(u.cohortIds) && u.cohortIds.map(Number).includes(cFilter)
      } else {
        matchCohort = false
      }
    }
    return matchSearch && matchRole && matchCohort
  })
})

function resetFilters() {
  search.value = ''
  filterRole.value = ''
  filterCohort.value = ''
}

// ----------------- CREATE USER -----------------
function openCreateModal() {
  createForm.rol = 'APRENDIZ'
  createForm.nombre = ''
  createForm.apellido = ''
  createForm.cedula = ''
  createForm.correo = ''
  createForm.password = generateSecurePassword()
  createForm.showPassword = true
  createForm.cohortId = null
  createForm.cohortIds = []
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function handleCreateUser() {
  if (!createForm.nombre.trim() || !createForm.apellido.trim() || !createForm.cedula.trim() || !createForm.correo.trim()) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Por favor completa todos los campos del formulario.'
    })
    return
  }

  actionLoading.value = true
  try {
    const token = getToken()
    const payload = {
      nombre: createForm.nombre.trim(),
      apellido: createForm.apellido.trim(),
      cedula: createForm.cedula.trim(),
      correo: createForm.correo.trim().toLowerCase(),
      password: createForm.password,
      rol: createForm.rol
    }

    if (createForm.rol === 'APRENDIZ' && createForm.cohortId) {
      payload.cohortId = Number(createForm.cohortId)
    } else if (createForm.rol === 'INSTRUCTOR' && createForm.cohortIds?.length) {
      payload.cohortIds = createForm.cohortIds.map(Number)
    }

    const res = await fetch(`${apiBaseUrl}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Error al crear el usuario.')
    }

    notificationStore.notify({
      type: 'success',
      title: 'Usuario creado con éxito',
      message: `El usuario ${createForm.nombre} fue registrado con rol ${createForm.rol}. Contraseña: ${createForm.password}`,
      duration: 6000
    })

    closeCreateModal()
    await fetchUsers()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error de registro',
      message: err.message || 'No se pudo registrar el usuario.'
    })
  } finally {
    actionLoading.value = false
  }
}

// ----------------- EDIT USER -----------------
function openEditModal(user) {
  let firstName = user.nombre || ''
  let lastName = user.apellido || ''

  if (!firstName && user.name) {
    const parts = user.name.trim().split(' ')
    firstName = parts[0] || ''
    lastName = parts.slice(1).join(' ') || ''
  }

  editForm.id = user.id
  editForm.nombre = firstName
  editForm.apellido = lastName
  editForm.cedula = user.cedula || ''
  editForm.correo = user.email || ''
  editForm.rol = (user.role || 'APRENDIZ').toUpperCase()
  editForm.password = ''
  editForm.showPassword = false
  editForm.cohortId = user.cohortId ? Number(user.cohortId) : null
  editForm.cohortIds = Array.isArray(user.cohortIds) ? [...user.cohortIds.map(Number)] : []

  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editForm.id = null
}

async function handleUpdateUser() {
  if (!editForm.nombre.trim() || !editForm.apellido.trim() || !editForm.correo.trim()) {
    notificationStore.notify({
      type: 'warning',
      title: 'Campos requeridos',
      message: 'Nombre, apellido y correo no pueden estar vacíos.'
    })
    return
  }

  actionLoading.value = true
  try {
    const token = getToken()
    const payload = {
      nombre: editForm.nombre.trim(),
      apellido: editForm.apellido.trim(),
      correo: editForm.correo.trim().toLowerCase(),
      rol: editForm.rol
    }

    if (editForm.password.trim()) {
      payload.password = editForm.password.trim()
    }

    if (editForm.rol === 'APRENDIZ') {
      payload.cohortId = editForm.cohortId ? Number(editForm.cohortId) : null
    } else if (editForm.rol === 'INSTRUCTOR') {
      payload.cohortIds = Array.isArray(editForm.cohortIds) ? editForm.cohortIds.map(Number) : []
    }

    const res = await fetch(`${apiBaseUrl}/api/admin/users/${editForm.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar usuario.')
    }

    notificationStore.notify({
      type: 'success',
      title: 'Usuario actualizado',
      message: `Los datos de ${editForm.nombre} ${editForm.apellido} se guardaron exitosamente.`
    })

    closeEditModal()
    await fetchUsers()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error de actualización',
      message: err.message || 'No se pudo actualizar el usuario.'
    })
  } finally {
    actionLoading.value = false
  }
}

// ----------------- DELETE USER -----------------
function openDeleteModal(user) {
  if (user.id === auth.user?.id) {
    notificationStore.notify({
      type: 'warning',
      title: 'Acción no permitida',
      message: 'No puedes eliminar tu propia cuenta de administrador.'
    })
    return
  }

  userToDelete.value = user
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function confirmDeleteUser() {
  if (!userToDelete.value) return

  actionLoading.value = true
  const targetId = userToDelete.value.id
  const targetName = userToDelete.value.name

  try {
    const token = getToken()
    const res = await fetch(`${apiBaseUrl}/api/admin/users/${targetId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Error al eliminar usuario.')
    }

    // Remove from local array immediately
    users.value = users.value.filter((u) => u.id !== targetId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value))

    notificationStore.notify({
      type: 'success',
      title: 'Usuario eliminado',
      message: `El usuario ${targetName} fue eliminado correctamente.`
    })

    closeDeleteModal()
  } catch (err) {
    notificationStore.notify({
      type: 'error',
      title: 'Error al eliminar',
      message: err.message || 'No se pudo eliminar el usuario.'
    })
  } finally {
    actionLoading.value = false
  }
}
</script>
