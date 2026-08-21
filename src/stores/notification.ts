import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationItem, NotifyOptions } from '../types/notification.types'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  let nextId = 1

  const notify = ({ type = 'success', title = '', message = '', duration = 3000 }: NotifyOptions): void => {
    const id = nextId++
    notifications.value.push({
      id,
      type,
      title,
      message,
    })

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: number): void => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    notify,
    removeNotification,
  }
})
