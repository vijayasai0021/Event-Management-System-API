const { error } = require('console');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');


// you have to pass the jwt token of the user to get the user details
const authMiddleware = (req,res,next)=>{
    // Get the Authorization header value
    const authHeader = req.headers['authorization'];
    console.log(authHeader);

    if(!authHeader){
        return res.status(401).json({error:'No token provided'});
    }

    // Authorization header format: Bearer <token>
    const token  = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({error:'Malformed token'});
    }

    try {
        const decoded  =jwt.verify(token, process.env.JWT_SECRET);

        req.user ={
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({error: 'Invalid token'});
    }
};

module.exports = authMiddleware;