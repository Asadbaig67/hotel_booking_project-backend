import multer from "multer";


// Define the multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // The folder where to save the images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use the original name of the file
    }
})

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });


export { upload };