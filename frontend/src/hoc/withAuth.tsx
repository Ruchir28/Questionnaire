import React, { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import {useNavigate} from 'react-router-dom'

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
):  React.FC<P> => {
  return (props: P) => {
    const isAuthenticated = useAuth(); 
    const navigate = useNavigate();
    useEffect(()=>{
      if (!isAuthenticated) {
        navigate("/login")
      }
    },[isAuthenticated,navigate]);
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
