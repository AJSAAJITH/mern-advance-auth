const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
        
    },
    name:{
        type:String,
        required:true
    },
    lastLogin:{
        type:Date,
        default:Date.now
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken:String,
    resetPasswordExpiredAt:Date,
    verificationToken:String,
    verificationTokenExpireAt:Date
},{timestamps:true});


// password hashing
userSchema.pre('save',async function (next) {
if(!this.isModified('password')){
    next();
}
this.password = await bcrypt.hash(this.password, 10);    
})


const model = mongoose.model('User',userSchema);
module.exports = model;