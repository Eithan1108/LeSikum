import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User"; // Assuming you have a User model
import Summary from "@/lib/models/Summary"; // Assuming you have a Summary model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query; // Assuming the user ID is passed as a query parameter

        try {
            await dbConnect();
            
            // Fetch the user to get their likedSummaries array
            const user = await User.findOne({ id: userId }).select("likedSummaries"); // Use custom `id` field
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Fetch summaries based on the likedSummaries array of custom IDs
            const likedSummaries = await Summary.find({ id: { $in: user.likedSummaries } }); // Query by custom `id`
            console.log("Liked summaries:", likedSummaries);
            res.status(200).json({
                success: true,
                likedSummaries,
            });
        } catch (error) {
            console.error("Error fetching liked summaries:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching liked summaries.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
