// /api/summaries/incrementLikes.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Destructure summaryId from the request body
            const { repositoryId  } = req.body;

            // Connect to the database
            await dbConnect();

            console.log("repositoryId", repositoryId);
            // Find the summary and increment the likes count
            const repository = await Repository.findOne({ id: repositoryId });

            if (!repository) {
                return res.status(404).json({
                    success: false,
                    message: "Summary not found.",
                });
            }

            // Increment the likes count
            repository.likes += 1;
            await repository.save();

            // Send success response
            res.status(200).json({
                success: true,
                message: "Summary likes incremented.",
                repository,
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
