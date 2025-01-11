import express from 'express';
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app=express();
const PORT=process.env.PORT || 5000;

app.use(express.json());  //middleware to parse json data

app.use(cookieParser());

app.use("/api/auth",authRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})