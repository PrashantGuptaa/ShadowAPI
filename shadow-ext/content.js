console.log("[ShadowAPI] content.js running");

// Function to inject fetch/XHR logic into the page context
function injectOverrideScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("injectedFetch.js");
  script.onload = () => {
    console.log("[ShadowAPI] injectedFetch.js injected into page context");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject immediately when content script loads
injectOverrideScript();

// Listen for messages from the page (injected script asking for rules)
window.addEventListener("message", (event) => {
  if (
    event.source !== window ||
    !event.data ||
    event.data.type !== "GET_RULES"
  ) {
    return;
  }

  console.log("[ShadowAPI] content.js received GET_RULES from page");

  chrome.runtime.sendMessage({ type: "GET_RULES" }, (rules) => {
    console.log("[ShadowAPI] content.js sending rules back to page", rules);
    window.postMessage(
      {
        type: "GET_RULES_RESPONSE",
        rules,
      },
      "*"
    );
  });
});

// Listen for messages from the background or popup (e.g. manual reinjection)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INJECT_SCRIPT") {
    console.log("[ShadowAPI] content.js received INJECT_SCRIPT message");
    
    // fetch rules
    
    injectOverrideScript();
    
    sendResponse({ status: "injected" });
  }
});
