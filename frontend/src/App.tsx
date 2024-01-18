import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Space from "./components/Space";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/space">
          <Route path=":spaceId" element={<Space/>}></Route>
        </Route>
      </Routes>
      <ToastContainer/>
    </BrowserRouter>
  );
}

export default App;
