import notificationModel from "../models/notificationModel.js";

const listNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.log("listNotifications error:", error);
        res.json({ success: false, message: "Error fetching notifications" });
    }
};

const markAsRead = async (req, res) => {
    try {
        if (req.body.id) {
            await notificationModel.findByIdAndUpdate(req.body.id, { read: true });
        } else {
            await notificationModel.updateMany({}, { read: true });
        }
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.log("markAsRead error:", error);
        res.json({ success: false, message: "Error updating notification" });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await notificationModel.deleteMany({});
        res.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.log("clearNotifications error:", error);
        res.json({ success: false, message: "Error clearing notifications" });
    }
};

const addNotification = async (req, res) => {
    try {
        const notification = new notificationModel({
            title: req.body.title,
            message: req.body.message,
            type: req.body.type || "order"
        });
        await notification.save();
        res.json({ success: true, message: "Notification Created" });
    } catch (error) {
        console.log("addNotification error:", error);
        res.json({ success: false, message: "Error creating notification" });
    }
};

export { listNotifications, markAsRead, clearNotifications, addNotification };
