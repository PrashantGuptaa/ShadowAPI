// Debug mode flag - can be controlled via settings if needed
const DEBUG_LOG = false;

function debug(...args) {
  if (DEBUG_LOG) console.debug("[ShadowAPI Debug]", ...args);
}

console.log("[ShadowAPI] Content script initialized");

// Function to inject fetch/XHR logic into the page context
function injectOverrideScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("injectedFetch.js");
  script.onload = () => {
    debug("injectedFetch.js loaded and injected");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject immediately when content script loads
injectOverrideScript();

// Helper function to check if extension context is still valid
function isExtensionContextValid() {
  return typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;
}

// Listen for messages from the page (injected script asking for rules)
window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    !event.data ||
    event.data.type !== "GET_RULES"
  ) {
    return;
  }

  debug("Received GET_RULES request from page");

  try {
    // Check if extension context is still valid
    if (!isExtensionContextValid()) {
      console.warn("[ShadowAPI] Extension context invalid, cannot get rules");
      window.postMessage(
        {
          type: "GET_RULES_RESPONSE",
          rules: [],
          requestId: event.data.requestId || null,
          error: "Extension context invalid",
          enabled: false,
        },
        "*"
      );
      return;
    }

    chrome.runtime.sendMessage(
      { type: "GET_RULES" },
      ({ rules = [], enabled }) => {
        try {
          debug(`Received rules from background`, rules);
          window.postMessage(
            {
              type: "GET_RULES_RESPONSE",
              rules: rules,
              requestId: event.data.requestId || null,
              error: null,
              enabled,
            },
            "*"
          );
        } catch (error) {
          console.error("[ShadowAPI] Error sending rules to page:", error);
          window.postMessage(
            {
              type: "GET_RULES_RESPONSE",
              rules: [],
              requestId: event.data.requestId || null,
              error: error.message,
            },
            "*"
          );
        }
      }
    );
  } catch (error) {
    console.error("[ShadowAPI] Error getting rules:", error);
  }
});

// Listen for messages from the background or popup
try {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === "INJECT_SCRIPT") {
      debug("Received INJECT_SCRIPT command");

      try {
        // fetch rules before injecting script
        chrome.runtime.sendMessage({ type: "GET_RULES" }, (rules = []) => {
          try {
            injectOverrideScript();
            sendResponse({ status: "injected", rulesCount: rules.length });
          } catch (error) {
            console.error("[ShadowAPI] Error handling rules:", error);
            sendResponse({ status: "error", error: error.message });
          }
        });
      } catch (error) {
        console.error("[ShadowAPI] Error sending message:", error);
        sendResponse({ status: "error", error: "Extension context invalid" });
      }

      return true; // Keep the message channel open for async response
    }
  });
} catch (error) {
  console.error("[ShadowAPI] Could not set up message listener:", error);
}
