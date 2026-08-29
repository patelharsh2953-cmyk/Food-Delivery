import express from "express";
import { addFood, listFood, getFoodById, updateFood, removeFood, restoreFood, purgeFood } from "../controllers/foodController.js";
import { validateFoodItem } from "../middleware/validators.js";
import multer from "multer";

const foodRouter = express.Router();

// image storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), validateFoodItem, addFood);
foodRouter.get("/list", listFood);
foodRouter.get("/:id", getFoodById);
foodRouter.post("/update", upload.single("image"), updateFood);
foodRouter.put("/:id", upload.single("image"), updateFood);
foodRouter.post("/remove", removeFood);
foodRouter.delete("/:id", removeFood);
foodRouter.post("/restore", restoreFood);
foodRouter.patch("/restore/:id", restoreFood);
foodRouter.post("/purge", purgeFood);
foodRouter.delete("/purge/:id", purgeFood);

export default foodRouter;