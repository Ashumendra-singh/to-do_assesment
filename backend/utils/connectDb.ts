import mongoose from "mongoose";

const dbConnect = async()=>{
    try {
        await mongoose.connect(process.env.MongoDB!);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
    }       
}
export default dbConnect;