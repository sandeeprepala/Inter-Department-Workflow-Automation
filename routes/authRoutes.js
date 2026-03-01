const router = require("express").Router();
const {
    registerPatient,
    registerDoctor,
    loginPatient,
    loginDoctor,
    registerStaff,
    loginStaff,
    logout
} = require("../controllers/authController");

router.post("/register/doctor", registerDoctor);
router.post("/login/doctor", loginDoctor);

router.post("/register/patient", registerPatient);
router.post("/login/patient", loginPatient);

// Staff routes (billing_person, lab_incharge, pharmacy, insurance_person, admin)
router.post("/register/staff", registerStaff);
router.post("/login/staff", loginStaff);

router.post("/logout", logout);

module.exports = router;