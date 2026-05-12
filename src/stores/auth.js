import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    name: 'Juan Pérez',
    email: 'juan@nursedacademy.com',
    avatar: null,
  })

  function setUser(userData) {
    user.value = { ...user.value, ...userData }
  }

  return { user, setUser }
})
