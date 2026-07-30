const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const product = require('./product');
const product_Array = require('./constant');
const cartModel = require('../model/cartModel')
const productModel = require('../model/productModel')

cart_array=[{}];


mongoose.connect(
  "mongodb+srv://kochey:UeaEGUhKErRYmpGu@cluster0.224lwek.mongodb.net/?appName=Cluster0"
)
.then(()=> console.log("db Connection successfull to cart"))
.catch((err)=>console.log(err));        
        

 router.post("/add", async (req, res) => {
   const productId = req.body.productId
   console.log(productId);
   
   
   // const foundItem = await product.foundbyid(item => item.id == req.params.id);
   const foundItem = await productModel.findById(productId)
   console.log(foundItem)

    try{

      if (!foundItem) {
          return res.status(404).json({
              message: "product not found"
          });
      }

      const cartItem = new cartModel({
      title: foundItem.title, 
      price: foundItem.price,
      description: foundItem.description,
      category: foundItem.category,
      quantity : foundItem.quantity
      });
      await cartItem.save();

    
      return res.status(200).json({
          message: "Product found and added to cart",
          product : foundItem 
      });

    }catch (e) {
        console.log(e);
        return res.status(404).json({ 
            message: "Prodcut doesnt exist" 
        });
    }
    
      
    
});

router.get('/add/:id', async (req, res) => {
  try {
    const cart = await product.find({ id: req.params.id });
    res.json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/remove", async (req,res) => {

    const productId = req.body.productId

    try{
        const deleteItem = await cartModel.findByIdAndDelete(productId)

      

        if(!deleteItem){
          res.status(404).json({
            message:"item not in cart"
          })
        }

      res.status(200).json({
        message:"Item successfully deleted from cart",
        product : deleteItem
      })

    }
    catch(e){
      console.log(e);
      res.status(500).json({message:"Something went wrong"})

    }
 })

router.put("/update", async (req,res) => {
  
const productId = req.body.productId

try{
 
updatedquantity = await cartModel.findByIdAndUpdate(productId, req.body.quantity)

if(!updatedquantity){
  res.status(404).json({message:"Product not found"})
}

res.status(200).json({
  message:"Product successfully updated",
  product : updatedquantity
})


}catch(e){
  console.log(e);
  res.status(500).json({message:"Something went wrong"})
}

})  


module.exports = router;