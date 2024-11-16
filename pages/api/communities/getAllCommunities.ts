// File: pages/api/communities/getAllCommunities.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Community from "@/lib/models/Community";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await dbConnect();
      console.log("Database connected");

      // Fetch all communities
      const communities = await Community.find({});
      console.log("Communities retrieved:", communities);

      res.status(200).json({
        success: true,
        data: communities
      });
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching communities."
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Endpoint not found."
    });
  }
}
