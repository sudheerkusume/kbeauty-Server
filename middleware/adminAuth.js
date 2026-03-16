const verifyToken = require("./routeAuth");

module.exports = function (req, res, next) {
    console.log("adminAuth middleware hit");
    // First run the token verification
    verifyToken(req, res, () => {
        console.log("Token verified in adminAuth, user:", req.user);
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            console.warn("adminAuth Access Denied: User is not an admin", req.user);
            res.status(403).json({ message: "Access denied. Admin only." });
        }
    });
};
