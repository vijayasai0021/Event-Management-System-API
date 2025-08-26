const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');

router.get('/',authMiddleware,authorizeRoles('ADMIN'),userController.getAllUsers);
router.put('/profile',authMiddleware,userController.updateProfile);
router.delete('/:id',authMiddleware,authorizeRoles('ADMIN'),userController.deleteUser);

//route of getting data by ID
router.get('/:id', authMiddleware, authorizeRoles('ADMIN'), userController.getUserByID);

//changing password of the user given id
router.put('/:id/reset-password',authMiddleware,userController.resetPassword);
module.exports = router;