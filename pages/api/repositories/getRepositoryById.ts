// pages/api/repositories/getRepositoryById.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository"; // Adjust the model path if necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // Extract the repository id from the URL parameter

    if (req.method === "GET") {
        try {
            // Connect to the database
            await dbConnect();

            // Fetch the repository by the custom id (not _id)
            const repository = await Repository.findOne({ id });

            if (!repository) {
                return res.status(404).json({ success: false, message: "Repository not found." });
            }

            res.status(200).json({
                success: true,
                repository,
            });
        } catch (error) {
            console.error("Error fetching repository:", error);
            res.status(500).json({ success: false, message: "Failed to fetch repository." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
