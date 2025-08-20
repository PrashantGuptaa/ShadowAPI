/**
 * Frontend input sanitization and validation utilities
 */

// Email validation and sanitization
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }

  // Remove whitespace and convert to lowercase
  const sanitized = email.trim().toLowerCase();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error("Invalid email format");
  }

  // Check for suspicious patterns
  if (containsSuspiciousPatterns(sanitized)) {
    throw new Error("Invalid email format");
  }

  return sanitized;
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required and must be a string");
  }

  const sanitized = password.trim();

  // Length validation
  if (sanitized.length < 8 || sanitized.length > 128) {
    throw new Error("Password must be between 8-128 characters");
  }

  // Check for dangerous characters
  if (
    sanitized.includes("\0") ||
    sanitized.includes("\r") ||
    sanitized.includes("\n")
  ) {
    throw new Error("Password contains invalid characters");
  }

  // Password strength validation
  const hasUpper = /[A-Z]/.test(sanitized);
  const hasLower = /[a-z]/.test(sanitized);
  const hasNumber = /\d/.test(sanitized);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(sanitized);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    throw new Error(
      "Password must contain uppercase, lowercase, number and special character"
    );
  }

  return sanitized;
};

// Name validation and sanitization
export const sanitizeName = (name, fieldName = "Name") => {
  if (!name || typeof name !== "string") {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  // Remove dangerous characters and trim
  let sanitized = escapeHtml(name.trim());

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  // Length validation
  if (sanitized.length < 2 || sanitized.length > 50) {
    throw new Error(`${fieldName} must be between 2-50 characters`);
  }

  // Check for valid name pattern (letters, spaces, basic punctuation)
  if (!/^[a-zA-Z\s\-\.\']+$/.test(sanitized)) {
    throw new Error(`${fieldName} contains invalid characters`);
  }

  // Check for suspicious patterns
  if (containsSuspiciousPatterns(sanitized)) {
    throw new Error(`${fieldName} contains invalid content`);
  }

  return sanitized;
};

// General text sanitization
export const sanitizeText = (text, maxLength = 1000, fieldName = "Text") => {
  if (!text || typeof text !== "string") {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  // Escape HTML and trim
  let sanitized = escapeHtml(text.trim());

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  // Length validation
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must be less than ${maxLength} characters`);
  }

  // Check for suspicious patterns
  if (containsSuspiciousPatterns(sanitized)) {
    throw new Error(`${fieldName} contains invalid content`);
  }

  return sanitized;
};

// HTML escaping utility
const escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

// Check for suspicious patterns
const containsSuspiciousPatterns = (input) => {
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
};

// Real-time validation for form inputs
export const createValidator = (type, options = {}) => {
  return (value) => {
    try {
      switch (type) {
        case "email":
          return { isValid: true, value: sanitizeEmail(value), error: null };
        case "password":
          return { isValid: true, value: validatePassword(value), error: null };
        case "name":
          return {
            isValid: true,
            value: sanitizeName(value, options.fieldName),
            error: null,
          };
        case "text":
          return {
            isValid: true,
            value: sanitizeText(value, options.maxLength, options.fieldName),
            error: null,
          };
        default:
          return {
            isValid: true,
            value: sanitizeText(value, options.maxLength),
            error: null,
          };
      }
    } catch (error) {
      return { isValid: false, value: value, error: error.message };
    }
  };
};

// Password strength checker
export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: [] };

  const feedback = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score += 1;
  else feedback.push("12+ characters recommended");

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  // Complexity patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push("Avoid repeating characters");

  if (!/^(.{1,2})\1+$/.test(password)) score += 1;
  else feedback.push("Avoid simple patterns");

  const strength =
    score >= 7
      ? "strong"
      : score >= 5
      ? "medium"
      : score >= 3
      ? "weak"
      : "very-weak";

  return { score, strength, feedback: feedback.slice(0, 3) }; // Limit feedback
};

// Input debouncer for real-time validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
