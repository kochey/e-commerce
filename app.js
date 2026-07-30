
const product = require('./back_end/route/product');
const user = require('./back_end/route/user');
const cart = require('./back_end/route/cart');

const express = require('express')
const port = 4000;

const mongoose = require('mongoose');
const app = express();
app.use(express.json())


app.use("/user", user);
app.use("/cart", cart);
app.use("/product", product);

mongoose.connect(
  "mongodb+srv://kochey:UeaEGUhKErRYmpGu@cluster0.224lwek.mongodb.net/?appName=Cluster0"
)
.then(()=> console.log("db connection successfull to App"))
.catch((err)=>console.log(err));







app.listen(port, ()=> {
  console.log(`running at http://localhost:${port}`)
})


