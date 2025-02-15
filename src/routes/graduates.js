const express = require("express");
const Graduate = require("../models/Graduate.js");
const router = express.Router();
const upload = require("../utils/multer.js"); // Import Multer

// GET all graduates
router.get("/", async (req, res) => {
  try {
    const graduates = await Graduate.find();
    res.json(graduates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data received! Make sure you set the correct headers in Postman." });
    }
        try {
          const existingGraduate = await Graduate.findOne({ phone: req.body.phone });
              if (existingGraduate) {
                  return res.status(400).json({ message: "This phone number is already registered!" });
              }
          const { name, university, department, year, phone, lastword } = req.body;
          const imageUrl = req.file.path; // Get Cloudinary image URL
      
          const newGraduate = new Graduate({
            name,
            university,
            department,
            year,
            phone,
            lastword,
            image: imageUrl,
          });
      
          await newGraduate.save();
          res.status(201).json({ message: "Graduate added successfully!", graduate: newGraduate });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, university, department, year, phone, lastword } = req.body;
    const graduateId = req.params.id;

    const updatedData = { name, university, department, year, phone, lastword};

    if (req.file) {
      updatedData.image = req.file.path; // Update image if a new one is uploaded
    }

    const updatedGraduate = await Graduate.findByIdAndUpdate(graduateId, updatedData, { new: true });

    if (!updatedGraduate) {
      return res.status(404).json({ message: "Graduate not found!" });
    }

    res.json({ message: "Graduate updated successfully!", graduate: updatedGraduate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
    

// DELETE a graduate
router.delete("/:id", async (req, res) => {
  try {
    await Graduate.findByIdAndDelete(req.params.id);
    res.json({ message: "Graduate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
