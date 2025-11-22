import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { suugestFeedback } from "../controllers/feedbackController";

const feedbackRouter = Router();


feedbackRouter.post("/", authMiddleware, suugestFeedback)

export default feedbackRouter;