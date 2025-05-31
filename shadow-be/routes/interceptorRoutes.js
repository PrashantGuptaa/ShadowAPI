const express = require('express');
const { getInterceptedRulesController, getMockDataController } = require('../controllers/interceptorController');
const interceptorRoutes = express.Router();


interceptorRoutes.get('/test', (req, res) => {
    res.status(200).json('Looks good');
});

interceptorRoutes.get('/data', getInterceptedRulesController);
interceptorRoutes.get('/first-mock', getMockDataController);

module.exports = interceptorRoutes;
