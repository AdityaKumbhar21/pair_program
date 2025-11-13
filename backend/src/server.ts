import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from "http";
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import roomRouter from './routes/rooms';
import { getRoomByShortId } from './controllers/roomController';
//import {authMiddleware} from "./middlewares/auth.js"


const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {origin: "*"}
})

app.use("/api/auth", authRouter)
app.use("/api/rooms", roomRouter)

app.get("/rooms/:shortId",getRoomByShortId)

io.on("connection", (socket) => {
    console.log("User connected", socket.id);
})

server.listen(PORT, ()=>{
    console.log("Server running");
    
})



