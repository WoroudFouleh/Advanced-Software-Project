const db = require("../db");
exports.updateOrInsert = (username, token, callback) => {
    const query = `
        INSERT INTO tokens (username, token)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE token = ?
    `;

    db.execute(
        query,
        [username, token, token],
        (error, result) => {
            if (error) {
                console.error('Error executing query:', error); // إضافة سطر للتصحيح
                return callback(error);
            }
            callback(null, result);
        }
    );
};



/*const db = require("../db"); 

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
*/