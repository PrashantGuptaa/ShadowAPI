const express = require('express');
const router = express.Router();

const interceptorRoutes = require('./interceptorRoutes');

router.use('/interceptor', interceptorRoutes);

module.exports = router;