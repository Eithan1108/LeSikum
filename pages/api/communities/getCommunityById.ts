// pages/api/communities/getCommunityById.ts

import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Community ID is required.",
                });
            }

            await dbConnect();

            // Find the community by its ID
            const community = await Community.findOne({ id });

            if (!community) {
                return res.status(404).json({
                    success: false,
                    message: "Community not found.",
                });
            }

            res.status(200).json({
                success: true,
                community,
            });
        } catch (error) {
            console.error("Error fetching community:", error);
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
