const validator = require("validator");
const AppError = require("./appError");
const logger = require("./logger");

/**
 * Comprehensive input sanitization and validation utility
 */
class InputSanitizer {
  /**
   * Sanitize and validate email
   */
  static sanitizeEmail(email) {
    if (!email || typeof email !== "string") {
      throw new AppError("Email is required and must be a string", 400);
    }

    // Remove whitespace and convert to lowercase
    const sanitized = validator.escape(email.trim().toLowerCase());

    // Validate email format
    if (!validator.isEmail(sanitized)) {
      throw new AppError("Invalid email format", 400);
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(sanitized)) {
      logger.warn("Suspicious email pattern detected", { email: sanitized });
      throw new AppError("Invalid email format", 400);
    }

    return sanitized;
  }

  /**
   * Sanitize and validate password
   */
  static sanitizePassword(password) {
    if (!password || typeof password !== "string") {
      throw new AppError("Password is required and must be a string", 400);
    }

    // Don't escape password as it needs special characters
    const sanitized = password.trim();

    // Length validation
    if (sanitized.length < 8 || sanitized.length > 128) {
      throw new AppError("Password must be between 8-128 characters", 400);
    }

    // Check for null bytes and other dangerous characters
    if (
      sanitized.includes("\0") ||
      sanitized.includes("\r") ||
      sanitized.includes("\n")
    ) {
      throw new AppError("Password contains invalid characters", 400);
    }

    // Password strength validation
    const hasUpper = /[A-Z]/.test(sanitized);
    const hasLower = /[a-z]/.test(sanitized);
    const hasNumber = /\d/.test(sanitized);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(sanitized);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      throw new AppError(
        "Password must contain uppercase, lowercase, number and special character",
        400
      );
    }

    return sanitized;
  }

  /**
   * Sanitize and validate name/username
   */
  static sanitizeName(name, fieldName = "Name") {
    if (!name || typeof name !== "string") {
      throw new AppError(`${fieldName} is required and must be a string`, 400);
    }

    // Remove dangerous characters and trim
    let sanitized = validator.escape(name.trim());

    // Remove extra whitespace
    sanitized = sanitized.replace(/\s+/g, " ");

    // Length validation
    if (sanitized.length < 2 || sanitized.length > 50) {
      throw new AppError(`${fieldName} must be between 2-50 characters`, 400);
    }

    // Check for valid name pattern (letters, spaces, basic punctuation)
    if (!/^[a-zA-Z\s\-\.\']+$/.test(sanitized)) {
      throw new AppError(`${fieldName} contains invalid characters`, 400);
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(sanitized)) {
      logger.warn("Suspicious name pattern detected", {
        name: sanitized,
        fieldName,
      });
      throw new AppError(`${fieldName} contains invalid content`, 400);
    }

    return sanitized;
  }

  /**
   * Sanitize general text input
   */
  static sanitizeText(text, maxLength = 1000, fieldName = "Text") {
    if (!text || typeof text !== "string") {
      throw new AppError(`${fieldName} is required and must be a string`, 400);
    }

    // Escape HTML and trim
    let sanitized = validator.escape(text.trim());

    // Remove extra whitespace
    sanitized = sanitized.replace(/\s+/g, " ");

    // Length validation
    if (sanitized.length > maxLength) {
      throw new AppError(
        `${fieldName} must be less than ${maxLength} characters`,
        400
      );
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(sanitized)) {
      logger.warn("Suspicious text pattern detected", {
        text: sanitized,
        fieldName,
      });
      throw new AppError(`${fieldName} contains invalid content`, 400);
    }

    return sanitized;
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(url, fieldName = "URL") {
    if (!url || typeof url !== "string") {
      throw new AppError(`${fieldName} is required and must be a string`, 400);
    }

    const sanitized = url.trim();

    // Validate URL format
    if (
      !validator.isURL(sanitized, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    ) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }

    return sanitized;
  }

  /**
   * Sanitize JWT token
   */
  static sanitizeToken(token, fieldName = "Token") {
    if (!token || typeof token !== "string") {
      throw new AppError(`${fieldName} is required and must be a string`, 400);
    }

    const sanitized = token.trim();

    // Basic JWT format validation (3 parts separated by dots)
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(sanitized)) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }

    return sanitized;
  }

  /**
   * Check for suspicious patterns (XSS, SQL injection, etc.)
   */
  static containsSuspiciousPatterns(input) {
    const suspiciousPatterns = [
      // XSS patterns
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,

      // SQL injection patterns
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /(\b(or|and)\s+\w+\s*(=|like))/i,
      /'/,
      /;/,

      // Path traversal
      /\.\.\//,
      /\.\.%2f/i,

      // Other suspicious patterns
      /\$\{/,
      /<%/,
      /%>/,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Sanitize object with multiple fields
   */
  static sanitizeObject(obj, schema) {
    const sanitized = {};

    for (const [field, config] of Object.entries(schema)) {
      const value = obj[field];

      if (config.required && (!value || value === "")) {
        throw new AppError(`${config.name || field} is required`, 400);
      }

      if (value) {
        try {
          switch (config.type) {
            case "email":
              sanitized[field] = this.sanitizeEmail(value);
              break;
            case "password":
              sanitized[field] = this.sanitizePassword(value);
              break;
            case "name":
              sanitized[field] = this.sanitizeName(value, config.name);
              break;
            case "text":
              sanitized[field] = this.sanitizeText(
                value,
                config.maxLength,
                config.name
              );
              break;
            case "url":
              sanitized[field] = this.sanitizeUrl(value, config.name);
              break;
            case "token":
              sanitized[field] = this.sanitizeToken(value, config.name);
              break;
            default:
              sanitized[field] = this.sanitizeText(
                value,
                config.maxLength || 1000,
                config.name
              );
          }
        } catch (error) {
          logger.warn("Input sanitization failed", {
            field,
            type: config.type,
            error: error.message,
          });
          throw error;
        }
      }
    }

    return sanitized;
  }
}

// Predefined schemas for common use cases
const USER_REGISTRATION_SCHEMA = {
  email: { type: "email", required: true, name: "Email" },
  password: { type: "password", required: true, name: "Password" },
  name: { type: "name", required: true, name: "Name" },
  userName: { type: "name", required: false, name: "Username" },
};

const USER_LOGIN_SCHEMA = {
  email: { type: "email", required: true, name: "Email" },
  password: { type: "password", required: true, name: "Password" },
};

const FORGOT_PASSWORD_SCHEMA = {
  email: { type: "email", required: true, name: "Email" },
};

const RESET_PASSWORD_SCHEMA = {
  token: { type: "token", required: true, name: "Reset Token" },
  newPassword: { type: "password", required: true, name: "New Password" },
};

const EMAIL_VERIFICATION_SCHEMA = {
  token: { type: "token", required: true, name: "Verification Token" },
};

module.exports = {
  InputSanitizer,
  USER_REGISTRATION_SCHEMA,
  USER_LOGIN_SCHEMA,
  FORGOT_PASSWORD_SCHEMA,
  RESET_PASSWORD_SCHEMA,
  EMAIL_VERIFICATION_SCHEMA,
};
