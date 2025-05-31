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

function getXhrAndFetchOverrider(rules) { return  `
(function () {
    console.log("[ShadowAPI] Page context override running");

    const rules = ${JSON.stringify(rules)};

    const originalFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
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
                if (rule.action?.mockResponseUrl) {
                    try {
                        const res = await originalFetch(rule.action.mockResponseUrl);
                        const mockResponse = await res.json();
                        return new Response(JSON.stringify(mockResponse), {
                            status: 200,
                            headers: {
                                "Content-Type": "application/json"
                            },
                        });
                    } catch (e) {
                        console.error("[ShadowAPI] Failed to fetch mockResponseUrl:", e);
                    }
                }

                return new Response(JSON.stringify(rule.mockResponse), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
            }
        }

        return originalFetch(input, init);
    };

    const OriginalXHR = window.XMLHttpRequest;
    function MockedXHR() {
        const xhr = new OriginalXHR();
        const open = xhr.open;
        xhr.open = function (method, url, async, user, password) {
            this._url = url;
            this._method = method;
            open.call(this, method, url, async !== false, user, password);
        };

        const send = xhr.send;
        xhr.send = function (body) {
            const url = this._url;
            const method = this._method;
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
                        send.call(this, body);
                        return;
                    }

                    fetch(rule.action.mockResponseUrl)
                        .then(res => res.text())
                        .then(mockResponseText => {
                            // self.readyState = 4;
                            // self.status = 200;
                            // self.responseText = mockResponseText;
                            // self.response = mockResponseText;
                            Object.defineProperty(xhr, "readyState", { value: 4 });
                            Object.defineProperty(xhr, "status", { value: 200 });
                            Object.defineProperty(xhr, "responseText", { value: mockResponseText });
                            Object.defineProperty(xhr, "response", { value: mockResponseText });
            
                            xhr.getAllResponseHeaders = () => "content-type: application/json\\n";
                            xhr.getResponseHeader = (header) => {
                                if (header.toLowerCase() === "content-type") return "application/json";
                                return null;
                            };

                            if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
                            xhr.dispatchEvent(new Event('readystatechange'));
                            if (typeof xhr.onload === "function") xhr.onload();
                            xhr.dispatchEvent(new Event('load'));
                            xhr.dispatchEvent(new Event('loadend'));
                        })
                        .catch(err => {
                            Object.defineProperty(xhr, "readyState", { value: 4 });
                            Object.defineProperty(xhr, "status", { value: 500 });
                            Object.defineProperty(xhr, "responseText", { value: JSON.stringify({ error: "Failed to fetch mock" }) });
            
                            if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
                            if (typeof xhr.onerror === "function") xhr.onerror(err);
                        });

                    return;
                }
            }

            send.call(this, body);
        };

        return xhr;
    }

    window.XMLHttpRequest = MockedXHR;
})();
`}