import express from "express";
import { getCaptcha, checkCaptcha } from "../controllers/captchaController.js";

const captchaRouter = express.Router();

captchaRouter.get("/", getCaptcha);
captchaRouter.get("/generate", getCaptcha);
captchaRouter.post("/verify", checkCaptcha);

export default captchaRouter;
