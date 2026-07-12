import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const deleted = await db.product.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("BULK_PRODUCT_DELETE", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
