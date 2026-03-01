const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const workflowRoutes = require("./routes/workflowRoutes");
const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const cors = require('cors');
app.use(cors({
    origin: true, // Allow all origins and reflect them
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);


const MONGO_URI = process.env.MONGO_URI ;
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