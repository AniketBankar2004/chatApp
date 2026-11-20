import express from "express"
import { createRoom } from "../controllers/roomController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"


const router = express.Router()

router.post("/",authMiddleware,createRoom)

export default router