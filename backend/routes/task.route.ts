import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controller/task.controller.ts";
import isAuth from "../middlewares/isAuth.middle.ts";

const TaskRoutes = express.Router();

TaskRoutes.post('/todos', isAuth, createTask);  
TaskRoutes.get('/todos', isAuth, getTasks);
TaskRoutes.put('/todos/:id', isAuth, updateTask);
TaskRoutes.delete('/todos/:id', isAuth, deleteTask);

export default TaskRoutes;