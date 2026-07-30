const express = require('express');
const app = express();
const cors = require('cors');
const product = require('./route/product');
const mongoose = require('mongoose');
const user = require('./route/user')


mongoose.connect(
  "mongodb+srv://kochey:UeaEGUhKErRYmpGu@cluster0.224lwek.mongodb.net/?appName=Cluster0"
)
.then(()=> console.log("db to Connection successfull"))
.catch((err)=>console.log(err));

app.listen(3000 ,()=>{
  console.log('Server is running on http://localhost:3000');
} )

