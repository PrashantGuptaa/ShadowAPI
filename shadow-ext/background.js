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

// Rule management

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
      sendResponse({ status: "enabled_and_rules_fetch_started" });
    } else {
      await storage.remove("rules");
      console.log("[ShadowAPI] Rules cleared from local storage");
      sendResponse({ status: "disabled_and_rules_cleared" });
    }
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
