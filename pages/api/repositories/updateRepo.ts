import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Received method:", req.method);  // Log the method to confirm it's PUT

    if (req.method === "PUT") {
        try {
            const { repoId, ...updateData } = req.body;
            console.log("Received repoId:", updateData.id);  // Log the repoId to confirm it's received
            console.log("Received updateData:", updateData);  // Log the updateData to confirm it's received

            // Log the request data
            console.log("Request body:", req.body);

            await dbConnect();

            const updatedRepo = await Repository.findOneAndUpdate(
                { id: updateData.id },  // Replace with your custom `repoId`
                updateData,
                { new: true }
            );

            if (!updatedRepo) {
                return res.status(404).json({
                    success: false,
                    message: "Repository not found.",
                });
            }

            res.status(200).json({
                success: true,
                message: "Repository updated successfully",
                repo: updatedRepo,
            });
        } catch (error) {
            console.error("Error updating repository:", error);
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
