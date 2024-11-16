import dbConnect from "@/lib/dbConnect"
import User from "@/lib/models/User"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("hey")
    if (req.method === 'GET') {
        try {
            const id = JSON.parse(req.body)
            console.log("id", id)

            // Ensure database connection
            await dbConnect()

            // Find user by ID
            const user = await User.findById(id)
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" })
            }

            // Send user data (excluding sensitive information)
            res.status(200).json({ 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    // Add any other non-sensitive user fields here
                }
            })
        } catch (error) {
            console.error("Error fetching user by ID:", error)
            res.status(500).json({
                success: false,
                message: "Something went wrong while fetching the user."
            })
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" })
    }
}
