import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, templateId, campaignId, canvasData, previewUrl } = body;

    if (!name || !templateId || !canvasData) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const poster = await db.poster.create({
      data: {
        name,
        templateId,
        campaignId,
        canvasData,
        previewUrl,
      }
    });

    return NextResponse.json(poster);
  } catch (error) {
    console.error("POSTER_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
