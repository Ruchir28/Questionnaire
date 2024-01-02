import React from "react";
import { useState } from "react";
import { BACKEND_URL } from "../constant";
import Cookies from "js-cookie";
import {Navigate} from 'react-router-dom'
import useAuth, { AuthStatus } from "../hooks/useAuth";

function Login() {
  const [name, setName] = useState("");
  const isAuthenticated = useAuth();
  console.log("State is",isAuthenticated);

  async function onSubmit(e: any) {
    e.preventDefault();
    console.log(name);
    fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName: name }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        Cookies.set("authToken", encodeURI(data.userId));
      })
      .catch((err) => {
        console.log("Login Failed");
      });
  }

  if(isAuthenticated === AuthStatus.Authenticated) {
    return <Navigate to="/"></Navigate>
  }

  return (
    <div>
      <h1>Login</h1>
      <form>
        <label>
          UserName:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button type="submit" value="Submit" onClick={(e) => onSubmit(e)}>
          LOGIN
        </button>
      </form>
    </div>
  );
}

export default Login;
