import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query;

        try {
            await dbConnect();
            
            // Fetch the user to get their savedSummaries array
            const user = await User.findOne({ id: userId }).select("savedSummaries");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Fetch summaries based on the savedSummaries array of custom IDs
            const savedSummaries = await Summary.find({ id: { $in: user.savedSummaries } });
            
            res.status(200).json({
                success: true,
                savedSummaries,
            });
        } catch (error) {
            console.error("Error fetching saved summaries:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching saved summaries.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
