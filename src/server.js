import express from "express";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js"
import connectDB from "./config/db.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/room",roomRoutes)

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