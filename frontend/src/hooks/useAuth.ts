import { useState, useEffect, useCallback } from "react";

export enum AuthStatus {
  Loading = 'Loading',
  Authenticated = 'Authenticated',
  NotAuthenticated = 'NotAuthenticated'
}

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthStatus.Loading);

  const checkAuthStatus = useCallback(() =>{
    const authToken = parseCookies(document.cookie)["authToken"];
    console.log("Value is",(!!authToken && authToken.length > 0));
    const isAuthenticated = !!authToken && authToken.length > 0;

    setIsAuthenticated(isAuthenticated ? AuthStatus.Authenticated : AuthStatus.NotAuthenticated);
    console.log("isAuthenticated",isAuthenticated);
  },[]);

  useEffect(() => {
    console.log("check here",isAuthenticated);
  },[isAuthenticated]);

  useEffect(() => {
    checkAuthStatus();

    // Periodic check every 5 minutes
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 5  * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkAuthStatus]);

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
