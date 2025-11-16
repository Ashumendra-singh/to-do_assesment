
import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './utils/connectDb.ts';
import UserRoutes from './routes/users.routes.ts';
import cookieParser from "cookie-parser";
import cors from "cors";
import { url } from 'inspector';
import TaskRoutes from './routes/task.route.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,  
    }
));

dbConnect();
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1/auth', UserRoutes);
app.use('/api/v1/tasks',  TaskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});