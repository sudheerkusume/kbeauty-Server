const jwt = require("jsonwebtoken");
const debugLog = require("../utils/logger");

module.exports = function (req, res, next) {
    try {
        debugLog(`OptionalAuth processing: ${req.url}`);
        let token = req.header("x-token") || req.header("Authorization");

        if (!token) {
            debugLog("OptionalAuth: No token provided");
            req.user = null; // No user, but allow continuation
            return next();
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "kbeauty_secret_production_key_123");
        req.user = decoded.user;
        debugLog(`OptionalAuth: User found ${req.user.id}`);
        next();
    } catch (err) {
        debugLog(`OptionalAuth: Invalid token - ${err.message}`);
        req.user = null;
        next();
    }
};
