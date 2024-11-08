const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv'); 
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connection = require('./db'); 
const authRoute = require('./routes/auth'); 
const userRoute = require('./routes/userRoutes'); 
const itemRoutes = require('./routes/itemRoutes'); 
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const discountLevelRoutes = require('./routes/discountLevelRoutes');  
const userPointsHistoryRoutes = require('./routes/userPointsHistoryRoutes');
const messageRoutes = require('./routes/MessageRoutes');
const pricingRulesRoute = require('./routes/pricingRulesRoute');
const notificationsRoutes = require('./routes/notificationsRoutes');
const discountRoutes = require('./routes/discountRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const RatingRoute= require('./routes/Rating');
const logisticsRoutes = require('./routes/logistics');
const cartRoutes = require('./routes/cartRoutes'); 
const requestIp = require('request-ip');
require('./cronJobs');


const app = express();
app.use(express.json());

dotenv.config(); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestIp.mw())
console.log("Starting server...");
app.use('/auth1', authRoute);
app.use('/api', itemRoutes);
app.use('/api2', userRoutes); 
app.use('/api', bookingRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/discount-levels', discountLevelRoutes); 
app.use('/api/user-points-history', userPointsHistoryRoutes);
app.use('/api', messageRoutes);
app.use('/api', insuranceRoutes);
app.use('/api/users', RatingRoute);
app.use('/api/logistics', logisticsRoutes);
app.use('/api', cartRoutes); 
app.use('/api/season', seasonRoutes);
app.use('/api', discountRoutes);
app.use('/api', pricingRulesRoute)
app.use('/api/notifications', notificationsRoutes);


const port = process.env.PORT || 6005;

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;