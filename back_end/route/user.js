const express = require("express");
 const app = express();
const router = express.Router()

const Usermodel = require('../model/userModel')
const founduser = ('../queries/userqueries')


 app.use(router);
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")




router.post("/signup", async (req,res) =>{
    
    const alreadyexistinguser = await Usermodel.find( {email : req.body.email});


    if(alreadyexistinguser.length >= 1){
        return res.status(400).json({message: "email is already used, try a diffrent email"});
    }


    const hashedpassword =  await bcrypt.hash(
        req.body.password,
        10,
    );
    

try{
  const newUser = new Usermodel({
        email : req.body.email,
        name: req.body.name,
        password : hashedpassword

})

    newUser.save();


    res.status(200).json({message:"Registration succesfull"});
}catch(e){
    console.log("failed to create user")
    res.status(406).json({message:"failed to create user"});
}
})



router.post("/signin", async (req,res) => {
  const alreadyexistinguser = await Usermodel.find({email : req.body.email});
  if(alreadyexistinguser.length>=1){
    try{
      const comparepassword = await bcrypt.compare(req.body.password,
        alreadyexistinguser[0].password
      );

      token = jwt.sign({email:alreadyexistinguser[0].email},

        "Goonygoogoo",
      {
        expiresIn: 60 * 60,
      }
      );
      res.status(200).json({message: "User successfully logged in "});
      console.log(token)
      

    }catch(e){
      console.log(e);
      res.status(400).json({message:"Wrong email or Password "});
    }
    
  }else{
    res.status(400).json({message:"Email does not exist"});
  }


});









module.exports = router;