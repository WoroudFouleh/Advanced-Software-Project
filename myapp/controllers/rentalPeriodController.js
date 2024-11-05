//rentalPeriodController.js
const RentalPeriod = require('../models/RentalPeriod');

// إنشاء فترة إيجار
exports.createRentalPeriod = (req, res) => {
    const rentalPeriodData = req.body;
    const owner_id = req.user.id;  // الحصول على معرف المالك من التوكين

    RentalPeriod.create(owner_id, rentalPeriodData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: "Rental period created successfully.", result });
    });
};

// تحديث فترة إيجار
exports.updateRentalPeriod = (req, res) => {
    const rentalPeriodId = req.params.id;
    const rentalPeriodData = req.body;
    const owner_id = req.user.id;  // الحصول على معرف المالك من التوكين

    RentalPeriod.update(owner_id, rentalPeriodId, rentalPeriodData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Rental period updated successfully." });
    });
};

// حذف فترة إيجار
exports.deleteRentalPeriod = (req, res) => {
    const rentalPeriodId = req.params.id;
    const owner_id = req.user.id;  // الحصول على معرف المالك من التوكين

    RentalPeriod.delete(owner_id, rentalPeriodId, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Rental period deleted successfully." });
    });
};

/*// controllers/rentalPeriodController.js
const RentalPeriod = require('../models/RentalPeriod');

// إنشاء فترة إيجار
exports.createRentalPeriod = (req, res) => {
    const rentalPeriodData = req.body;

    RentalPeriod.create(rentalPeriodData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: "Rental period created successfully.", result });
    });
};

// استرجاع جميع فترات الإيجار
exports.getAllRentalPeriods = (req, res) => {
    RentalPeriod.getAll((error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
};

// استرجاع فترة إيجار بواسطة ID
exports.getRentalPeriodById = (req, res) => {
    const rentalPeriodId = req.params.id;

    RentalPeriod.getById(rentalPeriodId, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        if (!result) return res.status(404).json({ message: "Rental period not found." });
        res.status(200).json(result);
    });
};

// تحديث فترة إيجار
exports.updateRentalPeriod = (req, res) => {
    const rentalPeriodId = req.params.id;
    const rentalPeriodData = req.body;

    RentalPeriod.update(rentalPeriodId, rentalPeriodData, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Rental period updated successfully." });
    });
};

// حذف فترة إيجار
exports.deleteRentalPeriod = (req, res) => {
    const rentalPeriodId = req.params.id;

    RentalPeriod.delete(rentalPeriodId, (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: "Rental period deleted successfully." });
    });
};
*/