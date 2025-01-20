const User = require("../models/user")
const bcrypt=require('bcrypt')
const validator=require('validator')

//get all users 
exports.getAllUsers=async(req,res)=>{
    try {
        const users=await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

//update user for users
exports.updateUser = async (req, res) => {
  try {
      const { role,password,confirmPassword, ...updateFields } = req.body
      const identifier = req.params.identifier
      if (role || password || confirmPassword) {
        return res.status(400).json({ error: 'Role, password, and confirmPassword cannot be updated here.' })
    }
      const isEmail = validator.isEmail(identifier)
      let query;

      if (isEmail) {
      query = { email: identifier }
      } else {
      query = { _id: identifier }
      }

      const updateUser = await User.findOneAndUpdate(query, updateFields, { new: true })
      if (!updateUser) {
          return res.status(404).json({ error: 'User not found' })
      }
      res.status(200).json(updateUser)

  } catch (err) {
      res.status(400).json({ error: err.message })
  }
}



//update password
exports.updatePassword=async(req,res)=>{
  try {
    const{email,currentPassword,newPassword}=req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"User not found"})
    }
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json("Password must contain at least one uppercase letter , one lowercase letter and 8 characters.")
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    return res.status(400).json("Incorrect current password")
  }
    user.password=newPassword
    user.confirmPassword=newPassword
    await user.save()
    return res.status(200).json({ message: "Password updated successfully" })
  } catch (err) {
      res.status(400).json({error:err.message})
  }
}
// add user (only admin)
exports.addUser= async(req,res)=>{try {
      
        const { email, password, fullName, mobile, role ,confirmPassword} = req.body;
        // const hashedPassword = await bcrypt.hash(password, saltRounds)
        if (!email || !password || !confirmPassword || !fullName || !mobile || !role) {
          return res.status(400).json({ error: "All fields are required." })
      }
      if(password!==confirmPassword){
        return res.status(400).json("verify the confirmPassword")
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
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        if (!passwordPattern.test(password)) {
          return res.status(400).json("Password must contain at least one uppercase letter , one lowercase letter and 8 characters.")
      }
        const savedUser = await newUser.save()
        
        return res.status(201).json({ message: "User added successfully", user: savedUser })
        
    } catch (err) {
        res.status(500).json({ error: err.message })
    }}

//search user by anything
exports.searchUser = async (req, res) => {
    const { fullName, email, mobile , id , role } = req.query
  
    let filter = {};
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' }
    if (email) filter.email = { $regex: email, $options: 'i' }
    if (mobile) filter.mobile = mobile
    if (role) filter.role = role
    if (id) filter._id = id
    try {
      const users = await User.find(filter)
      if(users.length===0){return res.status(404).json("user not found")}
      return res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
// delete user
  exports.deleteUser=async(req,res)=>{
    try {
        const deleteUser= await User.findByIdAndDelete(req.params.id)
        if (!deleteUser) {
            return res.status(404).json({ message: "User not found" })
          }
        res.status(200).json({message:"User deleted"})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
  }


  //update role (only for admin)
exports.updateRole=async(req,res)=>{
  try {
    const{email,role}=req.body
    const user=await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"User not found"})
    }
    user.role=role
    await user.save()
    res.status(200).json({ message: "Role updated successfully" , role: user.role })
  } catch (err) {
      res.status(400).json({error:err.message})
  }
}

