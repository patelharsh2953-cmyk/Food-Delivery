import express from "express";
import { loginAdmin, registerAdmin, verifyAdmin } from "../controllers/adminController.js";
import adminAuthMiddleware from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Public routes
adminRouter.post("/login",    loginAdmin);
adminRouter.post("/register", registerAdmin);

// Protected route — verify token & return admin info
adminRouter.get("/verify", adminAuthMiddleware, verifyAdmin);

export default adminRouter;
