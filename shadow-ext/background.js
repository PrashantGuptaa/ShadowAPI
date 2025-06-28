chrome.runtime.onInstalled.addListener(() => {
  fetchAndStoreRules();
  setInterval(fetchAndStoreRules, 30 * 1000);
});

async function fetchAndStoreRules() {
  try {
    const res = await fetch("http://localhost:3210/api/v1/rule/active-rules");
    const result = await res.json();
    const rulesFromServer = result?.data || [];

    console.log("[ShadowAPI] Fetched rules from server:", rulesFromServer);

    chrome.storage.local.set({ rules: rulesFromServer }, () => {
      console.log(
        "[ShadowAPI] Rules saved to local storage for injection.",
        rulesFromServer
      );
    });
  } catch (e) {
    console.error("[ShadowAPI] Failed to fetch rules:", e);
  }
}

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
