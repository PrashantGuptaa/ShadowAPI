const body = '{"domain":"practice"}';
const rulePayload = [
  {
    key: "domain",
    value: "practice",
    type: "",
    matcher: "Equals", // Not Equals, Contains
    id: 1,
  },
  {
    key: "domaina",
    value: "practice",
    type: "",
    matcher: "Equals",
    id: 1,
  },
];
let bodyMatch = true;
const method = "POST";
const hasPayload = true;
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
          parsedBody[rule.key] && parsedBody[rule.key].includes(rule.value)
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

// [
//   {
//     _id: ObjectId("685f9c0fd1caaab9bc7c2881"),
//     name: "GFG Url mock",
//     description: "Mocking problem of the day",
//     method: "GET",
//     payload: [],
//     response:
//       '{\n    "id": 1695,\n    "date": "2025-06-28 00:00:00",\n    "is_solved": false,\n    "problem_id": 700563,\n    "problem_name": "This is awesome",\n    "problem_url": "https://www.geeksforgeeks.org/problems/counting-elements-in-two-arrays/1",\n    "difficulty": "Medium",\n    "tags": {\n        "company_tags": [\n            "Amazon"\n        ],\n        "topic_tags": [\n            "Araara",\n            "Detective bakshi",\n            "Binary Search",\n            "Data Structures",\n            "Algorithms"\n        ]\n    },\n    "remaining_time": 123,\n    "end_date": "2025-06-28 23:59:59",\n    "accuracy": 100,\n    "total_submissions": 1,\n    "is_time_machine_reward_active": true\n}',
//     url: "problems-of-day/problem/today/",
//     match: "PARTIAL_MATCH",
//     isActive: true,
//     deleted: false,
//     createdBy: 1,
//     updatedBy: 1,
//     createdAt: ISODate("2025-06-28T13:08:55.758+05:30"),
//     updatedAt: ISODate("2025-06-28T13:08:55.758+05:30"),
//     ruleId: 3,
//     __v: 0,
//   },
//   {
//     _id: ObjectId("685fc3e622bd5caa60d0cfcd"),
//     name: "GFG Profile mock",
//     description: "PRofile query mock",
//     method: "POST",
//     payload: ,
//     response:
//       '{\n    "is_logged_in": true,\n    "user_name": "Apu Halwai",\n    "payload": {},\n    "country_name": "USA",\n    "country_code": "US",\n    "region_code": "NY",\n    "region_name": "Karnataka",\n    "city_name": "Tension"\n}',
//     url: "user/profile",
//     match: "PARTIAL_MATCH",
//     isActive: true,
//     deleted: false,
//     createdBy: 1,
//     updatedBy: 1,
//     createdAt: ISODate("2025-06-28T15:58:54.720+05:30"),
//     updatedAt: ISODate("2025-06-28T15:58:54.720+05:30"),
//     ruleId: 6,
//     __v: 0,
//   },
// ];
