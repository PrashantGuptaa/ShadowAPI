(async () => {
    const originalFetch = window.fetch;
  
    const getRules = () => new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_RULES" }, resolve);
    });
  
    let rules = await getRules();
  
    window.fetch = async function(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url;
      const method = (init.method || 'GET').toUpperCase();
      const body = init.body;
  
      for (const rule of rules) {
        const urlMatch = url.includes(rule.match.urlContains);
        const methodMatch = !rule.match.method || method === rule.match.method.toUpperCase();
        const bodyMatch = !rule.match.bodyContains || (body && body.includes(rule.match.bodyContains));
  
        if (urlMatch && methodMatch && bodyMatch) {
          console.log('[ShadowAPI] Mock matched:', rule.match);
  
          if (rule.action.mockResponseUrl) {
            // Fetch mock response dynamically from URL
            try {
              const mockRes = await originalFetch(rule.action.mockResponseUrl);
              const mockJson = await mockRes.json();
              return new Response(JSON.stringify(mockJson), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (e) {
              console.error('Failed to fetch mockResponseUrl:', e);
              break; // fallback to original fetch below
            }
          } else if (rule.action.mockResponse) {
            // Inline mock response
            return new Response(JSON.stringify(rule.action.mockResponse.body), {
              status: rule.action.mockResponse.status || 200,
              headers: rule.action.mockResponse.headers.reduce((acc, h) => {
                acc[h.name] = h.value;
                return acc;
              }, {})
            });
          }
        }
      }
  
      return originalFetch(input, init);
    };
  })();
  