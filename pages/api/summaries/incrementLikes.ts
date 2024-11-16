// /api/summaries/incrementLikes.ts

import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Destructure summaryId from the request body
            const { summaryId } = req.body;

            // Connect to the database
            await dbConnect();

            // Find the summary and increment the likes count
            const summary = await Summary.findOne({ id: summaryId });

            if (!summary) {
                return res.status(404).json({
                    success: false,
                    message: "Summary not found.",
                });
            }

            // Increment the likes count
            summary.likes += 1;
            await summary.save();

            // Send success response
            res.status(200).json({
                success: true,
                message: "Summary likes incremented.",
                summary,
            });
        } catch (error) {
            console.error("Error incrementing summary likes:", error);
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
