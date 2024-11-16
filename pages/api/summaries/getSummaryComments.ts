// pages/api/summaries/getSummaryComments.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import Comment from "@/lib/models/Comment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { summaryId } = req.query;

        if (!summaryId) {
            return res.status(400).json({ success: false, message: "Summary ID is required." });
        }

        try {
            await dbConnect();

            // Find the summary by custom 'id' field
            const summary = await Summary.findOne({ id: summaryId });
            if (!summary) {
                return res.status(404).json({ success: false, message: "Summary not found." });
            }

            // Fetch all comments based on IDs in summary.comments
            const comments = await Comment.find({ id: { $in: summary.comments } });

            res.status(200).json({ success: true, comments });
        } catch (error) {
            console.error("Error fetching comments for summary:", error);
            res.status(500).json({ success: false, message: "Failed to fetch comments for summary." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
