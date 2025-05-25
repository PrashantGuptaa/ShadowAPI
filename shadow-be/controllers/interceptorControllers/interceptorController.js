const {
    sendSuccess,
    sendError
} = require("../../utils/response")

const getInterceptedRulesController = (req, res) => {
    sendSuccess(res, {
        data: [
            {
                "id": 9001,
                "priority": 1,
                "action": {
                  "type": "redirect",
                  "redirect": {
                    "url": "https://shadow-api-be.vercel.app/cdn/user.json"
                  }
                },
                "condition": {
                  "urlFilter": "geeksforgeeks.org/gfg-assets/_next/data/llGH3WYJ8mTJCk1p9RZqC/",
                  "resourceTypes": ["xmlhttprequest"]
                }
              }
              
          ]

    })
}

const getMockDataController = (req, res) => {
    console.log("=============Reached ===========")
    try {
        const data = {
            res: 'Welcome! this is a custom response',
        }

        sendSuccess(res, {
            data
        })
    } catch (err) {
        sendError(res, {
            message: "Error while fetching mocks response",
            err
        })
    }
}

module.exports = {
    getInterceptedRulesController,
    getMockDataController,
}