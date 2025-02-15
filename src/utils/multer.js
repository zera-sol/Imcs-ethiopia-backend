const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Configure Multer to store images in different folders dynamically
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "news-images"; // Default folder

    if (req.path.includes("/graduates")) {
      folderName = "graduates-images"; // Store graduate images separately
    }

    return {
      folder: folderName,
      format: "png", // Convert images to PNG
      public_id: file.originalname.split(".")[0], // Use original filename
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
