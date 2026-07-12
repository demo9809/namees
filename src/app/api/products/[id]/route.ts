import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const product = await db.product.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!product) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const { name, sku, barcode, offerPrice, mrp, imagePath, images, categoryId } = body;

    const productSku = sku && sku.trim() !== "" ? sku : null;
    const productBarcode = barcode && barcode.trim() !== "" ? barcode : null;

    const product = await db.product.update({
      where: { id: resolvedParams.id },
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    await db.product.delete({
      where: { id: resolvedParams.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
