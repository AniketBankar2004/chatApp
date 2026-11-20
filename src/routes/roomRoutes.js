import express from "express"
import { createRoom, deleteRoom, getMyCreatedRooms, getMyRooms, joinRoom, leaveRoom } from "../controllers/roomController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"


const router = express.Router()

router.post("/",authMiddleware,createRoom)
router.post("/join/:roomId",authMiddleware,joinRoom)
router.post("/leave/:roomId",authMiddleware,leaveRoom)
router.delete("/:id",authMiddleware,deleteRoom)
router.get("/my-created-rooms",authMiddleware,getMyCreatedRooms)
router.get("/my-rooms",authMiddleware,getMyRooms)

export default router