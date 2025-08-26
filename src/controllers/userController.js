const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const cyrpto = require('crypto');

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
exports.getUserByID = async(req, res)=>{
    const userId = parseInt(req.params.id, 10);
    try{
        const userIdData = await prisma.user.findUnique({
            where:{
                id: userId,
            },
        })

        //user not found
        if(!userIdData){
            res.status(404).json({success:false, error: 'Invalid user ID'});
        }

        res.status(200).json({success: true, data: userIdData});
    }catch(error){
        res.status(500).json({success:false, error:'server error'});
    }
}


//password reset/change

