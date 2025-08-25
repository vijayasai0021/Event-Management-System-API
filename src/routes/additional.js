const router  = require('express').Router();
const additionalUsefulController = require('../controllers/additionalUsefulController');
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');

router.get('/filters', additionalUsefulController.filterEvents);


module.exports = router;