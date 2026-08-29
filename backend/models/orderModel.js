import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Confirmed" },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: true },
    paymentStatus: { type: String, default: "Paid" },
    paymentMethod: { type: String, default: "UPI" },
    deliveryPerson: { type: String, default: "Unassigned" },
    deliveryStatus: { type: String, default: "Pending" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null }
});

orderSchema.index({ isDeleted: 1, userId: 1, date: -1 });
orderSchema.index({ isDeleted: 1, status: 1 });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;