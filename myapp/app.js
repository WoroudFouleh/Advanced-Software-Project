const express = require('express');
const app = express();

const logisticsRoutes = require('./routes/logistics');

app.use(express.json()); // To handle JSON requests
app.use('/api/logistics', logisticsRoutes); // Mount the logistics routes

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
