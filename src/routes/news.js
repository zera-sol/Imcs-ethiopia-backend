const express = require("express");
const News = require("../models/News.js");
const router = express.Router();
const upload = require("../utils/multer.js"); // Import Multer

// GET all news
router.get("/", async (req, res) => {
    try {
         const news = await News.find();
         res.json(news.reverse()); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST (Create) a news article
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, content, date } = req.body;
        const imageUrl = req.file.path; // Get the uploaded image URL from Cloudinary

        // Validate date format (should be "June-10-2002")
        if (!/^[A-Za-z]+-\d{2}-\d{4}$/.test(date)) {
            return res.status(400).json({ message: "Invalid date format. Use 'Month-DD-YYYY' e.g. 'June-10-2002'." });
        }

        const newNews = new News({ 
                                    title, 
                                    content, 
                                    image: imageUrl,
                                    date });
        await newNews.save();
        res.status(201).json({ message: "News created successfully!", news: newNews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT (Update) a news article by ID
router.put("/:id", upload.single("image"), async (req, res) => {
   try {
      const { title, content, date } = req.body;
      const newsId = req.params.id;
  
      const updatedData = { title, content, date };
      
      if (req.file) {
        updatedData.image = req.file.path; // Update image if a new one is uploaded
      }
  
      const updatedNews = await News.findByIdAndUpdate(newsId, updatedData, { new: true });
  
      if (!updatedNews) {
        return res.status(404).json({ message: "News not found!" });
      }
  
      res.json({ message: "News updated successfully!", news: updatedNews });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// DELETE a news article by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);

        if (!deletedNews) {
            return res.status(404).json({ message: "News not found" });
        }

        res.json({ message: "News deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
