const express= require("express");
const {Host}= require("../db");
const router= express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const {hashPassword, comparePassword}= require("../utils/PasswordUtils");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const JWT_SECRET= process.env.JWT_SECRET;


//zod schema
const signupSchema = zod.object({
  hostId: zod.string().max(6),
  email: zod.string().email().min(6).max(30),
  password: zod.string().min(6),
  college: zod.string().max(100),
});

//error handling and data storage
router.post("/signup", async (req, res) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        let errorMessage = "";
        for (const error of errors) {
          if (error.path[0] === "email") {
            errorMessage = "Enter a valid email address";
          } else if (error.path[0] === "password") {
            errorMessage = "Password should be minimum of 6 characters";
          } else if (error.path[0] === "hostId") {
            errorMessage = `HostId should not exceed 6 characters`;
          } else if (error.path[0] === "college") {
            errorMessage = `College name should not exceed 100 characters`;
          }
          break;
        }

        return res.status(400).json({
          message: errorMessage || "Invalid input"
        });
      }

    const hashedPassword= await hashPassword(req.body.password);
    
    const email= req.body.email;
    const existingHost= await Host.findOne({email});
    if (existingHost) {
      return res.status(409).json({
        message: "Host Email already exists"
      });
    }

    const newHost = await Host.create({
      email: req.body.email,
      hostId: req.body.hostId,
      college: req.body.college,
      password: hashedPassword,
    });

    const token = jwt.sign({hostUniqueId: newHost._id }, JWT_SECRET);

    res.status(201).json({
      message: "Host created successfully",
      token: token,
      hostUniqueId: newHost._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

const loginSchema= zod.object({
  email: zod.string().email(),
  password: zod.string()
});

router.post("/login", async(req,res)=>{
  try{
    const {success}= loginSchema.safeParse(req.body);
    if(!success){
      return res.status(411).json({
        msg:"Incorrect Input"
      })
    }

    const {email, password}= req.body;

    const host= await Host.findOne({
      email
    });

    if(!host){
      return res.status(401).json({message: "Invalid email"});
    }

    const passwordMatch= await comparePassword(password, host.password);

    if(!passwordMatch){
      return res.status(401).json({message: "Invalid password"});
    }

    const token= jwt.sign({hostUniqueId: host._id}, JWT_SECRET);
    res.status(200).json({message:"Host Logged In successfully", token, hostUniqueId: host._id});
  }
  catch(error){
    res.status(500).json({
      message: "Internal server error"
    });
  }
})

module.exports= router;