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
            "ok": false,
            "message":"All fields are required",
        })

        const user = await prisma.user.findFirst({
            where : {email}
        })

        if(user) return res.status(400).json({
            "ok": false,
            "message":"User already exists",
        })

        bcrypt.hash(password, 10, async(err, hash) => {
            if(err) return res.status(500).json({
                "ok": false,
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
                "ok": true,
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
            "ok": false,
            "message":"Internal Server Error"
        })   
    }
}

export async function signIn(req: Request, res: Response){
    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({
            "ok": false,
            "message": "Email and Password are required"
        })
    }

    try {
        const user = await prisma.user.findFirst({
            where: {email}
        })

        if(!user){
            return res.status(404).json({
                "ok": false,
                "message": "User not found"
            })
        }

        const hashedPassword = user.password

        bcrypt.compare(password, hashedPassword, (err, result)=>{
            if(err){
                return res.status(400).json({
                    "ok": false,
                    "message": "Bcrypt error"
                })
            }

            if(result){
                const token = generateToken(user.id)
                res.cookie("token", token)
                return res.status(200).json({
                    "ok": true,
                    "message": "Sign-in Successfull"
                })
            }

            return res.status(400).json({
                "ok": false,
                "message": "Email or Password is Invalid"
            })

        })
    }
    catch (error) {
        console.error("Error signing in:", error);
        return res.status(500).json({ 
            "ok": false,
            message: "Internal Server Error" 
        });
    }
}

export async function signOut(req:Request, res: Response) {
    try {
        res.cookie("token", "")
        return res.status(200).json({ 
            ok: true,
            message: "SignOut successfull" 
        });
    } catch (error) {
        console.error("Error signing out:", error);
        return res.status(500).json({ 
            ok: false,
            message: "Internal Server Error" 
        });
    }
}

export async function verifyEmail(req: Request, res: Response){ 
    const { email, code } = req.query;    
    if (!email || !code) {
        return res.status(400).json({
            ok: false,
             message: "Email and code are required" 
            });
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: { email: String(email) },
        });
        
        if (!user) {
            return res.status(404).json({ 
                ok: false,
                message: "User not found" 
            });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ 
                ok: false,
                message: "Email is already verified" 
            });
        }
        
        if (user.verificationCode !== String(code)) {
            return res.status(400).json({ 
                ok: false,
                message: "Invalid verification code" 
            });
        }
        
        if (user.verifyExpires && user.verifyExpires < new Date()) {
            return res.status(400).json({ 
                ok: false,
                message: "Verification code has expired" 
            });
        }
        
        await prisma.user.update({
            where: { email: String(email) },
            data: {
                isVerified: true,
                verificationCode: null,
                verifyExpires: null,
            },
        });
        
        return res.status(200).json({ 
            ok: true,
            message: "Email verified successfully" 
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ 
            ok: false,
            message: "Internal Server Error" 
        });
    }
}

export async function resendVerification(req: Request, res: Response){
    const {email} = req.query
    
    if(!email) {
        return res.status(400).json({ 
            ok: false,
            message: "Email is required" 
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: String(email) },
        });
        if (!user) {
            return res.status(404).json({ 
                ok: false,
                message: "User not found" 
            });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ 
                ok: false,
                message: "Email is already verified" 
            });
        }

        const code = user.verificationCode || generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        
        await sendVerificationEmail(String(email), code);
        await prisma.user.update({
            where: { email: String(email) },
            data: {
                verificationCode: code,
                verifyExpires: expires,
            },
        });

        res.status(200).json({ 
            ok: true,
            message: "Verification email resent successfully" 
        });
    } catch (error) {
        console.error("Error resending verification email:", error);
        return res.status(500).json({ 
            ok: false,
            message: "Internal Server Error" 
        });
    }
}
