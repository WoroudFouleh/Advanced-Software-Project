// // controllers/paymentController.js
// console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const processPayment = async (req, res) => {
//     const { amount, currency, source, description } = req.body;

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount * 100, // تحويل المبلغ إلى سنتات
//             currency: currency,
//             description: description,
//             payment_method: source,
//             confirm: true
//         });

//         res.status(200).json({ success: true, paymentIntent });
//     } catch (error) {
//         console.error('Error processing payment:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// module.exports = { processPayment };