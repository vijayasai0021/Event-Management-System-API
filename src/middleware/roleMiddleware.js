function authorizeRoles(...allowedRoles){
    return (req,res,next)=>{
        const userRole = req.user.role;
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                success : false, message: 'Forbidden: Insufficient permissions'
            });
        }next();
    };
}

module.exports = {authorizeRoles};