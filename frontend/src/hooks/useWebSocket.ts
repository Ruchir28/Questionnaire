import { useEffect, useState, useCallback, useRef } from "react";
import { FrontEndWebSocket } from "../utils/FrontendWebSocket";
import { WEBSOCKET_URL } from "../constant";
let webSocket: FrontEndWebSocket | null = null;

export const useWebSocket = () => {
  const [isConnected, setConnected] = useState(webSocket?.ws.readyState === 1 ? true : false);
  const retryCount = useRef(0);
  console.log("isConnected", webSocket?.ws, isConnected);
  const initWebSocket = useCallback(() => {
      console.log("initWebSocket", webSocket?.ws, isConnected);
    if ((!webSocket || webSocket.ws.readyState === 3) && retryCount.current < 5) {
      console.log("called initWebSocket");
      webSocket = new FrontEndWebSocket(WEBSOCKET_URL);
      webSocket.ws.addEventListener("open", () => {
        retryCount.current = 0;
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
    retryCount.current += 1;
  }, [isConnected]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if(webSocket?.ws.readyState === 1 && isConnected === false) {
        setConnected(true);
        retryCount.current = 0;
      } else if(!isConnected) {
        console.log("Not connected", webSocket?.ws.readyState, isConnected);
        console.log("Trying to connect again ...");
        initWebSocket();
      }
    }, 1000);
    return () => {
      clearInterval(intervalId);
    }
  }, [isConnected, initWebSocket]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { webSocket, isConnected };
};
