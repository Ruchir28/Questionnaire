import { useState, useEffect } from "react";

function useAuth(initialState = false) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialState);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuthStatus();

    // Periodic check every 5 minutes
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return isAuthenticated;
}

export default useAuth;
