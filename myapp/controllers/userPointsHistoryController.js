// userPointsHistoryController.js
const db = require("../db");

const UserPointsHistory = require('../models/userPointsHistoryModel');

// جلب تاريخ نقاط المستخدم
const getAllUserPointsHistory = (req, res) => {
    const query = 'SELECT * FROM user_points_history'; // تأكد من أنك تقوم باسترجاع جميع السجلات

    db.execute(query, (error, results) => {
        if (error) {
            console.error("Database error:", error); // طباعة أي خطأ يظهر
            return res.status(500).json({ error: "Database error" });
        }

        res.status(200).json(results); // إرسال جميع النتائج كـ JSON
    });
};

// إضافة نقاط المستخدم
const addUserPointsHistory = (req, res) => {
    const newEntry = req.body;
    UserPointsHistory.addUserPointsHistory(newEntry, (error, results) => {
        if (error) return res.status(500).json({ error: "Database error" });
        res.status(201).json({ message: "Points history added successfully", id: results.insertId });
    });
};

// تحديث نقاط المستخدم
const updateUserPointsHistory = (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    UserPointsHistory.updateUserPointsHistory(id, updatedData, (error, results) => {
        if (error) return res.status(500).json({ error: "Database error" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Points history updated successfully" });
    });
};

// حذف نقاط المستخدم
const deleteUserPointsHistory = (req, res) => {
    const { id } = req.params;
    UserPointsHistory.deleteUserPointsHistory(id, (error, results) => {
        if (error) return res.status(500).json({ error: "Database error" });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Points history deleted successfully" });
    });
};

module.exports = {
    getAllUserPointsHistory,
    addUserPointsHistory,
    updateUserPointsHistory,
    deleteUserPointsHistory
};
