import React from "react";
import { useState } from "react";
import { BACKEND_URL } from "../constant";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import useAuth, { AuthStatus } from "../hooks/useAuth";

function Login() {
  const [name, setName] = useState("");
  const isAuthenticated = useAuth();
  console.log("State is", isAuthenticated);

  async function onSubmit(e: any) {
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

  if (isAuthenticated === AuthStatus.Authenticated) {
    return <Navigate to="/"></Navigate>;
  }

  return (
    <div>
      <div className="ms-5">
        <h1 className="text-primary">Login</h1>
      </div>
      <div className="d-flex my-3 ms-5">
        <input
          type="text"
          className="form-control w-50 m-2 my-auto"
          placeholder="Enter User Name"
          aria-label="Recipient's username"
          aria-describedby="button-addon2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary me-auto my-auto"
          type="button"
          id="button-addon2"
          onClick={() => {
            onSubmit(name);
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
