import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import bcrypt from "bcryptjs";
export const signup=async(req,res)=>{
   try {
    const{fullName,username,email,password}=req.body;
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error:"Invalid email format"});
    }
    const existingUser=await User.findOne({username});
    if(existingUser){
        return res.status(400).json({error:"Username is already taken"});
    }

    const existingEmail=await User.findOne({email});
    if(existingEmail){
        return res.status(400).json({error:"email is already taken"});
    }
    if(password.length<6){
        return res.status(400).json({error:"Password must be atleast 6 characters long"});
    }
    const salt=await bcrypt.genSalt(10);
    const passwordHash=await bcrypt.hash(password,salt);
    const newUser=new User({
        fullName,
        username,
        email,
        password:passwordHash
    })

    if(newUser){
        generateTokenAndSetCookie(newUser._id,res)
        await newUser.save();

        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            username:newUser.username,
            email:newUser.email,
            followers:newUser.followers,
            following:newUser.following,
            profileImg:newUser.profileImg,
            coverImg:newUser.coverImg,
        }) 
    }
    else{
         res.status(400).json({error:"Invalid User Data"});
    }
   } catch (error) {
    console.log("Error in signup controller: ",error.message);
    res.status(500).json({error:"Internal server error"});
   }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(user._id, res);

        // Send user data
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller: ",error.message);
        res.status(500).json({error:"Internal server error"});
        
    }
}

export const getMe=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
        
        
    }
}