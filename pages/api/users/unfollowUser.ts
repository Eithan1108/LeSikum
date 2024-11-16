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

            // Remove followerId from followingId's followers list and decrement followingId's followersCount
            const followingUser = await User.findOneAndUpdate(
                { id: followingId },
                { 
                    $pull: { followingId: followerId }, // $pull removes the element from the array
                    $inc: { following: -1 } // Decrement followingCount by 1
                },
                { new: true }
            );

            // Remove followingId from followerId's following list and decrement followerId's followingCount
            const followerUser = await User.findOneAndUpdate(
                { id: followerId },
                { 
                    $pull: { followerIds: followingId }, // $pull removes the element from the array
                    $inc: { followers: -1 } // Decrement followersCount by 1
                },
                { new: true }
            );

            if (!followingUser || !followerUser) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            res.status(200).json({
                success: true,
                message: "Unfollowed user successfully.",
                follower: followerUser,
                following: followingUser,
            });
        } catch (error) {
            console.error("Error updating unfollow relationship:", error);
            res.status(500).json({
                success: false,
                message: "Failed to unfollow user.",
            });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
