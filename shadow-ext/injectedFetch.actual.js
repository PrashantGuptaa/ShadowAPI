console.log("[ShadowAPI] injectedFetch.actual.js running in page context");

window.postMessage({ type: "GET_RULES" }, "*");

window.addEventListener("message", (event) => {
    if (
        event.source !== window ||
        !event.data ||
        event.data.type !== "GET_RULES_RESPONSE"
    ) return;

    const rules = event.data.rules || [];
    console.log("[ShadowAPI] Rules received in injectedFetch.actual.js:", rules);

    const script = document.createElement("script");
    script.textContent = getXhrAndFetchOverrider(rules);

    document.documentElement.appendChild(script);
});

function getXhrAndFetchOverrider(rules) { return `
    (function () {
        console.log("[ShadowAPI] Page context fetch override running");
      
        const rules = ${JSON.stringify(rules)};
      
        const originalFetch = window.fetch;
        window.fetch = async function (input, init = {}) {
          const url = typeof input === "string" ? input : input.url;
          const method = (init.method || "GET").toUpperCase();
          const body = init.body;
          console.log("F-2 Fetch url and body:", url, body);
      
          for (const rule of rules) {
            const {
              match = "",
              rulePayload = {},
              url: ruleUrl = "",
              method: ruleMethod = "",
              hasPayload = false,
            } = rule;
            const urlMatch =
              match === "PARTIAL_MATCH"
                ? url.includes(ruleUrl || "")
                : ruleUrl === url;
            const methodMatch = !rule.method || method === ruleMethod.toUpperCase();
            console.log(
              "F-3 Payload and body",
              typeof rulePayload,
              typeof body,
              method,
              hasPayload,
              rulePayload,
              body
            );
            let bodyMatch = true;
            if (method !== "GET" && hasPayload) {
              try {
                if (body && rulePayload && rulePayload.length > 0) {
                  const parsedBody = JSON.parse(body);
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
                  console.log("Body match result:", bodyMatch);
                }
              } catch (error) {
                console.error("Error parsing body or checking payload match:", error);
                bodyMatch = false; // If there's an error, we assume the body doesn't match
              }
            }
      
            if (urlMatch && methodMatch && bodyMatch) {
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
            console.log("[ShadowAPI] MockedXHR send function called", rules);
            const url = this._url;
            const method = this._method;
            const self = this;
            console.log("F-2 XHR send url and body:", url, body);
      
            for (const rule of rules) {
              const {
                match = "",
                rulePayload = {},
                url: ruleUrl = "",
                method: ruleMethod = "",
                hasPayload = false,
              } = rule;
              const urlMatch =
                match === "PARTIAL_MATCH"
                  ? url.includes(ruleUrl || "")
                  : ruleUrl === url;
              const methodMatch = !rule.method || method === ruleMethod.toUpperCase();
              let bodyMatch = true;
              if (method !== "GET" && hasPayload) {
                try {
                  if (body && rulePayload && rulePayload.length > 0) {
                    const parsedBody = JSON.parse(body);
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
                    console.log("Body match result:", bodyMatch);
                  }
                } catch (error) {
                  console.error(
                    "Error parsing body or checking payload match:",
                    error
                  );
                  bodyMatch = false; // If there's an error, we assume the body doesn't match
                }
              }
      
              if (urlMatch && methodMatch && bodyMatch) {
                console.log("[ShadowAPI] Mocking XHR for", url);
      
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
      })();      
`;
}