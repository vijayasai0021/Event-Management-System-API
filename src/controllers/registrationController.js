const prisma = require('../prismaClient');

//create a registration
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
//get all registrations of a user
exports.getAllRegistrationsOfUser = async(req,res)=>{
    const userId = parseInt(req.params.id,10);

    try{
        //check if the user is present or not
        const registrations = await prisma.registration.findMany({
            where:{
                userId
            },
            include:{
                event:true 
            }
        });

        if(registrations.length==0){
            return res.status(404).json({
                success:false,
                message:'there is no user registrations with the userId'
            });
        }

        return res.status(200).json({
            success:true,
            data: registrations
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'server error fetching registrations of the user'
        });
    }
};
//cancel registration
exports.cancelRegistation = async(req,res)=>{
    const userId = parseInt(req.params.userId,10);
    const eventId = parseInt(req.params.eventId,10);

    try{
        const myregistration = await prisma.registration.findFirst({
            where:{userId,eventId},
        });
        if(!myregistration){
            return res.status(404).json({
                success:false,
                message:"you haven't registered yet"
            });
        }

        await prisma.registration.delete({
            where:{
                id:myregistration.id
            },
        });
        return res.status(200).json({
            success:true,
            data:myregistration,
            message:'registration successfully deleted'
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'server error cancelling registration for this event'
        });
    }
};
//get registration by ID
exports.getRegistrationById = async(req,res)=>{
    const registrationId = parseInt(req.params.registrationId,10);

    try{
        const myregistration = await prisma.registration.findUnique({
            where:{
                id:registrationId
            },
        });

        if(!myregistration){
            return res.status(404).json({
                success:false,
                message:'there is no registrations with given id'
            });
        }

        return res.status(200).json({
            success:true,
            dat:myregistration
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'server error fetching details'
        });
    }
};
