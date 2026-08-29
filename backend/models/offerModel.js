import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    expiryDate: { type: String, required: true },
    status: { type: String, default: "Active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

offerSchema.index({ isDeleted: 1, code: 1, status: 1 });

const offerModel = mongoose.models.offer || mongoose.model("offer", offerSchema);

export default offerModel;
