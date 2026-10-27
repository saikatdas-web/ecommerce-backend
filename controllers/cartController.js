
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "A valid productId and positive integer quantity are required"
            });
        }

        // Find product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Determine the selling price
        const price =
            product.discountPrice != null &&
            product.discountPrice < product.price
                ? product.discountPrice
                : product.price;

        // Check whether the user already has a cart
        let cart = await Cart.findOne({ user: userId });

        // Create a new cart if none exists
        if (!cart) {
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock"
                });
            }

            cart = await Cart.create({
                user: userId,
                items: [{
                    product: product._id,
                    quantity,
                    price
                }]
            });

            return res.status(201).json({
                success: true,
                message: "Product added to cart",
                data: cart
            });
        }

        // Check whether the product is already in the cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock"
                });
            }

            existingItem.quantity = newQuantity;
            existingItem.price = price;
        
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock"
                });
            }

            cart.items.push({
                product: product._id,
                quantity,
                price
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            data: cart
        });

    } catch (err) {
        console.error(err.message);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }
};

// Get the logged-in user's cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product");

        if (!cart) {
            return res.status(200).json({
                success:true,
                message:" Your cart is empty",
                data: { 
                    items:[] 
                }
            });
        }

        res.status(200).json({
            success:true,
            message:"Cart retrieved successfully",
            data: cart
        });
    
    } catch(err) {
        console.log(err.message);

        res.status(500).json({
            success:false,
            message:"An internal server error occurred"
        })
    }
};

// updateCart
const updateCart = async (req, res) => {
    try {
        // Extract productId and quantity
        const { productId, quantity } = req.body;

        // Validate input
        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        //Find the logged-in user's cart
        const cart = await Cart.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find the existing item in the cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        //Find the product in the db
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check available stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        // Determine the current selling price
        const price =
            product.discountPrice != null &&
            product.discountPrice < product.price
                ? product.discountPrice
                : product.price;

        // Replace the existing quantity and update the price
        existingItem.quantity = quantity;
        existingItem.price = price;

        await cart.save();
        
        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: cart
        });

    } catch (err) {
        console.error(err.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// removeCart
const removeFromCart = async (req, res) => {
    try{
        //Extracted the product ID
        const { productId } = req.body;

        if(!productId) {
            return res.status(400).json({
             success:false,
             message:"ProductId is required"   
            });
        }

        //Find the user's cart
        const cart = await Cart.findOne({ user: req.user._id });

        if(!cart) {
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            });
        }



        //Find the item in the cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

    // Filter condition keeping everything EXCEPT the matching productId
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId);

            await cart.save();

            return res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
            data: cart
        });

        } catch(err) {
        console.error(err.message);

        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

module.exports = { 
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};
