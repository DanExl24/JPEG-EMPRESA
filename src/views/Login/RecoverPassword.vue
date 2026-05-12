<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: '',
})

const emailSent = ref(false)
const isLoading = ref(false)

function handleSubmit() {
  if (!form.email) return
  isLoading.value = true
  // Simular envío de correo
  setTimeout(() => {
    isLoading.value = false
    emailSent.value = true
  }, 1500)
}

function handleResend() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    alert('Reset link resent to ' + form.email)
  }, 1000)
}

function goBack() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex font-quicksand bg-slate-50">
    
    <!-- LEFT PANEL: Branding & Aesthetics -->
    <div class="relative hidden lg:flex lg:w-5/12 bg-[#006688] overflow-hidden flex-col justify-between p-12 text-white">
      <!-- Animated Background (DNA concept) -->
      <div class="absolute inset-0 pointer-events-none opacity-20">
        <svg class="w-full h-full animate-pulse" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M 200 0 C 300 100, 300 200, 200 300 C 100 400, 100 500, 200 600 C 300 700, 300 800, 200 900" fill="none" stroke="white" stroke-width="2" />
          <path d="M 200 0 C 100 100, 100 200, 200 300 C 300 400, 300 500, 200 600 C 100 700, 100 800, 200 900" fill="none" stroke="white" stroke-width="2" />
          <g fill="white">
            <circle cx="250" cy="150" r="4" />
            <circle cx="150" cy="450" r="4" />
            <circle cx="250" cy="750" r="4" />
            <circle cx="150" cy="150" r="4" />
            <circle cx="250" cy="450" r="4" />
            <circle cx="150" cy="750" r="4" />
          </g>
        </svg>
      </div>

      <!-- Top Branding -->
      <div class="relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </div>
          <div class="leading-tight">
            <p class="font-bold text-lg">NursePlay</p>
            <p class="text-[10px] uppercase tracking-widest opacity-70">Academy</p>
          </div>
        </div>
      </div>

      <!-- Center Message -->
      <div class="relative z-10 max-w-sm">
        <h1 class="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
          Your access to <span class="text-sky-300">clinical knowledge</span> is just one step away.
        </h1>
        <div class="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
          <div class="w-10 h-10 rounded-full bg-sky-400 flex items-center justify-center shrink-0 shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold">Secure Password Recovery</p>
            <p class="text-xs opacity-70">We'll send a link to your registered email</p>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="relative z-10 text-[10px] tracking-widest uppercase opacity-50">
        © 2024 THE CLINICAL EDITORIAL • ALL RIGHTS RESERVED
      </div>
    </div>

    <!-- RIGHT PANEL: Recover Form -->
    <div class="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white relative">
      <!-- Mobile Logo (Hidden on Desktop) -->
      <div class="lg:hidden absolute top-10 flex items-center gap-2">
        <div class="w-8 h-8 bg-[#006688] rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
        </div>
        <span class="font-bold text-slate-800">NursePlay Academy</span>
      </div>

      <div class="w-full max-w-[400px]">
        <!-- Initial Step -->
        <div v-if="!emailSent">
          <header class="mb-10 text-center lg:text-left">
            <button @click="goBack" class="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6 group">
              <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
            <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Forgot Password?</h2>
            <p class="text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
          </header>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <label for="email" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="nurse.smith@hospital.org"
                  required
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-[#006688] hover:bg-[#005577] text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ isLoading ? 'Sending Link...' : 'Reset Password' }}</span>
            </button>
          </form>
        </div>

        <!-- Success Step -->
        <div v-else class="text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 animate-bounce">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Check your email</h2>
          <p class="text-slate-500 mb-8">We have sent a password recover instruction to <span class="text-slate-900 font-bold">{{ form.email }}</span></p>
          
          <div class="space-y-4">
            <button
              @click="handleResend"
              :disabled="isLoading"
              class="w-full py-4 bg-[#006688] hover:bg-[#005577] text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              Resend Email
            </button>
            <button
              @click="goBack"
              class="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>

        <p class="mt-12 text-center text-sm text-slate-500">
          Did not receive the email?
          <button @click="handleResend" class="text-blue-600 font-bold hover:underline underline-offset-4 ml-1">Click to resend</button>
        </p>
      </div>

      <!-- Footer Proof -->
      <div class="mt-16 flex items-center gap-4 bg-slate-50 py-3 px-6 rounded-full border border-slate-100">
        <div class="flex -space-x-3">
          <img src="https://i.pravatar.cc/100?img=4" class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
          <img src="https://i.pravatar.cc/100?img=5" class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
          <img src="https://i.pravatar.cc/100?img=6" class="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
        </div>
        <div class="text-xs text-slate-500 font-medium">
          Supported by <span class="text-slate-800 font-bold">12,000+</span> specialists
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed, using pure Tailwind */
</style>