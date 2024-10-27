// cronJobs.js
const cron = require('cron');
const db = require('./db'); // تأكد أن المسار إلى قاعدة البيانات صحيح

// جدولة المهمة لحذف الحجوزات القديمة وتحديث حالة القطع
const job = new cron.CronJob('0 0 * * *', () => { // تنفذ يوميًا عند منتصف الليل
    // حذف الحجوزات القديمة
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

    // تحديث حالة القطع لتكون متاحة للحجز مجددًا
    const updateItemStatusQuery = `
        UPDATE items 
        SET status = 'available' 
        WHERE id IN (
            SELECT item_id 
            FROM bookings 
            WHERE end_date < NOW()
        )
    `;

    db.execute(updateItemStatusQuery, (error) => {
        if (error) {
            console.error("Error updating item status:", error);
            return;
        }
        console.log("Item statuses updated to 'available' for expired bookings.");
    });
});

// تشغيل المهمة المجدولة
job.start();