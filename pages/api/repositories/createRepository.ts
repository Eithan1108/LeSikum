import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import User from "@/lib/models/User";
import Community from "@/lib/models/Community"; // Import the Community model
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const { communityId, ...data } = req.body; // Extract communityId separately

            await dbConnect();

            // Create a new repository document
            const repositoryToCreate = {
                ...data,
                id: Date.now().toString(), // Custom ID or use MongoDB's generated ID
            };

            const repository = await Repository.create(repositoryToCreate);

            // If a community ID is provided, update the community's repository list
            if (communityId) {
                await Community.updateOne(
                    { id: communityId },
                    {
                        $inc: { totalContent: 1 },
                        $push: { repositories: repository.id } // Add the new repository ID to the community
                    }// Add the new repository ID to the community
                );
            }

            res.status(200).json({
                success: true,
                message: "Repository created successfully",
                repository,
            });
        } catch (error) {
            console.error("Error creating repository:", error);
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
