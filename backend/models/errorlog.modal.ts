import { error } from "console";
import e from "express";
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    errorMessage: { type: String, required: true },
    stackTrace: { type: String },
    occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });   

const ErrorLog = mongoose.model("ErrorLog", taskSchema);
export default ErrorLog;
