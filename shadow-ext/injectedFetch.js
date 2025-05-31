// Relay GET_RULES request from page to extension
window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      !event.data ||
      event.data.type !== "GET_RULES"
    ) return;
  
    chrome.runtime.sendMessage({ type: "GET_RULES" }, (rules) => {
      window.postMessage({ type: "GET_RULES_RESPONSE", rules }, "*");
    });
  });
  
  // Inject actual logic script into page
  (function injectScriptFile() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injectedFetch.actual.js");
    script.onload = () => {
      console.log("[ShadowAPI] injectedFetch.actual.js injected");
      script.remove();
    };
    document.documentElement.appendChild(script);
  })();
  