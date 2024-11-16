// pages/api/summaries/getSummaryById.ts

import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Summary ID is required.",
                });
            }

            await dbConnect();

            // Find the summary by its ID
            const summary = await Summary.findOne({ id });
            console.log("summary", summary);

            if (!summary) {
                return res.status(404).json({
                    success: false,
                    message: "Summary not found.",
                });
            }

            res.status(200).json({
                success: true,
                summary,
            });
        } catch (error) {
            console.error("Error fetching summary:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
