import orderModel from "../models/orderModel.js";

const listDeliveries = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        const deliveries = orders.map(order => ({
            _id: order._id,
            orderId: order._id,
            customer: `${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}`,
            address: `${order.address?.street || ""}, ${order.address?.city || ""}`,
            deliveryPerson: order.deliveryPerson || "Unassigned",
            orderStatus: order.status || "Food Processing",
            deliveryStatus: order.deliveryStatus || (order.status === "Delivered" ? "Delivered" : "Pending"),
            deliveryDate: order.date
        }));
        res.json({ success: true, data: deliveries });
    } catch (error) {
        console.log("listDeliveries error:", error);
        res.json({ success: false, message: "Error fetching deliveries" });
    }
};

const assignDeliveryPerson = async (req, res) => {
    try {
        const { orderId, deliveryPerson } = req.body;
        await orderModel.findByIdAndUpdate(orderId, {
            deliveryPerson,
            deliveryStatus: "Assigned"
        });
        res.json({ success: true, message: `Assigned to ${deliveryPerson}` });
    } catch (error) {
        console.log("assignDeliveryPerson error:", error);
        res.json({ success: false, message: "Error assigning delivery person" });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId, deliveryStatus, orderStatus } = req.body;
        const updateObj = {};
        if (deliveryStatus) updateObj.deliveryStatus = deliveryStatus;
        if (orderStatus) updateObj.status = orderStatus;
        
        await orderModel.findByIdAndUpdate(orderId, updateObj);
        res.json({ success: true, message: "Delivery status updated" });
    } catch (error) {
        console.log("updateDeliveryStatus error:", error);
        res.json({ success: false, message: "Error updating delivery status" });
    }
};

export { listDeliveries, assignDeliveryPerson, updateDeliveryStatus };
