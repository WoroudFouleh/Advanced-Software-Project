// insuranceController.js
const insuranceModel = require('../models/insuranceModel'); // Adjust the path as needed

// Controller to get all insurance records
const getAllInsurance = async (req, res) => {
    try {
        const insuranceRecords = await insuranceModel.getAllInsurance();
        res.status(200).json(insuranceRecords);
    } catch (error) {
        console.error("Error fetching insurance records:", error);
        res.status(500).send("Server error");
    }
};


// Controller to delete an insurance record by ID
const deleteInsuranceById = async (req, res) => {
    const { id } = req.body; // Getting id from request body

    if (!id) {
        return res.status(400).send("ID is required to delete an insurance record.");
    }

    try {
        const result = await insuranceModel.deleteInsuranceById(id);

        if (result.affectedRows === 0) {
            return res.status(404).send("No insurance record found with the provided ID.");
        }
        res.status(200).json({ message: 'Insurance record deleted successfully.' });
       
    } catch (error) {
        console.error("Error deleting insurance record:", error);
        res.status(500).send("Server error");
    }
}; 
const getInsuranceByUserId = async (req, res) => {
    const { user_id } = req.params; // Getting user_id from request parameters

    if (!user_id) {
        return res.status(400).send("User ID is required to fetch insurance records.");
    }

    try {
        const insuranceRecords = await insuranceModel.getInsuranceByUserId(user_id);

        if (insuranceRecords.length === 0) {
            return res.status(404).send("No insurance records found for the provided user ID.");
        }
        res.status(200).json(insuranceRecords);
    } catch (error) {
        console.error("Error fetching insurance records for user:", error);
        res.status(500).send("Server error");
    }
};

module.exports = {
    getAllInsurance,
    deleteInsuranceById,
    getInsuranceByUserId
};
