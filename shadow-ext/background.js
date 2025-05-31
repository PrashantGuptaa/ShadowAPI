async function fetchAndStoreRules() {
  try {
    const res = await fetch('http://localhost:3210/api/v1/interceptor/data');
    const result = await res.json();
    const rulesFromServer = result?.data?.data || [];

    chrome.storage.local.set({ rules: rulesFromServer }, () => {
      console.log("[ShadowAPI] Rules saved to storage for injection.");
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_RULES") {
        chrome.storage.local.get("rules", (data) => {
          sendResponse(data.rules || []);
        });
        // Must return true to indicate async response
        return true;
      }
    });
  } catch (e) {
    console.error('[ShadowAPI] Failed to fetch mock rules:', e);
  }
}

// Poll every 30 seconds
setInterval(fetchAndStoreRules, 30 * 1000);
fetchAndStoreRules(); // initial load
