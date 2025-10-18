const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to use based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  // For Vercel, use 'info' instead of 'warn' to capture more logs
  return isDevelopment ? "debug" : "info";
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");

// Define the format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    // For Vercel compatibility, also output as simple string
    const message =
      typeof info.message === "object"
        ? JSON.stringify(info.message)
        : info.message;
    return `${info.timestamp} ${info.level}: ${message}`;
  })
);

// Define the format for log files (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat,
  }),

  // // Error log file (daily rotation)
  // new winston.transports.DailyRotateFile({
  //   filename: path.join(logsDir, "error-%DATE%.log"),
  //   datePattern: "YYYY-MM-DD",
  //   level: "error",
  //   format: fileFormat,
  //   maxSize: "20m",
  //   maxFiles: "14d",
  // }),

  // // Combined log file (daily rotation)
  // new winston.transports.DailyRotateFile({
  //   filename: path.join(logsDir, "combined-%DATE%.log"),
  //   datePattern: "YYYY-MM-DD",
  //   format: fileFormat,
  //   maxSize: "20m",
  //   maxFiles: "14d",
  // }),
];

// Create the winston logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.simple(),
  transports,
  exitOnError: false,
});

// Enhanced logging functions with context
const logWithContext = (level, message, context = {}) => {
  const logData = {
    message,
    ...context,
  };

  if (context.error) {
    logData.error = {
      message: context.error.message,
      stack: context.error.stack,
      name: context.error.name,
    };

    // Handle chained AppError
    if (context.error.originalError) {
      logData.originalError = {
        message: context.error.originalError.message,
        stack: context.error.originalError.stack,
        name: context.error.originalError.name,
      };
    }
  }

  // Use Winston logger
  logger[level](logData);

  // Fallback for Vercel - also use console.log to ensure visibility
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const timestamp = new Date().toISOString();
    const contextStr =
      Object.keys(context).length > 0
        ? ` | Context: ${JSON.stringify(context)}`
        : "";
    console.log(
      `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
    );
  }
};

// Wrapper functions for easy use
const loggerWrapper = {
  error: (message, context = {}) => logWithContext("error", message, context),
  warn: (message, context = {}) => logWithContext("warn", message, context),
  info: (message, context = {}) => logWithContext("info", message, context),
  http: (message, context = {}) => logWithContext("http", message, context),
  debug: (message, context = {}) => logWithContext("debug", message, context),

  // Special function for request logging
  logRequest: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (req.user) {
      logData.userId = req.user.userId;
      logData.userEmail = req.user.email;
    }

    const level = res.statusCode >= 400 ? "error" : "http";
    logWithContext(level, "HTTP Request", logData);
  },

  // Special function for error logging with full context
  logError: (error, req = null, additionalContext = {}) => {
    const context = {
      error,
      ...additionalContext,
    };

    if (req) {
      context.request = {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        headers: req.headers,
        ip: req.ip || req.connection.remoteAddress,
      };

      if (req.user) {
        context.user = {
          userId: req.user.userId,
          email: req.user.email,
        };
      }
    }

    logWithContext("error", error.message || "Unknown error", context);
  },
};

module.exports = loggerWrapper;
