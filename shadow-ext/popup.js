document.getElementById("fetchRules").addEventListener("click", async () => {
  chrome.runtime.sendMessage({ type: "GET_RULES" }, (rules) => {
    document.getElementById(
      "status"
    ).innerText = `Fetched ${rules.length} rule(s).`;
  });
});
