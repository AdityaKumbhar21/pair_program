import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from "http";
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import roomRouter from './routes/rooms';
import { getRoomByShortId } from './controllers/roomController';
import * as Y from 'yjs';


const app = express()
const PORT = process.env.PORT

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
})

app.use("/api/auth", authRouter)
app.use("/api/rooms", roomRouter)

app.get("/rooms/:shortId",getRoomByShortId)

const roomDocs = new Map<string, Y.Doc>();

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("join-room", async ({user, shortId}) => {
        socket.join(shortId);
        
        // Get or create Yjs document for this room
        if (!roomDocs.has(shortId)) {
            roomDocs.set(shortId, new Y.Doc());
        }
        
        socket.emit("room-joined", {shortId, user});
        console.log(`User ${socket.id} joined room ${shortId}`);
    })

    // Handle Yjs updates from clients
    socket.on("yjs-update", ({ shortId, update }) => {
        const doc = roomDocs.get(shortId);
        if (doc) {
            // Apply update to server document
            Y.applyUpdate(doc, new Uint8Array(update));
            
            // Broadcast update to all other clients in the room
            socket.to(shortId).emit("yjs-update", update);
        }
    });

    socket.on("disconnect", ()=>{
        console.log("User disconnected: ", socket.id);
    })
})



server.listen(PORT, ()=>{
    console.log("Server running");
    
})



