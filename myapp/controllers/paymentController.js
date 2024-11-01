// // Import Stripe
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Add your Stripe Secret Key to .env

// exports.processPayment = async (req, res) => {
//     const { logisticsId, paymentMethod } = req.body;

//     // Fetch logistics data including the final price
//     const logistics = await Logistics.getLogisticsById(logisticsId);
//     if (!logistics) {
//         return res.status(404).json({ error: 'Logistics entry not found' });
//     }

//     if (paymentMethod === 'cash') {
//         // If cash, just update paymentMethod and set paymentStatus to 'paid'
//         await Logistics.updateLogistics(logisticsId, { paymentMethod: 'cash', paymentStatus: 'paid' });
//         return res.status(200).json({ message: 'Cash payment confirmed' });
//     } else if (paymentMethod === 'visa') {
//         // Process card payment
//         try {
//             const paymentIntent = await stripe.paymentIntents.create({
//                 amount: Math.ceil(logistics.finalPrice * 100), // Stripe expects amount in cents
//                 currency: 'usd',
//                 payment_method_types: ['card'],
//             });

//             // Update the logistics entry with payment details
//             await Logistics.updateLogistics(logisticsId, {
//                 paymentMethod: 'visa',
//                 paymentStatus: 'pending', // Pending until confirmed
//                 stripePaymentIntentId: paymentIntent.id
//             });

//             res.status(200).json({ clientSecret: paymentIntent.client_secret });
//         } catch (error) {
//             console.error('Error creating payment:', error);
//             res.status(500).json({ error: 'Payment processing failed' });
//         }
//     } else {
//         res.status(400).json({ error: 'Invalid payment method' });
//     }
// };
