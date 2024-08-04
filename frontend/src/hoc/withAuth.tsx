import React, { useEffect } from "react";
import {useNavigate} from 'react-router-dom'
import useStore, {AuthStatus} from "../hooks/useStore";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
):  React.FC<P> => {
  return (props: P) => {
    const {isAuthenticated} = useStore(); 
    const navigate = useNavigate();
    useEffect(()=>{
      console.log("State is",isAuthenticated);
      if (isAuthenticated === AuthStatus.NotAuthenticated) {
         navigate("/login");
        console.log("Not Authenticated");
      }
    },[isAuthenticated,navigate]);
    if(isAuthenticated === AuthStatus.Loading) {
      return <div>Loading...</div>
    }
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
