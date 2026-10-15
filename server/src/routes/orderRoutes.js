import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

export default router;