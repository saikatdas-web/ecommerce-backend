const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true
    },
    discountPrice:{
        type:Number,
        required:true,
        trim:true,
        min:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    brand:{
        type:String,
        required:true,
        trim:true
    },
    stock:{
        type:Number,
        default:0,
        min:0
    },
    
    images:{
    type:[String],
    required:true
},
    rating:{
        type:Number,
        default:0,
    },
    numReviews:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true,
    collection:"products"
});

module.exports = mongoose.model("Product", productSchema);