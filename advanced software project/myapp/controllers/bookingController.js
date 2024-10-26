const db = require('../db');

// دالة للحصول على نسبة الخصم بناءً على نقاط المستخدم
async function getDiscountPercentage(userPoints) {
    try {
        console.log("User points:", userPoints);  // عرض النقاط

        const query = `
            SELECT discount_percentage 
            FROM discount_levels 
            WHERE min_points <= ? 
            ORDER BY min_points DESC 
            LIMIT 1
        `;

        const [results] = await db.execute(query, [userPoints]);

        console.log("Discount query results:", results);  // عرض نتائج الاستعلام

        const discount = results.length > 0 ? results[0].discount_percentage : 0;
        console.log("Applicable discount:", discount);  // عرض النسبة النهائية
        return discount;
    } catch (error) {
        console.error("Error fetching discount percentage:", error);
        return 0;  // في حال وجود خطأ، لا يتم تطبيق خصم
    }
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

        // إضافة سجل في user_points_history
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




const createBooking = async (req, res) => {
    try {
        const itemId = req.body.item_id || null;
        const userId = req.body.user_id || null;
        const startDate = req.body.start_date || null;
        const endDate = req.body.end_date || null;
        const idNumber = req.body.id_number || null; // Use the ID number from the request body
        const isValidIdNumber = (idNumber) => {
            // Check if idNumber is defined and not null or empty, then trim and test against regex
            if (typeof idNumber === 'string' && idNumber.trim() !== '') {
                const isValid = /^PAL\d{4}$/.test(idNumber.trim());
                return isValid;
            }
            return false; // Return false for any undefined, null, or empty string
        };

if (isValidIdNumber(idNumber)) {
    console.log("Valid ID number format.");
} else {
    return res.status(400).send("Invalid ID number");
}

const checkInsuranceQuery = `
SELECT * FROM insurance WHERE Idnumber = ?
`;
const [insuranceResults] = await db.execute(checkInsuranceQuery, [idNumber]);

if (insuranceResults.length > 0) {
return res.status(400).send("Invalid ID number: ID number already exists in the insurance table.");
}

        // Check for overlapping bookings
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

        // Get item price details from the database
        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        const [itemResults] = await db.execute(query, [itemId]);

        if (itemResults.length === 0) {
            return res.status(404).send("Item not found.");
        }

        const { basePricePerHour, basePricePerDay } = itemResults[0];

        // Calculate total price, platform fee, total revenue, and booking duration in hours
        const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

        // Get user points
        const userPointsQuery = 'SELECT reward_points FROM users WHERE id = ?';
        const [userResults] = await db.execute(userPointsQuery, [userId]);

        if (userResults.length === 0) {
            return res.status(404).send("User not found.");
        }

        const userPoints = userResults[0].reward_points;

        // Get discount percentage based on points
        const discountPercentage = await getDiscountPercentage(userPoints);

        // Apply discount to total price
        const discountAmount = totalPrice * (discountPercentage / 100);
        const discountedTotalPrice = totalPrice - discountAmount;

        // Insert booking with discount, platform fee, and revenue into the database
        const insertQuery = `
            INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_percentage, discount_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, discountPercentage, discountAmount]);

        const bookingId = result.insertId;

        // Update user points after creating the booking
        await updateUserPoints(userId, bookingId, durationInHours);

        // Insert ID number into the insurance table
        const insuranceInsertQuery = `
            INSERT INTO insurance (user_id, Idnumber) 
            VALUES (?, ?)
        `;
        await db.execute(insuranceInsertQuery, [userId, idNumber]);

        res.status(201).json({
            message: "Booking created successfully.",
            originalTotalPrice: totalPrice,
            discountPercentage,
            discountAmount,
            finalTotalPrice: discountedTotalPrice,
            platformFee,
            totalRevenue
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).send("Server error.");
    }
};
// دالة لاسترجاع جميع حجوزات اليوزر أو المالك
const getAllBookings = async (req, res) => {
    try {
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
        } else if (role === 'admin') {
            // جلب جميع الحجوزات
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

// دالة لاسترجاع حجز معين (اليوزر أو المالك)
const getBookingById = async (req, res) => {
    try {
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
            // جلب الحجز المحدد
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

// دالة لتحديث حجز (اليوزر أو المالك)
const updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const username = req.user.username;
        const role = req.user.role;
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;

        // Check required fields
        if (!startDate || !endDate) {
            return res.status(400).send("Start date and end date are required.");
        }

        let query;
        let params;

        if (role === 'user') {
            // Get user_id based on username
            const [userResults] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
            if (userResults.length === 0) {
                return res.status(404).send("User not found.");
            }
            const userId = userResults[0].id;

            // Check if booking belongs to user
            query = 'SELECT * FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, userId];
        } else if (role === 'owner') {
            // Owner checks bookings associated with their items using username
            query = `
                SELECT b.* FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            // Admin can access any booking
            query = 'SELECT * FROM bookings WHERE id = ?';
            params = [bookingId];
        } else {
            return res.status(403).send("Access denied.");
        }

        const [results] = await db.execute(query, params);
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
        const itemId = results[0].item_id; // Get item_id to check overlap
        const [checkResults] = await db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate]);
        if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

        // Update booking
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
            // Retrieve user_id based on username
            const [userResults] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
            if (userResults.length === 0) {
                return res.status(404).send("User not found.");
            }
            const userId = userResults[0].id;

            // User can only delete their own bookings
            query = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
            params = [bookingId, userId];
        } else if (role === 'owner') {
            // Owner deletes bookings associated with their items using username
            query = `
                DELETE b FROM bookings b
                JOIN items i ON b.item_id = i.id
                WHERE b.id = ? AND i.username = ?
            `;
            params = [bookingId, username];
        } else if (role === 'admin') {
            // Admin can delete any booking
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

// تصدير الدوال
module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
};