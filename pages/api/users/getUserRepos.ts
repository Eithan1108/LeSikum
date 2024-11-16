// pages/api/repositories/getRepositoriesByUserId.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { userId } = req.query; // Assuming the user ID is passed as a query parameter

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
        }

        try {
            await dbConnect();

            // Find repositories where the user is either the owner or a collaborator
            const repositories = await Repository.find({
                $or: [
                    { owner: userId }, // User is the owner
                    { collaborators: userId } // User is a collaborator
                ]
            });

            res.status(200).json({
                success: true,
                repositories,
            });
        } catch (error) {
            console.error("Error fetching user repositories:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching repositories.",
            });
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found",
        });
    }
}
