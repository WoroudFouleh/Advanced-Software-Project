const Logistics = require('../models/LogisticsTemp');
const axios = require('axios');
const connection = require('../db');  // قم بتعديل المسار إذا كان ملف db في مكان مختلف
require('dotenv').config();

exports.createLogistics = async (req, res) => {
    try {
        // Allow admins to create logistics on behalf of another user if `userId` is provided in the request body
        let userId = req.user.id;
        if (req.user.role === 'admin' && req.body.userId) {
            userId = req.body.userId;
        }

        const { pickupLocation, deliveryAddress, deliveryOption } = req.body;

        if (!userId || !pickupLocation || !deliveryAddress || !deliveryOption) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Fetch item price and parse it as a float
        const bookingQuery = 'SELECT total_price FROM bookings WHERE user_id = ? ORDER BY id DESC LIMIT 1';
        const [bookingResult] = await connection.query(bookingQuery, [userId]);

        if (!bookingResult.length) {
            return res.status(404).json({ error: 'No booking found for this user.' });
        }

        const itemPrice = parseFloat(bookingResult[0].total_price);
        let deliveryPrice = 0;
        let finalPrice = itemPrice;

        console.log('Delivery option:', deliveryOption);

        if (deliveryOption.toLowerCase() === 'delivery') {
            deliveryPrice = calculateDeliveryPrice(pickupLocation, deliveryAddress);
            finalPrice = itemPrice + deliveryPrice; // Both are numbers now
        }

        console.log('Item Price:', itemPrice);
        console.log('Delivery Price:', deliveryPrice);
        console.log('Final Price:', finalPrice);

        // Store logistics record
        const logistics = await Logistics.createLogistics({
            userId,
            pickupLocation,
            deliveryAddress,
            deliveryOption,
            deliveryPrice,
            finalPrice
        });

        res.status(201).json({ message: 'Logistics option created', logistics });
    } catch (error) {
        console.error('Error creating logistics option:', error);
        res.status(500).json({ error: 'An error occurred while creating logistics option' });
    }
};

// دالة لحساب المسافة أو السعر باستخدام API للخرائط

const calculateDeliveryPrice = (pickupLocation, deliveryAddress) => {
    try {
        const pickupMatch = pickupLocation.match(/\d+/);
        const deliveryMatch = deliveryAddress.match(/\d+/);

        if (!pickupMatch || !deliveryMatch) {
            throw new Error('Pickup or Delivery address does not contain any numbers.');
        }

        const pickupNumber = parseInt(pickupMatch[0]);
        const deliveryNumber = parseInt(deliveryMatch[0]);

        if (isNaN(pickupNumber) || isNaN(deliveryNumber)) {
            throw new Error('Parsed numbers are not valid.');
        }

        const distance = Math.abs(deliveryNumber - pickupNumber);
        const pricePerUnit = 5; // Adjust as needed
        const deliveryPrice = Math.ceil((distance / 100) * pricePerUnit);

        console.log(`Calculated deliveryPrice: ${deliveryPrice} (Distance: ${distance})`);

        return deliveryPrice;
    } catch (error) {
        console.error('Error calculating delivery price:', error.message);
        return 0; // Default to 0 if there's an error
    }
};



exports.getLogistics = async (req, res) => {
    try {
        const logistics = await Logistics.getLogistics();
        res.status(200).json({ logistics }); // تأكد من أن logistics تحتوي على deliveryPrice
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
        res.status(200).json({ logistics }); // يتضمن deliveryPrice الآن
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
        let deliveryPrice = logistics.deliveryPrice;

        if (deliveryOption === 'delivery') {
            const distance = await calculateDeliveryPrice(pickupLocation || logistics.pickupLocation, deliveryAddress || logistics.deliveryAddress);
            deliveryPrice = distance * 0.5;
        } else if (deliveryOption === 'pickup') {
            deliveryPrice = 0;
        }

        // Fetch the latest booking to get total_price
        const [booking] = await connection.query('SELECT total_price FROM bookings WHERE user_id = ? ORDER BY id DESC LIMIT 1', [logistics.userId]);
        if (!booking || booking.length === 0) {
            return res.status(404).json({ error: 'Booking not found for this user.' });
        }

        const totalPrice = booking[0].total_price;
        const finalPrice = deliveryOption === 'delivery' ? totalPrice + deliveryPrice : totalPrice;

        const result = await Logistics.updateLogistics(req.params.id, {
            pickupLocation: pickupLocation || logistics.pickupLocation,
            deliveryAddress: deliveryAddress || logistics.deliveryAddress,
            deliveryOption: deliveryOption || logistics.deliveryOption,
            deliveryPrice,
            status: status || logistics.status,
            finalPrice
        });
        // Check if the status has changed to 'in_progress'
        if (status === 'in_progress' && logistics.status !== 'in_progress') {
            await sendNotification(logistics.userId, 'Your logistics is now in progress.');
        }

        res.status(200).json({ message: 'Logistics updated', result });
    } catch (error) {
        console.error('Error updating logistics:', error);
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
        const response = await axios.get('http://api.positionstack.com/v1/reverse', {
            params: {
                access_key: process.env.POSITIONSTACK_API_KEY, // تغيير المفتاح إلى Positionstack
                query: `${latitude},${longitude}`, // تمرير الإحداثيات
                limit: 10 // اختيارياً، تحديد عدد النتائج المراد استرجاعها
            }
        });
        res.status(200).json({ locations: response.data.data }); // تعديل على النتيجة حسب ما يعيده Positionstack
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
        res.status(200).json({ logistics }); // تأكد من أن logistics تحتوي على deliveryPrice
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
        res.status(200).json({ logistics }); // تأكد من أن logistics تحتوي على deliveryPrice
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching logistics by status' });
    }
};


// Import Stripe
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // تأكد من إضافة مفتاح STRIPE_SECRET_KEY إلى .env

const paymentNotification = require('../services/paymentNotification'); // تأكد من صحة المسار

exports.processPayment = async (req, res) => {
    const { logisticsId, paymentMethod } = req.body;

    try {
        const logistics = await Logistics.getLogisticsById(logisticsId);
        if (!logistics) {
            return res.status(404).json({ error: 'Logistics entry not found' });
        }

        if (paymentMethod === 'visa') {
            const paymentAmount = logistics.finalPrice * 100; // تحويل المبلغ إلى سنتات، لأن Stripe يقبل المبالغ بالسنتات

            // إجراء عملية الدفع عبر Stripe
            const paymentIntent = await stripe.paymentIntents.create({
                amount: paymentAmount,
                currency: 'usd', // عدل العملة حسب الحاجة
                payment_method_types: ['card']
            });

            const message = `Thank you for your payment of $${paymentAmount / 100} for your logistics service.`;

            // استدعاء دالة إشعار الدفع هنا
            await paymentNotification(logistics.userId, message);

            res.status(200).json({
                message: 'Payment successful and notification email sent.',
                clientSecret: paymentIntent.client_secret // ارجع client_secret لاستخدامه في واجهة العميل
            });
        } else if (paymentMethod === 'cash') {
            res.status(200).json({ message: 'Cash payment selected. No email notification sent.' });
        } else {
            res.status(400).json({ error: 'Invalid payment method.' });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'An error occurred while processing payment.' });
    }
};
