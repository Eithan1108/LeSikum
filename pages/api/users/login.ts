import dbConnect from "@/lib/dbConnect"
import bcrypt from 'bcryptjs'
import User from "@/lib/models/User"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const data = JSON.parse(req.body)
            await dbConnect()

            // Find the user by their username
            const user = await User.findOne({ username: data.username }) // assuming email is the unique field

            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found."
                })
            }

            // Check if the password is correct
            const isMatch = await bcrypt.compare(data.password, user.password)
            if (!isMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Incorrect password."
                })
            }

            // If login is successful, return user information (excluding sensitive info like password)
            res.status(200).json({
                success: true,
                message: "Login successful",
                userId: user.id,
                // Optionally, return other non-sensitive user details here
            })
        } catch (error) {
            console.error("Login error:", error)
            res.status(500).json({
                success: false,
                message: "Something went wrong during login."
            })
        }
    } else {
        res.status(404).json({
            success: false,
            message: "Not found"
        })
    }
}
