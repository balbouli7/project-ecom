const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer')


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