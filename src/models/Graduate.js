const mongoose = require("mongoose");

const GraduateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  university: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  phone: { type: String },
  lastword: { type: String },
  image: { type: String },
});

const Graduate = mongoose.model("Graduate", GraduateSchema);

module.exports = Graduate;
