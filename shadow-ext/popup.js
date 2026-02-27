import { CONFIG } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  initializePopup();
});

function initializePopup() {
  // Cache DOM elements
  const elements = {
    status: document.getElementById("status"),
    loginForm: document.getElementById("loginForm"),
    toggleExtension: document.getElementById("toggle-extension-label"),
    dashboard: document.getElementById("open-dashboard"),
    loginButton: document.getElementById("rule-login"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    toggleBtn: document.getElementById("toggle-extension"),
    openDashboardLink: document.getElementById("open-dashboard-link"),
    logoutButton: document.getElementById("logout-link"),
  };

  // Set up the dashboard link
  if (elements.openDashboardLink) {
    elements.openDashboardLink.href = CONFIG.UI_URL + "/dashboard";
  }

  // Storage helper
  const storage = {
    get: async (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
    set: async (data) => new Promise(resolve => chrome.storage.local.set(data, resolve)),
    remove: async (keys) => new Promise(resolve => chrome.storage.local.remove(keys, resolve)),
    clear: async () => new Promise(resolve => chrome.storage.local.clear(resolve))
  };

  // Initialize UI based on auth status
  initializeAuthUI();
  initializeToggleButton();

  // Set up event listeners
  elements.loginButton.addEventListener("click", handleLogin);
  elements.toggleBtn.addEventListener("change", handleToggle);
  if (elements.logoutButton) {
    elements.logoutButton.addEventListener("click", handleLogout);
  }

  // Helper functions
  function updateStatus(message) {
    if (elements.status) elements.status.innerText = message;
  }

  function toggleVisibility(element, isVisible) {
    if (element) element.style.display = isVisible ? "block" : "none";
  }

  async function initializeAuthUI() {
    const { authToken } = await storage.get("authToken");
    
    if (!authToken) {
      updateStatus("Please log in to use ShadowAPI");
      toggleVisibility(elements.loginForm, true);
      toggleVisibility(elements.toggleExtension, false);
      toggleVisibility(elements.logoutButton, false);
      return;
    }

    updateStatus("Logged in");
    toggleVisibility(elements.loginForm, false);
    toggleVisibility(elements.toggleExtension, true);
    toggleVisibility(elements.logoutButton, true);
  }

  async function initializeToggleButton() {
    const { enabled = false } = await storage.get("enabled");
    updateToggleButton(enabled);
  }

  function updateToggleButton(isEnabled) {
    if (!elements.toggleBtn) return;
    
    elements.toggleBtn.checked = isEnabled;
    elements.toggleBtn.setAttribute("value", isEnabled ? "Disable" : "Enable");
    elements.toggleBtn.setAttribute("aria-checked", isEnabled ? "true" : "false");
  }

  async function handleLogin() {
    const email = elements.email?.value || "";
    const password = elements.password?.value || "";

    if (!email || !password) {
      updateStatus("Please enter both email and password.");
      return;
    }

    updateStatus("Logging in...");

    try {
      const res = await fetch(`${CONFIG.API_URL}/user/extension-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result = await res.json();
      const authToken = result?.data?.token;

      if (!authToken) {
        updateStatus("Please login");
        toggleVisibility(elements.loginForm, true);
        throw new Error("No auth token received");
      }

      await storage.set({ authToken });
      toggleVisibility(elements.loginForm, false);
      toggleVisibility(elements.toggleExtension, true);
      toggleVisibility(elements.logoutButton, true);
      updateStatus("Logged in");
    } catch (error) {
      console.error("Error during login:", error);
      updateStatus("Login failed. Please try again.");
    }
  }

  async function handleLogout() {
    const confirmed = confirm("Are you sure you want to logout? You'll need to sign in again.");
    if (!confirmed) return;

    await storage.clear();
    updateStatus("Logged out successfully");
    toggleVisibility(elements.loginForm, true);
    toggleVisibility(elements.toggleExtension, false);
    toggleVisibility(elements.logoutButton, false);
    updateToggleButton(false);
  }

  async function handleToggle(e) {
    const isEnabled = e.target.checked;
    console.log("[ShadowAPI] Toggle button clicked", isEnabled);
    
    updateToggleButton(isEnabled);
    console.log(`[ShadowAPI] Extension ${isEnabled ? "enabled" : "disabled"}`);
    
    // Let background.js handle the business logic
    chrome.runtime.sendMessage(
      { type: "TOGGLE_EXTENSION", enabled: isEnabled },
      (response) => {
        if (response?.success) {
          console.log(`[ShadowAPI] Rules fetched: ${response.rulesCount}`);
          updateStatus(`Extension enabled (${response.rulesCount} rules loaded)`);
          
          // Inject into current tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.runtime.sendMessage({
                type: "INJECT_INTO_TAB",
                tabId: tabs[0].id
              });
            }
          });
        } else if (response?.status === "disabled_and_rules_cleared") {
          updateStatus("Extension disabled");
        } else {
          console.error("[ShadowAPI] Failed to fetch rules");
          updateStatus("Failed to load rules");
        }
      }
    );
  }
}
