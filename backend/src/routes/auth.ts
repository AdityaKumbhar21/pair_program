import { Router } from "express";
import { signUp, verifyEmail } from "../controllers/authControllers";

const authRouter = Router()


authRouter.post("/sign-up", signUp)
authRouter.get("/verify-email", verifyEmail)



export default authRouter