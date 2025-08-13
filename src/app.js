const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors()); //enables cors for all routes
app.use(express.json()); //Parse JSON request bodies
app.use(helmet()); //Security headers
app.use(morgan('dev')); //HTTP REQUEST logging in 'dev' format

//Import routes (create these files accordingly)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const categoryRoutes = require('./routes/category');

//  Mount routes with base paths
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/events',eventRoutes);
app.use('/api/registrations',registrationRoutes);
app.use('/api/category',categoryRoutes);


// Health-check endpoint
app.get('/health',(req,res)=>{
    res.status(200).json({status:'OK',timestamp: new Date() });
});

app.use((err,req,res,next)=>{
    console.error(err.stack);
    
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error:{
            message,
            ...(process.env.NODE_ENV === 'development' && {stack:err.stack}),
        },
    });
});

module.exports = app;
