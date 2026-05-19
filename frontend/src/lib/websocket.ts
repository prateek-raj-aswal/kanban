import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface BoardEvent {
  eventType:
    | 'CARD_CREATED' | 'CARD_UPDATED' | 'CARD_MOVED' | 'CARD_DELETED'
    | 'COLUMN_CREATED' | 'COLUMN_UPDATED' | 'COLUMN_REORDERED' | 'COLUMN_DELETED'
    | 'COLUMN_COLOR_UPDATED'
  boardId: string
  timestamp: string
  data: unknown
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8081/ws'

export function subscribeToBoard(
  boardId: string,
  token: string,
  onEvent: (event: BoardEvent) => void,
): () => void {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/boards/${boardId}`, (msg) => {
        try {
          onEvent(JSON.parse(msg.body) as BoardEvent)
        } catch {
          // ignore malformed frames
        }
      })
    },
  })

  client.activate()
  return () => { client.deactivate() }
}
