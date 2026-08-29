import express from "express";
import { loginUser, registerUser, verifyUser, listUsers, updateUser, removeUser, restoreUser, purgeUser } from "../controllers/userController.js";
import { validateUserRegistration, validateUserLogin } from "../middleware/validators.js";

const userRouter = express.Router();

userRouter.post("/register", validateUserRegistration, registerUser);
userRouter.post("/login", validateUserLogin, loginUser);
userRouter.get("/verify", verifyUser);
userRouter.get("/list", listUsers);
userRouter.post("/update", updateUser);
userRouter.put("/:id", updateUser);
userRouter.post("/remove", removeUser);
userRouter.delete("/:id", removeUser);
userRouter.post("/restore", restoreUser);
userRouter.patch("/restore/:id", restoreUser);
userRouter.post("/purge", purgeUser);
userRouter.delete("/purge/:id", purgeUser);

export default userRouter;