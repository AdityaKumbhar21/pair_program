import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"


const prisma = new PrismaClient();

interface JWTPayload{
    userId: string;
}

declare global{
    namespace Express{
        interface Request{
            user?:{
                id: string;
                email: string;
                name: string | null;
                isVerified: boolean;
            }
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            ok: false,
            message:"Login required to access the page"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload

        const user = await prisma.user.findFirst({
            where: {id: decoded.userId}
        })

        if(!user){
            return res.status(404).json({
                "ok": false,
                "message":"User not Found"
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.log("Error in auth middleware: ", error);
        return res.status(500).json({
            "ok": false,
            "message":"Internal Server error"
        })
        
    }


}