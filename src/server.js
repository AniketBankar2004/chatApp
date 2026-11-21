import express from "express";
import "dotenv/config";
import { Server } from "socket.io"
import http from "http"
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"
import connectDB from "./config/db.js";
import Room from "./models/roomModel.js";
import messageRoutes from "./routes/messageRoutes.js"
import Message from "./models/messageModel.js";

const app = express();

const server = http.createServer(app)

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"))
        }
        const decoded = JsonWebTokenError.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.userId = decoded.userId;

        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
})

io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    socket.on("joinRoom", async ({ roomId }, callback) => {
        try {
            const room = await Room.findOne({
                _id: roomId,
                members: socket.userId
            });

            if (!room) {
                return callback?.({
                    success: false,
                    messsage: "Room not found or access denied"
                })
            }

            socket.join(roomId);

            callback?.({
                success: true,
                message: "Joined room successfully"
            });

        } catch (error) {
            callback?.({
                success:false,
                message:"Unable to join room"
            })
        }
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
    });

    socket.on("sendMessage",async({roomId,content},callback)=>{
        try{
            if(!content || !content.trim()){
                return callback?.({
                    success: false,
                    message: "Message cannot be empty"
                });
            }

            const room = await Room.findOne({
                _id :roomId,
                members:socket.userId
            })

            if(!room){
                return callback?.({
                    success: false,
                    message: "You are not a member of this room"
                });
            }

            const message = await Message.create({
                room: room._id,
                sender: socket.userId,
                content: content.trim()
            });

            const populatedMessage = await Message.findById(message._id)
            .populate("sender","username");

            io.to(roomId).emit("newMessage",populatedMessage);

            callback?.({
                success: true,
                message: "Message sent"
            });
        }catch(error){
            console.error(error);

            callback?.({
                success:false,
                message:"failed to send message"
            })
        }
    })
})

app.use("/auth", authRoutes);
app.use("/room", roomRoutes);
app.use("/messages",messageRoutes);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();