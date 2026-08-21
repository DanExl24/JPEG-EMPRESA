export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  message: string
}

export interface NotifyOptions {
  type?: NotificationType
  title?: string
  message?: string
  duration?: number
}
