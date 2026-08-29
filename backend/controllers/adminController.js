import adminModel from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { verifyCaptcha } from "../utils/captcha.js";

// Helper: create JWT token with admin role claim
const createAdminToken = (id) => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────
const loginAdmin = async (req, res) => {
    const { email, password, captchaId, captchaValue } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // CAPTCHA check if passed
    if (captchaId && captchaValue) {
        const captchaCheck = verifyCaptcha(captchaId, captchaValue);
        if (!captchaCheck.success) {
            return res.status(400).json({ success: false, message: captchaCheck.message });
        }
    }

    try {
        const admin = await adminModel.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid credentials. Admin account not found." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials. Incorrect password." });
        }

        const token = createAdminToken(admin._id);

        res.json({
            success: true,
            message: "Login successful.",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ success: false, message: "Server error during admin login." });
    }
};

// ─────────────────────────────────────────
// POST /api/admin/register
// ─────────────────────────────────────────
const registerAdmin = async (req, res) => {
    const { name, email, password, confirmPassword, captchaId, captchaValue } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    // CAPTCHA check if passed
    if (captchaId && captchaValue) {
        const captchaCheck = verifyCaptcha(captchaId, captchaValue);
        if (!captchaCheck.success) {
            return res.status(400).json({ success: false, message: captchaCheck.message });
        }
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const existingAdmin = await adminModel.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "An admin with this email already exists." });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            isDeleted: false
        });

        const savedAdmin = await newAdmin.save();
        const token = createAdminToken(savedAdmin._id);

        res.status(201).json({
            success: true,
            message: "Admin account created successfully.",
            token,
            admin: {
                id: savedAdmin._id,
                name: savedAdmin.name,
                email: savedAdmin.email,
                role: savedAdmin.role
            }
        });
    } catch (error) {
        console.error("Admin register error:", error);
        res.status(500).json({ success: false, message: "Server error during admin registration." });
    }
};

// ─────────────────────────────────────────
// GET /api/admin/verify (token check)
// ─────────────────────────────────────────
const verifyAdmin = async (req, res) => {
    try {
        const admin = await adminModel.findOne({ _id: req.body.adminId, isDeleted: { $ne: true } }).select("-password");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }
        res.json({ success: true, admin });
    } catch (error) {
        console.error("Admin verify error:", error);
        res.status(500).json({ success: false, message: "Verification failed." });
    }
};

export { loginAdmin, registerAdmin, verifyAdmin };
