import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err)
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    const fileArray = files.file
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray

    const fileName = file.newFilename || file.originalFilename || 'unknown'
    const filePath = path.join('uploads', fileName)

    // Create file metadata
    const fileMetadata = {
      id: fileName, // Use the file name as the ID
      name: fileName,
      path: filePath,
      size: file.size,
      type: file.mimetype || 'application/octet-stream',
      uploadDate: new Date().toISOString(),
    }

    try {
      res.status(200).json({
        message: 'File uploaded successfully',
        fileId: fileMetadata.id, // This will now be the file name
      })
    } catch (error) {
      console.error('Error processing file upload:', error)
      res.status(500).json({ message: 'Error processing file upload' })
    }
  })
}