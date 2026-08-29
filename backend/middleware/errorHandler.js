export const errorHandler = (err, req, res, next) => {
    console.error("Internal Error Caught:", err.stack || err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: messages
        });
    }

    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `An entry with this ${field} already exists.`
        });
    }

    // Mongoose CastError (e.g. invalid ObjectId format)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Resource not found with invalid id format: ${err.value}`
        });
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authorization token."
        });
    }

    // Default 500 server error
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`
    });
};
