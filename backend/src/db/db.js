let mongoose = require('mongoose');

function connecDB(){
    mongoose.connect('mongodb://127.0.0.1:27017/NoExcuse')
    .then(()=>{
          console.log('MongoDB connected Successfully✅✅')
    }).catch((err)=>{
   console.log('MongoDB Connection Failed❌❌' ,err);
    })

}



 module.exports = connecDB;