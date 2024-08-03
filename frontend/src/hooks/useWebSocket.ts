import { useEffect, useState, useCallback, useRef } from "react";
import { FrontEndWebSocket } from "../utils/FrontendWebSocket";
import { WEBSOCKET_URL } from "../constant";
let webSocket: FrontEndWebSocket | null = null;

export enum WebSocketStatus {
  Uninitialized = "Uninitialized",
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
};

export const useWebSocket = () => {
  const retryCount = useRef(0);
  const [webSocketStatus,setWebSocketStatus] = useState<WebSocketStatus>(() => {
    if(!webSocket) {
      return WebSocketStatus.Uninitialized;
    } else if(webSocket.ws.readyState === 1) {
      return WebSocketStatus.Connected;
    } else if(webSocket.ws.readyState === 0) {
      return WebSocketStatus.Connecting;
    }
    return WebSocketStatus.Disconnected;
  });
  const initWebSocket = useCallback(() => {
    console.log("initWebSocket", webSocket?.ws, webSocketStatus, retryCount.current);
    if ((!webSocket || webSocketStatus === WebSocketStatus.Disconnected)) {
      console.log("called initWebSocket");
      webSocket = new FrontEndWebSocket(WEBSOCKET_URL);
      webSocket.ws.addEventListener("open", () => {
        retryCount.current = 0;
        console.log(`WebSocket connection established with ${WEBSOCKET_URL}`);
        setWebSocketStatus(WebSocketStatus.Connected);
      });
      webSocket.ws.addEventListener("error", () => {
        console.log(`WebSocket connection failed with ${WEBSOCKET_URL}`);
        webSocket?.ws.close();
        setWebSocketStatus(WebSocketStatus.Disconnected);
      });
      webSocket.ws.addEventListener("close", () => {
        console.log(`WebSocket connection closed with ${WEBSOCKET_URL}`);
        webSocket?.ws.close();
        setWebSocketStatus(WebSocketStatus.Disconnected);
      });
    }
  },[webSocketStatus]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if(!webSocket) {
        setWebSocketStatus(WebSocketStatus.Uninitialized);
        initWebSocket();
      }
      else if(webSocket.ws.readyState === 1) {
        setWebSocketStatus(WebSocketStatus.Connected);
        retryCount.current = 0;
      } else if(webSocket?.ws.readyState === 0) {
        setWebSocketStatus(WebSocketStatus.Connecting);
      } else if(webSocket?.ws.readyState === 3) {
        setWebSocketStatus(WebSocketStatus.Disconnected);
        initWebSocket();
      }
    }, 1000);
    return () => {
      clearInterval(intervalId);
    }
  }, [initWebSocket]);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);

  return { webSocket, webSocketStatus: webSocketStatus };
};
