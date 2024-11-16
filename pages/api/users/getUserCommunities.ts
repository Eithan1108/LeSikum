import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community"; // Assuming you have a Community model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query; // Assuming the user ID is passed as a query parameter

        try {
            await dbConnect();
            const communities = await Community.find({ members: userId }); // Fetch communities where the user is a member

            res.status(200).json({
                success: true,
                communities,
            });
        } catch (error) {
            console.error("Error fetching user communities:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching communities.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
