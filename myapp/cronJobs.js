const cron = require('cron');
const db = require('./db'); 

const job = new cron.CronJob('0 0 * * *', () => { 
    console.log("Running scheduled job for updating item statuses and deleting expired bookings...");

    const updateItemStatusQuery = `
        UPDATE items 
        SET status = 'available' 
        WHERE id IN (
            SELECT item_id 
            FROM bookings 
            WHERE end_date < NOW()
        )
    `;

    db.execute(updateItemStatusQuery, (error, result) => {
        if (error) {
            console.error("Error updating item status:", error);
            return;
        }
        console.log("Item statuses updated to 'available' for expired bookings:", result.affectedRows);
    });

    const deleteQuery = `
        DELETE FROM bookings 
        WHERE end_date < NOW()
    `;

    db.execute(deleteQuery, (error) => {
        if (error) {
            console.error("Error deleting expired bookings:", error);
            return;
        }
        console.log("Expired bookings deleted successfully.");
    });
});

job.start();