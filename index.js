const express = require("express");
const mongoose = require("mongoose");

const workflowRoutes = require("./routes/workflowRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();
app.use(express.json());

// 🔹 Replace with your MongoDB URL
const MONGO_URI = "mongodb+srv://sandeeprepala3_db_user:GSl5KsVferIH4XPX@cluster0.qnltds3.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("✅ Connected to MongoDB Database");

    app.use("/workflow", workflowRoutes);
    app.use("/request", requestRoutes);
    app.get("/", (req, res) => {
        res.send("Welcome to the Hospital Workflow Management System API");
    });
    app.listen(5000, () => {
        console.log("🚀 Server running on port 5000");
    });
})
.catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
});