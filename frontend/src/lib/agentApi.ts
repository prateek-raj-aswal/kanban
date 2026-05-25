import type { AgentMessage } from '@/store/agentStore'

const AGENT_BASE = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:8001'

export interface AgentChatResponse {
  reply: string
}

export async function sendChatMessage(
  messages: AgentMessage[],
  jwt: string
): Promise<AgentChatResponse> {
  const response = await fetch(`${AGENT_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ messages }),
  })
  if (!response.ok) {
    throw new Error(`Agent service returned ${response.status}`)
  }
  return response.json() as Promise<AgentChatResponse>
}
