import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        console.log("Fetching all summaries...");

        try {
            // Connect to the database
            await dbConnect();
            console.log("Database connected");

            // Fetch all summaries
            const summaries = await Summary.find({});
            console.log("Summaries fetched:", summaries);

            // Send the summaries as the response
            res.status(200).json({
                success: true,
                data: summaries,
            });
        } catch (error) {
            console.error("Error fetching all summaries:");
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching summaries.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
}
