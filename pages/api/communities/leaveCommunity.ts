// pages/api/leaveCommunity.ts
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Community from "@/lib/models/Community";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { userId, communityId } = req.body;

        if (!userId || !communityId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Community ID are required",
            });
        }

        try {
            await dbConnect();

            // Fetch the user and community documents
            const user = await User.findOne({id: userId});
            const community = await Community.findOne({id: communityId});

            if (!user || !community) {
                return res.status(404).json({
                    success: false,
                    message: "User or Community not found",
                });
            }

            // Check if the user is a member of the community
            if (!community.members.includes(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "User is not a member of this community",
                });
            }

            // Update Community: Remove userId from members and decrement totalMembers
            community.members = community.members.filter((id: string) => id !== userId);
            community.totalMembers -= 1;

            // Update User: Remove communityId from the user's communities
            user.communities = user.communities.filter((id: string) => id !== communityId);

            // Save the updated documents
            await Promise.all([user.save(), community.save()]);

            // Respond with the updated User and Community
            return res.status(200).json({
                success: true,
                user,
                community,
            });
        } catch (error) {
            console.error("Error leaving community:", error);
            return res.status(500).json({
                success: false,
                message: "An error occurred while leaving the community.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }
}
