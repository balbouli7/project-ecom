const express =require("express")

const{userRegister, userLogin, verifyUser}=require('../controllers/register&login')
const { getAllUsers, updateUser, addUser, searchUser, deleteUser, updatePassword, updateRole, uploadMiddleware, imageUpload,  } = require("../controllers/user&admin")
const { forgetPassword, resetPassword, genOTP, verifyOTP } = require("../controllers/resetPassword")

const router=express.Router()

router.post('/register',userRegister,uploadMiddleware,imageUpload)
router.post('/login',userLogin)
router.post('/verify',verifyUser)
router.get('/users',getAllUsers)
router.put('/update_user/:identifier', updateUser)
router.put('/update_password',updatePassword)
router.put('/update_role',updateRole)
router.post('/add_user',addUser)
router.get('/search', searchUser)
router.delete('/delete/:id',deleteUser)
router.post('/forgetPassword',forgetPassword)
router.post('/resetpassword/:token',resetPassword)
router.post('/OTP',genOTP)
router.post('/verify_otp',verifyOTP)
router.post('/uploadImage/:id',uploadMiddleware,imageUpload)
module.exports=router