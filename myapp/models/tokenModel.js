const mysql = require('mysql2');

// إعداد اتصال MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'noor2',
    password: ''
});

// دالة لتحديث أو إضافة توكن
exports.updateOrInsert = (username, token, callback) => {
    // استعلام SQL لتحديث التوكن إذا كان موجودًا، أو إضافته إذا لم يكن موجودًا
    const query = `
        INSERT INTO tokens (username, token)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE token = ?
    `;

    connection.execute(
        query,
        [username, token, token], // إضافة القيمة الجديدة في حالة التحديث
        (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        }
    );
};