const express= require("express");
const {Student}= require("../db");
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
  email: zod.string().email().min(6).max(30),
  password: zod.string().min(6),
  name: zod.string().max(100),
  mobileNumber: zod.string().max(10)
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
            errorMessage = "ENter a valid email address";
          } else if (error.path[0] === "password") {
            errorMessage = "Password should be minimum of 6 characters";
          } else if (error.path[0] === "name") {
            errorMessage = `${error.path[0]} should not exceed 100 characters`;
          }
          break;
        }

        return res.status(400).json({
          message: errorMessage || "Invalid input"
        });
      }

    const hashedPassword= await hashPassword(req.body.password);
    
    const email= req.body.email;
    const existingUser= await Student.findOne({email});
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const newStudent = await Student.create({
      email: req.body.email,
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
      password: hashedPassword,
    });

    const token = jwt.sign({studentId: newStudent._id }, JWT_SECRET);

    res.status(201).json({
      message: "Student created successfully",
      token: token,
      studentId: newStudent._id,
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

    const student= await Student.findOne({
      email
    });

    if(!student){
      return res.status(401).json({message: "Invalid email"});
    }

    const passwordMatch= await comparePassword(password, student.password);

    if(!passwordMatch){
      return res.status(401).json({message: "Invalid password"});
    }

    const token= jwt.sign({studentId: student._id}, JWT_SECRET);
    res.status(200).json({message: "Student Logged In successfully", token, studentId: student._id});
  }
  catch(error){
    res.status(500).json({
      message: "Internal server error"
    });
  }
})

module.exports= router;