// pages/api/summaries/getAllSummaries.ts

import dbConnect from "@/lib/dbConnect";
import Summary from "@/lib/models/Summary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await dbConnect();

      // Fetch all summaries from the database
      const summaries = await Summary.find({});

      res.status(200).json({
        success: true,
        summaries,
      });
    } catch (error) {
      console.error("Error fetching summaries:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong while fetching summaries.",
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "Not found",
    });
  }
}
