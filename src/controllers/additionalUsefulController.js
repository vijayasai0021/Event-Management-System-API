const prisma = require('../prismaClient');
const { parse } = require("path");
const { title } = require("process");
//Search events - extended search
//for filtering events for users
exports.filterEvents=async (req, res)=>{
    try{
        const{
            query,
            city,
            category,
            from,
            to,
            feeMin,
            feeMax,
            maxAttendees,
            registrationDeadline,
            organizerId,
            isPrivate,
            sortedBy,
            tags
        }=req.query;

        const providedFilters =[
            query,
            city,
            category,
            from,
            to,
            feeMin,
            feeMax,
            maxAttendees,
            registrationDeadline,
            organizerId,
            isPrivate,
            tags
        ];

        const filterCount = providedFilters.filter(val=>{
            return val!==undefined && val!=='' && val!==null;
        }).length;
        if(filterCount===0){
            return res.status(400).json({
                success:false,
                message:"Provide at least one search filter."
            });
        }

        const filters = {};
        
        if(query){
            filters.OR = [
                {title:{contains: query}},
                {description:{contains:query}}
            ];
        }

        if(city) filters.city = city;
        if(category) filters.category = {name: category};
        if(organizerId) filters.organizerId = parseInt(organizerId,10);
        if(maxAttendees) filters.maxAttendees = {gte: parseInt(maxAttendees,10)};
        if(registrationDeadline) filters.registrationDeadline = {gte:new Date(registrationDeadline)};

        //Boolean filter for public/private
        if(typeof isPrivate!== "undefined"){
            filters.isPrivate = isPrivate ==="true";
        }

        // Date range for events
        if(from&&to){
            filters.startDate = {gte:new Date(from),lte: new Date(to)};
        }else if(from){
            filters.startDate = {gte: new Date(from)};
        }else if(to){
            filters.startDate = {lte: new Date(to)};
        }

        //Registration fee range
        if(feeMin|| feeMax){
            filters.registrationFee = {};
            if(feeMin) filters.registrationFee.gte = parseFloat(feeMin);
            if(feeMax) filters.registrationFee.lte = parseFloat(feeMax);
        }

        //Tags filtering (Assuming tags are stored as comma-separated or Json)
        if(tags){
            const tagList = tags.split(',').map(tag => tag.trim());
            filters.tags = {contains:tagList[0]}; 
        }

        //sorting
        let orderBy = [];
        if(sortedBy){
            orderBy.push({[sortedBy]:'asc'});
        }else{
            orderBy.push({startDate:'asc'});
        }
        console.log('Filters',filters);
        const events  = await prisma.event.findMany({
            where: filters,
            orderBy,
            include: {category:true,organizer:true}
        });
        return res.status(200).json({
            success:true,
            data: events
        });

    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message: "Server error filtering events"
        });
    }
};
//Get upcoming events
exports.getUpcomingEvents = async(req,res)=>{
    try{
        const today = new Date();

        const events = await prisma.event.findMany({
            where:{
                startDate :{
                    gte: today //events starting today or later
                }
            },
            orderBy:{
                startDate: 'asc'
            },
            include:{
                category:true,
                organizer:true
            }
        });
        if(!events) return res.status(400).json({success:false,message:'there are no upcoming events'});
        return res.status(200).json({
            success:true,
            data:events
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:true,
            message:'server error fetching upcoming events'
        });
    }
};

//get Orgainzer's events
exports.getOrgainzerEvents = async(req,res)=>{
    const organizerId = parseInt(req.params.id,10);
    try{
        if(!organizerId) return res.status(400).json({
            success:false,
            message:'organizer id required',
        });

        const userDetails = await prisma.user.findUnique({
            where:{id:organizerId}
        });
        if(userDetails.role!="EVENT_CONDUCTOR"){
            return res.status(400).json({
                success:false,
                message:"given user id doesn't match with any organizer"
            });
        }

        const events = await prisma.event.findMany({
            where:{organizerId},
            orderBy:{startDate:'asc'},
            include:{category:true}
        });

        if(!events){
            return res.status(404).json({
                success:false,
                message:'there are no events with the orgainzer id'
            });
        }
        return res.status(200).json({
            success:true,
            data:events
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'server error fetching events'
        });
    }
};
//User profile managment
exports.getUserProfile = async(req,res)=>{
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({
                success:false,
                message:"user ID required"
            });
        }
        const userId = parseInt(id,10);
        if(isNaN(userId)){
            return res.status(400).json({
                success:false,
                message:"invalid user ID"
            });
        }
        const user  = await prisma.user.findUnique({
            where:{
                id:userId
            },
            select:{
                id:true,
                firstname:true,
                email:true,
                role:true,
                createdAt:true,
                updatedAt:true
            }
        });
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            });
        }
        return res.status(200).json({
            success:true,
            data:user
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"server error fetching user"
        });
    }
};
