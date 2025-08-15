const { errorMonitor } = require('events');
const prisma = require('../prismaClient');


exports.createCategory = async(req,res)=>{
    const {name,description,color,icon} = req.body;

    if(!name) {
        return res.status(400).json({error:'Category name is required'});
    }

    try{
        const category = await prisma.category.create({
            data:{
                name,
                description: description || null,
                color: color || null,
                icon: icon || null,
                creatorId: req.user.id,
            },
        });
        res.status(201).json({success:true,category});
    }catch(error){
        if(error.code === 'P2002' && error.meta&& error.meta.target.includes('name')){
            return res.status(400).json({error:'Category name already exists'});
        }
        res.status(500).json({error:'Server error creating category'});
    }
};


//get all categories
exports.getAllCategories = async(req,res)=>{
    try{
        const categories = await prisma.category.findMany({
            include:{
                events:true,
            }
        });

        return res.status(200).json({
            success:true,
            data: categories
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Server error fetching categories'
        });
    }
};
//update category
exports.updateCategory = async(req,res)=>{
    const categoryId = parseInt(req.params.id,10);
    const allowedFields = ['name','description','color','icon'];
    try{
        const category = await prisma.category.findUnique({
            where:{
                id:categoryId
            }
        });
        if(!category){
            return res.status(404).json({
                success:false,
                message:'there is no category with the given ID'
            });
        }
        const dataToUpdate = {};
        allowedFields.forEach(field => {
            if(field in req.body){
                dataToUpdate[field]  = req.body[field];
            }
        });
        const updatedCategory = await prisma.category.update({
            where:{id:categoryId},
            data: dataToUpdate,
        })
        return res.status(200).json({
            success:true,
            data: updatedCategory
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"server error updating category"
        });
    }
};

//delete category
exports.deleteCategory = async(req,res)=>{
    const categoryId = parseInt(req.params.id,10);

    try{
        //check if the category exist
        const category = await prisma.category.findUnique({
            where:{
                id:categoryId
            }
        });
        if(!category){
            return res.status(404).json({
                success:false,
                message:'there is no category for the mentioned id'
            });
        }
        //check if the user is authorized to delete the category
        if(req.user.role!=='ADMIN'){
            return res.status(403).json({
                success:false,
                message:'You cannot delete the or alter the category'
            });
        }

        await prisma.category.delete({
            where:{
                id:categoryId
            }
        });
        return res.status(200).json({
            success:true,
            message:'successfuly deleted the category',
            data: category
        });
        
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'server error deleting category'
        });
    }
}

