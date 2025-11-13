import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { nanoid } from "nanoid"


const prisma = new PrismaClient()

export async function createRoom(req:Request, res: Response) {
    const hostId = req.user!.id
    const user = req.user!
    if(!hostId){
        return res.status(401).json({
            ok: false,
            message: "You need to login to create a room."
        })
    }

    try {
        const room = await prisma.room.create({
            data:{
                shortId: nanoid(8),
                host: {connect: {id: hostId}},
            },
            include:{
                host:{
                    select: {name:true, email: true}
                }
            }
        })

        if(!user.isVerified){
            await prisma.room.update({
                where: { id: room.id },
                data: { isActive: false }
            })

            return res.status(200).json({
                ok: true,
                message: "Room created successfully, but your email is not verified. Please verify your email to activate the room.",
                joinLink: `${process.env.FRONTEND_URL}/rooms/${room.shortId}` || `http://localhost:3000/rooms/${room.shortId}`,
                isActive: room.isActive,
                hostName: room.host.name || room.host.email.split("@")[0],
            })
        } else {
            return res.status(200).json({
                ok: true,
                message: "Room created successfully.",
                joinLink: `${process.env.FRONTEND_URL || `http://localhost:3000`}/rooms/${room.shortId}`,
                isActive: room.isActive,
                hostName: room.host.name || room.host.email.split("@")[0],
            })
        }
    } catch (error) {
        console.log("Error creating room: ", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error"
        })
    }
}


export async function getRoomByShortId(req: Request, res: Response) {
    const {shortId} = req.params
    
    if(!shortId){
        res.status(400).json({
            ok: false,
            message:"shortId required to access the room"
        })
    }

    try {
        const room = await prisma.room.findFirst({
            where: {shortId: shortId},
            include:{
                host: {
                    select: {id: true, name: true, email: true}
                }
            }
        })

        if(!room){
            return res.status(404).json({
            ok: false,
            message:"Room not found"
         })
        }

        return res.status(200).json({
            ok: false,
            message:"shortId required to access the room",
            roomId: room.id,
            shortId: room.shortId,
            host: room.host
        })
    } catch (error) {
        console.log("Error in getting room: ", error);
        return res.status(500).json({
            ok: false,
            message:"shortId required to access the room"
        })
        
    }

}