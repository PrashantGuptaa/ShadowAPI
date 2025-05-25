const {
    sendSuccess,
    sendError
} = require("../../utils/response")

const getInterceptedRulesController = (req, res) => {
    sendSuccess(res, {
        data: [
            {
              "id": 101,
              "priority": 1,
              "action": {
                "type": "redirect",
                "redirect": {
                  "url": "https://shadow-api-be.vercel.app/cdn/user.json"
                }
              },
              "condition": {
                "urlFilter": "jsonplaceholder.typicode.com",
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