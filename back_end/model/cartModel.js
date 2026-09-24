// const mongoose = require("mongoose");
// const  schema  = require("./productModel");


// console.log(schema);

// const cartSchema = new mongoose.Schema({
//   title: String,
//   price: Number,
//   description: String,
//   category: String,
//   quantity: Number,
// });

// const cart = mongoose.model("cart", cartSchema);
// module.exports = cart;


const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },

  title: String,
  price: Number,
  description: String,
  category: String,
  quantity: {
    type: Number,
    default: 1,
  },
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart;