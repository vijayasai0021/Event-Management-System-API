const { stat } = require('fs');
const prisma = require('../prismaClient');
const { title } = require('process');

exports.createEvent = async(req,res)=>{
    const{ title,description,shortDescription,image,venue,address,city,state,zipCode,startDate,endDate,registrationDeadline,maxAttendees,registrationFee,currency,isPrivate,categoryId} = req.body;
    if(!title || !startDate || !endDate||!venue||!address||!city||!categoryId ){
        return res.status(400).json({success: false, message: 'missing fields are required'});
    }

    try{
        const newEvent = await prisma.event.create({
            data:{
                title,
                description,
                shortDescription,
                image,
                venue,
                address,
                city,
                state,
                zipCode,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                registrationDeadline: registrationDeadline ? new Date(registrationDeadline):null,
                maxAttendees,
                registrationFee,
                currency,
                isPrivate,
                organizerId: req.user.id, //Taken from logged-in user
                categoryId,
            },
        });

        return res.status(201).json({success:true,event: newEvent});
    }catch(error){
        
        return res.status(500).json({success: false,error: error.message});
    }
};

exports.getAllEvents = async(req,res)=>{
    try{
        const eventsAll = await prisma.event.findMany();

        if(eventsAll.length==0){
            res.status(401).json({message:'there are no events'});
        }

        res.status(200).json({success:true,data:eventsAll});
    }
    catch(error){
        console.log(error);
        res.status(500).json({success:false,message:'Server error fethcing events'});
    }
}

exports.getEventById = async(req,res)=>{
    const eventId = parseInt(req.params.id,10);

    try{
        const event = await prisma.event.findUnique({where:{id:eventId},});

        if(!event){
            return res.status(404).json({success:false,message:'Event not found'});
        }
        res.status(200).json({success:true,data:event});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,message:'server error fetching event'});
    }
};

exports.getEventByName = async(req,res)=>{
    const{searchName} = req.params; //coming from url

    try{
        const event = await prisma.event.findFirst({
            where:{
                title:{
                    contains: searchName,
                }
            },
        });

        if(!event){
            return res.status(404).json({success:false,message:'Event not found'});
        }
        res.status(200).json({success:true,data:event});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,message:'server error fetching event'});
    }
};

exports.updateEvent = async(req,res)=>{
    const eventId = parseInt(req.params.id,10);

    try{
        const event = await prisma.event.findUnique({
            where: {
                id:eventId
            }
        });

        if(!event){
            return res.status(404).json({success:false,message:'Event not found'});
        }

        //authorization: allow ADMIN or event organizer
        if(req.user.role!=='ADMIN'&& req.user.id !==event.organizerId){
            return res.status(403).json({
                success:false,
                message:'Forbidden: You cannot update this event'
            });
        }

        //perform update
        const updatedEvent = await prisma.event.update({
            where:{id:eventId},
            data: req.body
        });

        return res.status(200).json({
            success:true,
            message:'Event successfully updated',
            data: updatedEvent
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:'Server error updating event'
        });
    }
};


//register attendess to an event
exports.registerForEvent = async(req,res)=>{
    //params
    const eventId = parseInt(req.params.id,10);
    const userId = req.user.id;

    try{
        //check if the event exists
        const event = await prisma.event.findUnique({
            where:{id:eventId},
            include:{registrations:true}
        });

        if(!event){
            return res.status(404).json({success:false,message:"event doesn't exist"});
        }

        //check registration deadline
        if(event.registrationDeadline && new Date() > event.registrationDeadline){
            return res.status(404).json({success:false,message:'Registration deadline has passed'});
        }

        //check if event is full
        if(event.maxAttendees && Array.isArray(event.registrations) && event.registrations.length>=event.maxAttendees){
            return res.status(404).json({success:false,message:'Event is full'});
        }

        //check if the user is already registered
        const existingRegistration = await prisma.registration.findFirst({
            where:{
                eventId,userId
            }
        });

        if(existingRegistration){
            return res.status(400).json({
                success:false,
                message:'You are already registered for this event'
            });
        }

        //creating registration
        const registration = await prisma.registration.create({
            data:{
                eventId,
                userId,
                registeredAt: new Date(),
            }
        });

        return res.status(200).json({
            success:true,
            message:'Successfully registered for the event',
            data:registration
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Server error registering for Event'
        });
    }
};
//get all registrations for an event
exports.getRegistrationsForEvent = async(req,res)=>{
    const eventId  = parseInt(req.params.id,10);


    try{
        //check if the event exist
        const event =await prisma.event.findUnique({
            where:{id:eventId}
        });

        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event Not Found'
            });
        }

        //get all registrations for an event
        const registrations = await prisma.registration.findMany({
            where:{eventId},
            include:{
                user:true //include user info if relation exists
            }
        });

        return res.status(200).json({
            success:true,
            data: registrations
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching registrations'
        });
    }
};

//cancel or soft delete an event
exports.deleteEvent = async(req,res)=>{
    const eventId = parseInt(req.params.id,10);

    try{
        //check if the event is present or not
        const event = await prisma.event.findUnique({
            where:{id:eventId}
        });

        if(!event){
            return res.status(404).json({
                success:false,
                message:'Event Not Found'
            });
        }

        //Authorization check: ADMIN or EVENT_CONDUCTOR
        if(req.user.role !== 'ADMIN' && req.user.id!==event.organizerId){
            return res.status(403).json({
                success:false,
                message:"Forbidden: You cannot delete this event"
            });
        }

        await prisma.event.delete({
            where:{id:eventId}
        });

        return res.status(200).json({
            success:false,
            message:'Event deleted successfully',
            data: event
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Server error deleting Event'
        })
    }
};