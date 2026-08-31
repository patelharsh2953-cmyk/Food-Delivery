import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { verifyCaptcha } from "../utils/captcha.js";
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

const createToken = (id, role = "user") => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || "default_jwt_secret_key", { expiresIn: "7d" });
};

// ─────────────────────────────────────────
// POST /api/user/login
// ─────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password, captchaId, captchaValue } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide both email and password." });
    }

    // Security CAPTCHA verification
    if (captchaId && captchaValue) {
        const captchaCheck = verifyCaptcha(captchaId, captchaValue);
        if (!captchaCheck.success) {
            return res.status(400).json({ success: false, message: captchaCheck.message });
        }
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "No account found with this email. Please click 'Create Account' to sign up." 
            });
        }

        if (user.status === "Inactive") {
            return res.status(403).json({ success: false, message: "Your account is inactive. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Incorrect password. Please verify and try again." 
            });
        }

        const token = createToken(user._id, user.role || "user");
        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user"
            }
        });
    } catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: "Internal server error during login." });
    }
};

// ─────────────────────────────────────────
// POST /api/user/register
// ─────────────────────────────────────────
const registerUser = async (req, res) => {
    const { name, email, password, phone, captchaId, captchaValue } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    }

    // CAPTCHA verification
    if (captchaId && captchaValue) {
        const captchaCheck = verifyCaptcha(captchaId, captchaValue);
        if (!captchaCheck.success) {
            return res.status(400).json({ success: false, message: captchaCheck.message });
        }
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const exists = await userModel.findOne({ email: normalizedEmail });
        
        if (exists) {
            if (exists.isDeleted) {
                // Reactivate soft-deleted user
                const salt = await bcrypt.genSalt(10);
                exists.password = await bcrypt.hash(password, salt);
                exists.name = name.trim();
                exists.isDeleted = false;
                exists.deletedAt = null;
                await exists.save();

                const token = createToken(exists._id, exists.role || "user");
                return res.status(200).json({
                    success: true,
                    message: "Account reactivated successfully.",
                    token,
                    user: { id: exists._id, name: exists.name, email: exists.email }
                });
            }
            return res.status(409).json({ success: false, message: "An account with this email already exists. Please Sign In." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || "",
            role: "user",
            status: "Active",
            isDeleted: false
        });

        const savedUser = await newUser.save();
        const token = createToken(savedUser._id, savedUser.role);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role
            }
        });
    } catch (error) {
        console.error("registerUser error:", error);
        res.status(500).json({ success: false, message: "Error registering account." });
    }
};

// ─────────────────────────────────────────
// POST /api/user/reset-password
// ─────────────────────────────────────────
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "Email and new password are required." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail, isDeleted: { $ne: true } });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email. Please check the spelling or Sign Up." });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        const token = createToken(user._id, user.role || "user");
        res.json({
            success: true,
            message: "Password reset successful! You are now logged in.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user"
            }
        });
    } catch (error) {
        console.error("resetPassword error:", error);
        res.status(500).json({ success: false, message: "Error resetting password." });
    }
};

// ─────────────────────────────────────────
// GET /api/user/verify  (Profile verification)
// ─────────────────────────────────────────
const verifyUser = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId, isDeleted: { $ne: true } }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("verifyUser error:", error);
        res.status(500).json({ success: false, message: "Error verifying user." });
    }
};

// ─────────────────────────────────────────
// GET /api/user/list (Search, Filter, Pagination, Soft-Delete)
// ─────────────────────────────────────────
const listUsers = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['name', 'email', 'phone'],
            ['status', 'role']
        );

        const result = await paginateQuery(
            userModel,
            query,
            req,
            { createdAt: -1 }
        );

        res.json({
            success: true,
            data: result.data.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                status: u.status,
                role: u.role,
                isDeleted: u.isDeleted,
                createdAt: u.createdAt
            })),
            pagination: result.pagination
        });
    } catch (error) {
        console.error("listUsers error:", error);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// ─────────────────────────────────────────
// POST/PUT /api/user/update
// ─────────────────────────────────────────
const updateUser = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const { name, email, phone, status, role } = req.body;

        const updateFields = {};
        if (name !== undefined) updateFields.name = name.trim();
        if (email !== undefined) updateFields.email = email.trim().toLowerCase();
        if (phone !== undefined) updateFields.phone = phone.trim();
        if (status !== undefined) updateFields.status = status;
        if (role !== undefined) updateFields.role = role;

        const updated = await userModel.findByIdAndUpdate(id, updateFields, { returnDocument: 'after' }).select("-password");
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "User Updated Successfully", data: updated });
    } catch (error) {
        console.error("updateUser error:", error);
        res.status(500).json({ success: false, message: "Error updating user" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/user/remove (SOFT DELETE)
// ─────────────────────────────────────────
const removeUser = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.isDeleted = true;
        user.deletedAt = new Date();
        user.deletedBy = req.body.adminId || "admin";
        await user.save();

        res.json({ success: true, message: "User moved to trash (soft deleted)" });
    } catch (error) {
        console.error("removeUser error:", error);
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
};

// ─────────────────────────────────────────
// POST/PATCH /api/user/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreUser = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.isDeleted = false;
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save();

        res.json({ success: true, message: "User account restored successfully", data: user });
    } catch (error) {
        console.error("restoreUser error:", error);
        res.status(500).json({ success: false, message: "Error restoring user" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/user/purge (HARD DELETE)
// ─────────────────────────────────────────
const purgeUser = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "User account permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeUser error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting user account" });
    }
};

export { loginUser, registerUser, resetPassword, verifyUser, listUsers, updateUser, removeUser, restoreUser, purgeUser };
