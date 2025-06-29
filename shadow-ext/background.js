// Storage helper functions
const storage = {
  get: async (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve)),
  set: async (data) => new Promise(resolve => chrome.storage.local.set(data, resolve)),
  remove: async (keys) => new Promise(resolve => chrome.storage.local.remove(keys, resolve)),
  clear: async () => new Promise(resolve => chrome.storage.local.clear(resolve))
};

// Rule management
async function fetchAndStoreRules() {
  try {
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
      console.log("[ShadowAPI] Rules cleared from local storage");
      return;
    }

    const res = await fetch("http://localhost:3210/api/v1/rule/active-rules", {
      headers: {
        "auth-token": authToken,
        "Content-Type": "application/json",
      }
    });
    
    const result = await res.json();
    const rulesFromServer = result?.data || [];
    
    await storage.set({ rules: rulesFromServer });
    console.log("[ShadowAPI] Rules saved to local storage for injection.", rulesFromServer);
  } catch (e) {
    console.error("[ShadowAPI] Failed to fetch rules:", e);
    await storage.clear();
  }
}

// Message handlers
const messageHandlers = {
  GET_RULES: async (_, sendResponse) => {
    const { rules, enabled } = await storage.get(["rules", "enabled"]);
    sendResponse(enabled ? (rules || []) : []);
  },
  
  FETCH_RULES: async (_, sendResponse) => {
    try {
      await fetchAndStoreRules();
      sendResponse({ status: "rules_fetched" });
    } catch (error) {
      console.error("[ShadowAPI] Error fetching rules:", error);
      sendResponse({ status: "error", message: error.toString() });
    }
  },
  
  TOGGLE_EXTENSION: async (message, sendResponse) => {
    const newState = message.enabled;
    await storage.set({ enabled: newState });
    
    if (newState) {
      await fetchAndStoreRules();
      sendResponse({ status: "enabled_and_rules_fetched" });
    } else {
      await storage.remove("rules");
      console.log("[ShadowAPI] Rules cleared from local storage");
      sendResponse({ status: "disabled_and_rules_cleared" });
    }
  }
};

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("[ShadowAPI] Browser Installed");
  fetchAndStoreRules();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[ShadowAPI] Message received in background.js:", message);
  
  if (messageHandlers[message.type]) {
    messageHandlers[message.type](message, sendResponse);
    return true; // Required for async sendResponse
  }
});
