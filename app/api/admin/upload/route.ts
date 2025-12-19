import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/app/api/_utils/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    await requireRole(["admin"]);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ message: "No files uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "pharmacy", resource_type: "image" },
            (err, res) => {
              if (err) reject(err);
              else resolve(res);
            }
          )
          .end(buffer);
      });

      urls.push(result.secure_url);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
