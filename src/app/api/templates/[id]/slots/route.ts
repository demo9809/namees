import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { slotsData } = body;
    const resolvedParams = await params;

    const template = await db.template.update({
      where: { id: resolvedParams.id },
      data: { slotsData: JSON.stringify(slotsData) },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("TEMPLATE_SLOTS_PUT", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
