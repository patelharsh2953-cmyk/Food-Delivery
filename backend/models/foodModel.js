import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    discount: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    status: { type: String, default: "Active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Index for search & soft-delete filtering
foodSchema.index({ isDeleted: 1, category: 1, price: 1 });
foodSchema.index({ name: "text", description: "text" });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;