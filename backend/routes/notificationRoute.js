import express from "express";
import { listNotifications, markAsRead, clearNotifications, addNotification } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/list", listNotifications);
notificationRouter.post("/read", markAsRead);
notificationRouter.post("/clear", clearNotifications);
notificationRouter.post("/add", addNotification);

export default notificationRouter;
