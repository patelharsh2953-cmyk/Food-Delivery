import express from "express";
import { getSalesReport, exportOrdersCSV, exportProductsCSV, exportUsersCSV } from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/sales", getSalesReport);
reportRouter.get("/orders/export", exportOrdersCSV);
reportRouter.get("/products/export", exportProductsCSV);
reportRouter.get("/users/export", exportUsersCSV);

export default reportRouter;
