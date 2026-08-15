function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error("API Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(422).json({
      success: false,
      message: errors[0] || "Validation failed.",
      errors,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const duplicateField = Object.keys(
      err.keyPattern || err.keyValue || {}
    )[0];

    let message = "A record with this value already exists.";

    if (duplicateField === "phone") {
      message = "This phone number is already registered.";
    }

    if (duplicateField === "email") {
      message = "This email address is already registered.";
    }

    if (duplicateField === "username") {
      message = "This username is already registered.";
    }

    return res.status(409).json({
      success: false,
      message,
      field: duplicateField || null,
    });
  }

  // JWT errors
  if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Your session has expired. Please login again."
          : "Invalid authentication token.",
    });
  }

  // Explicit application errors
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      err.message || "Internal server error.",
  });
}

module.exports = {
  notFound,
  errorHandler,
};