const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const multer=require('multer')
const path=require('path')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')


let otpStorage = {}
//user register
exports.userRegister = async (req, res) => {
    try {
      
        const { email, password, fullName, mobile, role ,confirmPassword} = req.body;
        if (!email || !password || !confirmPassword || !fullName || !mobile || !role) {
          return res.status(400).json({ error: "All fields are required." })
      }
      if(password!==confirmPassword){
        return res.status(400).json("verify the confirmPassword")
      }
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
      if (!passwordPattern.test(password)) {
        return res.status(400).json("Password must contain at least one uppercase letter , one lowercase letter and 8 characters.")
    }
    const emailExists = await User.findOne({ email })
    if (emailExists){
      return res.status(400).json("Email already exists")
    }
    const mobileExists = await User.findOne({ mobile })
    if (mobileExists){
      return res.status(400).json("Mobile number already exists")
    }
        const newUser = new User({
            email,
            password, 
            confirmPassword,
            fullName,
            mobile,
            role,
        })

        const savedUser = await newUser.save()

            const generatedOTP = otpGenerator.generate(6, { 
      lowerCaseAlphabets: false, 
      upperCaseAlphabets: false, 
      specialChars: false 
    })

    otpStorage[email] = generatedOTP
        const transporter=nodemailer.createTransport({
                  service:"gmail",
                  auth:{
                       user: process.env.EMAIL,
                  pass: process.env.passwordEmail}
              })
              const mailOptions={
                  from:process.env.EMAIL,
                  to:email,
                  subject:"Account verification",
                  text:`Your verification code is : ${generatedOTP}`
                  }
                  transporter.sendMail(mailOptions)
        
        res.status(201).json({ message: "Eamil with verification code sent", user: savedUser })
        
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//user login
exports.userLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide email/mobile and password" })
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const mobilePattern = /^(\+216)?[0-9]{8}$/; 

    let query = {};
    if (emailPattern.test(identifier)) {
      query.email = identifier
    } else if (mobilePattern.test(identifier)) {
      query.mobile = identifier
    } else {
      return res.status(400).json({ error: "Invalid email or mobile number format." })
    }
    const user = await User.findOne(query)
    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }
    if (!user.isVerified) {
      return res.status(400).json({ error: "Please verify your account before logging in." })
  }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

exports.verifyUser=async(req,res)=>{
  try {
    const{verifyCode,email}=req.body
    if (!otpStorage[email] || otpStorage[email] !== verifyCode) {
      return res.status(400).json({ message: "Wrong verification code." })
  }
  await User.findOneAndUpdate({ email }, { isVerified: "verified" })
  delete otpStorage[email]
    return res.status(200).json({message:"account verified"})
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}