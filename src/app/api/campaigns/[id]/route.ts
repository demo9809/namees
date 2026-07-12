import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const campaign = await db.campaign.findUnique({
      where: {
        id
      }
    });

    if (!campaign) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGN_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, status, startDate, endDate } = body;

    const campaign = await db.campaign.update({
      where: {
        id
      },
      data: {
        name,
        description,
        status,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGN_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const campaign = await db.campaign.delete({
      where: {
        id
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[CAMPAIGN_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
