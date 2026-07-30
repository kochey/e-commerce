const express = require("express")
const router = express.Router()


const cart = require('./cart')
const product_Array = require("./constant")
const productModel = require('../model/productModel')


router.get('/' , async (req , res)=>{
  try{

  const products =  await productModel.find()
  console.log(products)
  res.status(200).json(products)

  }catch(e){
    console.log(e)
    res.status(500).json({message:"Failed to fetch product from database"})
  }
})


router.post("/add",async (req , res )=>{
  try{
      const newProduct = new productModel({
  
      title: req.body.title,
     price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      quantity: req.body.quantity

   });
    
    await newProduct.save();
     res.status(201).json({message: "successfully added"});   
    }catch(e){
    console.log(e)
    res.status(400).json({
      message : "Failed to make new product"
    })
 }
 })



// router.post("/products", (req, res)=>{
//   console.log("request handled", req.body);
//   let newProduct = {
//     id : newID,
//     title: req.body.title,
//     price: req.body.price,
//     description: req.body.description,
//     categories: req.body.categories
//   }
//   products.push(newProduct)
//   res.json({
//     success: true,
//     message: " succesfully added new product",
//     product: newProduct
//   })
// })

router.delete("/remove", async (req,res) => {

  const productId = req.body.productId

  try{

    deletedproduct = await productModel.findByIdAndDelete(productId)

  if(!deletedproduct){
    res.status(400).json({message:"Not found"})
  }

   console.log(deletedproduct)
   res.status(200).json({message: "Product deleted successfully"})


  }catch(e){
    console.log(e)
    res.status(500).json({message:"something went wrong"})
  }
 

        })


router.put("/update", async (req,res) => {

const productId = req.body.productId

try{

updatedata = await productModel.findByIdAndUpdate(productId, req.body)

if(!updatedata){
  res.status(404).json({message:"Product not found"})
}

res.status(200).json({
  message:"Product successfully updated",
  product : updatedata
  
})


}catch(e){
  console.log(e)
  res.status(500).json({message:"something went wrong"})

}
})

 module.exports = router;


 


