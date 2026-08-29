import express from "express";
import { addOffer, listOffer, updateOffer, removeOffer, restoreOffer, purgeOffer, applyOffer } from "../controllers/offerController.js";
import { validateCoupon } from "../middleware/validators.js";

const offerRouter = express.Router();

offerRouter.post("/add", validateCoupon, addOffer);
offerRouter.get("/list", listOffer);
offerRouter.post("/update", updateOffer);
offerRouter.put("/:id", updateOffer);
offerRouter.post("/remove", removeOffer);
offerRouter.delete("/:id", removeOffer);
offerRouter.post("/restore", restoreOffer);
offerRouter.patch("/restore/:id", restoreOffer);
offerRouter.post("/purge", purgeOffer);
offerRouter.delete("/purge/:id", purgeOffer);
offerRouter.post("/apply", applyOffer);

export default offerRouter;
