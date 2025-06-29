// utils/response.js

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

const sendError = (
  res,
  { message = "Something went wrong", statusCode, err = {}, data = null } = {}
) => {
  const error = err.message || err.toString?.() || "Unknown error";
  // console.error("Error:", err);
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
