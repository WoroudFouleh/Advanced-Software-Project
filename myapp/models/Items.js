const mysql = require('mysql2');

const connection = require('../db'); // Ensure the path is correct

exports.createItem = (itemData, callback) => {
  const { name, category, description, basePricePerDay, basePricePerHour, username, status, owner_id, imageURL } = itemData;
  // تحقق من القيم المطلوبة
  if (!name || !category || !description || basePricePerDay === undefined || !username || !status || !owner_id || !imageURL) {
      return callback(new Error("All fields are required."));
  }

  // تنفيذ الاستعلام
  const query = `
      INSERT INTO items (name, category, description, basePricePerDay, basePricePerHour, username, status, owner_id, imageURL)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.execute(
      query,
      [name, category, description, basePricePerDay, basePricePerHour, username, status, owner_id,imageURL],
      (error, result) => {
          if (error) return callback(error);
          callback(null, result);
      }
  );
};

// دالة لاسترجاع جميع العناصر
exports.getAllItems = (role, username, callback) => {
  let query = 'SELECT * FROM items';
  const params = [];

  // فقط المالك يرى العناصر الخاصة به
  if (role === 'owner') {
    query += ' WHERE username = ?';
    params.push(username);
  }

  connection.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};

// استرجاع عنصر معين باستخدام ID
exports.getItemById = (id, role, username, callback) => {
  let query = 'SELECT * FROM items WHERE id = ?';
  const params = [id];

  // إذا كان المستخدم "owner"، نضيف شرط المطابقة مع username
  if (role === 'owner') {
    query += ' AND username = ?';
    params.push(username);
  }

  connection.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results[0]); // جلب العنصر الأول
  });
};

// تحديث عنصر
exports.updateItem = (id, itemData, callback) => {
  // جلب البيانات الحالية للعنصر
  exports.getItemById(id, (error, existingItem) => {
    if (error || !existingItem) {
      return callback(new Error("Item not found"));
    }

    // تحديد القيم النهائية باستخدام البيانات الجديدة أو الحالية
    const name = itemData.name || existingItem.name;
    const category = itemData.category || existingItem.category;
    const description = itemData.description || existingItem.description;
    const basePricePerDay = itemData.basePricePerDay !== undefined ? itemData.basePricePerDay : existingItem.basePricePerDay;
    const basePricePerHour = itemData.basePricePerHour !== undefined ? itemData.basePricePerHour : existingItem.basePricePerHour;
    const username = itemData.username || existingItem.username;
    const status = itemData.status || existingItem.status;
    const owner_id = itemData.owner_id || existingItem.owner_id;
    const imageURL = itemData.imageURL || existingItem.imageURL;

    const query = `
      UPDATE items
      SET name = ?, category = ?, description = ?, basePricePerDay = ?, basePricePerHour = ?, username = ?, status = ?, owner_id = ?, imageURL = ?
      WHERE id = ?
    `;

    connection.execute(
      query,
      [name, category, description, basePricePerDay, basePricePerHour, username, status, owner_id, imageURL, id],
      (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      }
    );
  });
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
  const { name, category, minPrice, maxPrice, status } = filters;
  let query = 'SELECT * FROM items WHERE 1 = 1';

  const params = [];

  if (name) {
    query += ' AND name = ?';
    params.push(name);
  }

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
