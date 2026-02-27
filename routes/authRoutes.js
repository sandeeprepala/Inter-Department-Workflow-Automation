const router = require("express").Router();
const {
    registerPatient,
    registerDoctor,
    loginPatient,
    loginDoctor,
    logout
} = require("../controllers/authController");

router.post("/register/patient", registerPatient);
router.post("/register/doctor", registerDoctor);

router.post("/login/patient", loginPatient);
router.post("/login/doctor", loginDoctor);

router.post("/logout", logout);

module.exports = router;