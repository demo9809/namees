import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        brand: true,
        folder: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
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
    const { name, sku, barcode, offerPrice, mrp, imagePath, images, categoryId } = body;

    if (!name || offerPrice === undefined || mrp === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const productSku = sku && sku.trim() !== "" ? sku : null;
    const productBarcode = barcode && barcode.trim() !== "" ? barcode : null;

    const product = await db.product.create({
      data: {
        name,
        sku: productSku,
        barcode: productBarcode,
        offerPrice: parseFloat(offerPrice),
        mrp: parseFloat(mrp),
        imagePath,
        images: images ? JSON.stringify(images) : "[]",
        categoryId
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
