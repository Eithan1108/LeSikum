import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing userId",
            });
        }

        try {
            await dbConnect();

            // Fetch communities where the user is a member
            const userCommunities = await Community.find({ members: userId });

            res.status(200).json({
                success: true,
                communities: userCommunities,
            });
        } catch (error) {
            console.error("Error fetching communities:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch communities.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }
}
