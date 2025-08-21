const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles} = require('../middleware/roleMiddleware');
const registrationController = require('../controllers/registrationController');

router.get('/',(req,res)=>{
    res.send('registrations route works');
});

router.post('/:id/register',authMiddleware,registrationController.registerForEvent);
router.get('/:id/allRegistrations',authMiddleware,authorizeRoles('ADMIN'),registrationController.getAllRegistrationsOfUser);
router.delete('/:eventId/registration/:userId',registrationController.cancelRegistation);
router.get('/:registrationId',registrationController.getRegistrationById);
module.exports = router;