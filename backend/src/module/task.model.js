let mongoose = require('mongoose')

let taskSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    deadline:{
        type:Date,
        required:true
    },
    completed: {
        type: Boolean,
        default: false,
      
    },
    archived: {
        type: Boolean,
        default: false
    },
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true
}
}, { timestamps: true })


let userTasks = mongoose.model('userTasks' , taskSchema)
module.exports = userTasks;