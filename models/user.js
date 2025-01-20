const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        validate:[validator.isEmail,"Invalid Email"]
    },
    mobile:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    confirmPassword:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'visitor'],
        required: true,
        default: 'user',
    },

},{timestamps:true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt)
    next()
})

userSchema.pre('save', function (next) {
    if (this.isNew) { 
        this.role = 'user'
    }
    next()
})
module.exports = mongoose.model('User', userSchema)