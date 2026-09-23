let jwt = require('jsonwebtoken')


const authMiddleware = (req,res,next)=>{
let token = req.cookies.token;
if(!token){
    return res.status(400).json({
        message:"Unauthorized - Please login first"
    })
}
try {
    let decoded = jwt.verify(token,process.env.jwt_SECRET)
    req.user = decoded;
    next()
} catch (error) {
    return res.status(401).json({
        message:"Invalid or expire token"
    })
    
}
}
module.exports = authMiddleware;