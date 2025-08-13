const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');

router.get('/',authMiddleware,authorizeRoles('ADMIN'),userController.getAllUsers);
router.put('/profile',authMiddleware,userController.updateProfile);
router.delete('/:id',authMiddleware,authorizeRoles('ADMIN'),userController.deleteUser);

module.exports = router;