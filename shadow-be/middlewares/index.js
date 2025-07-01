const requestTrackingMiddleware = (req, res, next) => {
    try {
        // payload size
        const sizeInBytes = new TextEncoder().encode(
          JSON.stringify(req.body || {})
        ).length;
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB > 5) {
          console.warn(
            `[${new Date().toISOString()}] Request payload size is too large: ${sizeInKB.toFixed(2)} KB`
          );
        }
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Payload Size: ${sizeInKB.toFixed(2)} KB`);
  next();
    } catch (e) {
        console.error("Error in test middleware");
    }
}

module.exports = requestTrackingMiddleware;