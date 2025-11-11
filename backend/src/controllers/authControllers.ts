import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";


const prisma = new PrismaClient()

export async function signUp(req: Request, res:Response){
    const {name, email , password} = req.body
    try {
        if(!name || !email || !password) return res.status(400).json({
            "message":"All fields are required",
        })

        const user = await prisma.user.findFirst({
            where : {email}
        })

        if(user) return res.status(400).json({
            "message":"User already exists",
        })

        bcrypt.hash(password, 10, async(err, hash) => {
            if(err) return res.status(500).json({
                "message":"Error while hashing password",
            })

            const newUser = await prisma.user.create({
                data:{
                    name,
                    email,
                    password: hash,
                }
            })

            const token = generateToken(newUser.id)

            res.cookie("token", token)

            return res.status(201).json({
                "message":"User created successfully",
                "user": {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                }
            })
        })
    } catch (error) {
        console.log("Error in signing up the user: ", error);
        return res.status(500).json({
            "message":"Internal Server Error"
        })   
    }
}