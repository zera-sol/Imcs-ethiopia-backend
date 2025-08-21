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
//Get graduates of a given university
// Get graduates by university (param)
router.get("/:university", async (req, res) => {
  try {
    const { university } = req.params;

    // Find graduates whose university matches (case-insensitive)
    const graduates = await Graduate.find({
      university: { $regex: new RegExp(university, "i") }
    });

    if (graduates.length === 0) {
      return res.status(404).json({ message: "No graduates found for this university." });
    }

    res.json(graduates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new graduates to a database
router.post("/",  async (req, res) => {
  if (!req.body || !Array.isArray(req.body.graduates) || req.body.graduates.length === 0) {
      return res.status(400).json({ message: "No valid data received!" });
  }

  try {
      const graduates = req.body.graduates; // Array of graduates from frontend
      const phoneNumbers = graduates.map(g => g.phone);
      
      // Find existing graduates with the same phone numbers
      const existingGraduates = await Graduate.find({ phone: { $in: phoneNumbers } });

      if (existingGraduates.length > 0) {
          const registeredNames = existingGraduates.map(g => g.name);
          return res.status(400).json({ message: `These users are already registered: ${registeredNames.join(", ")}` });
      }
      
      // Add images to each graduate
      const newGraduates = graduates.map((graduate, index) => ({
          ...graduate
      }));

      // Save new graduates in bulk
      const savedGraduates = await Graduate.insertMany(newGraduates);
      res.status(201).json({ message: "Graduates added successfully!", graduates: savedGraduates });
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
