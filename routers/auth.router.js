const Router = require('express').Router
const AuthController = require('../controllers/auth.controller')
const {check} = require('express-validator')
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')


const router = new Router()

router.post('/registration', 
    check('email').isEmail(),
    check('password').isLength({min: 3, max: 32}),
    AuthController.registration
)
router.post('/login',
    [
        check('email', 'Invalid email address').isEmail(),
        check('email', 'Email field is empty').notEmpty(),
        check('password', 'Error Password: Password length must be at least 3 characters and not more than 32').isLength({min: 3, max: 32})
    ],
    AuthController.login
)

router.get('/refresh', AuthController.refresh)

// router.get('/users',
//     roleMiddleware(['user', 'admin']),
//     AuthController.getUsers
// )
router.get('/logout', AuthController.logout)

module.exports = router 