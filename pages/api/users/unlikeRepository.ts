// /api/users/unlikeSummary.ts

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            const { repoId, userId } = req.body;
            await dbConnect();

            const user = await User.findOne({ id: userId });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            // Remove summaryId from likedSummaries
            // user.likedRepositories = user.likedRepositories.filter((id: string) => id !== repoId);
            user.likedRepositories = user.likedRepositories.remove(repoId);
            await user.save();

            res.status(200).json({ success: true, message: "User's liked summary removed.", user });
        } catch (error) {
            console.error("Error unliking summary:", error);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
