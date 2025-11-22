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
                isActive: true
            },
            include:{
                host:{
                    select: {name:true, email: true}
                }
            }
        })

        return res.status(200).json({
            ok: true,
            message: "Room created successfully.",
            shortId: room.shortId,
            joinLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${room.shortId}`,
            isActive: room.isActive,
            hostName: room.host.name || room.host.email.split("@")[0],
        })
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
            ok: true,
            message:"User joined the room successfully",
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

export async function getUserRooms(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                ok: false,
                message: "Unauthorized"
            });
        }

        const rooms = await prisma.room.findMany({
            where: {
                hostId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                shortId: true,
                createdAt: true,
                isActive: true,
            }
        });

        return res.status(200).json({
            ok: true,
            rooms
        });
    } catch (error) {
        console.error("Error getting user rooms:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error"
        });
    }
}

export async function deleteRoom(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { shortId } = req.params;

        if (!userId) {
            return res.status(401).json({
                ok: false,
                message: "Unauthorized"
            });
        }

        const room = await prisma.room.findUnique({
            where: { shortId }
        });

        if (!room) {
            return res.status(404).json({
                ok: false,
                message: "Room not found"
            });
        }

        if (room.hostId !== userId) {
            return res.status(403).json({
                ok: false,
                message: "Forbidden: You are not the host of this room"
            });
        }

        await prisma.room.delete({
            where: { shortId }
        });

        return res.status(200).json({
            ok: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting room:", error);
        return res.status(500).json({
            ok: false,
            message: "Internal Server Error"
        });
    }
}