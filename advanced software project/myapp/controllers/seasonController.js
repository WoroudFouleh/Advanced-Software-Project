// controllers/seasonController.js
const seasonModel = require("../models/seasonModel");

exports.createSeason = (req, res) => {
    const seasonData = req.body;

    seasonModel.create(seasonData, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error creating season", error });
        }
        res.status(201).json({ message: "Season created successfully", data: result });
    });
};

exports.getAllSeasons = (req, res) => {
    seasonModel.getAll((error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching seasons", error });
        }
        res.status(200).json(results);
    });
};

exports.updateSeason = (req, res) => {
    const { id } = req.params;
    const seasonData = req.body;

    seasonModel.update(id, seasonData, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error updating season", error });
        }
        res.status(200).json({ message: "Season updated successfully", data: result });
    });
};

exports.deleteSeason = (req, res) => {
    const { id } = req.params;

    seasonModel.delete(id, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error deleting season", error });
        }
        res.status(200).json({ message: "Season deleted successfully", data: result });
    });
};