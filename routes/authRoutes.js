const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Fuser = require("../models/FuserModel");
const RefreshToken = require("../models/RefreshToken");
const verifyToken = require("../middleware/routeAuth");

const admin = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "kbeauty_secret_production_key_123";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "kbeauty_refresh_production_key_456";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Helper to generate tokens
const generateTokens = (user) => {
    const payload = { user: { id: user._id, role: user.role } };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

console.log("Auth routes file loading...");

// 🔹 Signin (Signup)
router.post("/signin", async (req, res) => {
    try {
        const { name, email, password, cpassword } = req.body;

        if (password !== cpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const exist = await Fuser.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Fuser({
            name,
            email,
            password: hashedPassword,
            role: email.startsWith("admin@") ? "admin" : "user"
        });

        await newUser.save();
        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Ulogin (Login)
router.post("/Ulogin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Fuser.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        
        // Store refresh token in database
        await new RefreshToken({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).save();

        // Update lastActiveAt
        user.lastActiveAt = Date.now();
        await user.save();

        res.json({ 
            token: accessToken, 
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Get User Profile (for AccountPage)
router.get("/Account", verifyToken, async (req, res) => {
    try {
        const user = await Fuser.findById(req.user.id).select("-password -cpassword");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Update User Profile
router.put("/update-profile", verifyToken, async (req, res) => {
    try {
        const { name, email, address } = req.body;
        const userId = req.user.id;

        const user = await Fuser.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Email validation (basic)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            // Check if email is being changed and is already in use
            if (email !== user.email) {
                const existingUser = await Fuser.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ message: "Email already exists" });
                }
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (address !== undefined) user.address = address; // Allow empty string for address

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                phone: user.phone
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Get User Profile (for CartContext synchronization)
router.get("/getuser", verifyToken, async (req, res) => {
    try {
        const user = await Fuser.findById(req.user.id).select("-password -cpassword");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Firebase Login (New)
router.post("/firebase-login", async (req, res) => {
    try {
        const { idToken } = req.body;
        
        // 1. Verify idToken with firebase-admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid: firebaseUid, phone_number: phone, name, email, picture } = decodedToken;
        
        // 2. Find or Create User
        let user = await Fuser.findOne({ $or: [{ firebaseUid }, { phone }] });
        
        if (!user) {
            // New User via Phone/Firebase
            user = new Fuser({
                name: name || `User_${firebaseUid.slice(-6)}`,
                email: email || `${firebaseUid}@kbeautymart.id`,
                phone: phone,
                firebaseUid: firebaseUid,
                password: await bcrypt.hash(Math.random().toString(36), 10),
                role: "user"
            });
            await user.save();
        } else {
            // Update Existing User
            let updated = false;
            if (!user.firebaseUid) { user.firebaseUid = firebaseUid; updated = true; }
            if (!user.phone && phone) { user.phone = phone; updated = true; }
            if (updated) await user.save();
        }

        // 3. Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Update lastActiveAt
        user.lastActiveAt = Date.now();
        await user.save();

        // 4. Store refresh token
        await new RefreshToken({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).save();

        res.json({ 
            token: accessToken, 
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        console.error("Firebase Auth Verification Failed:", err);
        res.status(401).json({ message: "Identity verification failed", error: err.message });
    }
});

// 🔹 Refresh Token
router.post("/refresh-token", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) return res.status(403).json({ message: "Invalid refresh token" });

        // Verify token using REFRESH_SECRET
        jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                // If verification fails, delete the token from DB
                await RefreshToken.deleteOne({ token: refreshToken });
                return res.status(403).json({ message: "Token expired or invalid" });
            }

            const user = await Fuser.findById(decoded.user.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            // Rotate refresh token
            storedToken.token = newRefreshToken;
            storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await storedToken.save();

            res.json({ token: accessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Logout
router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Get Online Users (Admin Only)
router.get("/online-users", verifyToken, async (req, res) => {
    try {
        // Only allow admins
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineUsers = await Fuser.find({ 
            lastActiveAt: { $gte: fiveMinutesAgo } 
        }).select("-password -cpassword");

        res.json({
            count: onlineUsers.length,
            users: onlineUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
