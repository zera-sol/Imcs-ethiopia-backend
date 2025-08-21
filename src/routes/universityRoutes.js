// src/routes/universityRoutes.js
const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Google Sheets authentication
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets", // for read and write
  ],
});

const sheets = google.sheets({ version: "v4", auth });

// GET /students
// GET /students?university=Addis Ababa University
router.get("/students", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:H", // Adjust if your sheet name or columns differ
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No students found." });
    }

    const headers = rows[0];
    let students = rows.slice(1).map((row) =>
      headers.reduce((obj, header, i) => {
        obj[header] = row[i] || "";
        return obj;
      }, {})
    );

    // Filter by university if query parameter is provided
    const { university } = req.query;
    if (university) {
      students = students.filter(
        (student) =>
          student.university &&
          student.university.toLowerCase() === university.toLowerCase()
      );
    }

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this university." });
    }

    res.json(students);
  } catch (error) {
    console.error("Error fetching students from Google Sheets:", error);
    res.status(500).json({ message: "Something went wrong while fetching students." });
  }
});

// POST /students
// Add a new student
router.post("/students", async (req, res) => {
  try {
    const { datafromUi } = req.body;

    if (!Array.isArray(datafromUi) || datafromUi.length === 0) {
      return res.status(400).json({ message: "datafromUi must be a non-empty array." });
    }

    // ✅ Validate each student
    const invalid = datafromUi.filter(
      (s) => !s.fullName || !s.university
    );
    if (invalid.length > 0) {
      return res
        .status(400)
        .json({ message: "Each student must include fullName and university." });
    }

    // ✅ Get headers dynamically
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A1:Z1",
    });

    const headers = headerResponse.data.values[0];

    // ✅ Get all existing data in the sheet
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A2:Z", // skip headers row
    });

    const existingRows = existingResponse.data.values || [];

    // Build a set of existing keys (e.g., fullName + university or email)
    const existingSet = new Set(
      existingRows.map((row) => {
        const rowObj = {};
        headers.forEach((h, i) => (rowObj[h] = row[i] || ""));
        return (rowObj.fullName + "-" + rowObj.university).toLowerCase().trim();
      })
    );

    // ✅ Filter only new students not already in sheet
    const newStudents = datafromUi.filter(
      (s) =>
        !existingSet.has((s.fullName + "-" + s.university).toLowerCase().trim())
    );

    if (newStudents.length === 0) {
      return res
        .status(200)
        .json({ message: "No new students to add. All already exist." });
    }

    // ✅ Map new students into rows following the headers
    const rowsToAppend = newStudents.map((student) =>
      headers.map((header) => student[header] || "")
    );

    // ✅ Append only unique new rows
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A:Z",
      valueInputOption: "USER_ENTERED",
      resource: { values: rowsToAppend },
    });

    res.status(201).json({
      message: `${newStudents.length} students added successfully (ignored duplicates).`,
      students: newStudents,
    });
  } catch (error) {
    console.error("Error adding students to Google Sheets:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while adding students." });
  }
});

module.exports = router;
