(function () {
  console.log("[ShadowAPI] Running injected override from scripting");

  // Request rules and set up listener
  window.postMessage({ type: "GET_RULES" }, "*");

  // Listen for rules from the background script

  window.addEventListener("message", (event) => {
    if (
      event.source === window &&
      event.data?.type === "GET_RULES_RESPONSE" &&
      event.data?.enabled
    ) {
      const rules = event.data.rules || [];
      console.log(
        "[ShadowAPI] Overriding network functions with",
        rules.length,
        "rules"
      );
      // Override fetch and XHR with the provided rules
      if (rules.length === 0) {
        console.warn(
          "[ShadowAPI] No rules provided, fetch/XHR will not be mocked"
        );
        return;
      }
      overrideFetchAndXHR(event.data.rules || []);
    }
  });

  // Core rule matching logic
  function matchRule(url = "", method = "", body = "", rule = {}) {
    const {
      match = "",
      payload: rulePayloadRaw = [],
      url: ruleUrl = "",
      method: ruleMethod = "",
    } = rule;

    // Check URL match
    const urlMatch =
      match === "PARTIAL_MATCH" ? url.includes(ruleUrl || "") : ruleUrl === url;

    // Check method match
    const methodMatch = !rule.method || method === ruleMethod.toUpperCase();

    // Check body match
    let bodyMatch = true;
    const rulePayload = Array.isArray(rulePayloadRaw) ? rulePayloadRaw : [];

    if (
      urlMatch &&
      methodMatch &&
      rulePayload.length > 0 &&
      body &&
      !["GET", "DELETE"].includes(method)
    ) {
      try {
        const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

        bodyMatch = rulePayload.every((rule) => {
          switch (rule.matcher) {
            case "Equals":
              return parsedBody[rule.key] === rule.value;
            case "Not Equals":
              return parsedBody[rule.key] !== rule.value;
            case "Contains":
              return (
                parsedBody[rule.key] &&
                JSON.stringify(parsedBody[rule.key])?.includes(rule.value)
              );
            default:
              return false;
          }
        });
      } catch (error) {
        console.error(
          `[ShadowAPI] Payload match error for rule URL: ${ruleUrl}, request URL: ${url}, method: ${method}, body: ${body}`,
          "Rule payload:",
          rulePayloadRaw,
          "Error:",
          error
        );
        bodyMatch = false;
      }
    }

    return urlMatch && methodMatch && bodyMatch ? rule : false;
  }

  function overrideFetchAndXHR(rules = []) {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
      const url = typeof input === "string" ? input : input.url;
      const method = (init.method || "GET").toUpperCase();
      const body = init.body;

      const matchedRule = rules.find((rule) =>
        matchRule(url, method, body, rule)
      );

      if (matchedRule) {
        console.log("[ShadowAPI] Mocking fetch for", url);
        const responseData =
          matchedRule.response || JSON.stringify(matchedRule.mockResponse);

        return new Response(responseData, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return originalFetch(input, init);
    };

    // Override XHR
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function MockedXHR() {
      const xhr = new OriginalXHR();

      // Override open method to capture URL and method
      const open = xhr.open;
      xhr.open = function (method, url, async, user, password) {
        this._url = url;
        this._method = method;
        open.call(this, method, url, async !== false, user, password);
      };

      // Override send method to intercept requests
      const send = xhr.send;
      xhr.send = function (body) {
        const matchedRule = rules.find((rule) =>
          matchRule(this._url, this._method, body, rule)
        );

        if (matchedRule) {
          try {
            const response = matchedRule.response;

            // Set XHR properties
            Object.defineProperty(xhr, "readyState", { value: 4 });
            Object.defineProperty(xhr, "status", { value: 200 });
            Object.defineProperty(xhr, "responseText", { value: response });
            Object.defineProperty(xhr, "response", { value: response });

            // Set response headers methods
            xhr.getAllResponseHeaders = () =>
              "content-type: application/json\n";
            xhr.getResponseHeader = (header) =>
              header.toLowerCase() === "content-type"
                ? "application/json"
                : null;

            // Trigger events
            if (typeof xhr.onreadystatechange === "function")
              xhr.onreadystatechange();
            xhr.dispatchEvent(new Event("readystatechange"));
            if (typeof xhr.onload === "function") xhr.onload();
            xhr.dispatchEvent(new Event("load"));
            xhr.dispatchEvent(new Event("loadend"));
            return;
          } catch (err) {
            // Handle errors
            Object.defineProperty(xhr, "readyState", { value: 4 });
            Object.defineProperty(xhr, "status", { value: 500 });
            Object.defineProperty(xhr, "responseText", {
              value: JSON.stringify({ error: "Failed to fetch mock" }),
            });

            if (typeof xhr.onreadystatechange === "function")
              xhr.onreadystatechange();
            if (typeof xhr.onerror === "function") xhr.onerror(err);
            return;
          }
        }

        send.call(this, body);
      };

      return xhr;
    };
  }
})();
