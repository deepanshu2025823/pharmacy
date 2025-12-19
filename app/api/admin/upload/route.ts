import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireRole } from "@/app/api/_utils/auth";

// Allowed file types with their extensions and mime types
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB`);
        continue;
      }

      // Validate file type
      const fileExtension = path.extname(file.name).toLowerCase();
      const isValidType = Object.entries(ALLOWED_FILE_TYPES).some(
        ([mimeType, extensions]) => 
          file.type === mimeType && extensions.includes(fileExtension)
      );

      if (!isValidType) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${randomString}-${safeName}`;
        
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, buffer);

        urls.push(`/uploads/${filename}`);
      } catch (error) {
        errors.push(`${file.name}: Upload failed`);
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    if (urls.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { message: "All uploads failed", errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      urls,
      ...(errors.length > 0 && { errors })
    });
  } catch (e) {
    console.error("UPLOAD ERROR", e);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}