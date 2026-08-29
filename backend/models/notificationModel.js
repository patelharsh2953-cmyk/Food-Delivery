import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "order" }, // order, payment, user, delivery, cancellation
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
