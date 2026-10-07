const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require('./config/connectDB');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// DB connection
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route
app.use("/api", router);

// Error handling middleware
app.use((err,req,res,next) => {
    console.log(err.stack);
    
    res.status(500).json({
        success:false,
        message:"An internal server error occured"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API running at http://localhost:${PORT}`);
});

