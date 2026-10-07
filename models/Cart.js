const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User", // Matches the model name
        required:true
    },
    items:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },

            quantity:{
                type:Number,
                required:true,
                min:[1, 'Quantity cannot be less than 1.'],
                default:1
            },

            price:{
                type:Number,
                required:true
            }
        }
    ]
},{
    timestamps:true,
    collection:"cart"
});

module.exports = mongoose.model("Cart", cartSchema);