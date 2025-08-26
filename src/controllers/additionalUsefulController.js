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
            //include: {category:true,organizer:true}
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

//get Orgainzer's events

//User profile managment
