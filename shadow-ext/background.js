async function fetchAndApplyRules() {
  try {
    const res = await fetch('http://localhost:3210/api/v1/interceptor/data');
    const result = await res.json();
    const rulesFromServer = result?.data?.data || [];

    const ruleIds = rulesFromServer.map(r => r.id);

    // 1. Update DNR rules (for GET)
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: ruleIds,
        addRules: rulesFromServer
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error applying rules:', chrome.runtime.lastError);
        } else {
          console.log('Mock rules updated.');
        }
      }
    );

    // 2. Save rules for injected fetch script to use (for POST/GraphQL/etc.)
    chrome.storage.local.set({ rules: rulesFromServer }, () => {
      console.log("Rules also saved to storage for fetch injection.");
    });

    // 3. Optional: log current rules
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      console.log('Loaded rules:', rules);
    });

  } catch (e) {
    console.error('Failed to fetch mock rules:', e);
  }
}

// Poll every 10 seconds
setInterval(fetchAndApplyRules, 30 * 1000);

// Fetch once on install and startup
chrome.runtime.onInstalled.addListener(fetchAndApplyRules);
chrome.runtime.onStartup.addListener(fetchAndApplyRules);

// chrome.runtime.onInstalled.addListener(() => {
//     const rules = [
//       {
//         id: 1,
//         priority: 1,
//         action: {
//           type: 'redirect',
//           redirect: {
//             url: chrome.runtime.getURL('mock/profile.json') // local mock response
//           }
//         },
//         condition: {
//           urlFilter: 'https://utilapi.geeksforgeeks.org/api/user/profile/',
//           resourceTypes: ['xmlhttprequest']
//         }
//       }
//     ];
  
//     // Remove all existing dynamic rules and add new ones
//     chrome.declarativeNetRequest.updateDynamicRules(
//       {
//         removeRuleIds: [1],
//         addRules: rules
//       },
//       () => {
//         if (chrome.runtime.lastError) {
//           console.error('Failed to update rules:', chrome.runtime.lastError);
//         } else {
//           console.log('Redirect rule added successfully!');
//         }
//       }
//     );
//   });
  

