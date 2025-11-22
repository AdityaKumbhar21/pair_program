import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { createRoom, deleteRoom, getUserRooms } from "../controllers/roomController";


const roomRouter = Router()


roomRouter.get("/room", authMiddleware, (req, res)=>{
    return res.json({
        ok: true
    })
})

roomRouter.post("/create-room", authMiddleware, createRoom)
roomRouter.get("/user", authMiddleware, getUserRooms)
roomRouter.delete("/:shortId", authMiddleware, deleteRoom)



export default roomRouter;