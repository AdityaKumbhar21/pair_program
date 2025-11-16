import { Router } from "express";
import { signUp, verifyEmail, resendVerification, signIn, signOut, getCurrentUser } from "../controllers/authControllers";
import { authMiddleware } from "../middlewares/auth";

const authRouter = Router()


authRouter.post("/sign-up", signUp)
authRouter.post("/sign-in", signIn)
authRouter.post("/sign-out", signOut)
authRouter.get("/verify-email", verifyEmail)
authRouter.post("/resend-verification", resendVerification)
authRouter.get("/me", authMiddleware, getCurrentUser)



export default authRouter