const mysql = require('mysql2');

// إعداد اتصال MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'noor2'
});

exports.createItem = (itemData, callback) => {
    const { name, category, description, basePricePerDay, basePricePerHour, username, status } = itemData;
    // تحقق من القيم المطلوبة
    if (!name || !category || !description || basePricePerDay === undefined || !username || !status) {
      return callback(new Error("All fields are required."));
  }
  

    // تنفيذ الاستعلام
    const query = `
        INSERT INTO items (name, category, description, basePricePerDay, basePricePerHour, username, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.execute(
        query,
        [name, category, description, basePricePerDay, basePricePerHour, username, status],
        (error, result) => {
            if (error) return callback(error);
            callback(null, result);
        }
    );
};

// دالة لاسترجاع جميع العناصر
exports.getAllItems = (callback) => {
  const query = 'SELECT * FROM items';

  connection.execute(query, (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};

// استرجاع عنصر معين باستخدام ID
exports.getItemById = (id, callback) => {
  const query = 'SELECT * FROM items WHERE id = ?';

  connection.execute(query, [id], (error, results) => {
    if (error) return callback(error);
    callback(null, results[0]); // جلب العنصر الأول
  });
};

// تحديث عنصر
exports.updateItem = (id, itemData, callback) => {
  const { name, category, description, basePricePerDay, basePricePerHour, username, status } = itemData;

  const query = `
    UPDATE items
    SET name = ?, category = ?, description = ?, basePricePerDay = ?, basePricePerHour = ?, username = ?, status = ?
    WHERE id = ?
  `;

  connection.execute(
    query,
    [name, category, description, basePricePerDay, basePricePerHour, username, status, id],
    (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    }
  );
};

// حذف عنصر
exports.deleteItem = (id, callback) => {
  const query = 'DELETE FROM items WHERE id = ?';

  connection.execute(query, [id], (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};

// دالة لتصفية العناصر
exports.filterItems = (filters, callback) => {
  const { category, minPrice, maxPrice, status } = filters;
  let query = 'SELECT * FROM items WHERE 1 = 1';

  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (minPrice) {
    query += ' AND basePricePerDay >= ?';
    params.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND basePricePerDay <= ?';
    params.push(maxPrice);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  connection.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};