export interface AuthResponse {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface BoardResponse {
  id: string
  name: string
  ownerId: string
  role?: string
  createdAt: string
  columns?: ColumnResponse[]
}

export interface ColumnResponse {
  id: string
  boardId: string
  name: string
  position: number
  createdAt?: string
  cards?: CardResponse[]
}

export interface CardResponse {
  id: string
  columnId: string
  title: string
  description: string | null
  position: number
  assigneeId: string | null
  dueDate: string | null
  labels: LabelResponse[]
  createdAt?: string
  updatedAt?: string
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

export interface ApiError {
  error: string
  code: string
  fields?: { field: string; message: string }[]
}
