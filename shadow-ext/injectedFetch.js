(function () {
  console.log("[ShadowAPI] Running injected override from scripting");

  window.postMessage({ type: "GET_RULES" }, "*");

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      !event.data ||
      event.data.type !== "GET_RULES_RESPONSE"
    ) {
      return;
    }
    const rules = event.data.rules || [];
    overrideFetchAndXHR(rules);
  });

  function overrideFetchAndXHR(rules = []) {
    console.log("[ShadowAPI] Page context fetch override running", rules);

    const originalFetch = window.fetch;
    // Fetch block
    window.fetch = async function (input, init = {}) {
      console.log("[ShadowAPI] Mocked fetch function called", rules);
      const url = typeof input === "string" ? input : input.url;
      const method = (init.method || "GET").toUpperCase();
      const body = init.body;
      console.log("F-2 Fetch url and body:", url, body);

      for (const rule of rules) {
        const ruleMatched = matchRule(url, method, body, rule);

        if (ruleMatched) {
          console.log("[ShadowAPI] Mocking fetch for", url);
          const { response } = rule;
          if (response) {
            try {
              return new Response(response, {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                },
              });
            } catch (e) {
              console.error("[ShadowAPI] Failed to return Response:", e);
            }
          }

          return new Response(JSON.stringify(rule.mockResponse), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      }

      return originalFetch(input, init);
    };

    // xhr block
    const OriginalXHR = window.XMLHttpRequest;
    function MockedXHR() {
      console.log("[ShadowAPI] MockedXHR constructor called");
      const xhr = new OriginalXHR();
      const open = xhr.open;
      xhr.open = function (method, url, async, user, password) {
        this._url = url;
        this._method = method;
        open.call(this, method, url, async !== false, user, password);
      };

      const send = xhr.send;
      xhr.send = function (body) {
        console.log("[ShadowAPI] MockedXHR send function called");
        const url = this._url;
        const method = this._method;
        console.log("F-2 XHR send url:", url);

        for (const rule of rules) {
          const ruleMatched = matchRule(url, method, body, rule);

          if (ruleMatched) {
            try {
              const { response } = rule;
              Object.defineProperty(xhr, "readyState", { value: 4 });
              Object.defineProperty(xhr, "status", { value: 200 });
              Object.defineProperty(xhr, "responseText", { value: response });
              Object.defineProperty(xhr, "response", { value: response });

              xhr.getAllResponseHeaders = () =>
                "content-type: application/json\\n";
              xhr.getResponseHeader = (header) => {
                if (header.toLowerCase() === "content-type")
                  return "application/json";
                return null;
              };

              if (typeof xhr.onreadystatechange === "function")
                xhr.onreadystatechange();
              xhr.dispatchEvent(new Event("readystatechange"));
              if (typeof xhr.onload === "function") xhr.onload();
              xhr.dispatchEvent(new Event("load"));
              xhr.dispatchEvent(new Event("loadend"));
            } catch (err) {
              Object.defineProperty(xhr, "readyState", { value: 4 });
              Object.defineProperty(xhr, "status", { value: 500 });
              Object.defineProperty(xhr, "responseText", {
                value: JSON.stringify({ error: "Failed to fetch mock" }),
              });

              if (typeof xhr.onreadystatechange === "function")
                xhr.onreadystatechange();
              if (typeof xhr.onerror === "function") xhr.onerror(err);
            }
            return;
          }
        }

        send.call(this, body);
      };

      return xhr;
    }

    window.XMLHttpRequest = MockedXHR;
  }

  const matchRule = (url, method, body, rule) => {
    const {
      match = "",
      payload: rulePayloadRaw = [],
      url: ruleUrl = "",
      method: ruleMethod = "",
    } = rule;
    const rulePayload = Array.isArray(rulePayloadRaw) ? rulePayloadRaw : [];
    const hasPayload = rulePayload.length > 0;
    const urlMatch =
      match === "PARTIAL_MATCH" ? url.includes(ruleUrl || "") : ruleUrl === url;
    const methodMatch = !rule.method || method === ruleMethod.toUpperCase();
    let bodyMatch = false;

    if (method === "GET" || method === "DELETE" || !body) {
      bodyMatch = true; // For GET requests, we don't check the body
    } else if (hasPayload) {
      try {
        if (body && rulePayload.length > 0) {
          const parsedBody = typeof body === "string" ? JSON.parse(body) : body;

          // loop through rulePayload and check if all of the payloads data is present in the body
          bodyMatch = rulePayload.every((rule) => {
            if (rule.matcher === "Equals") {
              return parsedBody[rule.key] === rule.value;
            }
            if (rule.matcher === "Not Equals") {
              return parsedBody[rule.key] !== rule.value;
            }
            if (rule.matcher === "Contains") {
              return (
                parsedBody[rule.key] &&
                parsedBody[rule.key]?.toString()?.includes(rule.value)
              );
            }
            return false; // if no matcher is found, return false
          });
        }
      } catch (error) {
        console.error("Error parsing body or checking payload match:", error);
        bodyMatch = false; // If there's an error, we assume the body doesn't match
      }
    }

    if (urlMatch && methodMatch && bodyMatch) {
      return rule;
    }
    return false;
  };
})();
