    (function() {
          console.log("[ShadowAPI] Page context override running");

          const rules = ${JSON.stringify(rules)};

          // FETCH OVERRIDE
          const originalFetch = window.fetch;
          window.fetch = async function(input, init = {}) {
            const url = typeof input === "string" ? input : input.url;
            const method = (init.method || "GET").toUpperCase();
            const body = init.body;

            for (const rule of rules) {
              const match = rule.match || {};
              const urlMatch = url.includes(match.urlContains || "");
              const methodMatch = !match.method || method === match.method.toUpperCase();
              const bodyMatch = !match.bodyContains || (body && body.includes(match.bodyContains));

              if (urlMatch && methodMatch && bodyMatch) {
                console.log("[ShadowAPI] Mocking FETCH for", url);

                // If mockResponseUrl is provided, fetch from there instead of inline mockResponse
                if (rule.action?.mockResponseUrl) {
                  try {
                    const res = await originalFetch(rule.action.mockResponseUrl);
                    const mockResponse = await res.json();
                    return new Response(JSON.stringify(mockResponse), {
                      status: 200,
                      headers: { "Content-Type": "application/json" },
                    });
                  } catch (e) {
                    console.error("[ShadowAPI] Failed to fetch mockResponseUrl:", e);
                    // fallback to inline mockResponse or continue
                  }
                }

                // fallback to inline mockResponse if no URL provided
                return new Response(JSON.stringify(rule.mockResponse), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }
            }

            return originalFetch(input, init);
          };

          // XHR OVERRIDE
          const OriginalXHR = window.XMLHttpRequest;
          function MockedXHR() {
            const xhr = new OriginalXHR();
            const open = xhr.open;
            xhr.open = function(method, url, async, user, password) {
              this._url = url;
              this._method = method;
              open.call(this, method, url, async !== false, user, password); // default async true if not false
            };

            const send = xhr.send;
            xhr.send = function(body) {
              const url = this._url;
              const method = this._method;
              // Save 'this' for use inside fetch promise
                  const self = this;
              for (const rule of rules) {
                const match = rule.match || {};
                const urlMatch = url.includes(match.urlContains || "");
                const methodMatch = !match.method || method.toUpperCase() === match.method.toUpperCase();
                const bodyMatch = !match.bodyContains || (body && body.includes(match.bodyContains));

                if (urlMatch && methodMatch && bodyMatch) {
                  console.log("[ShadowAPI] Mocking XHR for", url);

                  if (!rule.action?.mockResponseUrl) {
                    console.warn("[ShadowAPI] No mockResponseUrl in rule:", rule);
                    send.call(this, body); // fallback to original send
                    return;
                  }

    

                  // Asynchronously fetch mock response and simulate XHR response lifecycle
                  fetch(rule.action.mockResponseUrl)
                  .then(res => res.text())
                  .then(mockResponseText => {
                    console.log("Response from custom server", mockResponseText)
                    // Deliver async response to simulate real XHR timing
                    // setTimeout(() => {
                        self.readyState = 4;      // DONE
                        self.status = 200;        // OK
                        self.responseText = mockResponseText;
                        self.response = mockResponseText; // some libs expect this too
            
//                         self.getAllResponseHeaders = () => "content-type: application/json\n";
//   self.getResponseHeader = (header) => {
//   if (header.toLowerCase() === "content-type") return "application/json";
//   return null;
// };
                        
                        // Trigger readystatechange event
                        if (typeof self.onreadystatechange === "function") {
                          self.onreadystatechange();
                        }
            
                        // Dispatch event listeners for 'readystatechange'
                        self.dispatchEvent(new Event('readystatechange'));
            
                        // Trigger load event (success)
                        if (typeof self.onload === "function") {
                          self.onload();
                        }
                        self.dispatchEvent(new Event('load'));
            
                        // Also dispatch loadend event as request is finished
                        self.dispatchEvent(new Event('loadend'));
                    // }, 0);
                  })
                  .catch(err => {
                    const self = this;
                    setTimeout(() => {
                      self.readyState = 4;
                      self.status = 500;
                      self.responseText = JSON.stringify({ error: "Failed to load mock data" });
                      if (typeof self.onreadystatechange === "function") self.onreadystatechange();
                      if (typeof self.onerror === "function") self.onerror(err);
                    }, 0);
                  });
                
                return; // VERY important: stop here, do NOT call original send
                
                }
              }

              send.call(this, body); // For requests without mock rules, proceed normally
            };

            return xhr;
          }



          window.XMLHttpRequest = MockedXHR;
        })();