// controllers/itemController.js
const itemModel = require('../models/Items');
const db = require('../db');


exports.createItem = (req, res) => {
  const itemData = req.body;
  const username = req.user.username; 

  itemData.username = username;
  console.log("Item Data:", itemData);

  itemModel.createItem(itemData, (error, result) => {
      if (error) {
          console.error("Error details:", error.message); 
          return res.status(500).json({ error: 'Error creating item', details: error.message });
      }
      res.status(201).json({ message: 'Item created successfully', result });
  });
};

exports.getAllItems = async (req, res) => {
  const userRole = req.user.role; 
  const username = req.user.username; 
  
    
    itemModel.getAllItems(userRole, username, (error, items) => {
      if (error) {
        return res.status(500).json({ error: 'Error retrieving items' });
      }
      res.status(200).json(items);
    });
  
};


exports.getItemById = (req, res) => {
  const itemId = req.params.id;
  const userRole = req.user.role;
  const username = req.user.username;

  itemModel.getItemById(itemId, userRole, username, (error, item) => {
    if (error) {
      return res.status(500).json({ error: 'Error retrieving item' });
    }
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(item);
  });
};
exports.updateItem = (req, res) => {
  const itemId = req.params.id;
  const itemData = req.body;
  const userRole = req.user.role;
  const username = req.user.username;

  itemModel.updateItem(itemId, itemData, userRole, username, (error, result) => {
      if (error) {
          return res.status(500).json({ error: 'Error updating item', details: error.message });
      }
      res.status(200).json({ message: 'Item updated successfully', result });
  });
};

exports.deleteItem = (req, res) => {
    const itemId = req.params.id;

    itemModel.getItemById(itemId, req.user.role, req.user.username, (error, item) => {
      if (error || !item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if(req.user.role !== "admin"){
      if (item.username !== req.user.username) {
        return res.status(403).json({ error: 'You do not have permission to delete this item.' });
      }
      }
      itemModel.deleteItem(itemId, (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Error deleting item' });
        }
        res.status(200).json({ message: 'Item deleted successfully', result });
      });
    });
};

exports.filterItems = (req, res) => {
  const filters = req.query;

  itemModel.filterItems(filters, (error, items) => {
    if (error) {
      return res.status(500).json({ error: 'Error filtering items' });
    }
    res.status(200).json(items);
  });
};