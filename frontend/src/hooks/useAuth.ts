import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
export enum AuthStatus {
  Loading = 'Loading',
  Authenticated = 'Authenticated',
  NotAuthenticated = 'NotAuthenticated'
}

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthStatus.Loading);
  const {webSocket,isConnected} = useWebSocket();



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
    if(tokeanAvailable && webSocket && isConnected) {
      setIsAuthenticated(AuthStatus.Authenticated);
    } else if(webSocket?.ws.readyState === 0) {
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
  }, [webSocket,isConnected,webSocket?.ws.readyState]);


  return isAuthenticated;
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
