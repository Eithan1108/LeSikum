// pages/api/repositories/getUserRepos.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required.",
                });
            }

            await dbConnect();

            // Find repositories owned by the user
            const repositories = await Repository.find({ owner: userId });

            res.status(200).json({
                success: true,
                repositories,
            });
        } catch (error) {
            console.error("Error fetching user repositories:", error);
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
