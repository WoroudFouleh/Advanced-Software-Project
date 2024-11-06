// controllers/pickupController.js

const connection = require('../db');

exports.getAllPickupLocations = (req, res) => {
    const query = 'SELECT * FROM pickup_locations';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error retrieving pickup locations:', error);
            res.status(500).json({ message: 'Error retrieving pickup locations' });
        } else {
            res.status(200).json(results);
        }
    });
};

exports.assignPickupLocation = (req, res) => {
    const { orderId } = req.params;
    const { location_id } = req.body;

    const findOrderQuery = 'SELECT * FROM orders WHERE order_id = ?';
    const findLocationQuery = 'SELECT * FROM pickup_locations WHERE location_id = ?';
    const updateOrderQuery = 'UPDATE orders SET pickup_location_id = ? WHERE order_id = ?';

    connection.query(findOrderQuery, [orderId], (error, orderResults) => {
        if (error || orderResults.length === 0) {
            res.status(404).json({ message: 'Order not found' });
        } else {
            connection.query(findLocationQuery, [location_id], (error, locationResults) => {
                if (error || locationResults.length === 0) {
                    res.status(404).json({ message: 'Pickup location not found' });
                } else {
                    connection.query(updateOrderQuery, [location_id, orderId], (error) => {
                        if (error) {
                            console.error('Error assigning pickup location:', error);
                            res.status(500).json({ message: 'Error assigning pickup location' });
                        } else {
                            res.status(200).json({
                                message: 'Pickup location assigned successfully',
                                order_id: orderId,
                                pickup_location_id: location_id
                            });
                        }
                    });
                }
            });
        }
    });
};