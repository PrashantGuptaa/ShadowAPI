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

function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rule-config" element={<RuleConfig />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
