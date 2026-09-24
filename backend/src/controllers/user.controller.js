let userModel = require('../module/user.model')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')

const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
}



const userRegistration = async(req,res)=>{
let {fullName , email , password} = req.body;
let userAlreadyExist = await userModel.findOne({email})
if(userAlreadyExist){
    return res.status(400).json({
message:"User Already Exist"
    })
}

let hashedPassword = await bcrypt.hash(password, 10) 
    // Store hash in your password DB.
    let user = await userModel.create({
        fullName,
        email,
        password:hashedPassword
    })
    let token = jwt.sign({_id:user._id},process.env.jwt_SECRET)
    res.cookie('token' , token, cookieOptions)
    res.status(201).json({
        message:'User register successfull..',
        user:{
         _id:user._id,
         email:user.email,
         fullName:user.fullName
        }
    })



}

const userLogIn = async(req,res)=>{
    let{email,password} = req.body;
    let user  = await userModel.findOne({email})
    if(!user){
        return res.status(401).json({
            message:"User Not Found"
        })
    }
    
    let isPasswordValid = await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
     return res.status(400).json({
        message:'user not valid bitch'
     })
        }
    let token = jwt.sign({
        _id:user._id
    },process.env.jwt_SECRET)

    res.cookie('token' ,token, cookieOptions)
    res.status(200).json({
        message:"user Login Successfull"
    ,user:{
        _id:user._id,
        email:user.email,
        fullName:user.fullName}
 } )
}

const userLogOut = async(req,res)=>{
    res.clearCookie('token', cookieOptions)
    res.status(200).json({
        message:"user LogOut successfull"
    })
}


const userProfile = async (req,res)=>{
    const user = await userModel.findById(req.user._id).select('-password')
    return res.status(200).json({
        message:"Profile Accessed Successfully",
        user
    })
}

module.exports = {
    userRegistration,
    userLogIn,
    userLogOut,
    userProfile,
}

