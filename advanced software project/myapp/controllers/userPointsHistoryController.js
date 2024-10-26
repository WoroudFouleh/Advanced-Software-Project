const db = require("../db");
const UserPointsHistory = require('../models/userPointsHistoryModel');

// جلب تاريخ نقاط المستخدم
const getAllUserPointsHistory = async (req, res) => {
    const query = 'SELECT * FROM user_points_history';

    try {
        const [results] = await db.execute(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

// إضافة نقاط المستخدم
const addUserPointsHistory = async (req, res) => {
    const newEntry = req.body;
    try {
        const result = await UserPointsHistory.addUserPointsHistory(newEntry);
        res.status(201).json({ message: "Points history added successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

// تحديث نقاط المستخدم
const updateUserPointsHistory = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const result = await UserPointsHistory.updateUserPointsHistory(id, updatedData);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Points history updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

// حذف نقاط المستخدم
const deleteUserPointsHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await UserPointsHistory.deleteUserPointsHistory(id);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ message: "Points history deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

module.exports = {
    getAllUserPointsHistory,
    addUserPointsHistory,
    updateUserPointsHistory,
    deleteUserPointsHistory
};