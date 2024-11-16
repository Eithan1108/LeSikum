import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query

  if (typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Invalid file ID' })
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileId)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    const stat = fs.statSync(filePath)

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.pdf') {
      contentType = 'application/pdf'
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } else if (ext === '.doc') {
      contentType = 'application/msword'
    }
    // Add more content types as needed

    res.setHeader('Content-Length', stat.size)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`)

    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error serving file:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}