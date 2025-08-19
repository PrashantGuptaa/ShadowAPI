import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.jsx";
import "./index.css";
import { charcoalGoldenTheme as theme } from "./theme.js";
import { preloadCriticalImages } from "./utils/imageUtils.js";

// Preload critical images for better performance
preloadCriticalImages();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
