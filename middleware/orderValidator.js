const { body, validationResult } = require("express-validator");

const validateOrder = [
    body("shippingAddress.firstName").notEmpty().withMessage("First name is required"),
    body("shippingAddress.lastName").notEmpty().withMessage("Last name is required"),
    body("shippingAddress.address").notEmpty().withMessage("Address is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.pincode")
        .isLength({ min: 6, max: 6 })
        .withMessage("Pincode must be 6 digits")
        .isNumeric()
        .withMessage("Pincode must be numeric"),
    body("shippingAddress.phone")
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone number must be 10 digits")
        .isNumeric()
        .withMessage("Phone number must be numeric"),
    body("shippingAddress.email")
        .isEmail()
        .withMessage("Valid email is required"),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const debugLog = require("../utils/logger");
            debugLog.error(`Validation Failed: ${JSON.stringify(errors.array())}`);
            return res.status(400).json({ errors: errors.array(), message: "Validation Failed" });
        }
        next();
    }
];

module.exports = { validateOrder };
