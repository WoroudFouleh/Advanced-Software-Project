const router = require("express").Router();

const authController = require("../controllers/authContoller");

// REGISTRATION 
router.post("/register", authController.register);


// LOGIN 
router.post('/login', authController.login);

// مسار طلب إعادة تعيين كلمة المرور
router.post('/request-password-reset', authController.requestPasswordReset);

// مسار تعيين كلمة المرور الجديدة
router.post('/reset-password', authController.resetPassword);

module.exports = router 
