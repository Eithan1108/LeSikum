import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import User from "@/lib/models/User"; 
import { NextApiRequest, NextApiResponse } from "next";
import incrementTotalViews from "../users/incrementTotalViews"; // Import the function




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { id, userId } = req.query;

            // Check if the required parameters are provided
            if (!id || !userId) {
                return res.status(400).json({
                    success: false,
                    message: "Both summaryId and userId are required.",
                });
            }

            // Ensure database connection
            await dbConnect();

            // Fetch the summary by its custom ID and populate the owner field
            const summary = await Summary.findOne({ id: id }).populate('owner');
            const user = await User.findOne({ id: userId });

            // Check if the summary or user exists
            if (!summary || !user) {
                return res.status(404).json({
                    success: false,
                    message: "Summary or User not found.",
                });
            }

            // Access the owner from the populated field
            const owner = await User.findOne({ id: summary.owner }); // This should be a populated User object


            

            // Return the updated data
            res.status(200).json({
                success: true,
                summary: summary,
                user,
                owner: owner,
            });
        } catch (error) {
            console.error("Error updating view count:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching or updating the data.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}
