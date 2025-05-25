async function fetchAndApplyRules() {
  try {
    const res = await fetch('http://localhost:3210/api/v1/interceptor/data'); // use auth token or ID if needed
    const result = await res.json();
    console.log("Result", result)
    const rulesFromServer = result?.data?.data || [];
    console.info("Rules", rulesFromServer)
    const ruleIds = rulesFromServer.map(r => r.id);

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
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      console.log('Loaded rules:', rules);
    });
  } catch (e) {
    console.error('Failed to fetch mock rules:', e);
  }
}

// Poll every 60 seconds
setInterval(fetchAndApplyRules, 10 * 1000);

// Fetch once when extension is loaded
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
  

