const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { error } = require('console');
const crypto = require('crypto');
const prisma = require('../prismaClient');

// Add your email sending library (like nodemailer) setup here

// user registering route
exports.registerUser = async (req,res)=>{
    const {email,password,firstname,lastname,role} = req.body;


    try{
        //Hash Password with bcrypt FIRST!
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data:{
                email,
                password: hashedPassword,
                firstname,
                lastname,
                role,
            },
        });

        res.status(201).json({success:true,message:'User registered',user});
    }catch(error){
        if(error.code === 'P2002' && error.meta && error.meta.target.includes('email')){
            //prisma unique constraint failed on email
            return res.status(400).json({success:false, error:'Email already in use'});
        }
        console.error(error);
        res.status(500).json({error:'Server error registering user'});
    }
};

//event_conductor route 
exports.createUserByEventConductor = async(req,res)=>{
    const {email,password,firstname,lastname,role} = req.body;
  // Allowed roles for this route — customize as needed
  const allowedRoles = ['EVENT_CONDUCTOR', 'USER'];  // e.g., event conductors can create other conductors or users
  const userRole = role ? role.toUpperCase() : 'USER';

    if (!allowedRoles.includes(userRole)) {   
        return res.status(400).json({ error: "Invalid role" });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstname,
                lastname,
                role: userRole,
            },
        });

        res.status(201).json({ message: "User created by event conductor", user });
    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(400).json({ error: "Email already in use" });
        }
        res.status(500).json({ error: "Server error" });
    }
};

// admin route for registration
exports.createUserByAdmin =async(req,res)=>{
    const {email,password,firstname,lastname,role} = req.body;

    const allowedRoles = ['ADMIN', 'EVENT_CONDUCTOR', 'USER'];
    const userRole = role ? role.toUpperCase() : 'USER';

    if (!allowedRoles.includes(userRole)) {   
        return res.status(400).json({ error: "Invalid role" });
    }

    try{
        const hashedPassword = await bcrypt.hash(password,10);

        const user =await prisma.user.create({
            data:{
                email,
                password: hashedPassword,
                firstname,
                lastname,
                role:userRole,
            },
        });
        res.status(201).json({message:"user created by admin", user});
    }catch(error){
        if(error.code==='P2002'&& error.meta.target.includes('email')) {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Server error" });
    }
}

//login controller function

exports.loginUser = async (req,res)=>{
    const {email,password}  =req.body;
    const user = await prisma.user.findUnique({where: {email}});

    if(!user){
        return res.status(401).json({error:'user email does not exist'});
    }

    

    const isValid = await bcrypt.compare(password,user.password);

    if(!isValid){
        return res.status(401).json({error:'Invalid credentials'});
    }

    // Generate JWT token
    const token = jwt.sign({id:user.id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d',});

    // exclude the password from returned user obj
    const {password: _, ...userData} = user;

    res.json({message:'Login successful',token,user: userData});
}

exports.changePassword = async (req,res) => {
    const {currentPassword,newPassword} = req.body;
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({where:{id:userId}});
    if(!user) return res.status(404).json({error:'User not found'});

    const isValid = await bcrypt.compare(currentPassword,user.password);

    if(!isValid){
        return res.status(401).json({error:'Current password is incorrect'});
    }


    const hashedPassword = await bcrypt.hash(newPassword,10);
    await prisma.user.update({
        where: {id:userId},
        data: {password: hashedPassword}
    });

    res.json({success : true,message: 'Password changed successfully'});
};


// forgot password
exports.forgotPassword = async(req,res)=>{
    const {email} = req.body;

    // check if the user exists
    const user = await prisma.user.findUnique({where:{email}});
    if(!user){
        return res.status(404).json({error:'User with this email not found'});
    }

    // create a reset token -secure &random
    const resetToken = crypto.randomBytes(32).toString('hex');

    // hash the token before saving
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //save hashed token and expiry time onuser record
    const expiry = Date.now()+3600000; //token valid for 1 hour

    await prisma.user.update({
        where: {id:user.id},
        data:{
            passwordResetToken: hashedToken,
            passwordResetExpires: new Date(expiry),
        }
    });

    //send email with reset token (plain not hashed)
      // e.g., `https://yourfrontend.com/reset-password?token=${resetToken}`
  // Use nodemailer or another mail service here

  res.json({success:true,message:'Password reset link sent to email'});
};

exports.verifyEmail = async (req,res) => {
    const {token} = req.query;

    const user = await prisma.user.findFirst({where:{verificationToken: token}});
    if(!user) return res.status(400).json({success:false, message: 'Invalid or expired token'});

    await prisma.user.update({
        where:{id:user.id},
        data: {isVerified: true, verificationToken: null }
    });
    res.json({success:true, message: 'Email verified successfully!'});
};

