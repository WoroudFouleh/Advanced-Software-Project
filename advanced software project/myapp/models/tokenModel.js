const mysql = require('mysql2');

// إعداد اتصال MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'noor'
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

// دالة للبحث عن توكن باستخدامه
exports.findByToken = (token, callback) => {
    const query = 'SELECT * FROM tokens WHERE token = ?';
    connection.execute(query, [token], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

// دالة لحذف توكن بعد استخدامه
exports.deleteByToken = (token, callback) => {
    const query = 'DELETE FROM tokens WHERE token = ?';
    connection.execute(query, [token], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};