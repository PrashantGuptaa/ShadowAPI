const sendResponse = (
  res,
  {
    status = "success",
    message = "",
    data = null,
    statusCode = 200,
    error = null,
  } = {}
) => {
  res.status(statusCode).json({
    status,
    message,
    data,
    error,
  });
};

const sendSuccess = (
  res,
  { data = null, message = "Request successful", statusCode = 200 } = {}
) => {
  sendResponse(res, {
    status: "success",
    message,
    data,
    statusCode,
  });
};

const logger = require("./logger");

const sendError = (
  res,
  { message = "Something went wrong", statusCode, err = {}, data = null } = {}
) => {
  const error = err.message || err.toString?.() || "Unknown error";

  // Use the new logger for error details
  logger.error("Response Error", {
    message,
    statusCode: statusCode || err.statusCode || 500,
    error: err,
    data,
  });

  sendResponse(res, {
    status: "error",
    message,
    data,
    statusCode: statusCode || err.statusCode || 500,
    error,
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
};
