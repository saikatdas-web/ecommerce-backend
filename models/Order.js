const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    
    // 1. Owner of the cart/order
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },

    //Array of items inside the cart
    items:[
        {
            product:{
            type:mongoose.Schema.Types.ObjectId,
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
            required:true,
            min:[0,'Price cannot be negative.']
        }
    }
 ],

 //Overall calculation

 totalAmount:{
    type:Number,
    required:true,
    min: [0, 'Total amount cannot be negative.'],
    default: 0
 },

 // Shipping details

 shippingAddress:{
    street:{ type:String, required:true, trim:true },
    city:{ type:String, required:true, trim:true },
    state:{ type:String, required:true, trim:true },
    postalCode:{ type:Number, required:true },
    country:{ type:String, required:true, trim:true }
 },

 // Order/Cart status tracker
 
 status:{
    type:String,
    enum:[
        "pending",
        "confirmed", 
         "shipped", 
        "delivered",
        "cancelled"
    ],
    default:"pending",
    trim:true
 }
},{
    timestamps:true,
    collection:"order"
});

module.exports = mongoose.model("Order", orderSchema);