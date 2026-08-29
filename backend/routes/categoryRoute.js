import express from "express";
import { addCategory, listCategory, updateCategory, removeCategory, restoreCategory, purgeCategory } from "../controllers/categoryController.js";
import multer from "multer";

const categoryRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

categoryRouter.post("/add", upload.single("image"), addCategory);
categoryRouter.get("/list", listCategory);
categoryRouter.post("/update", upload.single("image"), updateCategory);
categoryRouter.put("/:id", upload.single("image"), updateCategory);
categoryRouter.post("/remove", removeCategory);
categoryRouter.delete("/:id", removeCategory);
categoryRouter.post("/restore", restoreCategory);
categoryRouter.patch("/restore/:id", restoreCategory);
categoryRouter.post("/purge", purgeCategory);
categoryRouter.delete("/purge/:id", purgeCategory);

export default categoryRouter;
