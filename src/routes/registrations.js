const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const registrationController = require('../controllers/registrationController');

router.get('/',(req,res)=>{
    res.send('registrations route works');
});

router.post('/:id/register',authMiddleware,registrationController.registerForEvent);
module.exports = router;