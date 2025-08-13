const router = require('express').Router();
const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/',(req,res)=>{
    res.send('events route works');
});

router.post('/',authMiddleware,authorizeRoles('EVENT_CONDUCTOR'),eventController.createEvent);
router.get('/all',authMiddleware,authorizeRoles('ADMIN'),eventController.getAllEvents);
router.get('/:id',eventController.getEventById);
router.get('/name/:name',eventController.getEventByName);
router.put('/:id',authMiddleware,authorizeRoles('ADMIN','EVENT_CONDUCTOR'),eventController.updateEvent);
module.exports = router;