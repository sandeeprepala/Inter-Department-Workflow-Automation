const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const generateToken = (user, role) => {
    return jwt.sign(
        { id: user._id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER PATIENT
exports.registerPatient = async (req, res) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10);

        const patient = await Patient.create({
            ...req.body,
            password: hashed
        });

        const token = generateToken(patient, "patient");

        res.json({ token });

    } catch (err) {
        res.status(500).json(err);
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

        res.json({ token });

    } catch (err) {
        res.status(500).json(err);
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

        res.json({ token });

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

        res.json({ token });

    } catch (err) {
        res.status(500).json(err);
    }
};


// LOGOUT (Client deletes token)
exports.logout = async (req, res) => {
    res.json("Logged out (delete token client-side)");
};