import { useState, useEffect, useRef } from 'react';

export function useWebSocket(userId) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications/${userId}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => { setConnected(false); setTimeout(connect, 5000); };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setNotifications(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 20));
        } catch (e) {}
      };
    };

    connect();
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [userId]);

  const clearNotifications = () => setNotifications([]);

  return { notifications, connected, clearNotifications };
}
