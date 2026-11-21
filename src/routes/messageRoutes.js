import express from "express"
import { authMiddleware } from "../middleware/authmiddleware.js"
import { loadMessages } from "../controllers/messageController.js"
import router from "./authRoutes.js"

router  = express.Router()

router.get("/:roomId/messages",authMiddleware,loadMessages)

export default router