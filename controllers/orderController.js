const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Place order
const placeOrder = async (req, res) => {
    const updatedProducts = [];
    let createdOrder = null;

    try {
        // Get the logged-in user's ID
        const userId = req.user._id;

        // Get shipping address from request body
        const { shippingAddress } = req.body;

        // Validate shipping address
        if (
            !shippingAddress ||
            !shippingAddress.street?.trim() ||
            !shippingAddress.city?.trim() ||
            !shippingAddress.state?.trim() ||
            shippingAddress.postalCode == null ||
            String(shippingAddress.postalCode).trim() === "" ||
            !shippingAddress.country?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A complete shipping address is required"
            });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId });

        // Check whether the cart exists and contains items
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Prepare order items and calculate total amount
        const orderItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            // Check whether the product exists
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // Check available stock
            if (item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            // Get the current selling price
            const price =
                product.discountPrice != null &&
                product.discountPrice < product.price
                    ? product.discountPrice
                    : product.price;

            // Store the product details for the order
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price
            });

            // Calculate the total price
            totalAmount += price * item.quantity;
        }

        // Reduce stock only if enough stock is still available
        for (const item of orderItems) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                {
                    new: true
                }
            );

            // Stop if stock is no longer sufficient
            if (!updatedProduct) {
                // Restore stock already reduced during this request
                for (const updated of updatedProducts) {
                    await Product.updateOne(
                        { _id: updated.productId },
                        { $inc: { stock: updated.quantity } }
                    );
                }

                updatedProducts.length = 0;

                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock. Please try again."
                });
            }

            // Remember the stock update in case a later step fails
            updatedProducts.push({
                productId: item.product,
                quantity: item.quantity
            });
        }

        // Create the order
        createdOrder = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress
        });

        // Empty the cart after creating the order
        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: createdOrder
        });

    } catch (err) {
        // Roll back stock changes if a later step fails
        try {
            for (const updated of updatedProducts) {
                await Product.updateOne(
                    { _id: updated.productId },
                    { $inc: { stock: updated.quantity } }
                );
            }

            // Remove the order if it was created but the request failed later
            if (createdOrder) {
                await Order.findByIdAndDelete(createdOrder._id);
            }
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError.message);
        }

        console.error(err.message);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }
};

// Admin only update the Order Status
const updateOrderStatus = async (req,res) => {
    try{
        // Get the order ID from req.params
        const orderId = req.params.id;
        
        // Get the new status from req.body
        const { status } = req.body;

        // Check whether the requested status is valid
        const validStatus = [
            "pending",
            "confirmed", 
            "shipped", 
            "delivered",
            "cancelled"
        ];

        if(!validStatus.includes(status)) {
            return res.status(400).json({
                success:false,
                message:"Invalid status update requested"
            });
        }

        // Find the order and update its status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new:true, runValidators:true }
        );

        // Check whether the order exists
           if(!updatedOrder) {
            return res.status(404).json({
                success:false,
                message:"Order not found"
            });
        }

        // Returned the updated order
        return res.status(200).json({
            success:true,
            message:"Order status updated successfully",
            order:updatedOrder
        });
    
    } catch (err) {
        console.error(err.message);
        
        res.status(500).json({
            success:false,
            message:"An internal server error occured"
        });
    }
}

// Only logged in users can see their order history

const getMyOrders = async (req, res) => {
    try {
        // Get the logged-in user's ID from req.user
        const userId = req.user._id;

        // Find all orders belonging to this user
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Order history fetched successfully",
            data: orders
        });

    } catch (err) {
        console.error(err.message);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }
};

// getAllOrders — Admin only(Admin can view every customer's orders)

const getAllOrders = async (req,res) => {
    try {
        // Find all orders, newest first
        const allOrders = await Order.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            message:"All orders fetched successfully",
            data: allOrders
        });
    
    } catch (err) {
        console.error(err.message);
        
        res.status(500).json({
            success:false,
            message:"An internal server error occured"
        });
    }
};

module.exports = { 
    placeOrder, 
    updateOrderStatus, 
    getMyOrders, 
    getAllOrders 
};
