// /api/owners/incrementTotalLikes.ts

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {
        try {
            // Destructure ownerId from the request body
            const { ownerId } = req.body;

            // Connect to the database
            await dbConnect();

            // Find the owner and increment the totalLikes
            const user = await User.findOne({ id: ownerId });


            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Owner not found.",
                });
            }

            // Increment the totalLikes
            user.totalLikes += 1;
            await user.save();

            // Send success response
            res.status(200).json({
                success: true,
                message: "Owner total likes incremented.",
                user,
            });
        } catch (error) {
            console.error("Error incrementing owner's total likes:", error);
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
