// Configuration
const CONFIG = {
  API_URL: "http://localhost:3210/api/v1",
  UI_URL: "http://localhost:5173",
  ENV: "local",
};

// Storage helper functions
const storage = {
  get: async (keys) =>
    new Promise((resolve) => chrome.storage.local.get(keys, resolve)),
  set: async (data) =>
    new Promise((resolve) => chrome.storage.local.set(data, resolve)),
  remove: async (keys) =>
    new Promise((resolve) => chrome.storage.local.remove(keys, resolve)),
  clear: async () =>
    new Promise((resolve) => chrome.storage.local.clear(resolve)),
};

// Rule management - Fetch rules from backend
async function fetchAndStoreRules() {
  try {
    console.log("[ShadowAPI] Background: Fetching rules from server...");
    const { authToken } = await storage.get("authToken");
    
    if (!authToken) {
      console.warn("[ShadowAPI] No auth token found. Skipping rule fetch.");
      await storage.clear();
      return { success: false, error: "No auth token" };
    }

    const { enabled } = await storage.get("enabled");
    if (!enabled) {
      console.log("[ShadowAPI] Extension disabled by user");
      await storage.remove("rules");
      return { success: false, error: "Extension disabled" };
    }

    const res = await fetch(`${CONFIG.API_URL}/rule/extension/active-rules`, {
      headers: {
        "auth-token": authToken,
        "Content-Type": "application/json",
      },
    });
    
    if (res.status !== 200) {
      console.error("[ShadowAPI] Failed to fetch rules, status:", res.status);
      await storage.clear();
      return { success: false, error: `HTTP ${res.status}` };
    }

    const result = await res.json();
    const rules = result?.data || [];
    await storage.set({ rules });
    console.log("[ShadowAPI] Rules saved:", rules.length);
    
    // Notify all tabs that rules have been updated
    notifyAllTabs({ type: "RULES_UPDATED", rulesCount: rules.length });
    
    return { success: true, rulesCount: rules.length };
  } catch (e) {
    console.error("[ShadowAPI] Failed to fetch rules:", e);
    await storage.clear();
    return { success: false, error: e.message };
  }
}

// Notify all tabs about rule updates
async function notifyAllTabs(message) {
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      // Skip chrome:// URLs and other restricted pages
      if (tab.url && !tab.url.startsWith("chrome://")) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
  } catch (error) {
    console.error("[ShadowAPI] Error notifying tabs:", error);
  }
}

// Inject content script into a specific tab
async function injectContentScriptIntoTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url || tab.url.startsWith("chrome://")) {
      return { success: false, error: "Cannot inject into this tab" };
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    await chrome.tabs.sendMessage(tab.id, { type: "INJECT_SCRIPT" });
    return { success: true };
  } catch (error) {
    console.error("[ShadowAPI] Error injecting script:", error);
    return { success: false, error: error.message };
  }
}

// Message handlers
const messageHandlers = {
  GET_RULES: async (_, sendResponse) => {
    const { rules = [], enabled } = await storage.get(["rules", "enabled"]);
    sendResponse(enabled ? { rules, enabled } : []);
  },

  TOGGLE_EXTENSION: async (message, sendResponse) => {
    const newState = message.enabled;
    await storage.set({ enabled: newState });

    if (newState) {
      console.log("[ShadowAPI] Extension enabled by user, fetching rules...");
      const result = await fetchAndStoreRules();
      sendResponse({ 
        status: "enabled_and_rules_fetched", 
        success: result.success,
        rulesCount: result.rulesCount 
      });
    } else {
      await storage.remove("rules");
      console.log("[ShadowAPI] Rules cleared from local storage");
      sendResponse({ status: "disabled_and_rules_cleared" });
    }
  },

  FETCH_RULES: async (message, sendResponse) => {
    console.log("[ShadowAPI] Manual rule fetch requested");
    const result = await fetchAndStoreRules();
    sendResponse(result);
  },

  INJECT_INTO_TAB: async (message, sendResponse) => {
    const result = await injectContentScriptIntoTab(message.tabId);
    sendResponse(result);
  },
};

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log("[ShadowAPI] Browser Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[ShadowAPI] Message received in background.js:", message);

  if (messageHandlers[message.type]) {
    messageHandlers[message.type](message, sendResponse);
    return true; // Required for async sendResponse
  }
});
