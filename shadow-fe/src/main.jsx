import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { preloadCriticalImages } from "./utils/imageUtils.js";

// Preload critical images for better performance
preloadCriticalImages();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
