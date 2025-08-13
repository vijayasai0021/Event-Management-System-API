const prisma = require('../prismaClient');

exports.getAllUsers = async (req,res)=>{
    const users = await prisma.user.findMany();

    res.status(200).json({
        success:true,
        data: users,
    });
};

exports.updateProfile = async(req,res)=>{
    const userId = req.user.id;
    const {firstname,lastname,phone,avatar} = req.body;
    const updatedUser = await prisma.user.update({
        where: {id: userId},
        data: {firstname,lastname,phone,avatar}
    });
    res.json({success:true,user:updatedUser});
};

exports.deleteUser = async(req,res)=>{
    const userId = parseInt(req.params.id,10); //id from route param

    try{
        await prisma.user.delete({where:{id:userId}});
        res.json({success:true, message:'User deleted succesfully.'});
    }catch(error){
        res.status(404).json({success:false,error:'User not found or could not be deleted.'});
    }
};

//get user by ID
//password reset/change
