const db = require('../db');
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



// دالة لحساب السعر الكلي ورسوم المنصة
function calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); // مدة الإيجار بالساعات
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // مدة الإيجار بالأيام

    let totalPrice = durationInDays > 1 ? durationInDays * basePricePerDay : durationInHours * basePricePerHour;

    // حساب رسوم المنصة (10%)
    const platformFeePercentage = 0.10; // 10% رسوم
    const platformFee = totalPrice * platformFeePercentage;

    // حساب الإيرادات الكلية
    const totalRevenue = totalPrice + platformFee;

    return { totalPrice, platformFee, totalRevenue, durationInHours };
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
const calculateTotalPrice = (item, rentalType, duration) => {
    if (rentalType === 'daily') {
        return item.basePricePerDay * duration;
    } else if (rentalType === 'hourly') {
        return item.basePricePerHour * duration;
    }
    return 0; // إذا لم يكن هناك نوع معروف
};
const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

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
            const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

            // الحصول على نقاط المستخدم
            const userPointsQuery = 'SELECT reward_points FROM users WHERE id = ?';
            db.execute(userPointsQuery, [userId], (error, userResults) => {
                if (error) {
                    console.error("Database error during user points retrieval:", error);
                    return res.status(500).send("Database error during user points retrieval.");
                }
                if (userResults.length === 0) {
                    return res.status(404).send("User not found.");
                }

                const userPoints = userResults[0].reward_points;
                console.log("User Points:", userPoints);

                // الحصول على نسبة الخصم بناءً على النقاط
                getDiscountPercentage(userPoints, (discountPercentage) => {
                    // تطبيق الخصم على السعر الكلي
                    const discountAmount = totalPrice * (discountPercentage / 100);
                    const discountedTotalPrice = totalPrice - discountAmount;
                    console.log({
                        itemId,
                        userId,
                        startDate,
                        endDate,
                        discountedTotalPrice,
                        platformFee,
                        totalRevenue,
                        discountPercentage,
                        discountAmount
                    });
                    
                    // إدخال الحجز مع الخصم ورسوم المنصة والإيرادات في قاعدة البيانات
                    const insertQuery = `
                        INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_percentage, discount_amount) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const updateItemStatusQuery = `
        UPDATE items SET status = 'محجوز' WHERE id = ?
    `;

                    db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, discountPercentage, discountAmount], (error, result) => {
                        if (error) {
                            console.error("Error creating booking:", error);
                            return res.status(500).send("Error creating booking.");
                        }
                        db.execute(updateItemStatusQuery, [itemId], (updateError, updateResult) => {
                            if (updateError) return callback(updateError);
                
                            callback(null, result); // إرجاع النتيجة أو أي شيء آخر تحتاجه
                        });
                        const bookingId = result.insertId;

                        // تحديث نقاط المستخدم بعد إنشاء الحجز
                        updateUserPoints(userId, bookingId, durationInHours);

                        // إرسال الإشعار إلى المالك
                       // إرسال الإشعار إلى المالك
const notificationMessage = `User ${userId} has booked your item ${itemId} from ${startDate} to ${endDate}.`;
sendNotificationToOwner(ownerId, notificationMessage, itemId, userId);


                        res.status(201).json({
                            message: "Booking created successfully.",
                            originalTotalPrice: totalPrice,
                            discountPercentage,
                            discountAmount,
                            finalTotalPrice: discountedTotalPrice,
                            platformFee,
                            totalRevenue
                        });
                    });
                });
            });
        });
    });
};const sendNotificationToOwner = (ownerId, message, itemId, userId) => {
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
/*
const createBooking = (req, res) => {
    const itemId = req.body.item_id || null;
    const userId = req.body.user_id || null;
    const startDate = req.body.start_date || null;
    const endDate = req.body.end_date || null;

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
        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        db.execute(query, [itemId], (error, itemResults) => {
            if (error) {
                console.error("Database error during item price retrieval:", error);
                return res.status(500).send("Database error during item price retrieval.");
            }
            if (itemResults.length === 0) {
                return res.status(404).send("Item not found.");
            }

            const { basePricePerHour, basePricePerDay } = itemResults[0];

            // حساب السعر الكلي، رسوم المنصة، والإيرادات الكلية ومدة الحجز بالساعات
            const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

            // الحصول على نقاط المستخدم
            const userPointsQuery = 'SELECT reward_points FROM users WHERE id = ?';
            db.execute(userPointsQuery, [userId], (error, userResults) => {
                if (error) {
                    console.error("Database error during user points retrieval:", error);
                    return res.status(500).send("Database error during user points retrieval.");
                }
                if (userResults.length === 0) {
                    return res.status(404).send("User not found.");
                }

                const userPoints = userResults[0].reward_points;
                console.log("User Points:", userPoints);

                // الحصول على نسبة الخصم بناءً على النقاط
                getDiscountPercentage(userPoints, (discountPercentage) => {
                    // تطبيق الخصم على السعر الكلي
                    const discountAmount = totalPrice * (discountPercentage / 100);
                    const discountedTotalPrice = totalPrice - discountAmount;
                    console.log({
                        itemId,
                        userId,
                        startDate,
                        endDate,
                        discountedTotalPrice,
                        platformFee,
                        totalRevenue,
                        discountPercentage,
                        discountAmount
                    });
                    
                    // إدخال الحجز مع الخصم ورسوم المنصة والإيرادات في قاعدة البيانات
                    const insertQuery = `
                        INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_percentage, discount_amount) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, discountPercentage, discountAmount], (error, result) => {
                        if (error) {
                            console.error("Error creating booking:", error);
                            return res.status(500).send("Error creating booking.");
                        }

                        const bookingId = result.insertId;

                        // تحديث نقاط المستخدم بعد إنشاء الحجز
                        updateUserPoints(userId, bookingId, durationInHours);

                        res.status(201).json({
                            message: "Booking created successfully.",
                            originalTotalPrice: totalPrice,
                            discountPercentage,
                            discountAmount,
                            finalTotalPrice: discountedTotalPrice,
                            platformFee,
                            totalRevenue
                        });
                    });
                });
            });
        });
    });
};*/


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

/*
// دالة لاسترجاع جميع الحجوزات
const getAllBookings = (req, res) => {
    const query = 'SELECT * FROM bookings';
    db.execute(query, (error, results) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).json(results);
    });
};

// دالة لاسترجاع حجز معين حسب الـ ID
const getBookingById = (req, res) => {
    const bookingId = req.params.id;
    const query = 'SELECT * FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Booking not found.");
        res.status(200).json(results[0]);
    });
};

const updateBooking = (req, res) => {
    const bookingId = req.params.id;
    const { startDate, endDate } = req.body;

    // التحقق من وجود القيم قبل المتابعة
    if (!startDate || !endDate) {
        return res.status(400).send("startDate and endDate are required.");
    }

    const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = (SELECT item_id FROM bookings WHERE id = ?)';
    db.execute(query, [bookingId], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length === 0) return res.status(404).send("Item not found for the booking.");

        const { basePricePerHour, basePricePerDay } = results[0];

        // التأكد من أن الأسعار ليست غير معرفة
        if (!basePricePerHour || !basePricePerDay) {
            return res.status(500).send("Price information missing for the item.");
        }

        const totalPrice = calculateTotalPrice(startDate, endDate, basePricePerHour, basePricePerDay);

        const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ?, total_price = ? WHERE id = ?';
        db.execute(updateQuery, [startDate, endDate, totalPrice, bookingId], (error) => {
            if (error) return res.status(500).send("Error updating booking.");
            res.status(200).send("Booking updated successfully.");
        });
    });
};


// دالة لحذف حجز
const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const query = 'DELETE FROM bookings WHERE id = ?';
    db.execute(query, [bookingId], (error) => {
        if (error) return res.status(500).send("Database error.");
        res.status(200).send("Booking deleted successfully.");
    });
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};


*/