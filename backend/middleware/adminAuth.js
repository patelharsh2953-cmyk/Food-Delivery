import jwt from "jsonwebtoken";

const adminAuthMiddleware = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({ success: false, message: "Admin not authorized. Please login again." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure this is an admin token
        if (decoded.role !== "admin") {
            return res.json({ success: false, message: "Access denied. Admin privileges required." });
        }

        if (!req.body) req.body = {};
        req.body.adminId = decoded.id;
        next();
    } catch (error) {
        console.log("Admin auth error:", error.message);
        res.json({ success: false, message: "Invalid or expired token. Please login again." });
    }
};

export default adminAuthMiddleware;
