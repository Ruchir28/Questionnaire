import { useEffect, useState, useCallback } from "react";
import { FrontEndWebSocket } from "../utils/FrontendWebSocket";
import { WEBSOCKET_URL } from "../constant";
let webSocket: FrontEndWebSocket | null = null;

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(webSocket ? true : false);

  const initWebSocket = useCallback(() => {
    if (!webSocket) {
      webSocket = new FrontEndWebSocket(WEBSOCKET_URL);
    }
    webSocket.ws.addEventListener("open", () => {
      console.log(`WebSocket connection established with ${WEBSOCKET_URL}`);
      setConnected(true);
    });
    webSocket.ws.addEventListener("close", () => setConnected(false));
  }, []);

  useEffect(() => {
    console.log("updated", isConnected);
  }, [isConnected]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { webSocket, isConnected };
};
