const Item = require("./Items");
const Owner = require("./Owner");

// العلاقة بين الجداول
Owner.hasMany(Item, {
    foreignKey: 'ownerId',
    onDelete: 'SET NULL'
});
Item.belongsTo(Owner, {
    foreignKey: 'ownerId',
    onDelete: 'SET NULL'
});
