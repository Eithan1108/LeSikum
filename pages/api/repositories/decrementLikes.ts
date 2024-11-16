// /api/summaries/decrementLikes.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            const { repositoryId } = req.body;
            await dbConnect();
            console.log("repositoryId", repositoryId);
            const repository = await Repository.findOne({ id: repositoryId });
            if (!repository) {
                return res.status(404).json({ success: false, message: "Summary not found." });
            }

            repository.likes = Math.max(0, repository.likes - 1);  // Ensure likes don't go negative
            await repository.save();
            console.log("seaved", repository);

            res.status(200).json({ success: true, message: "Summary likes decremented.", repository });
        } catch (error) {
            console.error("Error decrementing summary likes:", error);
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
