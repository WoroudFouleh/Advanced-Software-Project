// controllers/pickupController.js

const connection = require('../db');

// Get all available pickup locations
exports.getAllPickupLocations = async (req, res) => {
    const query = 'SELECT * FROM pickuplocations'; // Use the correct table name

    try {
        const [results] = await connection.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error retrieving pickup locations:', error);
        res.status(500).json({ message: 'Error retrieving pickup locations' });
    }
};
// Assign a pickup location to an order
// controllers/pickupController.js

exports.assignPickupLocation = async (req, res) => {
    const { orderId } = req.params;
    const { location_id } = req.body;

    const findBookingQuery = 'SELECT * FROM bookings WHERE id = ?';
    const findLocationQuery = 'SELECT * FROM pickuplocations WHERE location_id = ?';
    const updateBookingQuery = 'UPDATE bookings SET pickup_location_id = ? WHERE id = ?';

    try {
        // Step 1: Check if the booking exists
        const [bookingResults] = await connection.query(findBookingQuery, [orderId]);
        if (bookingResults.length === 0) {
            console.error(`Booking with ID ${orderId} not found`);
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Step 2: Check if the pickup location exists
        const [locationResults] = await connection.query(findLocationQuery, [location_id]);
        if (locationResults.length === 0) {
            console.error(`Pickup location with ID ${location_id} not found`);
            return res.status(404).json({ message: 'Pickup location not found' });
        }

        // Step 3: Update the booking with the selected pickup location
        const [updateResult] = await connection.query(updateBookingQuery, [location_id, orderId]);
        if (updateResult.affectedRows === 0) {
            console.error(`Failed to assign pickup location to booking with ID ${orderId}`);
            return res.status(500).json({ message: 'Failed to assign pickup location' });
        }

        res.status(200).json({
            message: 'Pickup location assigned successfully',
            booking_id: orderId,
            pickup_location_id: location_id
        });
    } catch (error) {
        console.error('Error assigning pickup location:', error);
        res.status(500).json({ message: 'Error assigning pickup location' });
    }
};
