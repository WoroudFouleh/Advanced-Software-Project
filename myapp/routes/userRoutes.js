// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const checkPermissions = require('../middleware/checkPermissions');
const userController = require('../controllers/userController');

// المسارات المخصصة للأدمن
router.get('/users', checkPermissions, userController.getAllUsers); // عرض كل المستخدمين
/*
router.post('/users', checkPermissions, userController.addUser); // إضافة مستخدم
router.put('/users/:id', checkPermissions, userController.updateUser); // تعديل مستخدم
router.delete('/users/:id', checkPermissions, userController.deleteUser); // حذف مستخدم
router.get('/users/search', checkPermissions, userController.searchUser); // البحث عن مستخدم

// المسارات المخصصة للمستخدمين العاديين
router.get('/profile', userController.getOwnProfile); // عرض الملف الشخصي للمستخدم
router.put('/profile', userController.updateOwnProfile); // تعديل الملف الشخصي للمستخدم
router.delete('/profile', userController.deleteOwnAccount); // حذف حساب المستخدم
*/
module.exports = router;
