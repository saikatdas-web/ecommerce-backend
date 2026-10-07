const mongoose = require("mongoose");

const userSchema = new mongoose.Schema ({
    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    password:{
        type:String,
        required:true,
        trim:true
    },

    role:{
        type:String,
        enum:["user", "admin"],
        required:true,
        trim:true
    }
},{
    collection:"users",
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);