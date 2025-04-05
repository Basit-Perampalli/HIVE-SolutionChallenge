import React, { useState } from "react";
import "./styles/main.css";
import "./styles/animations.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/AuthPages/LoginPage";
import SignupPage from "./components/AuthPages/SignupPage";
import NavBar from "./components/NavBar/NavBar";
import { ToastContainer } from "react-toastify";
import VoterPage from "./components/Voter/VoterPage";
import MobileNotification from "./components/MobileNotification/MobileNotification";
import HelpPage from "./components/HelpPage/HelpPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const updateToken = (newToken) => {
    setToken(newToken);
  };

  return (
    <div className="app">
      <BrowserRouter>
        {token && <NavBar />}
        <Routes>
          <Route
            path="/login"
            element={<LoginPage updateToken={updateToken} />}
          />
          <Route
            path="/signup"
            element={<SignupPage updateToken={updateToken} />}
          />
          <Route path="/voter" element={<VoterPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/" element={<MobileNotification />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
