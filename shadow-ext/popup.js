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
    toggleBtn: document.getElementById("toggle-extension")
  };

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
      return;
    }

    updateStatus("Logged in");
    toggleVisibility(elements.loginForm, false);
    toggleVisibility(elements.toggleExtension, true);
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
      const res = await fetch("http://localhost:3210/api/v1/user/login", {
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
      updateStatus("Logged in");
    } catch (error) {
      console.error("Error during login:", error);
      updateStatus("Login failed. Please try again.");
    }
  }

  async function handleToggle(e) {
    const isEnabled = e.target.checked;
    console.log("[ShadowAPI] Toggle button clicked", isEnabled);
    
    await storage.set({ enabled: isEnabled });
    updateToggleButton(isEnabled);
    console.log(`[ShadowAPI] Extension ${isEnabled ? "enabled" : "disabled"}`);
    
    if (isEnabled) {
      fetchAndStoreRules();
    } else {
      await storage.remove("rules");
    }
  }

  async function fetchAndStoreRules() {
    try {
      console.log("[ShadowAPI] Fetching rules from server...");
      const { authToken } = await storage.get("authToken");
      if (!authToken) {
        console.warn("[ShadowAPI] No auth token found. Skipping rule fetch.");
        await storage.clear();
        return;
      }

      const { enabled } = await storage.get("enabled");
      if (!enabled) {
        console.log("[ShadowAPI] Extension disabled by user");
        await storage.remove("rules");
        return;
      }

      const res = await fetch("http://localhost:3210/api/v1/rule/active-rules", {
        headers: {
          "auth-token": authToken,
          "Content-Type": "application/json",
        },
      });
      
      if (res.status !== 200) {
        await storage.clear();
        return;
      }

      const result = await res.json();
      const rules = result?.data || [];
      await storage.set({ rules });
      console.log("[ShadowAPI] Rules saved:", rules.length);
      
      injectContentScript();
    } catch (e) {
      console.error("[ShadowAPI] Failed to fetch rules:", e);
      await storage.clear();
    }
  }

  function injectContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || tab.url.startsWith("chrome://")) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }, () => {
        chrome.tabs.sendMessage(tab.id, { type: "INJECT_SCRIPT" });
      });
    });
  }
}
