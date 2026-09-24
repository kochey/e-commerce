const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const product = require("./product");
const product_Array = require("./constant");
const cartModel = require("../model/cartModel");
const productModel = require("../model/productModel");

cart_array = [{}];

// mongoose.connect(
//   "mongodb+srv://kochey:UeaEGUhKErRYmpGu@cluster0.224lwek.mongodb.net/?appName=Cluster0"
// )
// .then(()=> console.log("db Connection successfull to cart"))
// .catch((err)=>console.log(err));

router.post("/add", async (req, res) => {
  const productId = req.body.productId;
  //  console.log(productId);

  // const foundItem = await product.foundbyid(item => item.id == req.params.id);
  const foundItem = await productModel.findById(productId);
  //  console.log(foundItem)

  try {
    if (!foundItem) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    const existingCartItem = await cartModel.findOne({
      productId: productId,
    });

    // console.log("Product ID received:", productId);
    // console.log("Existing cart item:", existingCartItem);
    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();
      return res.status(200).json({
        message: "Product quantity increased",
        product: existingCartItem,
      });
    }

    const cartItem = new cartModel({
      productId: foundItem._id,
      title: foundItem.title,
      price: foundItem.price,
      description: foundItem.description,
      category: foundItem.category,
      quantity: 1,
    });
    await cartItem.save();

    return res.status(200).json({
      message: "Product found and added to cart",
      product: foundItem,
    });
  } catch (e) {
    console.log(e);
    return res.status(404).json({
      message: "Something went wrong",
    });
  }
});

router.get("/add/:id", async (req, res) => {
  try {
    const cart = await product.findOne({ productId: req.params.id });

    if (!cart) {
      return res.status(404).json({
        message: "product not in cart",
      });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/remove", async (req, res) => {
  const productId = req.body.productId;

  try {
    const deleteItem = await cartModel.findOneAndDelete({
      productId: productId,
    });

    if (!deleteItem) {
      res.status(404).json({
        message: "item not in cart",
      });
    }

    return res.status(200).json({
      message: "Item successfully deleted from cart",
      product: deleteItem,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/update", async (req, res) => {
  const productId = req.body.productId;
  const quantity = req.body.quantity;

  try {
    updatedquantity = await cartModel.findOneAndUpdate(
      { productId: productId },
      { quantity: quantity },
      { new: true },
    );

    if (!updatedquantity) {
      res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product successfully updated",
      product: updatedquantity,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
