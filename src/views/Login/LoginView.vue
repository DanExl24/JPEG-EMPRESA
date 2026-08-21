<template>
  <main class="min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden relative bg-surface">
    <RouterLink
      class="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-semibold text-[#006688] transition-colors hover:text-[#004e69] md:left-10 md:top-8"
      to="/"
    >
      <span class="material-symbols-outlined text-xl">arrow_back</span>
      Volver al inicio
    </RouterLink>

    <!-- Background Accent Illustration -->
    <div class="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block">
      <img
        alt=""
        class="w-full h-full object-cover"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN1ToNb3IRv0JgkNj3I2cqfG1pnBoglE2EpRTy7xxlNkmmNBOjyphavyxrYTdZMK2QbdAN6dtjG-bOjy3u9EP7udfhFPeCvPycG5hoD5NToaPNx18_rEBTBgAh89x1eqkPknNJgwHOnuTF_Q-NyqWMswuvH4FCntFV34RKz9SctWXx56fhenRrpfjnOHtdHEFqLQQt0CL6o2O4Mavq7qXE2DjlRVuGUjFO45AZAfCTt70GXi7KuVo7A1CWJQf2KwwMMgzkdY52hMJ5"
      />
    </div>

    <div class="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[2rem] editorial-shadow overflow-hidden">
      <!-- Left Side: Branding -->
      <div class="hidden lg:flex flex-col justify-between p-12 medical-gradient text-white">
        <div>
          <h1 class="font-headline text-2xl font-black tracking-tight mb-2">Nursing Academy</h1>
          <p class="font-body text-blue-100">The Empathetic Authority in Clinical Excellence.</p>
        </div>

        <div class="space-y-8">
          <div class="space-y-2">
            <div class="text-4xl font-headline font-bold leading-tight">
              Elevating the standard of
              <span class="text-[#c2e8ff]">patient care</span>
              through precision.
            </div>
          </div>
          <div class="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl">
            <div class="w-12 h-12 rounded-full bg-[#c2e8ff] flex items-center justify-center text-[#006688]">
              <span class="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <div class="font-semibold">Clinical Editorial Standards</div>
              <div class="text-sm opacity-80">Peer-reviewed nursing curriculum</div>
            </div>
          </div>
        </div>

        <div class="text-xs font-label uppercase tracking-widest opacity-60">
          © 2024 The Clinical Editorial
        </div>
      </div>

      <!-- Right Side: Form -->
      <div class="p-8 md:p-16 flex flex-col justify-center">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-12">
          <h1 class="font-headline text-xl font-black text-[#006688] tracking-tight">Nursing Academy</h1>
        </div>

        <header class="mb-10">
          <h2 class="text-3xl font-headline font-extrabold text-[#191c1e] tracking-tight mb-2">Welcome Back</h2>
          <p class="text-[#3e484f] font-body leading-relaxed">Please enter your credentials to access your dashboard.</p>
        </header>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Identifier -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-label font-bold uppercase tracking-wider text-[#3e484f] ml-1"
              for="identifier"
            >
              Correo o documento
            </label>
            <input
              id="identifier"
              v-model="form.identifier"
              class="w-full px-5 py-4 bg-[#e0e3e5] border-2 rounded-xl focus:ring-2 focus:ring-[#006688]/20 focus:bg-white transition-all duration-300 placeholder:text-[#6e7980] outline-none"
              :class="identifierError && touched.identifier
                ? 'border-red-400 bg-red-50'
                : 'border-transparent'"
              name="identifier"
              placeholder="Usuario, correo o documento"
              type="text"
              autocomplete="username"
              :disabled="isLoading"
              @blur="touched.identifier = true; syncFormWithDOM()"
              @input="syncFormWithDOM"
              @change="syncFormWithDOM"
            />
            <p v-if="identifierError && touched.identifier" class="text-xs text-red-500 ml-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">error</span>
              {{ identifierError }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-center ml-1">
              <label
                class="block text-xs font-label font-bold uppercase tracking-wider text-[#3e484f]"
                for="password"
              >
                Password
              </label>
              <RouterLink class="text-xs font-semibold text-[#006688] hover:text-[#004e69] transition-colors" to="/recover">
                Forgot password?
              </RouterLink>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                class="w-full px-5 py-4 bg-[#e0e3e5] border-2 rounded-xl focus:ring-2 focus:ring-[#006688]/20 focus:bg-white transition-all duration-300 placeholder:text-[#6e7980] outline-none pr-12"
                :class="!form.password && touched.password
                  ? 'border-red-400 bg-red-50'
                  : 'border-transparent'"
                name="password"
                placeholder="••••••••"
                autocomplete="current-password"
                :type="showPassword ? 'text' : 'password'"
                :disabled="isLoading"
                @blur="touched.password = true; syncFormWithDOM()"
                @input="syncFormWithDOM"
                @change="syncFormWithDOM"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e7980] hover:text-[#006688] transition-colors"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <span class="material-symbols-outlined text-xl">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p v-if="!form.password && touched.password" class="text-xs text-red-500 ml-1 flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined text-sm">error</span>
              La contraseña es obligatoria.
            </p>
          </div>

          <!-- Remember me -->
          <div class="flex items-center gap-3 ml-1 py-2">
            <input
              id="remember"
              v-model="form.remember"
              class="w-5 h-5 rounded-md border-[#bdc8d0] text-[#006688] focus:ring-[#c2e8ff] transition-all cursor-pointer"
              type="checkbox"
            />
            <label class="text-sm text-[#3e484f] font-medium cursor-pointer" for="remember">
              Keep me logged in for 30 days
            </label>
          </div>

          <!-- Lockout banner -->
          <div v-if="isLockedOut"
            class="flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3"
          >
            <span class="material-symbols-outlined text-orange-500 text-xl shrink-0 mt-0.5">lock</span>
            <div>
              <p class="text-sm font-bold text-orange-700">Cuenta bloqueada temporalmente</p>
              <p class="text-xs text-orange-600 mt-0.5">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Generic error -->
          <div v-else-if="errorMessage"
            class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            <span class="material-symbols-outlined text-red-500 text-lg shrink-0 mt-0.5">warning</span>
            <p class="text-sm font-medium text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Submit -->
          <button
            class="w-full py-4 font-headline font-bold rounded-full transition-all duration-200 editorial-shadow cursor-pointer"
            :class="(form.identifier.trim() && form.password && !isLockedOut)
              ? 'medical-gradient text-white active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400'"
            type="submit"
            :disabled="isLoading || isLockedOut"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Signing In...
            </span>
            <span v-else-if="isLockedOut">🔒 Cuenta bloqueada</span>
            <span v-else>Sign In to Academy</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-10 relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-[#e0e3e5]"></div>
          </div>
          <div class="relative flex justify-center text-xs font-label font-bold uppercase tracking-widest">
            <span class="bg-white px-4 text-[#6e7980]">Social Login</span>
          </div>
        </div>

        <!-- Social Buttons -->
        <div class="mt-8 grid grid-cols-2 gap-4">
          <button
            class="flex items-center justify-center gap-3 py-3 px-4 bg-[#f2f4f6] rounded-full hover:bg-[#e6e8ea] transition-colors font-semibold text-[#3e484f] text-sm"
            type="button"
            @click="handleSocialLogin('Google')"
          >
            <svg aria-hidden="true" class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"/>
            </svg>
            Google
          </button>
          <button
            class="flex items-center justify-center gap-3 py-3 px-4 bg-[#f2f4f6] rounded-full hover:bg-[#e6e8ea] transition-colors font-semibold text-[#3e484f] text-sm"
            type="button"
            @click="handleSocialLogin('Apple')"
          >
            <svg aria-hidden="true" class="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.52 12.52c-.02-2.1 1.72-3.12 1.8-3.17-1-.98-2.53-1.12-3.06-1.14-1.29-.13-2.54.77-3.19.77-.66 0-1.66-.75-2.74-.73-1.4.02-2.7.83-3.42 2.09-1.47 2.55-.37 6.3 1.03 8.36.7 1 1.52 2.12 2.6 2.08 1.05-.04 1.44-.67 2.7-.67 1.25 0 1.61.67 2.72.65 1.13-.02 1.84-1 2.51-2.01.81-1.15 1.13-2.28 1.14-2.34-.03-.01-2.07-.8-2.09-3.89z"/>
              <path d="M14.42 6.84c.56-.7.94-1.64.84-2.59-.81.04-1.82.56-2.4 1.24-.52.6-.99 1.58-.87 2.5.91.07 1.84-.46 2.43-1.15z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import type { LoginFormState, FormTouchedState, AuthCustomError } from '../../types/auth.types'

const router = useRouter()
const auth = useAuthStore()

const form = reactive<LoginFormState>({
  identifier: '',
  password: '',
  remember: false,
})

const touched = reactive<FormTouchedState>({
  identifier: false,
  password: false,
})

const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const isLockedOut = ref<boolean>(false)
const showPassword = ref<boolean>(false)

function syncFormWithDOM(): void {
  const identifierEl = document.getElementById('identifier') as HTMLInputElement | null
  const passwordEl   = document.getElementById('password') as HTMLInputElement | null

  if (identifierEl && identifierEl.value && identifierEl.value !== form.identifier) {
    form.identifier = identifierEl.value
  }
  if (passwordEl && passwordEl.value && passwordEl.value !== form.password) {
    form.password = passwordEl.value
  }
}

onMounted(() => {
  syncFormWithDOM()
  const delays: number[] = [50, 100, 250, 500, 1000, 2000]
  delays.forEach(d => setTimeout(syncFormWithDOM, d))

  window.addEventListener('focus', syncFormWithDOM)
  document.addEventListener('click', syncFormWithDOM, { capture: true, passive: true })
  document.addEventListener('mousemove', syncFormWithDOM, { once: true, passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', syncFormWithDOM)
  document.removeEventListener('click', syncFormWithDOM)
})

const identifierError: ComputedRef<string> = computed(() => {
  const val: string = form.identifier.trim()
  if (!val) return 'Este campo es obligatorio.'
  if (val.includes('@')) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(val)) return 'Ingresa un correo electrónico válido.'
  } else {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(val)) {
      return 'El documento o identificador debe tener entre 3 y 30 caracteres.'
    }
  }
  return ''
})

async function handleSubmit(): Promise<void> {
  const identifierEl = document.getElementById('identifier') as HTMLInputElement | null
  const passwordEl   = document.getElementById('password') as HTMLInputElement | null

  // Obtener directamente del DOM nativo para asegurar valor de autofill al primer clic
  const rawIdentifier: string = (identifierEl && identifierEl.value ? identifierEl.value : form.identifier) || ''
  const rawPassword: string   = (passwordEl && passwordEl.value ? passwordEl.value : form.password) || ''

  form.identifier = rawIdentifier
  form.password   = rawPassword

  touched.identifier = true
  touched.password   = true

  const identifierVal: string = rawIdentifier.trim()
  const passwordVal: string   = rawPassword

  if (!identifierVal || !passwordVal) {
    errorMessage.value = 'Por favor ingresa tu usuario y contraseña.'
    return
  }

  if (identifierError.value) {
    errorMessage.value = identifierError.value
    return
  }

  errorMessage.value = ''
  isLockedOut.value  = false
  isLoading.value    = true

  try {
    await auth.login({
      identifier: identifierVal,
      password:   passwordVal,
      remember:   form.remember,
    })
    await router.push('/dashboard/inicio')
  } catch (error: unknown) {
    const err = error as AuthCustomError
    console.error('[Login Error View]:', err)
    errorMessage.value = err.message || 'Error al iniciar sesión.'
    isLockedOut.value  = err.isLockout === true
  } finally {
    isLoading.value = false
  }
}

function handleSocialLogin(provider: string): void {
  console.log(`${provider} login — pendiente de integración`)
}
</script>

<style scoped>
.medical-gradient {
  background: linear-gradient(135deg, #006688 0%, #4fc3f7 100%);
}

.editorial-shadow {
  box-shadow: 0px 20px 40px rgba(25, 28, 30, 0.06);
}

.font-headline {
  font-family: 'Manrope', sans-serif;
}

.font-body,
.font-label {
  font-family: 'Inter', sans-serif;
}
</style>
