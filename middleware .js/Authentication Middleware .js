const jwt = require('jsonwebtoken');
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  
  console.log('Received Token:', token); 
  if (!token) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    const user = await User.findById(decoded.id); 
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticate };
