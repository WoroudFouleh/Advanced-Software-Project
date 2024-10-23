const db = require("../db");
const mysql = require('mysql2');

exports.createItem = (itemData, callback) => {
    const { name, category, description, basePricePerDay, basePricePerHour, username, status } = itemData;

    // تحقق من القيم المطلوبة
    if (!name || !category || !description || basePricePerDay === undefined || basePricePerHour === undefined || !username || !status) {
        console.log("Error: All fields are required.");
        return callback(new Error("All fields are required."));
    }

    // تنفيذ الاستعلام لإدخال العنصر
    const query = `
        INSERT INTO items (name, category, description, basePricePerDay, basePricePerHour, username, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(
        query,
        [name, category, description, basePricePerDay, basePricePerHour, username, status],
        (error, result) => {
            if (error) {
                console.log("Error while creating item:", error);
                return callback(error);
            }
            console.log("Item created successfully:", result);
            callback(null, result);
        }
    );
};

// دالة لاسترجاع جميع العناصر
exports.getAllItems = (callback) => {
    const query = 'SELECT * FROM items';

    db.execute(query, (error, results) => {
        if (error) {
            console.log("Error while fetching items:", error);
            return callback(error);
        }
        console.log("Fetched all items successfully:", results);
        callback(null, results);
    });
};

// استرجاع عنصر معين باستخدام ID
exports.getItemById = (id, callback) => {
    const query = 'SELECT * FROM items WHERE id = ?';

    db.execute(query, [id], (error, results) => {
        if (error) {
            console.log("Error while fetching item by ID:", error);
            return callback(error);
        }
        if (results.length === 0) {
            console.log(`No item found with ID: ${id}`);
            return callback(new Error(`No item found with ID: ${id}`));
        }
        console.log("Fetched item successfully:", results[0]);
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

    db.execute(
        query,
        [name, category, description, basePricePerDay, basePricePerHour, username, status, id],
        (error, results) => {
            if (error) {
                console.log("Error while updating item:", error);
                return callback(error);
            }
            console.log("Item updated successfully:", results);
            callback(null, results);
        }
    );
};

// حذف عنصر
exports.deleteItem = (id, callback) => {
    const query = 'DELETE FROM items WHERE id = ?';

    db.execute(query, [id], (error, results) => {
        if (error) {
            console.log("Error while deleting item:", error);
            return callback(error);
        }
        console.log("Item deleted successfully:", results);
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

    db.execute(query, params, (error, results) => {
        if (error) {
            console.log("Error while filtering items:", error);
            return callback(error);
        }
        console.log("Filtered items successfully:", results);
        callback(null, results);
    });
};
/*const db = require("../db");
const mysql = require('mysql2');

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

    db.execute(
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

  db.execute(query, (error, results) => {
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
ش
  db.execute(
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

  db.execute(query, [id], (error, results) => {
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

  db.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};
*/