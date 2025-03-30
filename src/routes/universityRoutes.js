const express = require("express");
const router = express.Router();
const { getUniversityData, saveToSheet } = require("../models/universityModel");

// 🔹 Fetch University Data
router.get("/", async (req, res) => {
  try {
    const { university } = req.query;
    if (!university) {
      return res.status(400).json({ message: "University name is required." });
    }
    const data = await getUniversityData(university);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Save Student Data
router.post("/", async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid data format. Must be an array." });
    }

    const university = data[0]?.university; // Ensure university is extracted
    if (!university) {
      return res.status(400).json({ message: "University is required in data." });
    }

    // Fetch existing data from the sheet
    const dataFromSheet = await getUniversityData(university);
    // Extract existing phone numbers from the sheet
    const existingPhones = new Set(dataFromSheet.map((row) => `0${row.phone}`));
    console.log("existing phone :", existingPhones)
    // Filter out new data that has duplicate phone numbers
    const uniqueData = data.filter((entry) => !existingPhones.has(entry.phone));
    console.log("unique phones", uniqueData)
    if (uniqueData.length === 0) {
      return res.status(200).json({ message: "No new unique data to save." });
    }

    // Save only unique data
    const response = await saveToSheet(uniqueData);
    console.log("Saved data:", response);

    res.json({ message: "Data saved successfully!", savedCount: uniqueData.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// 🔹 Fetch University Data by Query Parameter
router.get("/getUniversityData", async (req, res) => {
  try {
    const { university } = req.query;
    console.log("Received university:", university); // Debugging log

    if (!university) {
      return res.status(400).json({ error: "University is required" });
    }

    const data = await getUniversityData(university);
    console.log("Fetched data:", data); // Debugging log

    res.json(data);
  } catch (error) {
    console.error("Error in API:", error); // Log full error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
