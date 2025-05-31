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
  { message = "Something went wrong", statusCode = 500, err = {}, data = null } = {}
) => {
    const error = err.message || err.toString?.() || "Unknown error";
    console.error("Error:", error);
  sendResponse(res, {
    status: "error",
    message,
    data,
    statusCode,
    error,
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
};
