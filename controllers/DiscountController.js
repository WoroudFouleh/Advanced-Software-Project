const discountModel = require('../models/DiscountModel');

// Function to add a new discount
const addDiscount = (req, res) => {
    const { item_id, discount_type, discount_value } = req.body;

    // Validate that all required information is provided
    if (!item_id || !discount_type || discount_value === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required information: item_id, discount_type, and discount_value to successfully add a new discount." 
        });
    }

    // Add the discount using the model
    discountModel.createDiscount(item_id, discount_type, discount_value, (error, result) => {
        if (error) {
            return res.status(500).json({ 
                success: false, 
                message: "An error occurred while adding the discount to the database. Please ensure all parameters are correct and try again later. If the issue persists, contact support." 
            });
        }
        res.status(201).json({ 
            success: true, 
            message: "Discount added successfully. The discount has been applied to the specified item, and it will take effect according to the defined rules.", 
            data: result 
        });
    });
};

// Function to retrieve discounts associated with a specific item
const getDiscounts = (req, res) => {
    const { item_id } = req.params;

    // Validate that item_id is provided
    if (!item_id) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide the item_id to retrieve associated discounts. This information is necessary to fetch the relevant discount data for the specified item." 
        });
    }

    // Retrieve discounts for the specified item
    discountModel.getDiscountsByItemId(item_id, (error, discounts) => {
        if (error) {
            return res.status(500).json({ 
                success: false, 
                message: "An error occurred while retrieving discounts for the specified item. Please check the item_id provided and ensure it exists in the database. If you continue to face issues, please reach out for further assistance." 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: "Discounts retrieved successfully. Here are the discounts currently associated with the specified item.", 
            data: discounts 
        });
    });
};

// Exporting the functions
module.exports = {
    addDiscount,
    getDiscounts,
};
