import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";
import { generateOTP } from "../utils/generateOtp";


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
            const verifyCode = generateOTP()
            const newUser = await prisma.user.create({
                data:{
                    name,
                    email,
                    password: hash,
                    verificationCode:  verifyCode,
                    verifyExpires: new Date(Date.now() + 10 * 60 * 1000),
                    isVerified: false,
                }
            })

            const token = generateToken(newUser.id)

            res.cookie("token", token)
            
            await sendVerificationEmail(newUser.email,verifyCode)

            return res.status(201).json({
                "message":"User created successfully. Please verify your email.",
                "user": {
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


export async function verifyEmail(req: Request, res: Response){ 
    const { email, code } = req.query;

    if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: String(email) },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        if (user.verificationCode !== String(code)) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        if (user.verifyExpires && user.verifyExpires < new Date()) {
            return res.status(400).json({ message: "Verification code has expired" });
        }
        
        await prisma.user.update({
            where: { email: String(email) },
            data: {
                isVerified: true,
                verificationCode: null,
                verifyExpires: null,
            },
        });

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}