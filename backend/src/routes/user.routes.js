let express = require('express')
let userController = require('../controllers/user.controller')
let router = express.Router()
let authMiddleware = require('../middlewares/auth.middleware')

router.post('/register',userController.userRegistration)
router.post('/login',userController.userLogIn)
router.post('/logout',userController.userLogOut)
router.get('/profile', authMiddleware, userController.userProfile);




module.exports = router;