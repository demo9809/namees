import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, imagePath } = body;

    if (!name || !imagePath) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const priceTag = await db.priceTag.create({
      data: { name, imagePath }
    });

    return NextResponse.json(priceTag);
  } catch (error) {
    console.error("PRICETAG_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const priceTags = await db.priceTag.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(priceTags);
  } catch (error) {
    console.error("PRICETAG_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
