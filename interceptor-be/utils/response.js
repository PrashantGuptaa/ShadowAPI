// utils/response.js

const sendResponse = (res, {
    status = 'success',
    message = '',
    data = null,
    statusCode = 200,
}) => {
    res.status(statusCode).json({
        status,
        message,
        data,
    });
};

const sendSuccess = (res, data = null, message = 'Request successful', statusCode = 200) => {
    sendResponse(res, {
        status: 'success',
        message,
        data,
        statusCode
    });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, err  = {}, data = null) => {
    console.error(`${err.message || err.toString?.()} ${err.message || err.toString?.()}`)
    sendResponse(res, {
        status: 'error',
        message,
        data,
        statusCode,
        error: err.message || err.toString?.() || 'Unknown error'

    });
};

module.exports = {
    sendResponse,
    sendSuccess,
    sendError,
};