import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Space from "./components/Space";

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
    </BrowserRouter>
  );
}

export default App;
