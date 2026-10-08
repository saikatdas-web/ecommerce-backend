const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");

// Register user
const registerUser = async (req,res) => {
    try{
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password ) {
            return res.status(400).json({
                success:false,
                message:"Name, email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }

        // Hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role:"user"
        });

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    
    } catch(err) {
        console.log(err.message);

        res.status(500).json({
            success:false,
            message:"An internal server error occurred"
        });
    }
};

// Login user by using JWT

const login = async (req,res) => {
    try{
        const { email, password } = req.body;
        
        // Check required fields
        if(!password || !email) {
            return res.status(400).json({
                success:false,
                message:"Email & password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"Invalid email or password."
            });
        }

        // Comapre password
        const isPasswordMatch = await bcrypt.compare(
            password, 
            user.password
        );

        if(!isPasswordMatch) {
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            });
        }

        // Create JWT token
        const token = generateToken(user._id);
        
        res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    
    } catch(err) {
        console.log(err.message)

        res.status(500).json({
            success:false,
            message:"An internal server error occurred"
        });
    }
};

module.exports = { registerUser, login };
