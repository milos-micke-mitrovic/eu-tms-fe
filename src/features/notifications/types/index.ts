export type NotificationType = 'DOCUMENT_EXPIRING_7' | 'DOCUMENT_EXPIRING_14' | 'DOCUMENT_EXPIRING_30'

export type Notification = {
  id: number
  notificationType: NotificationType
  title: string
  message: string
  entityType: string
  entityId: number
  read: boolean
  createdAt: string
}
