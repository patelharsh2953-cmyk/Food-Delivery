import contactModel from "../models/contactModel.js";
import { verifyCaptcha } from "../utils/captcha.js";
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

// ─────────────────────────────────────────
// POST /api/contacts
// ─────────────────────────────────────────
const createContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message, status, captchaId, captchaValue } = req.body;

        // Security CAPTCHA verification
        if (captchaId && captchaValue) {
            const captchaCheck = verifyCaptcha(captchaId, captchaValue);
            if (!captchaCheck.success) {
                return res.status(400).json({ success: false, message: captchaCheck.message });
            }
        }

        const newContact = new contactModel({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : "",
            subject: subject.trim(),
            message: message.trim(),
            status: status || "New",
            isDeleted: false
        });

        const savedContact = await newContact.save();
        res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully. We will get back to you shortly!",
            data: savedContact
        });
    } catch (error) {
        console.error("createContact error:", error);
        res.status(500).json({ success: false, message: "Failed to submit inquiry. Please try again." });
    }
};

// ─────────────────────────────────────────
// GET /api/contacts (Search, Filter, Pagination, Soft-Delete)
// ─────────────────────────────────────────
const getAllContacts = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['name', 'email', 'phone', 'subject', 'message'],
            ['status']
        );

        const result = await paginateQuery(
            contactModel,
            query,
            req,
            { createdAt: -1 }
        );

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("getAllContacts error:", error);
        res.status(500).json({ success: false, message: "Error fetching contact inquiries" });
    }
};

// ─────────────────────────────────────────
// GET /api/contacts/:id
// ─────────────────────────────────────────
const getContactById = async (req, res) => {
    try {
        const contact = await contactModel.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact record not found" });
        }
        res.json({ success: true, data: contact });
    } catch (error) {
        console.error("getContactById error:", error);
        res.status(500).json({ success: false, message: "Error fetching contact inquiry" });
    }
};

// ─────────────────────────────────────────
// PUT /api/contacts/:id
// ─────────────────────────────────────────
const updateContact = async (req, res) => {
    try {
        const updateFields = {};
        if (req.body.status) updateFields.status = req.body.status;
        if (req.body.name) updateFields.name = req.body.name.trim();
        if (req.body.email) updateFields.email = req.body.email.trim().toLowerCase();
        if (req.body.phone) updateFields.phone = req.body.phone.trim();
        if (req.body.subject) updateFields.subject = req.body.subject.trim();
        if (req.body.message) updateFields.message = req.body.message.trim();

        const updated = await contactModel.findByIdAndUpdate(req.params.id, updateFields, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Contact record not found" });
        }

        res.json({ success: true, message: "Contact inquiry updated successfully", data: updated });
    } catch (error) {
        console.error("updateContact error:", error);
        res.status(500).json({ success: false, message: "Error updating contact inquiry" });
    }
};

// ─────────────────────────────────────────
// DELETE /api/contacts/:id (SOFT DELETE)
// ─────────────────────────────────────────
const deleteContact = async (req, res) => {
    try {
        const contact = await contactModel.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact record not found" });
        }

        contact.isDeleted = true;
        contact.deletedAt = new Date();
        contact.deletedBy = req.body?.adminId || "admin";
        await contact.save();

        res.json({ success: true, message: "Inquiry moved to trash (soft deleted)" });
    } catch (error) {
        console.error("deleteContact error:", error);
        res.status(500).json({ success: false, message: "Error deleting contact inquiry" });
    }
};

// ─────────────────────────────────────────
// POST /api/contacts/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreContact = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const contact = await contactModel.findById(id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact record not found" });
        }

        contact.isDeleted = false;
        contact.deletedAt = null;
        contact.deletedBy = null;
        await contact.save();

        res.json({ success: true, message: "Inquiry restored successfully", data: contact });
    } catch (error) {
        console.error("restoreContact error:", error);
        res.status(500).json({ success: false, message: "Error restoring contact inquiry" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/contacts/purge (HARD DELETE)
// ─────────────────────────────────────────
const purgeContact = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const contact = await contactModel.findById(id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact record not found" });
        }

        await contactModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Contact message permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeContact error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting contact inquiry" });
    }
};

export {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    restoreContact,
    purgeContact
};
