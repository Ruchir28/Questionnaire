import { useEffect, useState, useCallback } from 'react';
import { FrontEndWebSocket } from '../utils/FrontendWebSocket';
import {WEBSOCKET_URL} from '../constant'
let webSocket: FrontEndWebSocket | null = null;

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(false);

  const initWebSocket = useCallback(() => {
    if (!webSocket) {
      webSocket = new FrontEndWebSocket(WEBSOCKET_URL);
      webSocket.ws.addEventListener('open', () => setConnected(true));
      webSocket.ws.addEventListener('close', () => setConnected(false));
    }
  },[]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { webSocket, isConnected };
};
