const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer')
const twilio=require('twilio')
const otpGenerator = require('otp-generator')
const client = twilio(accountSid, authToken)
const OTPModel = require('../models/OTPModel')

//forget password

exports.forgetPassword=async(req,res)=>{
  try {
    const { email } = req.body
      const user=await User.findOne({email})
      if(!user){
          res.status(404).json("user not found")
      }
      const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"15m"})
      const transporter=nodemailer.createTransport({
          service:"gmail",
          auth:{
               user: process.env.EMAIL,
          pass: process.env.passwordEmail}
      })
      const mailOptions={
          from:process.env.EMAIL,
          to:email,
          subject:"reset password",
          text:`http://localhost:5000/api/resetpassword/${token}`
          }
          transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                return res.status(500).json({ message: err.message })
              }
              res.status(200).json({ message: "Email sent" })
            })
          } catch (err) {
            res.status(500).json({ message: err.message })
          }
        }

//reset password
exports.resetPassword=async(req,res)=>{
  try {
    const decodedToken=jwt.verify(req.params.token,process.env.JWT_SECRET)
    if(!decodedToken){
      return res.status(404).json({message:"Invalid token"})
    }
    const { email , newPassword } = req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"User not found"})
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json("Password must contain at least one uppercase letter , one lowercase letter and 8 characters.")
  }
    user.password = newPassword
    user.confirmPassword= newPassword
    await user.save()
    res.status(200).send({ message: "Password updated" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// account recovery otp sms

exports.genOTP = async (req, res) => {
  try {
    const { mobile } = req.body
        if (!mobile) {
      return res.status(400).json({ error: "Mobile Number is required" })
    }
    const checkMobile = await User.findOne({ mobile })
    if (!checkMobile) {
      return res.status(404).json({ error: "Mobile number not found" })
    }
    const generatedOTP = otpGenerator.generate(6, { 
      lowerCaseAlphabets: false, 
      upperCaseAlphabets: false, 
      specialChars: false 
    })
    await OTPModel.create({
      mobile,
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
    })
    await client.messages.create({
      body: `Your OTP is: ${generatedOTP}`,
      from: '+44 7575 172583',  
      to: mobile
    })
    res.status(200).json({ message: 'OTP sent successfully' })

  } catch (err) {
    res.status(500).json({ message: err.stack })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body

    if (!mobile || !otp) {
      return res.status(400).json({ error: "Mobile number and OTP are required" })
    }
    const storedOTP = await OTPModel.findOne({ mobile, otp })
    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid OTP" })
    }
    if (storedOTP.expiresAt < new Date()) {
      await OTPModel.deleteOne({ mobile, otp })
      return res.status(400).json({ error: "OTP has expired" })
    }
    await OTPModel.deleteOne({ mobile, otp })
    res.status(200).json({ message: "OTP verified successfully" })
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}