import { useState } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import LoginPage from "./containers/login";
import AppHeader from "./components/AppHeader";
import Dashboard from "./containers/dashboard";
import EmailVerification from "./containers/emailVerification";
import Register from "./containers/register";
import RuleConfig from "./containers/ruleConfig";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccess from "./containers/AuthSuccess";

function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rule-config"
          element={
            <ProtectedRoute>
              <RuleConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rule-config/:ruleId"
          element={
            <ProtectedRoute>
              <RuleConfig />
            </ProtectedRoute>
          }
        />

        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
