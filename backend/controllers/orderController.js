import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_T7r2m2f2DSkplw",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "your_razorpay_key_secret"
});

// ─────────────────────────────────────────
// POST /api/order/place
// ─────────────────────────────────────────
const placeOrder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const totalAmount = Number(req.body.amount);
        const isCOD = req.body.paymentMethod === "COD";

        const newOrder = new orderModel({
            userId: userId,
            items: req.body.items,
            amount: totalAmount,
            address: req.body.address,
            status: "Food Processing",
            payment: isCOD ? false : false,
            paymentStatus: isCOD ? "Pending" : "Pending",
            paymentMethod: req.body.paymentMethod || "UPI",
            deliveryStatus: "Pending",
            isDeleted: false
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        if (isCOD) {
            return res.json({
                success: true,
                message: "Order Placed Successfully with Cash on Delivery",
                isCOD: true,
                orderId: newOrder._id,
                data: newOrder
            });
        }

        // Razorpay accepts amount in PAISE (₹1 = 100 paise)
        const amountInPaise = Math.round(totalAmount * 100);

        let razorpayOrder = null;
        try {
            razorpayOrder = await razorpayInstance.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: newOrder._id.toString()
            });
        } catch (rzpErr) {
            console.error("Razorpay order create error:", rzpErr.message);
            razorpayOrder = {
                id: `order_${Date.now()}`,
                amount: amountInPaise,
                currency: "INR"
            };
        }

        res.json({
            success: true,
            message: "Order Placed Successfully",
            orderId: newOrder._id,
            order: razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_T7r2m2f2DSkplw",
            amount: amountInPaise,
            currency: "INR",
            data: newOrder
        });
    } catch (error) {
        console.error("placeOrder error:", error);
        res.status(500).json({ success: false, message: "Error placing order" });
    }
};

// ─────────────────────────────────────────
// POST /api/order/verify
// ─────────────────────────────────────────
const verifyOrder = async (req, res) => {
    const { orderId, success, razorpay_payment_id } = req.body;
    try {
        if (success === "true" || success === true) {
            await orderModel.findByIdAndUpdate(orderId, { 
                payment: true, 
                paymentStatus: "Paid" 
            });
            res.json({ success: true, message: "Payment Verified & Order Confirmed" });
        } else {
            await orderModel.findByIdAndUpdate(orderId, { 
                isDeleted: true, 
                deletedAt: new Date() 
            });
            res.json({ success: false, message: "Payment Failed / Order Cancelled" });
        }
    } catch (error) {
        console.error("verifyOrder error:", error);
        res.status(500).json({ success: false, message: "Error verifying order" });
    }
};

// ─────────────────────────────────────────
// POST /api/order/userorders
// ─────────────────────────────────────────
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ 
            userId: req.body.userId,
            isDeleted: { $ne: true }
        }).sort({ date: -1, _id: -1 });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("userOrders error:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// ─────────────────────────────────────────
// GET /api/order/list (Search, Filter, Pagination, Soft-Delete)
// ─────────────────────────────────────────
const listOrders = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['address.firstName', 'address.lastName', 'address.email', 'address.phone', 'address.city', 'paymentMethod'],
            ['status', 'deliveryStatus', 'payment']
        );

        if (req.query.search) {
            const term = req.query.search.trim();
            query.$or = [
                { 'address.firstName': { $regex: term, $options: 'i' } },
                { 'address.lastName': { $regex: term, $options: 'i' } },
                { 'address.email': { $regex: term, $options: 'i' } },
                { 'address.phone': { $regex: term, $options: 'i' } },
                { 'address.city': { $regex: term, $options: 'i' } },
                { paymentMethod: { $regex: term, $options: 'i' } }
            ];
        }

        const result = await paginateQuery(
            orderModel,
            query,
            req,
            { date: -1, _id: -1 }
        );

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("listOrders error:", error);
        res.status(500).json({ success: false, message: "Error listing orders" });
    }
};

// ─────────────────────────────────────────
// POST /api/order/status
// ─────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const updated = await orderModel.findByIdAndUpdate(
            orderId,
            { status: status },
            { returnDocument: 'after' }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, message: "Status Updated", data: updated });
    } catch (error) {
        console.error("updateStatus error:", error);
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/order/remove (SOFT DELETE)
// ─────────────────────────────────────────
const removeOrder = async (req, res) => {
    try {
        const id = req.body.orderId || req.body.id || req.params.id;
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.isDeleted = true;
        order.deletedAt = new Date();
        order.deletedBy = req.body.adminId || "admin";
        await order.save();

        res.json({ success: true, message: "Order moved to trash (soft deleted)" });
    } catch (error) {
        console.error("removeOrder error:", error);
        res.status(500).json({ success: false, message: "Error deleting order" });
    }
};

// ─────────────────────────────────────────
// POST/PATCH /api/order/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreOrder = async (req, res) => {
    try {
        const id = req.body.orderId || req.body.id || req.params.id;
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.isDeleted = false;
        order.deletedAt = null;
        order.deletedBy = null;
        await order.save();

        res.json({ success: true, message: "Order restored successfully", data: order });
    } catch (error) {
        console.error("restoreOrder error:", error);
        res.status(500).json({ success: false, message: "Error restoring order" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/order/purge (HARD DELETE)
// ─────────────────────────────────────────
const purgeOrder = async (req, res) => {
    try {
        const id = req.body.orderId || req.body.id || req.params.id;
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        await orderModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Order permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeOrder error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting order" });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, removeOrder, restoreOrder, purgeOrder };