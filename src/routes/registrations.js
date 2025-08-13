const router = require('express').Router();

router.get('/',(req,res)=>{
    res.send('registrations route works');
});

module.exports = router;