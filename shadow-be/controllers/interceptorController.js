const {
    sendSuccess,
    sendError
} = require("../utils/response")

const getInterceptedRulesController = (req, res) => {
    sendSuccess(res, {
        data: [{
            "id": 101,
            "priority": 1,
            "action": {
                "type": "mock",
                "mockResponseUrl": "https://shadow-api.vercel.app/cdn/custom.json"
            },
            "match": {
                "urlContains": "jsonplaceholder.typicode.com/posts",
                "method": "POST"
            }
        }]
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