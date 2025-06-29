const dashboardBtnElem = document.getElementById("open-dashboard");
dashboardBtnElem
  .addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: "GET_RULES" }, (rules) => {
      document.getElementById(
        "status"
      ).innerText = `Fetched ${rules.length} rule(s).`;
    });
  });

document.getElementById("rule-login").addEventListener("click", handleLogin);

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    document.getElementById(
      "status"
    ).innerText = `Please enter both email and password.`;
    alert("Please enter both email and password.");
    return;
  }

  try {
    
  } catch (error) {
    console.error("Error during login:", error);
    document.getElementById(
      "status"
    ).innerText = `Login failed. Please try again.`;
    return;
  }
  const res = await fetch("http://localhost:3210/api/v1/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  console.log("F-2", result);
  const authToken = result?.data?.token;
  // if (result.success) {
  document.getElementById(
    "status"
  ).innerText = `Login successful! Welcome, ${result?.data?.name}!`;

  // Store the token chrome storage
  chrome.storage.local.set({ authToken }, () => {
    console.log("Token stored successfully:", token);
  });

}


chrome.storage.local.get("authToken", async ({ authToken }) => {
 const loginFormElem = document.getElementById('loginForm')

  if (!authToken) {
    console.warn("[ShadowAPI] No auth token found. Skipping rule fetch.");
    loginFormElem.style.display = "block";
    // dashboardBtnElem.style.display = "none";
    return;
  }
  // dashboardBtnElem.style.display = "block";
  loginFormElem.style.display = "none";
});