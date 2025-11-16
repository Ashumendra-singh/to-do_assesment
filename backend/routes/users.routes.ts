import express from 'express';
import dotenv from 'dotenv';
import {registerUser, loginUser, logoutUser, forgotPassword, resetPassword} from '../controller/user.controller.ts';
import isAuth from '../middlewares/isAuth.middle.ts';

const UserRoutes = express.Router();
dotenv.config();

UserRoutes.post('/register', registerUser);
UserRoutes.post('/login', loginUser);
UserRoutes.post('/logout', isAuth, logoutUser);
UserRoutes.post('/forgot-password', forgotPassword  );
UserRoutes.post('/reset-password', resetPassword );


export default UserRoutes;
