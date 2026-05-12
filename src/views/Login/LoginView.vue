<template>
  <main class="min-h-screen flex items-center justify-center p-6 md:p-12 overflow-hidden relative bg-surface">
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
          <!-- Email -->
          <div class="space-y-2">
            <label
              class="block text-xs font-label font-bold uppercase tracking-wider text-[#3e484f] ml-1"
              for="email"
            >
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              class="w-full px-5 py-4 bg-[#e0e3e5] border-none rounded-xl focus:ring-2 focus:ring-[#006688]/20 focus:bg-white transition-all duration-300 placeholder:text-[#6e7980] outline-none"
              name="email"
              placeholder="nurse.smith@hospital.org"
              type="email"
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <div class="flex justify-between items-center ml-1">
              <label
                class="block text-xs font-label font-bold uppercase tracking-wider text-[#3e484f]"
                for="password"
              >
                Password
              </label>
              <a class="text-xs font-semibold text-[#006688] hover:text-[#004e69] transition-colors" href="/recover">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              v-model="password"
              class="w-full px-5 py-4 bg-[#e0e3e5] border-none rounded-xl focus:ring-2 focus:ring-[#006688]/20 focus:bg-white transition-all duration-300 placeholder:text-[#6e7980] outline-none"
              name="password"
              placeholder="••••••••"
              type="password"
            />
          </div>

          <!-- Remember me -->
          <div class="flex items-center gap-3 ml-1 py-2">
            <input
              id="remember"
              v-model="form.remember"
              class="w-5 h-5 rounded-md border-[#bdc8d0] text-[#006688] focus:ring-[#c2e8ff] transition-all"
              type="checkbox"
            />
            <label class="text-sm text-[#3e484f] font-medium" for="remember">
              Keep me logged in for 30 days
            </label>
          </div>

          <!-- Submit -->
          <button
            class="w-full py-4 medical-gradient text-white font-headline font-bold rounded-full transition-transform active:scale-[0.98] editorial-shadow"
            type="submit"
          >
            Sign In to Academy
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
            @click="handleGoogleLogin"
          >
            <img
              alt="Google"
              class="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlpZ4zOgqod6-_2NyjgF8iDP_2krppQb6xHtcZy0LOXprvIJk6ONXCUqBs02JSoUUG4BQfYI_1SX9MTcXzyF641qDynkVPo6l1MfQjEpIYoKjRZvhdJFYNAAekq2QoOsEIpMAxV8mH23ksLvWVqwoUC04eynwzn7B9u-37Mas8367v1BWYwa56SerGQiyQ-UFB5ac_cNvwcby1r986KbS6cM0ydjllxU_Glp3Hqe1YdSJWnHNTsuGvaqMap5rG6oBe8IL7adGUzXSr"
            />
            Google
          </button>
          <button
            class="flex items-center justify-center gap-3 py-3 px-4 bg-[#f2f4f6] rounded-full hover:bg-[#e6e8ea] transition-colors font-semibold text-[#3e484f] text-sm"
            type="button"
            @click="handleAppleLogin"
          >
            <span class="material-symbols-outlined text-xl">ios</span>
            Apple
          </button>
        </div>

        <!-- Footer -->
        
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute bottom-10 left-10 hidden xl:bottom-0 mb-2 xl:block">
      <div class="flex items-center gap-6">
        <div class="flex -space-x-3">
          <img
            alt="Nurse"
            class="w-10 h-10 rounded-full border-2 border-white"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3bm-5AeIKuj6NpFPxY3SYV9X0_VzJUUEPPmYXHKrJmoE5xhpiwshKKNj1zJ4G1lok6RHBiUZS0wiCyZDJsTc0gwsDSJZcu7We3Ublssx1x9Da8LeX5gJEL7najp6cs8Jkm5o7MTgXf0BPK4fNVhvQeehyloaAMlYYA6BTserh8iHIN8VaUHWbT37iRIIj78O4iY5f3p7bvWFonr_u0WJgnJVbYci6ycNckG5LHM1f-7Ww0sbEPu16LdTOL2xMlB8tu2GavNdNHgfX"
          />
          <img
            alt="Doctor"
            class="w-10 h-10 rounded-full border-2 border-white"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDawUn_7bcuHnnCZNzbnfGhESvvrC0i28fCB-ij9KHkisa1ePM4bRNrb9I_au5aBJoaT2tOo0Svep8xstDz_YFA69mgzz3Dx5UPaqvUhgOtpObACBZSj7MpdV_5p1Wb_WBDeEEMZoHTntKvvPOVdwU31uwkC-eKf-XA5FVopp3w7SHpzHifB5wl9S_0ABWrTH26wBb7YvDu6RpaTdEuqHaiHG_oBaZJh_iUnJolGpcpnEIFhZW9FZ_G2Rzp-fXhSzyubSKE5ZdHubeT"
          />
          <img
            alt="Healthcare worker"
            class="w-10 h-10 rounded-full border-2 border-white"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsUlarddgjGXOkUiRQeFe2Y_taIX1urbCn0uCmnyKGDmf4PLoLXAJ_DuGSOzAAwOsULvOHI3ZRhIG4YOzfc6mCF6ymUVcpqbsj5XF1Tb6gnHa1nFD2xjMKSALfE_fZkw8W00OZTccPM1yOgc61NfNCiZWHstUJYervQ1B65r351G503n0ohPOSsMrHW_7QQ_BnZh9d6If5ZeKCcS97w-2W1tSMYtKjA8tj9dlsB8II2WJk97gb1BF8W1KOTo7plrfG3fhuOg4yFKYr"
          />
        </div>
        <div class="text-xs text-[#3e484f] font-medium ">
          Joined by <span class="text-[#006688] font-bold">12,000+</span> healthcare professionals
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { loginSubmit } from '@/composables/formLogin'
const { submit, email, password } = loginSubmit()
const form = reactive({
  remember: false,
})

async function handleSubmit() {
  console.log('Login submitted:', form)
  await submit()
}

function handleGoogleLogin() {
  console.log('Google login')
  // Aquí va tu lógica de login con Google
}

function handleAppleLogin() {
  console.log('Apple login')
  // Aquí va tu lógica de login con Apple
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
