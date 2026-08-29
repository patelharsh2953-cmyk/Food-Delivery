import express from "express";
import { listDeliveries, assignDeliveryPerson, updateDeliveryStatus } from "../controllers/deliveryController.js";

const deliveryRouter = express.Router();

deliveryRouter.get("/list", listDeliveries);
deliveryRouter.post("/assign", assignDeliveryPerson);
deliveryRouter.post("/update", updateDeliveryStatus);

export default deliveryRouter;
