import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    phone: { type: String, default: "" },
    status: { type: String, default: "Active" },
    role: { type: String, default: "user" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
}, { minimize: false });

userSchema.index({ isDeleted: 1, email: 1 });
userSchema.index({ name: "text", email: "text" });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
