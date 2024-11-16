// pages/api/repositories/getAllRepositories.ts

import dbConnect from "@/lib/dbConnect";
import Repository from "@/lib/models/Repository";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            await dbConnect();

            // Fetch all repositories
            const repositories = await Repository.find();

            res.status(200).json({
                success: true,
                message: "Repositories retrieved successfully",
                repositories,
            });
        } catch (error) {
            console.error("Error fetching repositories:", error);
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
