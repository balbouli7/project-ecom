const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

//user login
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
        const newUser = new User({
            email,
            password, 
            confirmPassword,
            fullName,
            mobile,
            role
        })
        const emailExists = await User.findOne({ email })
        if (emailExists){
          return res.status(400).json("Email already exists")
        }
        const mobileExists = await User.findOne({ mobile })
        if (mobileExists){
          return res.status(400).json("Mobile number already exists")
        }
        if(!password===confirmPassword){
          return res.status(400).json("verify the confirmPassword")
        }
        const savedUser = await newUser.save()
        
        res.status(201).json({ message: "User registered successfully", user: savedUser })
        
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

//user login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" })
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format." })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "wrong" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
   
      return res.status(400).json({ error: "password wrong" })
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
        role: user.role,
      },
    })
    
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
