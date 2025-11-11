import jwt from "jsonwebtoken";


export const generateToken = (id:string) =>{
    jwt.sign({
                userId: id
            }, process.env.JWT_SECRET!, {expiresIn:"7d"})
}