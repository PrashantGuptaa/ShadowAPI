class AppError extends Error {
  constructor(message, statusCode, originalError = null, context = {}) {
    super(message);
    this.statusCode = statusCode || 500;
    this.name = "AppError";
    this.isOperational = true; // Indicates this is an operational error
    this.timestamp = new Date().toISOString();
    this.context = context; // Additional context for debugging

    // Preserve original error details
    if (originalError) {
      this.originalError = originalError;
      this.originalStack = originalError.stack;
      this.originalMessage = originalError.message;
      this.originalName = originalError.name;
      
      // Chain the stack traces with better formatting
      this.stack = this.stack + "\n\n--- Caused by ---\n" + originalError.stack;
      
      // If original error has context, merge it
      if (originalError.context) {
        this.context = { ...originalError.context, ...context };
      }
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static factory methods for common errors
  static badRequest(message, originalError = null, context = {}) {
    return new AppError(message, 400, originalError, context);
  }

  static unauthorized(message = "Unauthorized", originalError = null, context = {}) {
    return new AppError(message, 401, originalError, context);
  }

  static forbidden(message = "Forbidden", originalError = null, context = {}) {
    return new AppError(message, 403, originalError, context);
  }

  static notFound(message = "Resource not found", originalError = null, context = {}) {
    return new AppError(message, 404, originalError, context);
  }

  static conflict(message = "Conflict", originalError = null, context = {}) {
    return new AppError(message, 409, originalError, context);
  }

  static internal(message = "Internal server error", originalError = null, context = {}) {
    return new AppError(message, 500, originalError, context);
  }

  // Method to get error details for logging
  getLogDetails() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      name: this.name,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      context: this.context,
      originalError: this.originalError ? {
        message: this.originalMessage,
        name: this.originalName,
        stack: this.originalStack,
      } : null,
      stack: this.stack,
    };
  }

  // Method to get client-safe error response
  getClientResponse() {
    // Only send detailed errors in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
      error: {
        message: this.isOperational ? this.message : "Something went wrong",
        statusCode: this.statusCode,
        ...(isDevelopment && {
          name: this.name,
          context: this.context,
          stack: this.stack,
        }),
      },
    };
  }
}

module.exports = AppError;
