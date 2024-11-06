const mysql = require('mysql2');

const connection = require('../db'); 

exports.createItem = (itemData, callback) => {
  const { name, category, description, basePricePerDay, basePricePerHour, username, status, imageURL } = itemData;
  if (!name || !category || !description || basePricePerDay === undefined || !username || !status  || !imageURL) {
      return callback(new Error("All fields are required (name, category, description, basePricePerDay, basePricePerHour, status, imageURL )."));
  }

  const query = `
      INSERT INTO items (name, category, description, basePricePerDay, basePricePerHour, username, status, imageURL)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.execute(
      query,
      [name, category, description, basePricePerDay, basePricePerHour, username, status,imageURL],
      (error, result) => {
          if (error) return callback(error);
          callback(null, result);
      }
  );
};

exports.getAllItems = (role, username, callback) => {
  let query = 'SELECT * FROM items';
  const params = [];

  if (role === 'owner') {
    query += ' WHERE username = ?';
    params.push(username);
  }

  connection.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};

exports.getItemById = (id, role, username, callback) => {
  let query = 'SELECT * FROM items WHERE id = ?';
  const params = [id];

  if (role === 'owner') {
    query += ' AND username = ?';
    params.push(username);
  }

  connection.execute(query, params, (error, results) => {
    if (error) return callback(error);
    callback(null, results[0]); 
  });
};

exports.updateItem = (id, itemData, role, username, callback) => {
  exports.getItemById(id, role, username, (error, existingItem) => {
      if (error || !existingItem) {
          return callback(new Error("Item not found"));
      }

      const name = itemData.name || existingItem.name;
      const category = itemData.category || existingItem.category;
      const description = itemData.description || existingItem.description;
      const basePricePerDay = itemData.basePricePerDay !== undefined ? itemData.basePricePerDay : existingItem.basePricePerDay;
      const basePricePerHour = itemData.basePricePerHour !== undefined ? itemData.basePricePerHour : existingItem.basePricePerHour;
      const status = itemData.status || existingItem.status;
      const imageURL = itemData.imageURL || existingItem.imageURL;

      const query = `
          UPDATE items
          SET name = ?, category = ?, description = ?, basePricePerDay = ?, basePricePerHour = ?, status = ?, imageURL = ?
          WHERE id = ?
      `;

      connection.execute(
          query,
          [name, category, description, basePricePerDay, basePricePerHour, status, imageURL, id],
          (error, results) => {
              if (error) return callback(error);
              callback(null, results);
          }
      );
  });
};


exports.deleteItem = (id, callback) => {
  const query = 'DELETE FROM items WHERE id = ?';

  connection.execute(query, [id], (error, results) => {
    if (error) return callback(error);
    callback(null, results);
  });
};

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