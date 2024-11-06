const axios = require('axios');
require('dotenv').config();

const getGeoLocation = async (ip) => {
    try {
        if (ip === '::1' || ip === '127.0.0.1') {
            ip = '8.8.8.8'; 
        }

        const response = await axios.get('http://api.positionstack.com/v1/reverse', {
            params: {
                access_key: process.env.POSITIONSTACK_API_KEY,
                query: ip
            }
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
            const locationData = response.data.data[0];
            return {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                city: locationData.locality,
                country: locationData.country
            };
        } else {
            throw new Error('Failed to get geolocation from Positionstack API');
        }
    } catch (error) {
        console.error('Error in getGeoLocation:', error);
        throw error;
    }
};

module.exports = { getGeoLocation };