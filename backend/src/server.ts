import express from 'express';
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

interface Participant {
    id?: string;
    name: string;
    email?: string;
}

const roomDocs = new Map<string, Y.Doc>();
const roomParticipants = new Map<string, Map<string, Participant>>();

const removeParticipant = (shortId: string, socketId: string, io: Server) => {
    const participants = roomParticipants.get(shortId);
    if (!participants) {
        return;
    }

    if (participants.has(socketId)) {
        participants.delete(socketId);
        if (participants.size === 0) {
            roomParticipants.delete(shortId);
        }
        io.to(shortId).emit("room-users", Array.from(participants.values()));
    }
};

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("join-room", async ({user, shortId}) => {
        socket.join(shortId);
        socket.data.activeRoom = shortId;
        
        // Get or create Yjs document for this room
        if (!roomDocs.has(shortId)) {
            roomDocs.set(shortId, new Y.Doc());
        }

        if (!roomParticipants.has(shortId)) {
            roomParticipants.set(shortId, new Map());
        }

        const participants = roomParticipants.get(shortId)!;
        participants.set(socket.id, user);
        io.to(shortId).emit("room-users", Array.from(participants.values()));

        const doc = roomDocs.get(shortId)!;
        const stateUpdate = Y.encodeStateAsUpdate(doc);
        socket.emit("yjs-update", Array.from(stateUpdate));
        
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
        const activeRoom: string | undefined = socket.data.activeRoom;
        if (activeRoom) {
            removeParticipant(activeRoom, socket.id, io);
        }
    })

    socket.on("leave-room", ({ shortId }) => {
        socket.leave(shortId);
        removeParticipant(shortId, socket.id, io);
        if (socket.data.activeRoom === shortId) {
            delete socket.data.activeRoom;
        }
    });
})



server.listen(PORT, ()=>{
    console.log("Server running");
    
})



