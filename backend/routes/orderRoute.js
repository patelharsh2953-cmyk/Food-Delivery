import express from "express";
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, removeOrder, restoreOrder, purgeOrder } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.put("/status", updateStatus);
orderRouter.post("/remove", removeOrder);
orderRouter.delete("/:id", removeOrder);
orderRouter.post("/restore", restoreOrder);
orderRouter.patch("/restore/:id", restoreOrder);
orderRouter.post("/purge", purgeOrder);
orderRouter.delete("/purge/:id", purgeOrder);

export default orderRouter;