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
//update category
//delete category

