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
        const logistics = await Logistics.updateLogistics(req.params.id, req.body);
        res.status(200).json({ message: 'Logistics updated', logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating logistics' });
    }
};

