const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["viewer", "admin"], default: "viewer" } // Role
});

const User = mongoose.model("User", userSchema);
module.exports = User;
