const Logistics = require('../models/Logistics');

exports.createLogistics = async (req, res) => {
    try {
        const { userId, pickupLocation, deliveryAddress, deliveryOption } = req.body;
        const logistics = await Logistics.createLogistics({ userId, pickupLocation, deliveryAddress, deliveryOption });
        res.status(201).json({ message: 'Logistics option created', logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating logistics option' });
    }
};

exports.getLogistics = async (req, res) => {
    try {
        const logistics = await Logistics.getLogistics();
        res.status(200).json({ logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching logistics options' });
    }
};

exports.getLogisticsById = async (req, res) => {
    try {
        const logistics = await Logistics.getLogisticsById(req.params.id);
        if (!logistics) {
            return res.status(404).json({ error: 'Logistics not found' });
        }
        res.status(200).json({ logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching logistics option' });
    }
};

exports.updateLogistics = async (req, res) => {
    try {
        // Get the existing logistics entry by ID
        const logistics = await Logistics.getLogisticsById(req.params.id);
        if (!logistics) {
            return res.status(404).json({ error: 'Logistics not found' });
        }

        const { pickupLocation, deliveryAddress, deliveryOption, status } = req.body;

        // Use the model's update function to update the logistics entry
        const result = await Logistics.updateLogistics(req.params.id, {
            pickupLocation: pickupLocation || logistics.pickupLocation,
            deliveryAddress: deliveryAddress || logistics.deliveryAddress,
            deliveryOption: deliveryOption || logistics.deliveryOption,
            status: status || logistics.status
        });

        res.status(200).json({ message: 'Logistics updated', result });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating logistics' });
    }
};


exports.deleteLogistics = async (req, res) => {
    try {
        await Logistics.deleteLogistics(req.params.id);
        res.status(200).json({ message: 'Logistics deleted' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting logistics' });
    }
};
