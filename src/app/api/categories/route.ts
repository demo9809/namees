import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const categories = await db.category.findMany({
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("CATEGORIES_GET", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
