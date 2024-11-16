import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User"; // Assuming you have a User model
import Repository from "@/lib/models/Repository"; // Assuming you have a Repository model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query; // Assuming the user ID is passed as a query parameter

        try {
            await dbConnect();
            
            // Fetch the user to get their likedRepositories array
            const user = await User.findOne({ id: userId }).select("likedRepositories"); // Use custom `id` field for user lookup
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Fetch repositories based on the likedRepositories array of custom IDs
            const likedRepositories = await Repository.find({ id: { $in: user.likedRepositories } }); // Query by custom `id` in Repository
            
            res.status(200).json({
                success: true,
                likedRepositories,
            });
        } catch (error) {
            console.error("Error fetching liked repositories:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching liked repositories.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
