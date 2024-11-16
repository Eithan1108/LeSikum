// /api/summaries/decrementLikes.ts

import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            const { summaryId } = req.body;
            await dbConnect();

            const summary = await Summary.findOne({ id: summaryId });
            if (!summary) {
                return res.status(404).json({ success: false, message: "Summary not found." });
            }

            summary.likes = Math.max(0, summary.likes - 1);  // Ensure likes don't go negative
            await summary.save();

            res.status(200).json({ success: true, message: "Summary likes decremented.", summary });
        } catch (error) {
            console.error("Error decrementing summary likes:", error);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
