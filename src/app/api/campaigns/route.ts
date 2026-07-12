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

    const campaigns = await db.campaign.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("[CAMPAIGNS_GET]", error);
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
    const { name, description, status, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const campaign = await db.campaign.create({
      data: {
        name,
        description,
        status: status || "DRAFT",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
