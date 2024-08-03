import { useState, useEffect } from "react";
import { useWebSocket, WebSocketStatus } from "./useWebSocket";;
export enum AuthStatus {
  Loading = 'Loading',
  Authenticated = 'Authenticated',
  NotAuthenticated = 'NotAuthenticated'
}

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthStatus.Loading);
  const {webSocket,webSocketStatus} = useWebSocket();



  const checkAuthStatus = () =>{
    const authToken = parseCookies(document.cookie)["authToken"];
    console.log("Value is",(!!authToken && authToken.length > 0));
    const isAuthenticated = !!authToken && authToken.length > 0;
    console.log("checkAuthStatus function",isAuthenticated);
    return isAuthenticated;
    };

  useEffect(() => {
    const tokeanAvailable = checkAuthStatus();
    console.log("useAuth",tokeanAvailable,webSocket?.ws.readyState);
    if(tokeanAvailable && webSocket && webSocketStatus === WebSocketStatus.Connected) {
      setIsAuthenticated(AuthStatus.Authenticated);
    } else if(webSocketStatus === WebSocketStatus.Connecting || webSocketStatus === WebSocketStatus.Uninitialized) {
      setIsAuthenticated(AuthStatus.Loading);
    } else {
      setIsAuthenticated(AuthStatus.NotAuthenticated);
    }
    return () => {
      document.cookie = document.cookie.split(";").filter((c) => {
        let cookie = c.split("=");
        let cookieName = cookie[0].trim();
        return cookieName !== "authToken";
      }).join(";");
    }
  }, [webSocket,webSocketStatus,webSocket?.ws.readyState]);

  const logout = () => {
    document.cookie = document.cookie.split(";").filter((c) => {
      let cookie = c.split("=");
      let cookieName = cookie[0].trim();
      return cookieName !== "authToken";
    }).join(";");
    setIsAuthenticated(AuthStatus.NotAuthenticated);
  };


  return {isAuthenticated,logout};
}


function parseCookies(cookies: string): { [key: string]: string } {
  const list: { [key: string]: string } = {};

  cookies && cookies.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    const value = decodeURI(parts.join('=')?.trim());
    if(key && value) {
      list[key] = value;
    }
  });

  return list;
}
export default useAuth;
