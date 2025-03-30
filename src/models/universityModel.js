const axios = require("axios");
require("dotenv").config();

const SHEET_BEST_URL = process.env.SHEET_BEST_URL; // The API URL from Sheet.best

const getUniversityData = async (university) => {
  try {
    // Fetch all data from Sheet.best
    const response = await axios.get(SHEET_BEST_URL);
    const rows = response.data || [];

    // Filter rows by university name
    const filteredRows = rows.filter(row => 
      row.university&& row.university.toLowerCase() === university.toLowerCase()
    );

    return filteredRows;
  } catch (error) {
    console.error("Error fetching university data:", error);
    throw new Error("Failed to fetch university data.");
  }
};

const saveToSheet = async (data) => {
  try {
    if (!Array.isArray(data) || data.length === 0) throw new Error("No data provided");

    // Send data to Sheet.best API
    const response = await axios.post(SHEET_BEST_URL, data);

    return { message: "Data saved successfully!", response: response.data };
  } catch (error) {
    console.error("Error saving data:", error);
    throw new Error("Failed to save data.");
  }
};

module.exports = { getUniversityData, saveToSheet };
