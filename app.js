require("dotenv").config();
require("./db");

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { apiLimiter, authLimiter } = require("./middleware/security");
const logger = require("./utils/logger");

// Initialize Firebase Admin
require("./config/firebase");
logger.info("Firebase Admin initialized via production service account");

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        const whitelist = [
            "https://kglowmart.in",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://project1-copy.vercel.app"
        ];
        if (!origin || whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`CORS Rejected for origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(apiLimiter);

// Log all requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});


// ROUTES
const productRoutes = require("./routes/productRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const typeRoutes = require("./routes/typeRoutes");
const faqRoutes = require("./routes/faqRoutes");
const megaMenuRoutes = require("./routes/megaMenuRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");


// API Routes
app.use("/products", productRoutes);
app.use("/enquiries", enquiryRoutes);
console.log("Loading Payment Routes...");
app.use("/api/payment", require("./routes/paymentRoutes"));
console.log("Payment Routes Registered");
app.use("/blogPosts", blogRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/types", typeRoutes);
app.use("/faq", faqRoutes);
app.use("/megamenu", megaMenuRoutes);
app.use("/discoveryIngredients", require("./routes/ingredientRoutes"));

// Auth, Cart, and Order Routes (Match Frontend)
console.log("Registering auth routes at /api/auth");
app.use("/api/auth", authLimiter, authRoutes);
console.log("Registering cart routes at /cart");
app.use("/cart", cartRoutes);
console.log("Registering order routes at /order");
app.use("/order", orderRoutes);
console.log("Registering wishlist routes at /wishlist");
app.use("/wishlist", wishlistRoutes);


app.get("/", (req, res) => {
    res.send("KBeautyMart API Running");
});

// Final Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(`Server Error: ${err.message}`, { stack: err.stack, url: req.url });
    res.status(500).json({ message: "Internal server error", error: err.message });
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});