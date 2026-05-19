import { apiClient } from '../client';

export function sendChatMessage({ message, history, signal }) {
  return apiClient.post('/api/orchestration/chat', { message, history }, { signal });
}
