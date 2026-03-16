const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        let token = req.header("x-token") || req.header("Authorization");

        if (!token) {
            return res.status(400).send("Token not found");
        }

        // Handle "Bearer <token>" format if necessary
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length);
        }

        const decode = jwt.verify(token, "kbeauty_secret");
        req.user = decode.user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(500).send("Invalid Token");
    }
};
