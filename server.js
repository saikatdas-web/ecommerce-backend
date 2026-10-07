const express = require("express");
const app = express();
const path = require("path");
const connectDB = require('./config/connectDB');
const dotenv = require("dotenv");
const { log } = require("console");
dotenv.config();
const PORT = process.env.PORT || 5000;

// Db connection
connectDB();

// middleware
app.use(express.json());
app.use(express.urlencoded,({ extended:"true" }));

// server image upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route
app.use("/api", router);

// error
app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(500).json({
        success:false,
        message:"An internal server error occured"
    });
});

// server configuration
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API:http//localhost:${PORT} to view the client in browser`);
});

