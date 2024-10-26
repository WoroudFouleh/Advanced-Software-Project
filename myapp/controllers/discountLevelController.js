const db = require('../db');  // Adjust the path as needed
const DiscountLevel = require('../models/discountLevelModel');  // Adjust the path as needed

const getAllDiscountLevels = async (req, res) => {
    try {
        const levels = await DiscountLevel.getAll();
        res.status(200).json(levels);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const getDiscountLevelById = async (req, res) => {
    const { id } = req.params;
    try {
        const level = await DiscountLevel.getById(id);
        if (!level) return res.status(404).json({ message: 'Discount level not found' });
        res.status(200).json(level);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const createDiscountLevel = async (req, res) => {
    const { min_points, discount_percentage } = req.body;
    try {
        const newId = await DiscountLevel.create(min_points, discount_percentage);
        res.status(201).json({ id: newId, message: 'Discount level created' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const updateDiscountLevel = async (req, res) => {
    const { id } = req.params;
    const { min_points, discount_percentage } = req.body;

    // تأكد من أن القيم المدخلة ليست undefined
    const newMinPoints = (min_points !== undefined) ? min_points : null;
    const newDiscountPercentage = (discount_percentage !== undefined) ? discount_percentage : null;

    const query = `
        UPDATE discount_levels
        SET 
            min_points = COALESCE(?, min_points), 
            discount_percentage = COALESCE(?, discount_percentage)
        WHERE id = ?
    `;
    try {
        const [results] = await db.execute(query, [newMinPoints, newDiscountPercentage, id]);
        if (results.affectedRows === 0) return res.status(404).json({ message: "Discount level not found" });
        res.status(200).json({ message: "Discount level updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

// حذف مستوى خصم
const deleteDiscountLevel = async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM discount_levels WHERE id = ?`;
    try {
        const [results] = await db.execute(query, [id]);
        if (results.affectedRows === 0) return res.status(404).json({ message: "Discount level not found" });
        res.status(200).json({ message: "Discount level deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
};

module.exports = {
    getAllDiscountLevels,
    getDiscountLevelById,
    createDiscountLevel,
    updateDiscountLevel,
    deleteDiscountLevel
};
