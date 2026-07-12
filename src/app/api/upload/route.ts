import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'template' or 'product'

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public/uploads", type || "misc");
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await require("fs/promises").mkdir(uploadDir, { recursive: true });
    
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${type || "misc"}/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
