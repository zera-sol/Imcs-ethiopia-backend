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
  console.log("posting started")
  // the following code is used to save data in google sheet 
  try {
    const { datafromUi } = req.body; //sent array from the frontend

    //return an error if data from the frontend section is not array
      if (!Array.isArray(datafromUi) || datafromUi.length === 0) {
        return res.status(400).json({ message: "Invalid data format. Must be an array." });
      }
    
    //If phone number start with number rather than 09 it adds 0
    const data = datafromUi.map((a) => ({
      ...a,
      phone: (a.phone.length === 9) ? `0${a.phone}` : a.phone
    }));
    
    if (data.length === 0) {
      return res.status(400).json({ message: "No data provided." });
    }

    const university = data[0]?.university;
    if (!university) {
      return res.status(400).json({ message: "University is required in data." });
    }

    const dataFromSheet = await getUniversityData(university);
    let uniqueData = [];

    // checks if there is any resembeles of data in provided and previously saved one 
    if (dataFromSheet.length === 0) {
      uniqueData = data;
    } else {
      const updatedDataFromSheet = dataFromSheet.map((a) => ({
        ...a,
        phone: `0${a.phone}`
      }));

      uniqueData = data.filter(obj1 =>
        !updatedDataFromSheet.some(obj2 => JSON.stringify(obj1) === JSON.stringify(obj2))
      );
    }

    if (uniqueData.length === 0) {
      return res.status(200).json({ message: "No new unique data to save." });
    }

    const response = await saveToSheet(uniqueData);
    console.log("Saved data:", response);

    res.json({ message: "Data saved successfully!", savedCount: uniqueData.length });
  } catch (error) {
    console.error("Error saving data:", error);
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
