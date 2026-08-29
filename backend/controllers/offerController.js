import offerModel from "../models/offerModel.js";
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

// ─────────────────────────────────────────
// POST /api/offer/add
// ─────────────────────────────────────────
const addOffer = async (req, res) => {
    try {
        const offer = new offerModel({
            code: req.body.code.trim().toUpperCase(),
            discount: Number(req.body.discount),
            minAmount: Number(req.body.minAmount) || 0,
            expiryDate: req.body.expiryDate,
            status: req.body.status || "Active",
            isDeleted: false
        });
        await offer.save();
        res.status(201).json({ success: true, message: "Coupon Code Added Successfully", data: offer });
    } catch (error) {
        console.error("addOffer error:", error);
        res.status(500).json({ success: false, message: error.message || "Error adding coupon" });
    }
};

// ─────────────────────────────────────────
// GET /api/offer/list (Search, Filter, Pagination, Soft-Delete)
// ─────────────────────────────────────────
const listOffer = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['code'],
            ['status']
        );

        const result = await paginateQuery(
            offerModel,
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
        console.error("listOffer error:", error);
        res.status(500).json({ success: false, message: "Error fetching coupons" });
    }
};

// ─────────────────────────────────────────
// POST/PUT /api/offer/update
// ─────────────────────────────────────────
const updateOffer = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const updateFields = {};
        if (req.body.code) updateFields.code = req.body.code.trim().toUpperCase();
        if (req.body.discount !== undefined) updateFields.discount = Number(req.body.discount);
        if (req.body.minAmount !== undefined) updateFields.minAmount = Number(req.body.minAmount);
        if (req.body.expiryDate) updateFields.expiryDate = req.body.expiryDate;
        if (req.body.status) updateFields.status = req.body.status;

        const updated = await offerModel.findByIdAndUpdate(id, updateFields, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon Updated", data: updated });
    } catch (error) {
        console.error("updateOffer error:", error);
        res.status(500).json({ success: false, message: "Error updating coupon" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/offer/remove (SOFT DELETE)
// ─────────────────────────────────────────
const removeOffer = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const offer = await offerModel.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        offer.isDeleted = true;
        offer.deletedAt = new Date();
        offer.deletedBy = req.body.adminId || "admin";
        await offer.save();

        res.json({ success: true, message: "Coupon moved to trash (soft deleted)" });
    } catch (error) {
        console.error("removeOffer error:", error);
        res.status(500).json({ success: false, message: "Error deleting coupon" });
    }
};

// ─────────────────────────────────────────
// POST/PATCH /api/offer/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreOffer = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const offer = await offerModel.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        offer.isDeleted = false;
        offer.deletedAt = null;
        offer.deletedBy = null;
        await offer.save();

        res.json({ success: true, message: "Coupon restored successfully", data: offer });
    } catch (error) {
        console.error("restoreOffer error:", error);
        res.status(500).json({ success: false, message: "Error restoring coupon" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/offer/purge (HARD DELETE)
// ─────────────────────────────────────────
const purgeOffer = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const offer = await offerModel.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        await offerModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Coupon permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeOffer error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting coupon" });
    }
};

// ─────────────────────────────────────────
// POST /api/offer/apply
// ─────────────────────────────────────────
const applyOffer = async (req, res) => {
    try {
        const { code, amount } = req.body;
        if (!code || !code.trim()) {
            return res.status(200).json({ success: false, message: "Please enter a valid coupon code." });
        }

        const cleanCode = code.trim().toUpperCase();
        const offer = await offerModel.findOne({ 
            code: cleanCode, 
            status: "Active",
            isDeleted: { $ne: true }
        });

        if (!offer) {
            return res.status(200).json({ success: false, message: `Coupon code '${cleanCode}' is invalid or inactive.` });
        }

        if (offer.expiryDate) {
            const expiry = new Date(offer.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiry < today) {
                return res.status(200).json({ success: false, message: `Coupon code '${cleanCode}' has expired.` });
            }
        }

        const subtotal = Number(amount) || 0;
        if (offer.minAmount && subtotal < offer.minAmount) {
            const diff = offer.minAmount - subtotal;
            return res.status(200).json({ 
                success: false, 
                message: `Minimum order amount of ₹${offer.minAmount} required. Add ₹${diff} more to apply '${cleanCode}'!` 
            });
        }

        const discountAmount = Math.round((subtotal * offer.discount) / 100);

        res.json({
            success: true,
            message: `Coupon '${offer.code}' applied! Saved ₹${discountAmount} 🎉`,
            data: {
                _id: offer._id,
                code: offer.code,
                discountPercent: offer.discount,
                discountAmount: discountAmount,
                minAmount: offer.minAmount
            }
        });
    } catch (error) {
        console.error("applyOffer error:", error);
        res.status(500).json({ success: false, message: "Error applying coupon code." });
    }
};

export { addOffer, listOffer, updateOffer, removeOffer, restoreOffer, purgeOffer, applyOffer };
