<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form state
const email    = ref('')
const password = ref('')
const remember = ref(false)
const showPw   = ref(false)

// UI state
const loading  = ref(false)
const error    = ref('')
const success  = ref(false)

const togglePassword = () => { showPw.value = !showPw.value }

const handleSubmit = async () => {
  error.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  loading.value = true
  // Simulate async cwwwall — swap for real API later
  await new Promise(r => setTimeout(r, 1400))
  loading.value = false
  success.value = true

  // Navigate to home after brief confirmation
  setTimeout(() => router.push('/'), 900)
}
</script>

<template>
  <div class="login-page">

    <!-- ══════════ LEFT PANEL ══════════ -->
    <aside class="left-panel">
      <!-- Decorative blobs -->
      <div class="blob blob-top"></div>
      <div class="blob blob-bottom"></div>
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="ring ring-3"></div>

      <!-- Brand -->
      <header class="brand">
        <div class="brand-logo">
          <span class="logo-icon">
            <svg viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill="rgba(255,255,255,0.18)"/>
              <rect x="14" y="7" width="6" height="20" rx="3" fill="#fff"/>
              <rect x="7" y="14" width="20" height="6" rx="3" fill="#fff"/>
            </svg>
          </span>
          <span class="brand-name">NurseAcademy</span>
        </div>
        <p class="brand-tagline">The Empathetic Authority in Clinical Excellence.</p>
      </header>

      <!-- Hero copy -->
      <div class="hero">
        <h1>Elevating the<br>standard of <span>patient care</span><br>through precision.</h1>

        <div class="feature-pill">
          <div class="pill-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="pill-text">
            <strong>Clinical Editorial Standards</strong>
            <span>Peer-reviewed nursing curriculum</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="left-footer">
        <div class="joined">
          <div class="avatars">
            <div class="av">JR</div>
            <div class="av">SM</div>
            <div class="av">AL</div>
          </div>
          <span>Joined by <b>12,000+</b> healthcare professionals</span>
        </div>
        <small>© 2025 NurseAcademy — All rights reserved.</small>
      </footer>
    </aside>

    <!-- ══════════ RIGHT PANEL ══════════ -->
    <main class="right-panel">
      <div class="form-card">

        <div class="form-header">
          <h2>Welcome Back 👋</h2>
          <p>Please enter your credentials to access your dashboard.</p>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>

          <!-- Email -->
          <div class="field-group">
            <label for="email" class="field-label">Email Address</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="nurse.smith@hospital.org"
                autocomplete="email"
                :class="{ 'has-error': error }"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="label-row">
              <label for="password" class="field-label">Password</label>
              <a href="#" class="forgot-link" @click.prevent>Forgot password?</a>
            </div>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :class="{ 'has-error': error }"
              />
              <button type="button" class="toggle-pw" @click="togglePassword" :aria-label="showPw ? 'Hide password' : 'Show password'">
                <!-- Eye open -->
                <svg v-if="!showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye closed -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error message -->
          <transition name="shake">
            <p v-if="error" class="error-msg">⚠ {{ error }}</p>
          </transition>

          <!-- Remember me -->
          <div class="remember-row">
            <input id="remember" v-model="remember" type="checkbox" />
            <label for="remember">Keep me logged in for 30 days</label>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="btn-primary"
            :class="{ loading, success }"
            :disabled="loading || success"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else-if="success">✓ Access Granted</span>
            <span v-else>Sign In to Academy</span>
          </button>

          <!-- Divider -->
          <div class="divider"><span>Social Login</span></div>

          <!-- Social buttons -->
          <div class="social-row">
            <button type="button" class="btn-social" @click.prevent>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.2 30.3 0 24 0 14.8 0 6.9 5.4 3.1 13.3l7.9 6.1C12.9 13.1 18 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.7 37.4 46.5 31.4 46.5 24.5z"/>
                <path fill="#FBBC05" d="M11 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7.9-6.1A23.8 23.8 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.5-6.2z"/>
                <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.4l-7.5-5.8c-2 1.4-4.6 2.2-7.5 2.2-6 0-11.1-3.6-13-8.8l-8.5 6.2C6.9 42.6 14.8 48 24 48z"/>
              </svg>
              Google
            </button>
            <button type="button" class="btn-social" @click.prevent>
              <svg width="18" height="18" viewBox="0 0 814 1000" fill="#1D1D1F">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.7-49.1 188.3-49.1 30.1 0 108.2 2.6 157.4 101.8zm-174.3-79.2c21.4-25.2 36.7-60.3 36.7-95.4 0-4.9-.3-9.9-1.1-14.2-34.9 1.3-76.3 23.3-101.5 51.9-19.7 22.4-38.2 57.5-38.2 93 0 5.4.9 10.9 1.3 12.5 2.2.4 5.8.9 9.4.9 31.5 0 70.6-20.8 93.4-48.7z"/>
              </svg>
              Apple
            </button>
          </div>

          <p class="register-row">
            Don't have an account yet?
            <a href="#" @click.prevent>Create Account</a>
          </p>

        </form>
      </div>
    </main>

  </div>
</template>

<style scoped>
/* ── Tokens ── */
:root {
  --primary:      #4FC3F7;
  --primary-dark: #0288D1;
  --secondary:    #81C784;
  --tertiary:     #64B5F6;
  --neutral:      #F8FAFC;
}

/* ── Layout ── */
.login-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #0D1B2A;
}

/* ══ LEFT PANEL ══ */
.left-panel {
  width: 42%;
  background: linear-gradient(155deg, #0288D1 0%, #0D47A1 55%, #1B5E20 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 44px;
  position: relative;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}
.blob-top    { width: 300px; height: 300px; top: -80px;    right: -60px; background: rgba(79,195,247,.15); }
.blob-bottom { width: 260px; height: 260px; bottom: -60px; left: -40px;  background: rgba(129,199,132,.13); }

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,.12);
  pointer-events: none;
}
.ring-1 { width: 180px; height: 180px; top: -30px;   right:  20px; }
.ring-2 { width: 100px; height: 100px; bottom: 120px; right: -20px; }
.ring-3 { width:  60px; height:  60px; top:  160px;   left: -10px; }

/* Brand */
.brand { position: relative; z-index: 1; }
.brand-logo {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
}
.logo-icon svg { width: 34px; height: 34px; display: block; }
.brand-name {
  font-family: 'Manrope', sans-serif;
  font-size: 1.15rem; font-weight: 800; color: #fff; letter-spacing: .5px;
}
.brand-tagline { font-size: .78rem; color: rgba(255,255,255,.62); }

/* Hero */
.hero { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.hero h1 {
  font-family: 'Manrope', sans-serif;
  font-size: clamp(1.6rem, 2.8vw, 2.3rem);
  font-weight: 800; color: #fff; line-height: 1.22; margin-bottom: 22px;
}
.hero h1 span { color: #4FC3F7; }

.feature-pill {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 14px;
  padding: 13px 16px;
}
.pill-icon {
  width: 38px; height: 38px; border-radius: 9px;
  background: #81C784;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pill-icon svg { width: 18px; height: 18px; }
.pill-text strong { display: block; font-size: .85rem; color: #fff; font-weight: 600; }
.pill-text span   { font-size: .73rem; color: rgba(255,255,255,.6); }

/* Left footer */
.left-footer { position: relative; z-index: 1; color: rgba(255,255,255,.4); font-size: .72rem; }
.joined { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.joined b { color: rgba(255,255,255,.75); }
.avatars { display: flex; margin-right: 2px; }
.av {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid #0288D1; margin-right: -8px;
  background: linear-gradient(135deg, #4FC3F7, #81C784);
  display: flex; align-items: center; justify-content: center;
  font-size: .52rem; color: #fff; font-weight: 700;
}

/* ══ RIGHT PANEL ══ */
.right-panel {
  flex: 1;
  background: #F8FAFC;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 48px;
  position: relative;
}
.right-panel::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(circle at 80% 10%, rgba(79,195,247,.09) 0%, transparent 50%),
    radial-gradient(circle at 20% 90%, rgba(129,199,132,.08) 0%, transparent 45%);
}

.form-card {
  width: 100%; max-width: 420px;
  position: relative; z-index: 1;
  animation: fadeUp .5s ease both;
}

/* Form header */
.form-header { margin-bottom: 30px; }
.form-header h2 {
  font-family: 'Manrope', sans-serif;
  font-size: 1.85rem; font-weight: 800; color: #0D1B2A; margin-bottom: 7px;
}
.form-header p { font-size: .87rem; color: #607D8B; line-height: 1.55; }

/* Fields */
.field-group { margin-bottom: 18px; }
.field-label {
  display: block;
  font-size: .73rem; font-weight: 600; color: #37474F;
  letter-spacing: .6px; text-transform: uppercase; margin-bottom: 7px;
}
.label-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 7px;
}
.label-row .field-label { margin-bottom: 0; }
.forgot-link {
  font-size: .77rem; color: #0288D1; font-weight: 600; text-decoration: none;
  transition: color .2s;
}
.forgot-link:hover { color: #4FC3F7; }

.input-wrap { position: relative; }
.input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; color: #90A4AE; pointer-events: none;
}
.input-wrap input {
  width: 100%;
  padding: 13px 13px 13px 40px;
  border: 1.5px solid #CFD8DC;
  border-radius: 10px;
  font-size: .9rem; font-family: 'Inter', sans-serif;
  color: #0D1B2A; background: #fff;
  outline: none;
  transition: border-color .25s, box-shadow .25s;
}
.input-wrap input::placeholder { color: #B0BEC5; }
.input-wrap input:focus {
  border-color: #4FC3F7;
  box-shadow: 0 0 0 3px rgba(79,195,247,.2);
}
.input-wrap input.has-error {
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229,57,53,.15);
}

.toggle-pw {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; padding: 0; color: #90A4AE;
  transition: color .2s; display: flex; align-items: center;
}
.toggle-pw:hover { color: #0288D1; }
.toggle-pw svg { width: 17px; height: 17px; display: block; }

/* Error */
.error-msg {
  font-size: .82rem; color: #e53935;
  margin-bottom: 12px; margin-top: -4px;
}
.shake-enter-active { animation: shake .35s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%,60%  { transform: translateX(-6px); }
  40%,80%  { transform: translateX(6px); }
}

/* Remember */
.remember-row {
  display: flex; align-items: center; gap: 9px;
  margin-bottom: 22px;
}
.remember-row input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: #0288D1; cursor: pointer;
}
.remember-row label { font-size: .83rem; color: #607D8B; cursor: pointer; }

/* Submit */
.btn-primary {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #0288D1 0%, #0277BD 100%);
  color: #fff; border: none; border-radius: 10px;
  font-size: .95rem; font-weight: 700; font-family: 'Manrope', sans-serif;
  cursor: pointer; letter-spacing: .3px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .15s, box-shadow .2s, background .3s;
  box-shadow: 0 4px 18px rgba(2,136,209,.35);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(2,136,209,.45);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: .85; cursor: not-allowed; }
.btn-primary.success { background: linear-gradient(135deg, #2e7d32, #388e3c); box-shadow: 0 4px 18px rgba(46,125,50,.35); }

/* Spinner */
.spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  animation: spin .7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0; color: #B0BEC5; font-size: .73rem;
  text-transform: uppercase; letter-spacing: .8px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E0E7EF; }

/* Social */
.social-row { display: flex; gap: 12px; margin-bottom: 22px; }
.btn-social {
  flex: 1; padding: 11px 14px;
  border: 1.5px solid #CFD8DC; border-radius: 10px;
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  font-size: .85rem; font-weight: 600; font-family: 'Inter', sans-serif;
  color: #37474F;
  transition: border-color .2s, box-shadow .2s, transform .15s;
}
.btn-social:hover {
  border-color: #4FC3F7; transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(0,0,0,.08);
}

/* Register */
.register-row { text-align: center; font-size: .84rem; color: #78909C; }
.register-row a {
  color: #0288D1; font-weight: 700; text-decoration: none; transition: color .2s;
}
.register-row a:hover { color: #4FC3F7; }

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .left-panel { width: 100%; padding: 36px 28px; }
  .hero h1 { font-size: 1.5rem; }
  .right-panel { padding: 36px 24px; }
}
</style>
