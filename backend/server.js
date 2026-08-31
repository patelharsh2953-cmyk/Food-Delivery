import 'dotenv/config';
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import offerRouter from "./routes/offerRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import contactRouter from "./routes/contactRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import adminRouter from "./routes/adminRoute.js";
import captchaRouter from "./routes/captchaRoute.js";
import reportRouter from "./routes/reportRoute.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// db connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/offer", offerRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/contact", contactRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth/captcha", captchaRouter);
app.use("/api/captcha", captchaRouter);
app.use("/api/reports", reportRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "FoodDel Enterprise API is running",
        version: "2.0.0"
    });
});

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});

export default app;
