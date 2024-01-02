import { useEffect, useState, useCallback } from "react";
import { FrontEndWebSocket } from "../utils/FrontendWebSocket";
import { WEBSOCKET_URL } from "../constant";
let webSocket: FrontEndWebSocket | null = null;

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(webSocket?.ws.readyState === 1 ? true : false);
  console.log("isConnected", webSocket?.ws, isConnected);
  const initWebSocket = useCallback(() => {
    if (!webSocket || webSocket.ws.readyState === 3) {
      console.log("called initWebSocket");
      webSocket = new FrontEndWebSocket(WEBSOCKET_URL);
      webSocket.ws.addEventListener("open", () => {
        console.log(`WebSocket connection established with ${WEBSOCKET_URL}`);
        setConnected(true);
      });
      webSocket.ws.addEventListener("error", () => {
        console.log(`WebSocket connection failed with ${WEBSOCKET_URL}`);
        webSocket = null;
        setConnected(false)
      });
      webSocket.ws.addEventListener("close", () => {
        console.log(`WebSocket connection closed with ${WEBSOCKET_URL}`);
        webSocket = null;
        setConnected(false)
      });
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if(webSocket?.ws.readyState === 1 && isConnected === false) {
        setConnected(true);
      }
    }, 5 * 100);
    return () => {
      clearInterval(intervalId);
    }
  }, [isConnected, initWebSocket]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { webSocket, isConnected };
};
