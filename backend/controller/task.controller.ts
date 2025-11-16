import Task from "../models/task.modal.ts";
import User from "../models/user.models.ts";
import type { Request, Response } from "express";

type TaskIdParam = { id: string };

const createTask = async (req: Request, res: Response) => {
    try {
        console.log("Create Task request body:", req.body);
        const userId = req.userId;
        const { title, description } = req.body;
        const newTask = new Task({ title, description, userId });
       
        await newTask.save();

        res.status(201).json({ task: newTask });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getTasks = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const tasks = await Task.find({ userId });
        // console.log("Tasks found:", tasks);
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateTask = async (req: Request<TaskIdParam>, res: Response) => {
    try {
        const { id } = req.params;      
        const { title, description, completed } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteTask = async (req: Request<TaskIdParam>, res: Response) => {
    try {
        const { id } = req.params;
        console.log("Deleting task with id:", req.params);
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export { createTask, getTasks, updateTask, deleteTask };

