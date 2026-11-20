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

export const getMyCreatedRooms = async (req, res) => {
    try {
        const userId = req.userId;

        const rooms = await Room.find({
            owner: userId
        })
        .populate("owner", "username email")
        .populate("members", "username");

        return res.status(200).json({
            message: "Created rooms fetched successfully",
            count: rooms.length,
            rooms
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const leaveRoom = async (req, res) => {
    try {
        const userId = req.userId;
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required"
            });
        }

        const room = await Room.findOne({ 
            roomId: roomId.toUpperCase() 
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Check whether user is a member
        const isMember = room.members.some(
            member => member.toString() === userId
        );

        if (!isMember) {
            return res.status(400).json({
                message: "You are not a member of this room"
            });
        }

        // Prevent owner from leaving
        if (room.owner.toString() === userId) {
            return res.status(400).json({
                message: "Room owner cannot leave. Transfer ownership or delete the room."
            });
        }

        // Remove user from members array
        await Room.updateOne(
            { _id: room._id },
            { $pull: { members: userId } }
        );

        return res.status(200).json({
            message: "Successfully left the room",
            roomId: room.roomId
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const getMyRooms = async (req, res) => {
    try {
        const userId = req.userId;

        const rooms = await Room.find({
            members: userId
        })
        .populate("owner", "username email")
        .populate("members", "username");

        return res.status(200).json({
            message: "Rooms fetched successfully",
            count: rooms.length,
            rooms
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Find room by MongoDB _id
        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Check room ownership
        if (room.owner.toString() !== userId) {
            return res.status(403).json({
                message: "Only the room owner can delete this room"
            });
        }

        await Room.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Room deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const userId = req.userId;
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({
                message: "Room ID is required"
            });
        }

        const room = await Room.findOne({
            roomId: roomId.toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

    
        if (room.members.some(member => member.toString() === userId)) {
            return res.status(409).json({
                message: "You are already a member of this room"
            });
        }

       
        room.members.push(userId);

        await room.save();

        return res.status(200).json({
            message: "Successfully joined room",
            roomId: room.roomId,
            roomName: room.roomName
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export const createRoom = async (req, res) => {
    try {
        const userId = req.userId

        const { roomName } = req.body

        const user = await User.findOne({ _id: userId });

        console.log("userId: ", userId)

        if (!user) {
            return res.status(404).json(
                { message: "User not found" }
            )
        }

        const createdRoom = await Room.create({
            roomName: roomName,
            owner: user._id,
            roomId: generateCode(),
            members: [userId]
        })

        return res.status(200).json({
            message: "created rooom",
            roomId: createdRoom.roomId
        })

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            message: "Internal Server error"
        })
    }

}