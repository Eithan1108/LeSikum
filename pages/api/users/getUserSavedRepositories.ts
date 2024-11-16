import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query;

        try {
            await dbConnect();
            
            // Fetch the user to get their savedRepositories array
            const user = await User.findOne({ id: userId }).select("savedRepositories");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Fetch repositories based on the savedRepositories array of custom IDs
            const savedRepositories = await Repository.find({ id: { $in: user.savedRepositories } });
            
            res.status(200).json({
                success: true,
                savedRepositories,
            });
        } catch (error) {
            console.error("Error fetching saved repositories:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching saved repositories.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
