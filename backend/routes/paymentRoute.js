import express from "express";
import { listPayments, updatePaymentStatus } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.get("/list", listPayments);
paymentRouter.post("/status", updatePaymentStatus);

export default paymentRouter;
