import React, { useState } from "react";
import ApplicationForm from "./components/ApplicationForm";
import "./styles/main.css";
import "./styles/animations.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/AuthPages/LoginPage";
import SignupPage from "./components/AuthPages/SignupPage";
import NavBar from "./components/NavBar/NavBar";
import { ToastContainer } from "react-toastify";
import AdminDashboard from "./Dashboards/AdminDashboard";
import BatchUpload from "./components/ApplicationForm/BatchUpload";
import ImageDataExtractor from "./components/ImageDataExtractor/ImageDataExtractor";
import VoterIDExtractor from "./components/VoterIDExtractor/VoterIDExtractor";
import VoterPage from "./components/Voter/VoterPage";

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
          <Route path="/" element={<ApplicationForm />} />
          <Route
            path="/login"
            element={<LoginPage updateToken={updateToken} />}
          />
          <Route
            path="/signup"
            element={<SignupPage updateToken={updateToken} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/batchprocess" element={<BatchUpload />} />
          <Route path="/extract" element={<ImageDataExtractor />} />
          <Route path="/voter-id" element={<VoterIDExtractor />} />
          <Route path="/voter" element={<VoterPage />} />
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
