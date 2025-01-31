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
        validate:[validator.isEmail,"Invalid Email"],
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
        trim:true

    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'visitor'],
        required: true,
        default: 'user',
    },
    address:{
        type: String,
        required:true
    },
    profileImage:{
        type:String,
        default:'/uploads/default-profile.png'
    },
    isVerified: { type: Boolean,
         default: false }

},{timestamps:true})
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.pre('save', function (next) {
    if (this.isNew) { 
        this.role = 'user'
    }
    if(this.isNew){
        this.isVerified='false'
    }
    next()
})
module.exports = mongoose.model('User', userSchema)