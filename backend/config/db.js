import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Database connected successfully");
        })
        .catch((error) => {
            console.log("Database connection failed", error);
        })
}

export default connectDB;