const Logistics = require('../models/LogisticsTemp');
const axios = require('axios');
require('dotenv').config();

exports.createLogistics = async (req, res) => {
    try {
        const { userId, pickupLocation, deliveryAddress, deliveryOption } = req.body;

        if (!userId || !pickupLocation || !deliveryAddress || !deliveryOption) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const logistics = await Logistics.createLogistics({ userId, pickupLocation, deliveryAddress, deliveryOption });

        res.status(201).json({ message: 'Logistics option created', logistics });
    } catch (error) {
        console.error('Error creating logistics option:', error); // تحقق من وحدة التحكم
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

const { sendNotification } = require('../services/notificationService'); // Import the notification service

exports.updateLogistics = async (req, res) => {
    try {
        const logistics = await Logistics.getLogisticsById(req.params.id);
        if (!logistics) {
            return res.status(404).json({ error: 'Logistics not found' });
        }

        const { pickupLocation, deliveryAddress, deliveryOption, status } = req.body;

        const result = await Logistics.updateLogistics(req.params.id, {
            pickupLocation: pickupLocation || logistics.pickupLocation,
            deliveryAddress: deliveryAddress || logistics.deliveryAddress,
            deliveryOption: deliveryOption || logistics.deliveryOption,
            status: status || logistics.status
        });

        // Check if the status has changed to 'in_progress'
        if (status === 'in_progress' && logistics.status !== 'in_progress') {
            await sendNotification(logistics.userId, 'Your logistics is now in progress.');
        }

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

exports.getNearbyLocations = async (req, res) => {
    const { latitude, longitude } = req.query;
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${latitude},${longitude}`,
                radius: 5000,
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });
        res.status(200).json({ locations: response.data.results });
    } catch (error) {
        console.error('Error fetching nearby locations:', error);
        res.status(500).json({ error: 'Error fetching nearby locations' });
    }
};
exports.getLogisticsByUser = async (req, res) => {
    try {
        const { userId } = req.params; // جلب userId من الـ params
        const logistics = await Logistics.getLogisticsByUser(userId);
        if (logistics.length === 0) {
            return res.status(404).json({ error: 'No logistics found for this user' });
        }
        res.status(200).json({ logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching logistics for the user' });
    }
};

// جلب جميع خيارات اللوجستيات حسب الحالة
exports.getLogisticsByStatus = async (req, res) => {
    try {
        const { status } = req.params; // جلب status من الـ params
        const logistics = await Logistics.getLogisticsByStatus(status);
        if (logistics.length === 0) {
            return res.status(404).json({ error: 'No logistics found with this status' });
        }
        res.status(200).json({ logistics });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching logistics by status' });
    }
};




