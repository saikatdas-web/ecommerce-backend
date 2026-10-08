const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// Get all products
const getProduct = async (req,res) => {
    try{
        const products = await Product.find({});
        res.status(200).json({
            success:true,
            message:"Fetch all products successfully",
            data:products
        });
    
    } catch(err) {
        console.log(err.message);

        res.status(500).json({
            success:false,
            message:err.message
        });
    }
};

// Get single product
const getOneProduct = async (req,res) => {
    try{
        const oneProduct = await Product.findById(req.params.id);

        if(!oneProduct) {
            return res.status(404).json({
                success:false,
                message:"Products not found"
            });
        }
        res.status(200).json({
            success:true,
            message:"Fetched single product successfully",
            data: oneProduct
        });
    
    } catch(err) {
        console.log(err.message);

        res.status(500).json({
            success:false,
            message:err.message
        });
    }
};

// Create product
const createProduct = async (req,res) => {
    try{
        const imagePaths = req.files ?.map(
            file =>`/uploads/products/${file.filename}`) || [];
        
        const product = await Product.create({

            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            discountPrice:req.body.discountPrice,
            category:req.body.category,
            brand:req.body.brand,
            stock:req.body.stock,
            images:imagePaths,
            rating:req.body.rating,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured
        });

        res.status(201).json({
            success:true,
            message:"Product hasbeen created successfully",
            data:product
        });
    
    } catch(err) {
        res.status(500).json({
            success:false,
            messgae:err.message
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.discountPrice = req.body.discountPrice;
        product.category = req.body.category;
        product.brand = req.body.brand;
        product.stock = req.body.stock;

        if (req.body.rating !== undefined) {
            product.rating = req.body.rating;
        }

        if (req.body.numReviews !== undefined) {
            product.numReviews = req.body.numReviews;
        }

        if (req.body.isFeatured !== undefined) {
            product.isFeatured = req.body.isFeatured;
        }


        // If new images were uploaded
        if (req.files && req.files.length > 0) {

            // Delete old physical images
            product.images.forEach((imagePath) => {

                const fileName = path.basename(imagePath);

                const filePath = path.join(
                    __dirname,
                    "../uploads/products",
                    fileName
                );

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });


            // Create paths for new images
            const imagePaths = req.files.map(
                file => `/uploads/products/${file.filename}`
            );

            product.images = imagePaths;
        }


        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (err) {
        console.log(err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Delete product
const deleteProduct = async (req,res) => {
    try {
        const data = await Product.findById(req.params.id);
        if(!data) {
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }

        // Delete physical image files
        data.images.forEach((imagePath) => {
            const fileName = path.basename(imagePath);

            const filePath = path.join(
                __dirname, 
                "../uploads/products", 
                fileName
            );
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);

                console.log("Deleted image:", fileName);
            }
        });

        // Delete product from DB
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"Product deleted successfully",
            data:data
        });

    } catch(err) {
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
};

const productController = { 
    getProduct,
    getOneProduct,
    createProduct,
    updateProduct,
    deleteProduct 
}

module.exports = productController;