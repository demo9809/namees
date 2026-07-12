import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { ids, offerPrice, mrp } = body;

    if (!Array.isArray(ids) || ids.length === 0 || typeof offerPrice !== 'number' || typeof mrp !== 'number') {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const updated = await db.product.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        offerPrice,
        mrp
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("BULK_PRODUCT_EDIT", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
