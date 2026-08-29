import foodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

// ─────────────────────────────────────────
// POST /api/food/add
// ─────────────────────────────────────────
const addFood = async (req, res) => {
    try {
        let image_filename = req.file ? req.file.filename : (req.body.image || "food_1.png");

        const food = new foodModel({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            price: Number(req.body.price),
            category: req.body.category.trim(),
            image: image_filename,
            discount: Number(req.body.discount) || 0,
            availability: req.body.availability !== undefined ? (req.body.availability === true || req.body.availability === 'true') : true,
            status: req.body.status || "Active",
            isDeleted: false
        });

        await food.save();
        res.status(201).json({ success: true, message: "Food Product Added Successfully", data: food });
    } catch (error) {
        console.error("addFood error:", error);
        res.status(500).json({ success: false, message: "Error adding food product" });
    }
};

// ─────────────────────────────────────────
// GET /api/food/list (Search, Filter, Pagination, Soft-Delete)
// ─────────────────────────────────────────
const listFood = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['name', 'description'],
            ['category', 'status', 'availability']
        );

        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        const result = await paginateQuery(
            foodModel,
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
        console.error("listFood error:", error);
        res.status(500).json({ success: false, message: "Error fetching food list" });
    }
};

// ─────────────────────────────────────────
// GET /api/food/:id
// ─────────────────────────────────────────
const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }
        res.json({ success: true, data: food });
    } catch (error) {
        console.error("getFoodById error:", error);
        res.status(500).json({ success: false, message: "Error retrieving food item" });
    }
};

// ─────────────────────────────────────────
// POST/PUT /api/food/update
// ─────────────────────────────────────────
const updateFood = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const updateFields = {};

        if (req.body.name !== undefined) updateFields.name = req.body.name.trim();
        if (req.body.description !== undefined) updateFields.description = req.body.description.trim();
        if (req.body.price !== undefined) updateFields.price = Number(req.body.price);
        if (req.body.category !== undefined) updateFields.category = req.body.category.trim();
        if (req.body.discount !== undefined) updateFields.discount = Number(req.body.discount);
        if (req.body.availability !== undefined) updateFields.availability = req.body.availability === true || req.body.availability === 'true';
        if (req.body.status !== undefined) updateFields.status = req.body.status;

        if (req.file) {
            updateFields.image = req.file.filename;
        }

        const updated = await foodModel.findByIdAndUpdate(id, updateFields, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        res.json({ success: true, message: "Food Product Updated", data: updated });
    } catch (error) {
        console.error("updateFood error:", error);
        res.status(500).json({ success: false, message: "Error updating food" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/food/remove (SOFT DELETE - Move to Trash)
// ─────────────────────────────────────────
const removeFood = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        // NON-DESTRUCTIVE SOFT DELETE: Retain image file and record in database
        food.isDeleted = true;
        food.deletedAt = new Date();
        food.deletedBy = req.body.adminId || req.body.userId || "admin";
        await food.save();

        res.json({ success: true, message: "Food product moved to trash (soft deleted)" });
    } catch (error) {
        console.error("removeFood error:", error);
        res.status(500).json({ success: false, message: "Error deleting food" });
    }
};

// ─────────────────────────────────────────
// POST/PATCH /api/food/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreFood = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        food.isDeleted = false;
        food.deletedAt = null;
        food.deletedBy = null;
        await food.save();

        res.json({ success: true, message: "Food product restored successfully", data: food });
    } catch (error) {
        console.error("restoreFood error:", error);
        res.status(500).json({ success: false, message: "Error restoring food item" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/food/purge (HARD DELETE - Permanent Purge)
// ─────────────────────────────────────────
const purgeFood = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const food = await foodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        // Remove image file if stored locally in uploads
        if (food.image && !food.image.startsWith("food_") && !food.image.startsWith("http")) {
            const imagePath = path.join(process.cwd(), "uploads", food.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await foodModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Food product permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeFood error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting food item" });
    }
};

export { addFood, listFood, getFoodById, updateFood, removeFood, restoreFood, purgeFood };