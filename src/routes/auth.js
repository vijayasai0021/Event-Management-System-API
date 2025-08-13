const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {authorizeRoleInBody} =require('../middleware/authorizeRoleInBody');


router.get('/',(req,res)=>{
    res.send('Auth route works');
});

//user creation 
router.post('/register',authorizeRoleInBody('USER'),authController.registerUser);
router.post('/event-conductor/create-user',authorizeRoleInBody('EVENT_CONDUCTOR'),authController.createUserByEventConductor);
router.post('/admin/create-user',authorizeRoleInBody('ADMIN'),authController.createUserByAdmin);


router.post('/login',authController.loginUser);
router.post('/change-password',authMiddleware,authController.changePassword);
router.post('/forgot-password',authController.forgotPassword);
router.get('/verify-email',authController.verifyEmail);




module.exports = router;