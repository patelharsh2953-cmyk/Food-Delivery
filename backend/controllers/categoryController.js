import categoryModel from "../models/categoryModel.js";
import foodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';
import { buildQuery, paginateQuery } from "../utils/queryHelper.js";

// ─────────────────────────────────────────
// POST /api/category/add
// ─────────────────────────────────────────
const addCategory = async (req, res) => {
    try {
        let image_filename = req.file ? req.file.filename : (req.body.image || "menu_1.png");

        const category = new categoryModel({
            name: req.body.name.trim(),
            image: image_filename,
            status: req.body.status || "Active",
            productCount: Number(req.body.productCount) || 0,
            isDeleted: false
        });

        await category.save();
        res.status(201).json({ success: true, message: "Category Added Successfully", data: category });
    } catch (error) {
        console.error("addCategory error:", error);
        res.status(500).json({ success: false, message: "Error adding category" });
    }
};

// ─────────────────────────────────────────
// GET /api/category/list (Search, Filter, Pagination, Soft-Delete, Live Product Count)
// ─────────────────────────────────────────
const listCategory = async (req, res) => {
    try {
        const query = buildQuery(
            req,
            ['name'],
            ['status']
        );

        const result = await paginateQuery(
            categoryModel,
            query,
            req,
            { createdAt: -1 }
        );

        // Compute live non-deleted food counts per category
        const categoryCounts = await foodModel.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        categoryCounts.forEach(c => {
            if (c._id) {
                countMap[c._id.toString().toLowerCase().trim()] = c.count;
            }
        });

        const enrichedData = result.data.map(cat => {
            const catObj = cat.toObject ? cat.toObject() : { ...cat };
            const cleanName = (cat.name || "").toString().toLowerCase().trim();
            const liveCount = countMap[cleanName] || 0;
            return {
                ...catObj,
                productCount: liveCount
            };
        });

        res.json({
            success: true,
            data: enrichedData,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("listCategory error:", error);
        res.status(500).json({ success: false, message: "Error fetching category list" });
    }
};

// ─────────────────────────────────────────
// POST/PUT /api/category/update
// ─────────────────────────────────────────
const updateCategory = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const updateFields = {};

        if (req.body.name !== undefined) updateFields.name = req.body.name.trim();
        if (req.body.status !== undefined) updateFields.status = req.body.status;
        if (req.body.productCount !== undefined) updateFields.productCount = Number(req.body.productCount);

        if (req.file) {
            updateFields.image = req.file.filename;
        }

        const updated = await categoryModel.findByIdAndUpdate(id, updateFields, { returnDocument: 'after' });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: "Category Updated", data: updated });
    } catch (error) {
        console.error("updateCategory error:", error);
        res.status(500).json({ success: false, message: "Error updating category" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/category/remove (SOFT DELETE)
// ─────────────────────────────────────────
const removeCategory = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.isDeleted = true;
        category.deletedAt = new Date();
        category.deletedBy = req.body.adminId || "admin";
        await category.save();

        res.json({ success: true, message: "Category moved to trash (soft deleted)" });
    } catch (error) {
        console.error("removeCategory error:", error);
        res.status(500).json({ success: false, message: "Error deleting category" });
    }
};

// ─────────────────────────────────────────
// POST/PATCH /api/category/restore (RESTORE SOFT-DELETED)
// ─────────────────────────────────────────
const restoreCategory = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.isDeleted = false;
        category.deletedAt = null;
        category.deletedBy = null;
        await category.save();

        res.json({ success: true, message: "Category restored successfully", data: category });
    } catch (error) {
        console.error("restoreCategory error:", error);
        res.status(500).json({ success: false, message: "Error restoring category" });
    }
};

// ─────────────────────────────────────────
// POST/DELETE /api/category/purge (HARD DELETE)
// ─────────────────────────────────────────
const purgeCategory = async (req, res) => {
    try {
        const id = req.body.id || req.params.id;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (category.image && !category.image.startsWith("menu_") && !category.image.startsWith("http")) {
            const imagePath = path.join(process.cwd(), "uploads", category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Category permanently deleted from database (hard delete)" });
    } catch (error) {
        console.error("purgeCategory error:", error);
        res.status(500).json({ success: false, message: "Error permanently deleting category" });
    }
};

export { addCategory, listCategory, updateCategory, removeCategory, restoreCategory, purgeCategory };
