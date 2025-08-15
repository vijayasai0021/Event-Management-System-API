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
//cancel registration
//get registration by ID
