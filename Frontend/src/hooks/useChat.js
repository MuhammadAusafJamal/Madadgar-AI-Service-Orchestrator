import { useCallback, useEffect, useRef, useState } from 'react';

import { sendChatMessage } from '@/src/api/endpoints/orchestration';
import { useAuth } from '@/src/context/AuthContext';
import { saveBookingForUser } from '@/src/services/bookingService';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatHistory(messages) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || loading) return;

      const userMsg = { id: makeId(), role: 'user', text: trimmed };
      const historyString = formatHistory([...messages, userMsg]);

      setMessages((prev) => [...prev, userMsg]);
      setError(null);
      setLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await sendChatMessage({
          message: trimmed,
          history: historyString,
          signal: controller.signal,
        });

        const replyText =
          result?.message ||
          (result?.success === false ? 'Something went wrong.' : 'No response from server.');

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'assistant',
            text: replyText,
            booking: result?.booking,
          },
        ]);

        if (result?.booking && user?.uid) {
          saveBookingForUser(user.uid, result.booking).catch(() => {});
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: 'assistant', text: `⚠️ ${err.message}`, isError: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, user?.uid]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return { messages, send, reset, loading, error };
}
