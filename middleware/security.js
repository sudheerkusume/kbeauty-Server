const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
});

// Stricter limiter for Auth/OTP routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each IP to 10 attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again in an hour." }
});

module.exports = { apiLimiter, authLimiter };
