import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ["New", "Read", "Resolved"], 
        default: "New" 
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

contactSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema);

export default contactModel;
