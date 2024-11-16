import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import User from "@/lib/models/User";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
        const { summaryId } = req.body; // Expecting summaryId in the request body

        if (!summaryId) {
            return res.status(400).json({ success: false, message: "Missing summaryId in request body." });
        }

        try {
            await dbConnect();

            // Fetch the summary to validate its existence and retrieve associated data
            const summary = await Summary.findOne({ id: summaryId });

            if (!summary) {
                return res.status(404).json({ success: false, message: "Summary not found." });
            }

            console.log("Deleting summary:", summary);

            // Delete the summary
            await Summary.deleteOne({ id: summaryId });

            // Decrement the summary count for the owner
            await User.updateOne(
                { id: summary.owner },
                { $inc: { summariesCount: -1 } }
            );

            console.log("Summary deleted and user updated.");

            // Remove the summary from any repositories and folders
            const reposUpdated = await removeSummaryFromRepositories(summaryId);
            console.log("Summary removed from repositories:", reposUpdated);

            res.status(200).json({
                success: true,
                message: "Summary and related data deleted successfully.",
            });
        } catch (error) {
            console.error("Error while deleting summary:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while deleting the summary.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}

// Function to remove a summary from all repositories
async function removeSummaryFromRepositories(summaryId: string) {
    try {
        const repos = await Repository.find({ "rootFolder.items.id": summaryId });

        for (const repo of repos) {
            console.log("Updating repository:", repo.id);

            // Remove the summary from the folder structure
            const updatedRootFolder = removeSummaryFromFolder(repo.rootFolder, summaryId);

            // Save the updated repository
            await Repository.updateOne(
                { id: repo.id },
                { $set: { rootFolder: updatedRootFolder } }
            );
        }

        return true;
    } catch (error) {
        console.error("Error removing summary from repositories:", error);
        throw error;
    }
}

// Recursive helper to remove a summary from nested folders
function removeSummaryFromFolder(folder: any, summaryId: string): any {
    folder.items = folder.items.filter((item: any) => item.id !== summaryId);

    for (const item of folder.items) {
        if (item.items) {
            item.items = removeSummaryFromFolder(item, summaryId);
        }
    }

    return folder;
}
