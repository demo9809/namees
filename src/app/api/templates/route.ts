import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templates = await db.template.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, imagePath, width, height } = body;

    if (!name || !imagePath || !width || !height) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await db.template.create({
      data: {
        name,
        imagePath,
        width: parseInt(width),
        height: parseInt(height)
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
