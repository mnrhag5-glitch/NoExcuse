let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})


let userModel = mongoose.model("user" , userSchema)

module.exports = userModel;