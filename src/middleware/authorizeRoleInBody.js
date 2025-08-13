const { error } = require("console");

function authorizeRoleInBody(...allowedRoles){
    return (req,res,next)=>{
        const role = req.body.role;
        if(!role){
            return res.status(400).json({error:'Role is required in the request body'});
        }
        const upperRole = role.toUpperCase();
        if(!allowedRoles.includes(upperRole)){
            return res.status(403).json({error:'Role not allowed to access this route'});
        }
        next();
    };
}

module.exports = {authorizeRoleInBody};