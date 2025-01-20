const express =require("express")

const{userRegister, userLogin}=require('../controllers/register&login')
const { getAllUsers, updateUser, addUser, searchUser, deleteUser, updatePassword, updateRole,  } = require("../controllers/user&admin")
const { forgetPassword, resetPassword } = require("../controllers/resetPassword")

const router=express.Router()

router.post('/register',userRegister)
router.post('/login',userLogin)
router.get('/users',getAllUsers)
router.put('/update_user/:identifier', updateUser)
router.put('/update_password',updatePassword)
router.put('/update_role',updateRole)
router.post('/add_user',addUser)
router.get('/search', searchUser)
router.delete('/delete/:id',deleteUser)
router.post('/forgetPassword',forgetPassword)
router.post('/resetpassword/:token',resetPassword)
module.exports=router