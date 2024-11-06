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
            return callback(0);  
        }

        console.log("Discount query results:", results);  

        const discount = results.length > 0 ? results[0].discount_percentage : 0;
        console.log("Applicable discount:", discount);  
        callback(discount);
    });
}



function calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60)); 
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); 

    let totalPrice = durationInDays > 1 ? durationInDays * basePricePerDay : durationInHours * basePricePerHour;

    const platformFeePercentage = 0.10; 
    const platformFee = totalPrice * platformFeePercentage;

    const totalRevenue = totalPrice + platformFee;

    return { totalPrice, platformFee, totalRevenue, durationInHours };
}

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


    const checkQuery = `
        SELECT * FROM bookings 
        WHERE item_id = ? 
        AND (
            (start_date < ? AND end_date > ?) OR 
            (start_date < ? AND end_date > ?)
        )
    `;

    db.execute(checkQuery, [itemId, endDate, startDate, startDate, endDate], (error, results) => {
        if (error) return res.status(500).send("Database error.");
        if (results.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

        const query = 'SELECT basePricePerHour, basePricePerDay FROM items WHERE id = ?';
        db.execute(query, [itemId], (error, results) => {
            if (error) return res.status(500).send("Database error.");
            if (results.length === 0) return res.status(404).send("Item not found.");

            const { basePricePerHour, basePricePerDay } = results[0];

            const { totalPrice, platformFee, totalRevenue, durationInHours } = calculateTotalAndPlatformFee(startDate, endDate, basePricePerHour, basePricePerDay);

            const userPointsQuery = 'SELECT reward_points FROM users WHERE id = ?';
            db.execute(userPointsQuery, [userId], (error, userResults) => {
                if (error) return res.status(500).send("Database error.");

                const userPoints = userResults[0].reward_points;
                console.log(userPoints);

                getDiscountPercentage(userPoints, (discountPercentage) => {
                    const discountAmount = totalPrice * (discountPercentage / 100);
                    const discountedTotalPrice = totalPrice - discountAmount;

                    const insertQuery = `
                        INSERT INTO bookings (item_id, user_id, start_date, end_date, total_price, platform_fee, total_revenue, discount_percentage, discount_amount) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.execute(insertQuery, [itemId, userId, startDate, endDate, discountedTotalPrice, platformFee, totalRevenue, discountPercentage, discountAmount], (error, result) => {
                        if (error) return res.status(500).send("Error creating booking.");

                        const bookingId = result.insertId;

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
};



const getAllBookings = (req, res) => {
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
    }  else if (role === 'admin') {
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

const getBookingById = (req, res) => {
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
        
        res.status(200).json({
            booking: results[0],
            message: "Booking retrieved successfully."
        });
    });
};

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

        const checkQuery = `
            SELECT * FROM bookings 
            WHERE item_id = ? 
            AND id != ?  -- Exclude the current booking
            AND (
                (start_date < ? AND end_date > ?) OR 
                (start_date < ? AND end_date > ?)
            )
        `;

        const itemId = results[0].item_id; 
        db.execute(checkQuery, [itemId, bookingId, endDate, startDate, startDate, endDate], (error, checkResults) => {
            if (error) return res.status(500).send("Database error.");
            if (checkResults.length > 0) return res.status(400).send("Booking already exists for this item in the selected time period.");

            const updateQuery = 'UPDATE bookings SET start_date = ?, end_date = ? WHERE id = ?';
            db.execute(updateQuery, [startDate, endDate, bookingId], (error) => {
                if (error) return res.status(500).send("Error updating booking.");
                res.status(200).send("Booking updated successfully.");
            });
        });
    });
};


const deleteBooking = (req, res) => {
    const bookingId = req.params.id;
    const username = req.user.username;
    const role = req.user.role;

    let query;
    let params;

    if (role === 'user') {
        query = 'DELETE FROM bookings WHERE id = ? AND user_id = ?';
        params = [bookingId, username];
    } else if (role === 'owner') {
        query = `
            DELETE b FROM bookings b
            JOIN items i ON b.item_id = i.id
            WHERE b.id = ? AND i.username = ?
        `;
        params = [bookingId, username];
    } else if (role === 'admin') {
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
            console.error("Error details:", error); 
            return res.status(500).send("Database error.");
        }
        if (results.affectedRows === 0) return res.status(404).send("Booking not found or unauthorized.");
        
        res.status(200).send("Booking deleted successfully.");
    });
    
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
