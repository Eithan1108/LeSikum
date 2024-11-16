// pages/api/requestToJoinCommunity.ts
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

            // Fetch user and community documents
            const user = await User.findOne({id: userId});
            const community = await Community.findOne({id: communityId});

            if (!user || !community) {
                return res.status(404).json({
                    success: false,
                    message: "User or Community not found",
                });
            }

            // Check if user is already a member or has a pending request
            if (community.members.includes(userId) || community.pendingMembers?.includes(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "User is already a member or has a pending request",
                });
            }

            // Add userId to pendingMembers array
            community.pendingMembers = community.pendingMembers || [];
            community.pendingMembers.push(userId);

            // Save the updated community document
            await community.save();

            // Return updated community along with user data
            return res.status(200).json({
                success: true,
                user,
                community,
            });
        } catch (error) {
            console.error("Error requesting to join community:", error);
            return res.status(500).json({
                success: false,
                message: "An error occurred while requesting to join the community.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }
}
