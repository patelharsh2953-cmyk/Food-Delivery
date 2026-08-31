import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const token = req.headers.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized. Please sign in again." });
    }
    try {
        const secret = process.env.JWT_SECRET || "random#secret";
        const token_decode = jwt.verify(token, secret);
        if (!req.body) req.body = {};
        req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        next();
    } catch (error) {
        console.error("authMiddleware error:", error.message);
        res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
    }
};

export default authMiddleware