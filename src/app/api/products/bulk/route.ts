import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { products } = body; 

    if (!Array.isArray(products) || products.length === 0) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const categoriesToEnsure = Array.from(new Set(products.map((p: any) => p.category?.trim()).filter(Boolean))) as string[];
    const existingCats = await db.category.findMany({ where: { name: { in: categoriesToEnsure } } });
    const categoryMap = new Map(existingCats.map(c => [c.name.toLowerCase(), c.id]));
    
    const missing = categoriesToEnsure.filter(c => !categoryMap.has(c.toLowerCase()));
    if (missing.length > 0) {
      await db.category.createMany({ data: missing.map(m => ({ name: m })) });
      const newlyCreated = await db.category.findMany({ where: { name: { in: missing } } });
      newlyCreated.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));
    }
    
    const defaultCategory = await db.category.findFirst({ orderBy: { createdAt: "asc" } });

    const created = await db.product.createMany({
      data: products.map((p: any) => {
        const catName = p.category?.trim().toLowerCase();
        const catId = catName ? categoryMap.get(catName) : defaultCategory?.id;
        
        return {
          name: String(p.name || "Unnamed").trim(),
          mrp: parseFloat(p.mrpPrice) || 0,
          offerPrice: parseFloat(p.offerPrice) || 0,
          imagePath: "",
          images: "[]",
          categoryId: catId
        };
      })
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("BULK_PRODUCT_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
