import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String, default: "" },
    status: { type: String, default: "Active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

categorySchema.index({ isDeleted: 1, name: 1 });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
