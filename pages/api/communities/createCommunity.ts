// /pages/api/communities/createCommunity.ts

import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community";
import User from "@/lib/models/User";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            const data = req.body;

            await dbConnect();

            const communityToCreate = {
                ...data,
                id: Date.now().toString(),
              }

            // Create a new community in the database
            const community = await Community.create(communityToCreate);



            res.status(200).json({
                success: true,
                message: "Community created successfully",
                communityId: communityToCreate.id,  // Return the new community ID
            });
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create community.",
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }
}
