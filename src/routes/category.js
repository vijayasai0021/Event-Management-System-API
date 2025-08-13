const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');
const categoryController = require('../controllers/categoryController');

router.post('/',authMiddleware,authorizeRoles('ADMIN'),categoryController.createCategory);

module.exports = router;
