let express = require('express')
let taskcontroller = require('../module/task.model')
const { createTasks, getTasks,getTaskHistory,archiveTask,deleteAllHistory,updateTask,completeTask,deleteTask,checkTaskStatus } = require('../controllers/task.controller')

let authMiddleware = require('../middlewares/auth.middleware')


let routes = express.Router()
routes.post('/createTasks',authMiddleware,createTasks )
routes.get('/getTasks', authMiddleware, getTasks)
routes.get('/history', authMiddleware, getTaskHistory)
routes.put('/updateTask/:id', authMiddleware, updateTask)
routes.put('/archiveTask/:id', authMiddleware, archiveTask)
routes.put('/completeTask/:id', authMiddleware, completeTask)
routes.delete('/deleteTask/:id', authMiddleware, deleteTask)
routes.delete('/history', authMiddleware, deleteAllHistory)
routes.get('/checkTaskStatus/:id', authMiddleware, checkTaskStatus)


module.exports = routes;