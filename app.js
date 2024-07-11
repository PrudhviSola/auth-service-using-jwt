// app.js
require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./config/database");
const userSchema = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "50mb" }));

const isValidEmail=(email)=>{
  const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
app.post("/register", async (req, res) => {
  //try {
    const {first_name,last_name,email,password}=req.body
    if(!first_name || !last_name || !email || !password)
      return res.status(400)
            .json({
              success:false,
              message:"User information is incomplete"});  
    if(!isValidEmail(email))
      return res.status(400)
              .json({
              success:false,
              message:"Invalid email format"});  
    
    const encryptedPassword = await bcrypt.hash(password, 10); 
    var sql = 'SELECT * FROM users WHERE email = ?';
    var values = [email];
    db.query(sql,values, (error, results) => {
      if(error)
        return res.status(500).json({success:false,message:"Internal Server error"});  
      //  console.log(results) // Send the query results as the response
      if (results.length > 0) {
          return res.status(400).json({ success: false, message: "user already exists" });
      }
      else{
        sql= 'INSERT into users (first_name, last_name, email, password) values(?,?,?,?)';
        values=[first_name,last_name,email,encryptedPassword]
        db.query(sql,values, (error, results) => {
          if(error)
            return res.status(500).json({success:false,message:"Internal Server error"});  
          if (results.affectedRows === 1) {
              return res.status(200).json({first_name,last_name,email });
          }
          }); 
      }
      });  
    
  
  
});


app.post("/login", async (req, res) => {
  const {email,password} =req.body;
  if(!email || !password)
      return res.status(400).json({sucess:false,message:"All fields are required"})
  var sql='select * from users where email=?';
  var values=[email]
  db.query(sql,values,(error,results)=>{
      if(error)
          return res.status(500).json({sucess:false,message:"Internal server error"})
      else if (results.length===0)
          return res.status(400).json({success:false,message:"User not found with given email"})
      else{
          //console.log(results[0].password)
          const encryptedPassword=results[0].password
          const first_name=results[0].first_name
          const last_name=results[0].last_name
          bcrypt.compare(password,encryptedPassword,(err,compared)=>{
            if(err)
              return res.status(500).json({sucess:false,message:"Internal server error"})
            else if(!compared)
              return res.status(400).json({sucess:false,message:"Invalid Credentials"})
            else{
              const token = jwt.sign({ email: email,first_name:first_name,last_name:last_name}, process.env.TOKEN_KEY, {
                expiresIn: '2h',
                });
              sql='update users set token = ? where email=?'
              values=[token,email]
              db.query(sql,values)//No need of call back
              return res.status(200).json({
                first_name,
                last_name,
                email,
                token
              })
            }
          })
      }
      
  })
  //res.status(200).json({success:true});
});



app.get("/welcome", auth, (req, res) => {
  const{first_name,last_name,email}=req.user
  res.status(200).json({success:true,message:"Welcome",first_name,last_name,email});
});


// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
