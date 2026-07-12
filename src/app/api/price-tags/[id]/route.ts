import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    
    await db.priceTag.delete({
      where: { id: resolvedParams.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("PRICETAG_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
