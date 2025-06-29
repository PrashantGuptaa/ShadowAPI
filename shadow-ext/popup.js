document.addEventListener("DOMContentLoaded", () => {
  handleDashboardAndLogin();
  handleExtensionToggle();
});

function handleDashboardAndLogin() {
  // Cache DOM elements
  const elements = {
    status: document.getElementById("status"),
    loginForm: document.getElementById("loginForm"),
    toggleExtension: document.getElementById("toggle-extension"),
    dashboard: document.getElementById("open-dashboard"),
    loginButton: document.getElementById("rule-login"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
  };

  // Helper functions
  function updateStatus(message) {
    elements.status.innerText = message;
  }

  function toggleVisibility(element, isVisible) {
    element.style.display = isVisible ? "block" : "none";
  }

  elements.loginButton.addEventListener("click", handleLogin);

  async function handleLogin() {
    const email = elements.email.value;
    const password = elements.password.value;

    if (!email || !password) {
      updateStatus("Please enter both email and password.");
      return;
    }

    updateStatus("Logging in...");

    try {
      const res = await fetch("http://localhost:3210/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result = await res.json();
      const authToken = result?.data?.token;

      if (!authToken) {
        throw new Error("No auth token received");
      }

      // Store the token in chrome storage
      chrome.storage.local.set({ authToken }, () => {
        updateStatus(`Welcome, ${result?.data?.name || "User"}!`);
        toggleVisibility(elements.loginForm, false);
        toggleVisibility(elements.toggleExtension, true);
      });
    } catch (error) {
      console.error("Error during login:", error);
      updateStatus("Login failed. Please try again.");
    }
  }

  // Check auth status on load
  chrome.storage.local.get("authToken", ({ authToken }) => {
    if (!authToken) {
      updateStatus("Please log in to use ShadowAPI");
      toggleVisibility(elements.loginForm, true);
      toggleVisibility(elements.toggleExtension, false);
      return;
    }

    updateStatus("Logged in");
    toggleVisibility(elements.loginForm, false);
    toggleVisibility(elements.toggleExtension, true);
  });
}

function handleExtensionToggle() {
  const toggleBtn = document.getElementById("toggle-extension");

  // Initialize toggle button state
  chrome.storage.local.get("enabled", ({ enabled }) => {
    const isEnabled = enabled === true;
    updateToggleButton(isEnabled);
  });

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get("enabled", ({ enabled }) => {
      const newState = !enabled;

      chrome.storage.local.set({ enabled: newState }, () => {
        updateToggleButton(newState);
        console.log(
          `[ShadowAPI] Extension ${newState ? "enabled" : "disabled"}`
        );
        if (newState) {
          // Send message to trigger injection immediately
          handleScriptTrigger();
        }
      });
    });
  });

  function updateToggleButton(isEnabled) {
    toggleBtn.value = isEnabled ? "Disable" : "Enable";
    toggleBtn.textContent = isEnabled
      ? "Disable Extension"
      : "Enable Extension";
  }

  function handleScriptTrigger() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || tab.url.startsWith("chrome://")) return;

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.js"], // 👈 This reinjects content.js
        },
        () => {
          console.log("[ShadowAPI] content.js reinjected");

          chrome.tabs.sendMessage(
            tab.id,
            { type: "INJECT_SCRIPT" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Message failed:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log("Injection response:", response);
              }
            }
          );
        }
      );
    });
  }
}
