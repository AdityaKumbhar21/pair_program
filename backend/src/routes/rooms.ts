import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { createRoom } from "../controllers/roomController";


const roomRouter = Router()


roomRouter.get("/room", authMiddleware, (req, res)=>{
    return res.json({
        ok: true
    })
})

roomRouter.post("/create-room", authMiddleware, createRoom)



export default roomRouter;