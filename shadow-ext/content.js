console.log("[ShadowAPI] content.js running");

const script = document.createElement("script");
script.src = chrome.runtime.getURL("injectedFetch.js");
script.onload = () => {
  console.log("[ShadowAPI] injectedFetch.js injected into page context");
  script.remove();
};

(document.head || document.documentElement).appendChild(script);

// ✅ Listen for window message FROM page context
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
