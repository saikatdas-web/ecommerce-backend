const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const{ addToCart, getCart, updateCart, removeFromCart} = require("../controllers/cartController");

// Add product to cart
router.post("/", authMiddleware, addToCart);

//Get logged-in user's cart
router.get("/", authMiddleware,getCart);

// Update cart item quantity
router.patch("/item", authMiddleware,updateCart);

// Remove product from cart
router.delete("/item", authMiddleware,removeFromCart);

module.exports = router;
