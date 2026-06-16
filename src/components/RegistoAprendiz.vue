<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#006688]">person_add</span>
          Registrar Nuevo Aprendiz
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        
        <!-- Tipo de Documento -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Tipo de Documento <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="form.document_type" 
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            required
          >
            <option value="">Seleccione...</option>
            <option value="TI">TI - Tarjeta de Identidad</option>
            <option value="CC">CC - Cédula de Ciudadanía</option>
            <option value="CE">CE - Cédula de Extranjería</option>
          </select>
          <p v-if="errors.document_type" class="text-xs text-red-500 mt-1 font-medium">{{ errors.document_type }}</p>
        </div>

        <!-- Documento de Identidad -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Documento de Identidad <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.document_number" 
            type="text" 
            placeholder="Ej: 10203040"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            required
          />
          <p v-if="errors.document_number" class="text-xs text-red-500 mt-1 font-medium">{{ errors.document_number }}</p>
        </div>

        <!-- Nombres -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Nombres <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.first_name" 
            type="text" 
            placeholder="Ej: Juan Carlos"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            required
          />
          <p v-if="errors.first_name" class="text-xs text-red-500 mt-1 font-medium">{{ errors.first_name }}</p>
        </div>

        <!-- Apellidos -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Apellidos <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.last_name" 
            type="text" 
            placeholder="Ej: Pérez Gomez"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            required
          />
          <p v-if="errors.last_name" class="text-xs text-red-500 mt-1 font-medium">{{ errors.last_name }}</p>
        </div>

        <!-- Correo Electrónico -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Correo Electrónico <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Ej: juan.perez@example.com"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#006688] focus:ring-1 focus:ring-[#006688] transition-all"
            required
          />
          <p v-if="errors.email" class="text-xs text-red-500 mt-1 font-medium">{{ errors.email }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <button 
            type="button" 
            @click="closeModal" 
            class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-5 py-2 bg-[#006688] hover:bg-[#004e69] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            Registrar Aprendiz
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useNotificationStore } from '../stores/notification.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'apprenticeCreated']);

const initialForm = {
  document_type: '',
  document_number: '',
  first_name: '',
  last_name: '',
  email: ''
};

const form = reactive({ ...initialForm });
const errors = reactive({ ...initialForm });

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

function resetForm() {
  Object.assign(form, initialForm);
  Object.assign(errors, initialForm);
}

function closeModal() {
  resetForm();
  emit('close');
}

// Generador de contraseña segura
function generateSecurePassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$!%*?&';
  
  let pw = '';
  // Garantizar al menos un carácter de cada tipo
  pw += uppercase[Math.floor(Math.random() * uppercase.length)];
  pw += lowercase[Math.floor(Math.random() * lowercase.length)];
  pw += numbers[Math.floor(Math.random() * numbers.length)];
  pw += special[Math.floor(Math.random() * special.length)];
  
  // Agregar caracteres aleatorios hasta completar longitud 10
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 6; i++) {
    pw += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Barajar la contraseña
  return pw.split('').sort(() => 0.5 - Math.random()).join('');
}

async function handleSubmit() {
  // Limpiar errores previos
  Object.assign(errors, initialForm);
  let hasErrors = false;

  // 1. Validar Tipo de Documento
  const allowedDocTypes = ['TI', 'CC', 'CE'];
  if (!allowedDocTypes.includes(form.document_type)) {
    errors.document_type = 'El tipo de documento es obligatorio y debe ser TI, CC o CE.';
    hasErrors = true;
  }

  // 2. Validar Documento de Identidad (solo números y longitud 6 a 1J1)
  const docRegex = /^\d+$/;
  if (!form.document_number) {
    errors.document_number = 'El número de identidad es obligatorio.';
    hasErrors = true;
  } else if (!docRegex.test(form.document_number)) {
    errors.document_number = 'El número de identidad debe contener únicamente caracteres numéricos.';
    alert('Error de formato: El número de documento debe contener únicamente caracteres numéricos.');
    hasErrors = true;
  } else if (form.document_number.length < 6 || form.document_number.length > 11) {
    errors.document_number = 'El número de identidad debe tener entre 6 y 11 dígitos.';
    alert('Error de formato: El documento de identidad debe tener una longitud coherente (mínimo 6 y máximo 11 dígitos).');
    hasErrors = true;
  }

  // 3. Validar Nombres y Apellidos (solo letras, espacios, tildes, ñ)
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!form.first_name.trim()) {
    errors.first_name = 'El nombre es obligatorio.';
    hasErrors = true;
  } else if (!nameRegex.test(form.first_name)) {
    errors.first_name = 'Los nombres deben contener solo letras.';
    alert('Error en nombres: Solo se permiten letras (incluyendo tildes y la letra ñ) para evitar alterar la base de datos.');
    hasErrors = true;
  }

  if (!form.last_name.trim()) {
    errors.last_name = 'El apellido es obligatorio.';
    hasErrors = true;
  } else if (!nameRegex.test(form.last_name)) {
    errors.last_name = 'Los apellidos deben contener solo letras.';
    alert('Error en apellidos: Solo se permiten letras (incluyendo tildes y la letra ñ) para evitar alterar la base de datos.');
    hasErrors = true;
  }

  // 4. Validar Correo Electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
    hasErrors = true;
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'El correo electrónico no es válido.';
    hasErrors = true;
  }

  if (hasErrors) return;

  // Generar contraseña interna segura
  const generatedPassword = generateSecurePassword();

  try {
    await authStore.register({
      nombre: form.first_name,
      apellido: form.last_name,
      cedula: form.document_number,
      correo: form.email,
      password: generatedPassword,
      document_type: form.document_type
    });

    notificationStore.notify({
      type: 'success',
      title: 'Registro exitoso',
      message: `Contraseña generada: ${generatedPassword}\n\nPor favor, guarda esta contraseña.`,
      duration: 3000
    });

    emit('apprenticeCreated', {
      id: Date.now(),
      name: `${form.first_name} ${form.last_name}`,
      email: form.email
    });

    // Cerrar y limpiar
    closeModal();
  } catch (err) {
    if (err.isConflict) {
      if (confirm('Estas credenciales ya existen ¿Desea recuperar la cuenta?')) {
        // Redirigir a recuperación o abrir modal
        notificationStore.notify({ type: 'info', title: 'Recuperación', message: 'Ir a recuperación de cuenta...' });
      }
    } else {
      notificationStore.notify({ type: 'error', title: 'Error en el registro', message: err.message });
    }
  }
}
</script>
