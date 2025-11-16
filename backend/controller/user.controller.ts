import User from "../models/user.models.ts";
import sendOtp from "../utils/sendOtp.ts";

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body; 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }   
        const newUser = new User({ username, email, password });
        console.log(newUser);
        await newUser.save();
        console.log("User registered:", newUser);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // console.error("Error registering user:", error);
        res.status(500).json({msg: (error as Error).message, message: "Server error" });
    }
};

const loginUser = async (req: Request, res: Response) => {
    
    try {
        console.log("Login request body:", req.body);
        const { email, password } = req.body;
        console.log("Email:", email);
        const user = await User.findOne({ email });
        console.log("Found user:", user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });  
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
        res.status(200).json({ message: "Login successful", userName: user.username });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }       
};

const logoutUser = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};


const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        await user.save();
        sendOtp(email, otp);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }   
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        user.password = newPassword;
        user.otp = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};



export { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };  