const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { 
    placeOrder, 
    updateOrderStatus, 
    getMyOrders, 
    getAllOrders } = require("../controllers/orderController");

// Place Order by login user
router.post("/", authMiddleware, placeOrder);

// Only Admin updates order status
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

// Logged-in user can view their own order history
router.get("/order-history", authMiddleware, getMyOrders);

// getAllOrders — Admin only
router.get("/all-orders", authMiddleware,adminMiddleware,getAllOrders);

module.exports = router;