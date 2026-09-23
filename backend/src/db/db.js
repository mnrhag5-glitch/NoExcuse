let mongoose = require('mongoose');

function connecDB(){
    mongoose.connect(process.env.mongoDB_URI)
    .then(()=>{
          console.log('MongoDB connected Successfully✅✅')
    }).catch((err)=>{
   console.log('MongoDB Connection Failed❌❌' ,err);
    })

}



 module.exports = connecDB;