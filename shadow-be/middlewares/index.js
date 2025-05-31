const requestTrackingMiddleware = (req, res, next) => {
    try {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
    } catch (e) {
        console.error("Error in test middleware");
    }
}

module.exports = requestTrackingMiddleware;