import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const isAuth =  (req: Request, res: Response, next: NextFunction) => {
     
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }  
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)  ;
        
        req.userId = (decoded as { userId: string }).userId; 
        next();
    }
    catch (error) {
        return res.status(401).json({error, message: "Unauthorized: Invalid token" });
    }
};

export default isAuth;