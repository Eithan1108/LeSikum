// /api/users/likeSummary.ts

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("hello");
    if (req.method === "PUT") {
        try {
            // Destructure summaryId and userId from the request body
            const { repoId, userId } = req.body;

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
            console.log("user", user);
            // Add the summaryId to likedSummaries if not already present
            console.log("!user.likedRepositories.includes(repositoryId)", !user.likedRepositories.includes(repoId));
            
            console.log("repositoryId", repoId);
            const updtatedUser = await User.findOneAndUpdate({ id: userId }, { $push: { likedRepositories: repoId } }, { new: true });

            console.log("updtatedUser", updtatedUser);
            // if (!user.likedRepositories.includes(repositoryId)) {
                
            //     user.likedRepositories.push(repositoryId);
            //     await user.save();
            //     console.log("Hello user", user);
            // }

            // Send success response
            res.status(200).json({
                success: true,
                message: "User's liked summary updated.",
                user: updtatedUser,
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
