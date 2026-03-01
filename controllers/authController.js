const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Staff = require("../models/Staff");

const generateToken = (user, role) => {
    return jwt.sign(
        { id: user._id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER PATIENT
exports.registerPatient = async (req, res) => {
    console.log("register patient");

    console.log(req.body);

    try {
        const hashed = await bcrypt.hash(req.body.password, 10);

        const patient = await Patient.create({
            ...req.body,
            password: hashed
        });

        const token = generateToken(patient, "patient");
        res.cookie("token", token);
        res.json({ token, user: { id: patient._id, name: patient.patientName || patient.name, role: 'patient' } });

    } catch (err) {
        console.error("Register Patient Error:", err);
        res.status(500).json(err.message || "Registration failed.");
    }
};

// REGISTER DOCTOR
exports.registerDoctor = async (req, res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10);

        const doctor = await Doctor.create({
            ...req.body,
            password: hashed
        });

        const token = generateToken(doctor, "doctor");
        res.cookie("token", token);
        res.json({ token, user: { id: doctor._id, name: doctor.doctorName || doctor.name, role: 'doctor' } });

    } catch (err) {
        console.error("Register Doctor Error:", err);
        res.status(500).json(err.message || "Registration failed.");
    }
};


// LOGIN PATIENT
exports.loginPatient = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            patientName: req.body.patientName
        });

        if (!patient) return res.status(404).json("Not found");

        const match = await bcrypt.compare(
            req.body.password,
            patient.password
        );

        if (!match) return res.status(401).json("Wrong password");

        const token = generateToken(patient, "patient");
        res.cookie("token", token);
        res.json({ token, user: { id: patient._id, name: patient.patientName || patient.name, role: 'patient' } });

    } catch (err) {
        res.status(500).json(err);
    }
};


// LOGIN DOCTOR
exports.loginDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            doctorName: req.body.doctorName
        });

        if (!doctor) return res.status(404).json("Not found");

        const match = await bcrypt.compare(
            req.body.password,
            doctor.password
        );

        if (!match) return res.status(401).json("Wrong password");

        const token = generateToken(doctor, "doctor");
        res.cookie("token", token);
        res.json({ token, user: { id: doctor._id, name: doctor.doctorName || doctor.name, role: 'doctor' } });

    } catch (err) {
        res.status(500).json(err);
    }
};


// LOGOUT (Client deletes token)
exports.logout = async (req, res) => {
    res.cookie("token", "");
    res.json("Logged out (delete token client-side)");
};


// =============================
// STAFF AUTHENTICATION
// =============================

// REGISTER STAFF (billing_person, lab_incharge, pharmacy, insurance_person, admin)
exports.registerStaff = async (req, res) => {
    try {
        const { name, password, role } = req.body;

        // Validate role
        const validRoles = ["Billing", "Lab", "Pharmacy", "Insurance", "Admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json("Invalid role. Valid roles: Billing, Lab, Pharmacy, Insurance, Admin");
        }

        // Check if staff already exists
        const existingStaff = await Staff.findOne({ name, role });
        if (existingStaff) {
            return res.status(400).json("Staff member with this name and role already exists");
        }

        const hashed = await bcrypt.hash(password, 10);

        const staff = await Staff.create({
            name,
            role,
            password: hashed
        });

        const token = generateToken(staff, role);
        res.cookie("token", token);
        res.json({ token, staff: { id: staff._id, name: staff.name, role: staff.role } });

    } catch (err) {
        console.error("Register Staff Error:", err);
        res.status(500).json("Registration failed. Staff ID may already exist.");
    }
};

// LOGIN STAFF (billing_person, lab_incharge, pharmacy, insurance_person, admin)
exports.loginStaff = async (req, res) => {
    try {
        const { name, password, role } = req.body;

        // Validate role
        const validRoles = ["Billing", "Lab", "Pharmacy", "Insurance", "Admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json("Invalid role. Valid roles: Billing, Lab, Pharmacy, Insurance, Admin");
        }

        const staff = await Staff.findOne({ name, role });

        if (!staff) return res.status(404).json("Staff member not found");

        const match = await bcrypt.compare(password, staff.password);

        if (!match) return res.status(401).json("Wrong password");

        const token = generateToken(staff, role);
        res.cookie("token", token);
        res.json({ token, staff: { id: staff._id, name: staff.name, role: staff.role } });

    } catch (err) {
        console.error("Login Staff Error:", err);
        res.status(500).json("Login failed. Check your connection.");
    }
};