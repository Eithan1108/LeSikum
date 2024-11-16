import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("req.method:", req.method);
    if (req.method === "POST") {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ success: false, message: "Both followerId and followingId are required." });
        }

        try {
            await dbConnect();

            // Add followerId to followingId's followers list and increment followingId's followersCount
            const followingUser = await User.findOneAndUpdate(
                { id: followingId },
                { 
                    $addToSet: { followingId: followerId }, // $addToSet ensures no duplicates
                    $inc: { following: 1 } // Increment followersCount by 1
                },
                { new: true }
            );

            // Add followingId to followerId's following list and increment followerId's followingCount
            const followerUser = await User.findOneAndUpdate(
                { id: followerId },
                { 
                    $addToSet: { followerIds: followingId }, // $addToSet ensures no duplicates
                    $inc: { followers: 1 } // Increment followingCount by 1
                },
                { new: true }
            );


            if (!followingUser || !followerUser) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            res.status(200).json({
                success: true,
                message: "Followed user successfully.",
                follower: followerUser,
                following: followingUser,
            });
        } catch (error) {
            console.error("Error updating follow relationship:", error);
            res.status(500).json({
                success: false,
                message: "Failed to follow user.",
            });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
