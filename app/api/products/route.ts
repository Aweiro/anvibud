
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const categorySlug = searchParams.get("categorySlug");
  const subcategorySlug = searchParams.get("subcategorySlug");
  const sort = searchParams.get("sort") || "newest";

  const search = searchParams.get("search");

  const skip = (page - 1) * limit;

  const whereClause: any = { isActive: true };
  if (subcategorySlug) {
    whereClause.subcategory = { slug: subcategorySlug };
  } else if (categorySlug) {
    whereClause.subcategory = {
      category: { slug: categorySlug }
    };
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { name_uk: { contains: search, mode: 'insensitive' } },
      { name_ru: { contains: search, mode: 'insensitive' } },
      { name_pl: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        subcategory: {
          include: { category: true }
        }
      },
      take: limit,
      skip: skip,
      orderBy
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
