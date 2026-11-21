import express from "express"
import Room from "../models/roomModel";
import Message from "../models/messageModel";

export const loadMessages=async(req,res)=>{
    try{
        const userId = req.userId;

        const {roomId} = req.params

        const room = await Room.findOne({
            _id:roomId,
            members:userId
        })

        if(!room){
            return res.status(404).json({
                message:"Room not found or access denied"
            })
        }

        const messages = await Message.find({
            room:roomId
        })
        .populate("sender","username")
        .sort({createdAt:-1})
        .limit(50);

        return res.status(200).json({
            count:messages.length,
            messages:messages.reverse()
        });

    }catch(error){
        console.error(error);

        return res.status(500).json({
            message:"Internal Server error"
        })
    }
}