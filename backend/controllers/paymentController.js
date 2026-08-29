import orderModel from "../models/orderModel.js";
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

// ─────────────────────────────────────────
// GET /api/payment/list
// ─────────────────────────────────────────
const listPayments = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['paymentMethod', 'paymentStatus'],
            ['paymentMethod', 'paymentStatus']
        );

        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            query.$or = [
                { 'address.firstName': searchRegex },
                { 'address.lastName': searchRegex },
                { paymentMethod: searchRegex },
                { paymentStatus: searchRegex }
            ];
            if (req.query.search.trim().match(/^[0-9a-fA-F]{24}$/)) {
                query.$or.push({ _id: req.query.search.trim() });
            }
        }

        const result = await paginateQuery(
            orderModel,
            query,
            req,
            { date: -1 }
        );

        const payments = result.data.map(order => {
            let status = order.paymentStatus || (order.payment ? "Paid" : "Pending");
            let method = order.paymentMethod || "UPI";
            return {
                _id: `PAY-${order._id.toString().slice(-6).toUpperCase()}`,
                rawId: order._id,
                orderId: order._id,
                customer: order.address ? `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || "Customer" : "Customer",
                amount: order.amount,
                method: method,
                status: status,
                date: order.date ? new Date(order.date).toLocaleDateString() : "Today"
            };
        });

        res.json({
            success: true,
            data: payments,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("listPayments error:", error);
        res.status(500).json({ success: false, message: "Error fetching payments" });
    }
};

// ─────────────────────────────────────────
// POST /api/payment/status
// ─────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        let orderId = id;

        if (id && id.startsWith("PAY-")) {
            const orders = await orderModel.find({ isDeleted: { $ne: true } });
            const target = orders.find(o => `PAY-${o._id.toString().slice(-6).toUpperCase()}` === id || o._id.toString() === id);
            if (target) {
                orderId = target._id;
            }
        }

        const isPaid = status === "Paid";
        const updated = await orderModel.findByIdAndUpdate(
            orderId,
            { paymentStatus: status, payment: isPaid },
            { new: true }
        );

        if (updated) {
            res.json({ success: true, message: `Payment status updated to "${status}"`, data: updated });
        } else {
            res.status(404).json({ success: false, message: "Order transaction not found" });
        }
    } catch (error) {
        console.error("updatePaymentStatus error:", error);
        res.status(500).json({ success: false, message: "Error updating payment status" });
    }
};

export { listPayments, updatePaymentStatus };
