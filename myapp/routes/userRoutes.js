// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const checkPermissions = require('../middleware/checkPermissions');
const userController = require('../controllers/userController');

//Admin
router.get('/users', checkPermissions, userController.getAllUsers); // عرض كل المستخدمين
router.delete('/users/:id', checkPermissions, userController.deleteUser); // حذف مستخدم
router.post('/users', checkPermissions, userController.addUser); // إضافة مستخدم
router.put('/users/:id', checkPermissions, userController.updateUser); // تعديل مستخدم
router.get('/users/search', checkPermissions, userController.searchUser); // البحث عن مستخدم
router.get('/users/role-percentages', checkPermissions, userController.getUserRolePercentages);

//Users
router.get('/profile', checkPermissions, userController.getOwnProfile); // إضافة الميدل وير

router.put('/profile', checkPermissions,userController.updateOwnProfile); // تعديل الملف الشخصي للمستخدم

router.delete('/profile', checkPermissions, userController.deleteOwnAccount); // حذف حساب المستخدم


module.exports = router;









