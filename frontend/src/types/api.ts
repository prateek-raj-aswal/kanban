export interface AuthResponse {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface BoardResponse {
  id: string
  name: string
  ownerId: string
  role?: string
  createdAt: string
  workspaceId?: string | null
  taskCount?: number
  columns?: ColumnResponse[]
  groupBy?: string
}

export interface ModuleResponse {
  id: string
  boardId: string
  name: string
  color?: string | null
}

export interface WorkspaceResponse {
  id: string
  name: string
  ownerId: string
  role: string
  createdAt: string
}

export interface SmartCardResponse {
  id: string
  title: string
  boardId: string
  boardName: string
  columnId: string
  columnName: string
  dueDate: string | null
  startDate: string | null
  priority: string
}

export interface TimelineCardResponse {
  id: string
  title: string
  columnName: string
  startDate: string | null
  dueDate: string | null
  priority: string
  assignees: string[]
}

export interface ColumnResponse {
  id: string
  boardId: string
  name: string
  position: number
  headerColor?: string | null
  createdAt?: string
  cards?: CardResponse[]
}

export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ItemType = 'STORY' | 'FEATURE' | 'BUG'

export interface CardResponse {
  id: string
  columnId: string
  title: string
  description: string | null
  position: number
  startDate: string | null
  dueDate: string | null
  priority: Priority
  labels: LabelResponse[]
  assignees: string[]
  color?: string | null
  subtaskTotal?: number
  subtaskDone?: number
  commentCount?: number
  createdAt?: string
  updatedAt?: string
  modules?: ModuleResponse[]
  type?: ItemType
  readableId?: string
}

export interface AttachmentResponse {
  id: string
  cardId: string
  filename: string
  url: string
  contentType: string
  sizeBytes: number
  uploadedBy: string
  uploadedAt: string
}

export interface LabelResponse {
  id: string
  name: string
  color: string
}

export interface MemberResponse {
  userId: string
  displayName: string
  email: string
  role: string
  joinedAt: string
}

export interface InvitationResponse {
  id: string
  boardId: string
  inviteeEmail: string
  token: string
  status: string
  expiresAt: string
}

export interface SubtaskResponse {
  id: string
  cardId: string
  title: string
  completed: boolean
  position: number
  createdAt: string
}

export interface CommentResponse {
  id: string
  cardId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface ActivityLogResponse {
  id: string
  boardId: string
  cardId: string | null
  actorId: string | null
  actorName: string | null
  eventType: string
  summary: string
  createdAt: string
}

export interface NotificationResponse {
  id: string
  cardId: string | null
  boardId: string | null
  type: string
  message: string
  read: boolean
  createdAt: string
}

export interface ApiError {
  error: string
  code: string
  fields?: { field: string; message: string }[]
}

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export interface IssueResponse {
  id: string
  title: string
  description: string | null
  status: IssueStatus
  parentCardId: string | null
  createdAt: string
  updatedAt: string
  type?: ItemType
  readableId?: string
}
