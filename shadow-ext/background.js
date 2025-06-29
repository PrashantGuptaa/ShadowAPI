chrome.runtime.onInstalled.addListener(() => {
  fetchAndStoreRules();
  setInterval(fetchAndStoreRules, 30 * 1000);
});

async function fetchAndStoreRules() {
  try {
    chrome.storage.local.get("authToken", async ({ authToken }) => {
      if (!authToken) {
        console.warn("[ShadowAPI] No auth token found. Skipping rule fetch.");
        clearChromeLocalStorage();
        return;
      }
      const res = await fetch(
        "http://localhost:3210/api/v1/rule/active-rules",
        {
          headers: {
            ["auth-token"]: `${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await res.json();
      const rulesFromServer = result?.data || [];

      console.log("[ShadowAPI] Fetched rules from server:", rulesFromServer);

      chrome.storage.local.set({ rules: rulesFromServer }, () => {
        console.log(
          "[ShadowAPI] Rules saved to local storage for injection.",
          rulesFromServer
        );
      });
    });
  } catch (e) {
    console.error("[ShadowAPI] Failed to fetch rules:", e);
    clearChromeLocalStorage();
  }
}

const clearChromeLocalStorage = () => {
  chrome.storage.local.clear(() => {
    console.log("chrome.storage.local cleared");
  });
};

// ✅ Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[ShadowAPI] Message received in background.js:", message);

  if (message.type === "GET_RULES") {
    chrome.storage.local.get("rules", (data) => {
      sendResponse(data.rules || []);
    });

    return true; // Required for async sendResponse
  }
});
