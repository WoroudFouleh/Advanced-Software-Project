
const db = require('../db');
const discountModel = require('../models/DiscountModel'); 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

function calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay, rentalType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.abs(end - start) / 36e5;

    let totalPrice = 0;
    if (rentalType === 'hourly') {
        totalPrice = durationInHours * basePricePerHour;
    } else if (rentalType === 'daily') {
        const durationInDays = Math.ceil(durationInHours / 24);
        totalPrice = durationInDays * basePricePerDay;
    }

    const platformFee = totalPrice * 0.1; 
    const totalRevenue = totalPrice + platformFee; 

    return { totalPrice, platformFee, totalRevenue, durationInHours };
}

async function updateUserPoints(userId, bookingId, durationInHours) {
    const pointsPerHour = 5;
    const earnedPoints = durationInHours * pointsPerHour;

    console.log("Updating user points:", { userId, bookingId, earnedPoints });

    try {
        const updateUserQuery = `
            UPDATE users 
            SET reward_points = reward_points + ?
            WHERE id = ?
        `;

        await db.execute(updateUserQuery, [earnedPoints, userId]);
        console.log("User points updated successfully.");

        const insertHistoryQuery = `
            INSERT INTO user_points_history (user_id, booking_id, points_earned)
            VALUES (?, ?, ?)
        `;
        await db.execute(insertHistoryQuery, [userId, bookingId, earnedPoints]);
        console.log("Points history inserted successfully.");
    } catch (error) {
        console.error("Error updating user points or inserting points history:", error);
    }
}

function getDiscountPercentage(userPoints, callback) {
    console.log("User points:", userPoints);  
    
    const query = `
        SELECT discount_percentage 
        FROM discount_levels 
        WHERE min_points <= ? 
        ORDER BY min_points DESC 
        LIMIT 1
    `;

    db.execute(query, [userPoints], (error, results) => {
        if (error) {
            console.error("Error fetching discount percentage:", error);
            return callback(0);
        }

        console.log("Discount query results:", results);  

        const discount = results.length > 0 ? results[0].discount_percentage : 0;
        console.log("Applicable discount:", discount);  
        callback(discount);
    });
}

const createBooking = async (req, res) => {
    try {
        const itemId = req.body.item_id || null;
        const userId = req.body.user_id || null;
        const startDate = req.body.start_date || null;
        const endDate = req.body.end_date || null;
        const rentalType = req.body.rentalType || null;
        const idnumber = req.body.idnumber || null;

        if (!['hourly', 'daily'].includes(rentalType)) {
            return res.status(400).send("Invalid rental type. It must be 'hourly' or 'daily'.");
        }

        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;
        const [results] = await db.execute(checkQuery, [itemId, endDate, startDate, startDate, endDate]);
        if (results.length > 0) {
            return res.status(400).send("Booking already exists for this item in the selected time period.");
        }
        
        const itemQuery = 'SELECT basePricePerHour, basePricePerDay, category, owner_id FROM items WHERE id = ?';
        const [itemResults] = await db.execute(itemQuery, [itemId]);
        if (itemResults.length === 0) {
            return res.status(404).send("Item not found.");
        }

        const { basePricePerHour, basePricePerDay, category, owner_id: ownerId } = itemResults[0];
        const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay, rentalType);

        // Fetch user's discount percentage based on points
        const userPoints = await getUserPoints(userId); // دالة للحصول على نقاط المستخدم
        const pointsDiscountPercentage = await new Promise((resolve) => {
            getDiscountPercentage(userPoints, resolve);
        });

        // Fetch discounts for item and calculate total discount
        const discounts = await discountModel.getDiscountsByItemId(itemId);
        let totalDiscount = 0;

        // حساب الخصم من النقاط
        const pointsDiscountAmount = (totalPrice * pointsDiscountPercentage) / 100;
        totalDiscount += pointsDiscountAmount;

        // حساب الخصومات الثابتة أو النسبية
        discounts.forEach(discount => {
            if (discount.discount_type === 'fixed') {
                totalDiscount += discount.discount_value;
            } else if (discount.discount_type === 'percentage') {
                totalDiscount += (totalPrice * discount.discount_value) / 100;
            }
        });

        const discountedTotalPrice = totalPrice - totalDiscount;

        // Insert booking
        const insertQuery = `
            INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, totalDiscount]);

        const bookingId = result.insertId;

        // Update user points
        await updateUserPoints(userId, bookingId, durationInHours);

        // Fetch or insert insurance info
        const [insuranceResults] = await db.execute('SELECT idnumber FROM insurance WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
        const idnumberToUse = insuranceResults.length > 0 ? insuranceResults[0].idnumber : idnumber;
        const insuranceInsertQuery = `INSERT INTO insurance (user_id, idnumber, bookingid) VALUES (?, ?, ?)`;
        await db.execute(insuranceInsertQuery, [userId, idnumberToUse, bookingId]);

        // Update user category orders
        const userCategoryOrderQuery = `
            INSERT INTO user_category_orders (user_id, category, order_count, last_order_date)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                order_count = order_count + 1,
                last_order_date = CURRENT_TIMESTAMP;
        `;
        await db.execute(userCategoryOrderQuery, [userId, category]);

        // Send notification to the owner
        const notificationMessage = `User ${userId} has booked your item ${itemId} from ${startDate} to ${endDate}.`;
        sendNotificationToOwner(ownerId, notificationMessage, itemId, userId);

        // Respond with success
        res.status(201).json({
            message: "Booking created successfully.",
            originalTotalPrice: totalPrice,
            totalDiscount,
            finalTotalPrice: discountedTotalPrice,
            platformFee,
            totalRevenue
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send("Server error.");
    }
};

const getAllBookings = async (req, res) => {
    try {
        const username = req.user.username;  
        const role = req.user.role;  

        let query;
        let params;

        if (role === 'user') {
            query = 'SELECT * FROM bookings WHERE user_id = ?';
            params = [username];
        } else if (role === 'owner') {
            query = `
                SELECT b.* FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE i.username = ?
            `;
            params = [username];
        } else if (role === 'admin') {
            query = 'SELECT * FROM bookings';
            params = [];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Server error.");
    }
};

const getBookingById = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;  
        const role = req.user.role;  

        let query;
        let params;

        if (role === 'user') {
            query = `
                SELECT id, item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue 
                FROM bookings 
                WHERE id = ? AND user_id = ?
            `;
            params = [bookingId, username];
        } else if (role === 'owner') {
            query = `
                SELECT b.id, b.item_id, b.user_id, b.start_date, b.end_date, b.total_price, b.platform_fee, b.total_revenue 
                FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            query = 'SELECT * FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.length === 0) return res.status(404).send("Booking not found.");

        res.status(200).json({
            booking: results[0],
            message: "Booking retrieved successfully."
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).send("Server error.");
    }
};

const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;
        const role = req.user.role;
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;

        if (!startDate || !endDate) {
            return res.status(400).send("Start date and end date are required.");
        }

        let query;
        let params;

        if (role === 'user') {
            const [userResults] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
            if (userResults.length === 0) {
                return res.status(404).send("User not found.");
            }
            const userId = userResults[0].id;

            query = 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, userId];
        } else if (role === 'owner') {
            query = `
                SELECT b.* FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            query = 'SELECT * FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.length === 0) return res.status(404).send("Booking not found or unauthorized.");

        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND id != ?  
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;
        const itemId = results[0].item_id; 
        const [checkResults] = await db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate]);
        if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

        const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
        await db.execute(updateQuery, [startDate, endDate, bookingId]);

        res.status(200).send("Booking updated successfully.");
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send("Server error.");
    }
};

const deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;
        const role = req.user.role;

        let query;
        let params;

        if (role === 'user') {
            const [userResults] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
            if (userResults.length === 0) {
                return res.status(404).send("User not found.");
            }
            const userId = userResults[0].id;

            query = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, userId];
        } else if (role === 'owner') {
            query = `
                DELETE b FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            query = 'DELETE FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
        if (results.affectedRows === 0) return res.status(404).send("Booking not found or unauthorized.");

        res.status(200).send("Booking deleted successfully.");
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).send("Server error.");
    }
};
const getBookingStatistics = (req, res) => {
    const query = `
        SELECT 
            DATE(start_date) AS booking_date, 
            COUNT(*) AS booking_count 
        FROM bookings 
        GROUP BY booking_date
        ORDER BY booking_date DESC
    `;

    db.execute(query, (error, dailyResults) => {
        if (error) return res.status(500).send("Database error.");

        const monthlyQuery = `
            SELECT 
                DATE_FORMAT(start_date, '%Y-%m') AS booking_month, 
                COUNT(*) AS booking_count 
            FROM bookings 
            GROUP BY booking_month
            ORDER BY booking_month DESC
        `;

        db.execute(monthlyQuery, (error, monthlyResults) => {
            if (error) return res.status(500).send("Database error.");

            const yearlyQuery = `
                SELECT 
                    YEAR(start_date) AS booking_year, 
                    COUNT(*) AS booking_count 
                FROM bookings 
                GROUP BY booking_year
                ORDER BY booking_year DESC
            `;

            db.execute(yearlyQuery, (error, yearlyResults) => {
                if (error) return res.status(500).send("Database error.");

                res.status(200).json({
                    dailyBookings: dailyResults,
                    monthlyBookings: monthlyResults,
                    yearlyBookings: yearlyResults
                });
            });
        });
    });
};
module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getBookingStatistics,
};
/*const db = require('../db');
const discountModel = require('../models/DiscountModel'); // تأكد من المسار الصحيح

function getDiscountPercentage(userPoints, callback) {
    console.log("User points:", userPoints);  // عرض النقاط
    
    const query = `
        SELECT discount_percentage 
        FROM discount_levels 
        WHERE min_points <= ? 
        ORDER BY min_points DESC 
        LIMIT 1
    `;

    db.execute(query, [userPoints], (error, results) => {
        if (error) {
            console.error("Error fetching discount percentage:", error);
            return callback(0);  // في حال وجود خطأ، لا يتم تطبيق خصم
        }

        console.log("Discount query results:", results);  // عرض نتائج الاستعلام

        const discount = results.length > 0 ? results[0].discount_percentage : 0;
        console.log("Applicable discount:", discount);  // عرض النسبة النهائية
        callback(discount);
    });
}


// دالة لتحديث نقاط المستخدم
function updateUserPoints(userId, bookingId, durationInHours) {
    const pointsPerHour = 5;
    const earnedPoints = durationInHours * pointsPerHour;

    console.log("Updating user points:", { userId, bookingId, earnedPoints });

    const updateUserQuery = `
        UPDATE users 
        SET reward_points = reward_points + ?
        WHERE id = ?
    `;

    db.execute(updateUserQuery, [earnedPoints, userId], (error) => {
        if (error) {
            console.error("Error updating user points:", error);
        } else {
            console.log("User points updated successfully.");
        }

        // إضافة سجل في user_points_history
        const insertHistoryQuery = `
            INSERT INTO user_points_history (user_id, booking_id, points_earned)
            VALUES (?, ?, ?)
        `;
        db.execute(insertHistoryQuery, [userId, bookingId, earnedPoints], (error) => {
            if (error) console.error("Error inserting points history:", error);
            else console.log("Points history inserted successfully.");
        });
    });
}

const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;
    const rentalType = req.body.rentalType || null;

    if (!['hourly', 'daily'].includes(rentalType)) {
        return res.status(400).send("Invalid rental type. It must be 'hourly' or 'daily'.");
    }

    // التحقق مما إذا كان هناك حجز متداخل
    const checkQuery = `
        SELECT * FROM bookings 
        WHERE item_id = ? 
        AND (
            (start_date < ? AND end_date > ?) OR 
            (start_date < ? AND end_date > ?)
        )
    `;

    db.execute(checkQuery, [itemId, endDate, startDate, startDate, endDate], (error, results) => {
        if (error) {
            console.error("Database error during overlapping check:", error);
            return res.status(500).send("Database error during overlapping check.");
        }
        if (results.length > 0) {
            return res.status(400).send("Booking already exists for this item in the selected time period.");
        }

        // الحصول على سعر العنصر من قاعدة البيانات
        const query = 'SELECT basePricePerHour, basePricePerDay, owner_id FROM items WHERE id = ?';
        db.execute(query, [itemId], (error, itemResults) => {
            if (error) {
                console.error("Database error during item price retrieval:", error);
                return res.status(500).send("Database error during item price retrieval.");
            }
            if (itemResults.length === 0) {
                return res.status(404).send("Item not found.");
            }

            const { basePricePerHour, basePricePerDay, owner_id: ownerId } = itemResults[0];

            // حساب السعر الكلي، رسوم المنصة، والإيرادات الكلية ومدة الحجز بالساعات
            const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay, rentalType);

            // استرجاع الخصومات الخاصة بالعنصر
            discountModel.getDiscountsByItemId(itemId, (error, discounts) => {
                if (error) {
                    console.error("Error fetching discounts:", error);
                    return res.status(500).send("Error fetching discounts.");
                }

                // حساب الخصم الكلي
                let totalDiscount = 0;
                discounts.forEach(discount => {
                    if (discount.discount_type === 'fixed') {
                        totalDiscount += discount.discount_value; // خصم ثابت
                    } else if (discount.discount_type === 'percentage') {
                        totalDiscount += (totalPrice * discount.discount_value) / 100; // خصم كنسبة مئوية
                    }
                });

                // تطبيق الخصم على السعر الكلي
                const discountedTotalPrice = totalPrice - totalDiscount;

                // إدخال الحجز مع الخصم ورسوم المنصة والإيرادات في قاعدة البيانات
                const insertQuery = `
                    INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_amount) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, totalDiscount], (error, result) => {
                    if (error) {
                        console.error("Error creating booking:", error);
                        return res.status(500).send("Error creating booking.");
                    }

                    const bookingId = result.insertId;

                    // تحديث نقاط المستخدم بعد إنشاء الحجز
                    updateUserPoints(userId, bookingId, durationInHours);

                    // إرسال الإشعار إلى المالك
                    const notificationMessage = `User ${userId} has booked your item ${itemId} from ${startDate} to ${endDate}.`;
                    sendNotificationToOwner(ownerId, notificationMessage, itemId, userId);

                    res.status(201).json({
                        message: "Booking created successfully.",
                        originalTotalPrice: totalPrice,
                        totalDiscount,
                        finalTotalPrice: discountedTotalPrice,
                        platformFee,
                        totalRevenue
                    });
                });
            });
        });
    });
};


// تحديث الدالة calculateTotalAndPlatformFee لتقبل rentalType
function calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay, rentalType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.abs(end - start) / 36e5; // تحويل المدة إلى ساعات

    let totalPrice = 0;
    if (rentalType === 'hourly') {
        totalPrice = durationInHours * basePricePerHour;
    } else if (rentalType === 'daily') {
        const durationInDays = Math.ceil(durationInHours / 24); // التحويل إلى أيام
        totalPrice = durationInDays * basePricePerDay;
    }

    // حساب رسوم المنصة وإيراداتها
    const platformFee = totalPrice * 0.1; // على سبيل المثال، 10% رسوم منصة
    const totalRevenue = totalPrice - platformFee;

    return { totalPrice, platformFee, totalRevenue, durationInHours };
}


// دالة إرسال الإشعار إلى المالك
const sendNotificationToOwner = (ownerId, message, itemId, userId) => {
    const insertNotificationQuery = `
        INSERT INTO notifications (user_id, item_id, message, created_at) 
        VALUES (?, ?, ?, NOW())
    `;

    db.execute(insertNotificationQuery, [ownerId, itemId, message], (error, result) => {
        if (error) {
            console.error("Error sending notification:", error);
        }
    });
};


// دالة لإنشاء حجز مع حساب السعر الكلي ورسوم المنصة وتحديث نقاط المستخدم



// دالة لاسترجاع جميع حجوزات اليوزر أو المالك
const getAllBookings = (req, res) => {
    const username = req.user.username;  // اسم المستخدم
    const role = req.user.role;  // دور المستخدم (User أو Owner)

    let query;
    let params;

    if (role === 'user') {
        // جلب الحجوزات التي قام بها المستخدم
        query = 'SELECT * FROM bookings WHERE user_id = ?';
        params = [username];
    } else if (role === 'owner') {
        // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
        query = `
            SELECT b.* FROM bookings b
            JOIN items i ON b.item_id = i.id
            WHERE i.username = ?
        `;
        params = [username];
    }  else if (role === 'admin') {
        // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
        query = `
            SELECT * FROM bookings
        `;
        params = [username];
    } 
    else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة لاسترجاع حجز معين (اليوزر أو المالك)
const getBookingById = (req, res) => {
    const bookingId = req.params.id;
    const username = req.user.username;  // اسم المستخدم
    const role = req.user.role;  // دور المستخدم

    let query;
    let params;

    if (role === 'user') {
        // اليوزر يسترجع حجز يخصه فقط
        query = `
            SELECT id, item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue 
            FROM bookings 
            WHERE id = ? AND user_id = ?
        `;
        params = [bookingId, username];
    } else if (role === 'owner') {
        // المالك يسترجع حجز مرتبط بممتلكاته باستخدام username
        query = `
            SELECT b.id, b.item_id, b.user_id, b.start_date, b.end_date, b.total_price, b.platform_fee, b.total_revenue 
            FROM bookings b
            JOIN items i ON b.item_id = i.id
            WHERE b.id = ? AND i.username = ?
        `;
        params = [bookingId, username];
    } else if (role === 'admin') {
        // جلب الحجوزات المرتبطة بممتلكات المالك باستخدام username
        query = `
            SELECT * FROM bookings WHERE id=?
        `;
        params = [bookingId];
    } 
    else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        
        // إرسال بيانات الحجز مع رسوم المنصة والإيرادات
        res.status(200).json({
            booking: results[0],
            message: "Booking retrieved successfully."
        });
    });
};

// دالة لتحديث حجز (اليوزر أو المالك)
const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const username = req.user.username;
    const role = req.user.role;
    const startDate = req.body.start_date; 
    const endDate = req.body.end_date; 

    // Check for required fields
    if (!startDate || !endDate) {
        return res.status(400).send("Start date and end date are required.");
    }

    let query;
    let params;

    if (role === 'user') {
        query = 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
        params = [bookingId, username];
    } else if (role === 'owner') {
        query = `SELECT b.* FROM bookings b
                  JOIN items i ON b.item_id = i.id
                  WHERE b.id = ? AND i.username = ?`;
        params = [bookingId, username];
    } else if (role === 'admin') {
        query = 'SELECT * FROM bookings WHERE id = ?';
        params = [bookingId];
    } else {
        return res.status(403).send("Access denied.");
    }

    db.execute(query, params, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found or unauthorized.");

        // Check for overlapping bookings
        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND id != ?  -- Exclude the current booking
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;

        const itemId = results[0].item_id; // Get the item_id of the booking to check for overlaps
        db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate], (error, checkResults) => {
            if (error) return res.status(500).send("Database error.");
            if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

            // Now we can safely update the booking
            const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
            db.execute(updateQuery, [startDate, endDate, bookingId], (error) => {
                if (error) return res.status(500).send("Error updating booking.");
                res.status(200).send("Booking updated successfully.");
            });
        });
    });
};


// دالة لحذف حجز (اليوزر أو المالك)
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const username = req.user.username;
    const role = req.user.role;

    let query;
    let params;

    if (role === 'user') {
        // اليوزر يحذف حجوزاته فقط
        query = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
        params = [bookingId, username];
    } else if (role === 'owner') {
        // المالك يحذف الحجوزات المرتبطة بممتلكاته باستخدام username
        query = `
            DELETE b FROM bookings b
            JOIN items i ON b.item_id = i.id
            WHERE b.id = ? AND i.username = ?
        `;
        params = [bookingId, username];
    } else if (role === 'admin') {
        // المالك يحذف الحجوزات المرتبطة بممتلكاته باستخدام username
        query = `
            DELETE FROM bookings WHERE id=?
        `;
        params = [bookingId];
    }
    else {
        return res.status(403).send("Access denied.");
    }
    db.execute(query, params, (error, results) => {
        if (error) {
            console.error("Error details:", error); // طباعة تفاصيل الخطأ
            return res.status(500).send("Database error.");
        }
        if (results.affectedRows === 0) return res.status(404).send("Booking not found or unauthorized.");
        
        res.status(200).send("Booking deleted successfully.");
    });
    
};

// دالة لحساب إحصائيات الحجز
const getBookingStatistics = (req, res) => {
    const query = `
        SELECT 
            DATE(start_date) AS booking_date, 
            COUNT(*) AS booking_count 
        FROM bookings 
        GROUP BY booking_date
        ORDER BY booking_date DESC
    `;

    db.execute(query, (error, dailyResults) => {
        if (error) return res.status(500).send("Database error.");

        const monthlyQuery = `
            SELECT 
                DATE_FORMAT(start_date, '%Y-%m') AS booking_month, 
                COUNT(*) AS booking_count 
            FROM bookings 
            GROUP BY booking_month
            ORDER BY booking_month DESC
        `;

        db.execute(monthlyQuery, (error, monthlyResults) => {
            if (error) return res.status(500).send("Database error.");

            const yearlyQuery = `
                SELECT 
                    YEAR(start_date) AS booking_year, 
                    COUNT(*) AS booking_count 
                FROM bookings 
                GROUP BY booking_year
                ORDER BY booking_year DESC
            `;

            db.execute(yearlyQuery, (error, yearlyResults) => {
                if (error) return res.status(500).send("Database error.");

                res.status(200).json({
                    dailyBookings: dailyResults,
                    monthlyBookings: monthlyResults,
                    yearlyBookings: yearlyResults
                });
            });
        });
    });
};

// تصدير الدوال
module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getBookingStatistics,
};
*/