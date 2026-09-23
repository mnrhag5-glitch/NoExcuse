let userTasks = require('../module/task.model')

const createTasks = async (req,res)=>{
    let {title,description,deadline,} = req.body;



    let currentTime = new Date();
    let deadlineTime = new Date(deadline);

    
    console.log("CURRENT:", currentTime)
console.log("DEADLINE:", deadlineTime)
console.log("DIFFERENCE:", deadlineTime - currentTime)

    if (Number.isNaN(deadlineTime.getTime()) || deadlineTime <= currentTime) {
        return res.status(400).json({
            message: "Deadline must be in the future"
        })
    }


    let task = await userTasks.create({
        title,
        description,
        deadline,
        user:req.user._id
    })
    return res.status(201).json({
        message:"Task created Successfully",
        task
    })
}


const getTasks = async (req,res)=>{
    let tasks = await userTasks.find({
        user : req.user._id,
        archived: false
    }).sort({ createdAt: -1 })

    return res.status(200).json({
        message:"Tasks fetched successfully",
        tasks
    })
}

const getTaskHistory = async (req, res) => {
    const tasks = await userTasks.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json({ message: "Task history fetched successfully", tasks })
}

const archiveTask = async (req, res) => {
    const task = await userTasks.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { archived: true },
        { new: true }
    )
    if (!task) return res.status(404).json({ message: "Task not found" })
    return res.status(200).json({ message: "Task moved to history", task })
}

const deleteAllHistory = async (req, res) => {
    await userTasks.deleteMany({ user: req.user._id })
    return res.status(200).json({ message: "All task history deleted" })
}

const updateTask = async (req, res) => {
    const { title, description, deadline } = req.body
    const task = await userTasks.findOne({ _id: req.params.id, user: req.user._id })

    if (!task) {
        return res.status(404).json({ message: "Task not found" })
    }

    const deadlineTime = new Date(deadline)
    const currentTime = new Date()
    if (!title || !description || Number.isNaN(deadlineTime.getTime()) || deadlineTime <= currentTime) {
        return res.status(400).json({ message: "Please provide valid task details and a future deadline" })
    }
    task.title = title
    task.description = description
    task.deadline = deadlineTime
    await task.save()
    return res.status(200).json({ message: "Task updated successfully", task })
}


const completeTask = async (req, res) => {

    let task = await userTasks.findById(req.params.id)

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        })
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You cannot complete this task"
        })
    }

    if (new Date() > task.deadline) {
        return res.status(409).json({
            message: "Deadline passed. This task is missed and cannot be completed now.",
            status: "missed"
        })
    }

    task.completed = true

    await task.save()

    return res.status(200).json({
        message: "Task completed successfully",
        task
    })
}


const deleteTask = async (req, res) => {

    let task = await userTasks.findById(req.params.id)

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        })
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You cannot delete this task"
        })
    }

    await userTasks.findByIdAndDelete(req.params.id)

    return res.status(200).json({
        message: "Task deleted successfully"
    })
}


const checkTaskStatus = async (req, res) => {

    let task = await userTasks.findById(req.params.id)

      console.log("TASK ID:", req.params.id)
    console.log("TASK:", task)
    console.log("USER:", req.user._id)

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        })
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You cannot access this task"
        })
    }

    let currentTime = new Date()

    if (task.completed) {
        return res.status(200).json({
            message: "🔥 Task completed! Good job!",
            status: "completed"
        })
    }

    if (currentTime > task.deadline) {
        return res.status(200).json({
            message: "💀 You missed the deadline! Yuo Looser",
            status: "missed"
        })
    }

    return res.status(200).json({
        message: "⏳ Task is still pending",
        status: "pending"
    })
}



module.exports = {createTasks,getTasks,getTaskHistory,archiveTask,deleteAllHistory,updateTask,completeTask,deleteTask,checkTaskStatus};
