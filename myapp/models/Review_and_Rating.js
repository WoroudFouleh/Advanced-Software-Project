// reviewModel.js
module.exports = {
    tableName: 'reviews',
    columns: {
        username: 'STRING',
        itemId: 'INTEGER',
        reviewerId: 'INTEGER', // Primary Key
        rating: 'INTEGER',
        comment: 'TEXT'
    }
};