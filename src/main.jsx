import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";

import SplashScreen from "./pages/splashscreen";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

const savedGoogleClientId = localStorage.getItem('sync_google_client_id') || "1029384756-mockclientid.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={savedGoogleClientId}>
      <AuthProvider>
        <TaskProvider>
          <BrowserRouter>
            <Routes>

              {/* Splash Screen */}
              <Route path="/" element={<SplashScreen />} />

              {/* Login Page */}
              <Route path="/login" element={<Login />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

            </Routes>
          </BrowserRouter>
        </TaskProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);