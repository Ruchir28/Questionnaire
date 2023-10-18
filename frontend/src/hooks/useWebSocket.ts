import { useEffect, useState, useCallback } from 'react';

let ws: WebSocket | null = null;

export const useWebSocket = (url: string) => {
  const [isConnected, setConnected] = useState(false);

  const initWebSocket = useCallback(() => {
    if (!ws) {
      ws = new WebSocket(url);
      ws.addEventListener('open', () => setConnected(true));
      ws.addEventListener('close', () => setConnected(false));
    }
  }, [url]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { ws, isConnected };
};
