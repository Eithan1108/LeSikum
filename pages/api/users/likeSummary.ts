// /api/users/likeSummary.ts

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Destructure summaryId and userId from the request body
            const { summaryId, userId } = req.body;

            // Connect to the database
            await dbConnect();

            // Find the user and add the summary ID to likedSummaries
            const user = await User.findOne({ id: userId });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            // Add the summaryId to likedSummaries if not already present
            if (!user.likedSummaries.includes(summaryId)) {
                user.likedSummaries.push(summaryId);
                await user.save();
            }

            // Send success response
            res.status(200).json({
                success: true,
                message: "User's liked summary updated.",
                user,
            });
        } catch (error) {
            console.error("Error updating user's liked summary:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}
