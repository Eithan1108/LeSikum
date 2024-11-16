import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query; // Assuming the user ID is passed as a query parameter

        try {
            await dbConnect();
            const summaries = await Summary.find({ owner: userId }); // Fetch summaries for the specified user ID

            res.status(200).json({
                success: true,
                summaries,
            });
        } catch (error) {
            console.error("Error fetching user summaries:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching summaries.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
