const mongoose = require("mongoose");
const { schema } = require("./productModel");

const cartSchema = new mongoose.Schema
({
    title: String, 
    price: Number,
    description: String,
    category: String,
    quantity : Number
})

const cart = mongoose.model('cart', cartSchema);
module.exports = cart