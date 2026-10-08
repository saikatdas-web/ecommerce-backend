const multer = require("multer");
const fs = require("fs");
const path= require("path");

const uploadDir = path.join(__dirname,"../uploads/products");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive:true });
}

// Multer storage configuration //
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, uploadDir);
    },

    filename:function(req,file,cb){
// Generate a unique filename using timestamp and a random number//

const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() *1e9);
const ext = path.extname(file.originalname);
cb(null, file.fieldname+ "-" + uniqueSuffix + ext);
 }
});

// File filter to restrict to images only //
const fileFilter = (req,file,cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png',  
        'image/webp'];
        if (allowedTypes.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG and WEBP image files are allowed!'), false);
    }
};

// Initialize multer upload instance
const upload = multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:20 * 1024 * 1024}
});

module.exports = upload;

