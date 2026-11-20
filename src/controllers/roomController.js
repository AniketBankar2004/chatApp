import User from "../models/userModel.js"
import Room from "../models/roomModel.js";
import { randomInt } from "node:crypto";

function generateCode(length = 6) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
        const index = randomInt(0, characters.length);
        code += characters[index];
    }

    return code;
}

export const createRoom = async (req, res) => {
try{
    const userId = req.userId

    const {roomName} = req.body

    const user = await User.findOne({ _id: userId });

    console.log("userId: ",userId)

    if (!user) {
        return res.status(404).json(
            { message: "User not found" }
        )
    }

    const createdRoom = await Room.create({
        roomName:roomName,
        owner:user._id,
        roomId:generateCode()
    })

    return res.status(200).json({
        message:"created rooom",
        roomId:createdRoom.roomId
    })

}catch(err){
    console.log(err)

    return res.status(500).json({
        message:"Internal Server error"
    })
}

}