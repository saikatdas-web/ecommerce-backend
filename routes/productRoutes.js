const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");
const productController = require("../controllers/productController");

// Routes
router.get("/", productController.getProduct);
router.get("/:id", productController.getOneProduct);
router.post("/", authMiddleware, adminMiddleware, upload.array("images",5), productController.createProduct);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images",5), productController.updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
