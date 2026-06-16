<template>
  <div class="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
    <transition-group name="toast">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        :class="[
          'pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border flex items-start gap-3 backdrop-blur-md transition-all duration-300',
          notification.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 
          notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
          notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' :
          'bg-white/90 border-gray-200 text-gray-800'
        ]"
      >
        <span 
          class="material-symbols-outlined mt-0.5"
          :class="[
            notification.type === 'success' ? 'text-green-500' : 
            notification.type === 'error' ? 'text-red-500' :
            notification.type === 'warning' ? 'text-amber-500' :
            'text-gray-500'
          ]"
        >
          {{ 
            notification.type === 'success' ? 'check_circle' : 
            notification.type === 'error' ? 'error' :
            notification.type === 'warning' ? 'warning' :
            'info'
          }}
        </span>
        <div class="flex-1">
          <h4 v-if="notification.title" class="font-bold text-sm">{{ notification.title }}</h4>
          <p class="text-sm whitespace-pre-wrap">{{ notification.message }}</p>
        </div>
        <button @click="notificationStore.removeNotification(notification.id)" class="text-gray-400 hover:text-gray-600 transition-colors">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../stores/notification'

const notificationStore = useNotificationStore()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
