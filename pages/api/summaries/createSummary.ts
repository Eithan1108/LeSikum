import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import User from "@/lib/models/User"; // Import your User model
import Repository from "@/lib/models/Repository"; // Import your Repository model


import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("blobloblo");
    if (req.method === "POST") {
      try {
        const { summary, repoId, folderId } = req.body; // Destructure repoId, folderId, and summary from the request body
  
        await dbConnect();

        console.log("Creating summary:", summary);
  
        // Create the summary
        const createdSummary = await Summary.create(summary);
  
        // Increment the user's summary count
        await User.updateOne(
          { id: summary.owner },
          { $inc: { summariesCount: 1 } }
        );
  
        console.log("Summary created:", createdSummary);
  
        // If a repoId and folderId are provided, update the repository
        if (repoId && folderId) {
          console.log("Updating repository with repoId:", repoId);
          await updateRepo(repoId, folderId, createdSummary);
        }
  
        // await notifyFollowers(summary, summary.owner);

        res.status(200).json({
          success: true,
          message: "Summary created and repository updated successfully",
          summary: createdSummary,
        });
      } catch (error) {
        console.error("Error creating summary:", error);
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
  

// Function to update the repository with the new summary
async function updateRepo(repoId: string, folderId: string, summary: any) {
    try {
        console.log("Attempting to find repository with id:", repoId);
        const repo = await Repository.findOne({ id: repoId });

        if (!repo) {
            throw new Error("Repository not found");
        }

        console.log("Found repository:", repo); 

        let folderToUpdate = findFolderById(repo.rootFolder, folderId);

        if (!folderToUpdate) {
            throw new Error("Folder not found");
        }

        console.log("Found folder:", folderToUpdate); 

        // Add the summary to the folder's items
        folderToUpdate.items.push({
            id: summary.id,  
            title: summary.title,
            description: summary.description,
            author: summary.author,
            lastUpdated: summary.lastUpdated,
            views: summary.views,
            likes: summary.likes,
            comments: summary.comments,
            path: summary.path,
            owner: summary.owner,
            isPrivate: summary.isPrivate,
        });

        console.log("Folder updated with new summary:", folderToUpdate);

        // Update the repository by creating a new object
        const updatedRepo = {
            ...repo.toObject(), // Convert the repo to a plain object to avoid mutation issues
            rootFolder: {
                ...repo.rootFolder,
                items: [...repo.rootFolder.items, folderToUpdate] // Ensure that the items array is updated correctly
            }
        };

        // Save the updated repository
        await Repository.updateOne({ id: repoId }, updatedRepo);  // Use `updateOne` to save changes to the database

        console.log("Repository updated successfully");
    } catch (error) {
        console.error("Error updating repository:", error);
    }
}



// Helper function to find a folder by its ID (recursively)
// Ensure folder search uses the custom `id` field
function findFolderById(folder: any, folderId: string): any {
    console.log("Checking folder:", folder.id); // Log the current folder ID

    if (folder.id === folderId) {
        return folder;
    }

    // If the folder has subfolders (items that are folders), recurse into them
    for (const item of folder.items) {
        if (item.items) {  // Check if this item is a folder
            const foundFolder = findFolderById(item, folderId);
            if (foundFolder) {
                return foundFolder;  // Return the found folder
            }
        }
    }

    return null;  // Return null if folder wasn't found
}
