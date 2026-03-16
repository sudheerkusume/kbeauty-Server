const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        let token = req.header("x-token") || req.header("Authorization");

        if (!token) {
            console.warn("No auth token provided in headers");
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "kbeauty_secret_production_key_123");
        req.user = decoded.user;

        // Update lastActiveAt asynchronously to avoid blocking the request
        const Fuser = require("../models/FuserModel");
        Fuser.findByIdAndUpdate(req.user.id, { lastActiveAt: Date.now() }).catch(err => 
            console.error("Failed to update user activity:", err)
        );

        console.log("Token verification successful for user:", req.user.id);
        next();
    } catch (err) {
        console.error("Auth middleware verification failed:", err.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};
