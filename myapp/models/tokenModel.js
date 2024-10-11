const mysql = require('mysql2');

// إعداد اتصال MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 's120WOROUD#',
  database: 'worouddb'
});

// دالة لحفظ التوكن
exports.saveToken = (username, token, callback) => {
  const query = `
    INSERT INTO tokens (username, token)
    VALUES (?, ?)
  `;

  connection.execute(query, [username, token], (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};
