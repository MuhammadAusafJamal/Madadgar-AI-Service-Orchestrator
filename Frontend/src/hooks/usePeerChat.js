import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ensureChatSession,
  sendPeerMessage,
  subscribeToPeerChat,
} from '@/src/services/peerChatService';

export function usePeerChat(sessionId, currentUid, meta = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const metaRef = useRef(meta);
  metaRef.current = meta;

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    ensureChatSession(sessionId, metaRef.current).catch((e) => {
      if (!cancelled) setError(e);
    });

    const unsubscribe = subscribeToPeerChat(sessionId, (msgs) => {
      if (cancelled) return;
      setMessages(msgs);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [sessionId]);

  const send = useCallback(
    async (text) => {
      if (!sessionId || !currentUid) return;
      try {
        await sendPeerMessage(sessionId, currentUid, text);
      } catch (e) {
        setError(e);
      }
    },
    [sessionId, currentUid],
  );

  return { messages, send, loading, error };
}
