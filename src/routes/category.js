const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');
const categoryController = require('../controllers/categoryController');

router.post('/',authMiddleware,authorizeRoles('ADMIN'),categoryController.createCategory);
router.get('/all',authMiddleware,authorizeRoles('ADMIN'),categoryController.getAllCategories);
router.put('/:id/update',authMiddleware,authorizeRoles('ADMIN','EVENT_CONDUCTOR'),categoryController.updateCategory);

module.exports = router;
