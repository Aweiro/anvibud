"use server";

import { prisma } from "@/lib/prisma";

export async function getLatestPrices(productIds: string[]) {
    if (!productIds || productIds.length === 0) return [];

    try {
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds }
            },
            select: {
                id: true,
                price: true,
                discountAmount: true,
                sizeVariants: true,
                stock: true,
            }
        });

        return products.map(p => ({
            id: p.id,
            price: Number(p.price),
            discountAmount: Number(p.discountAmount),
            sizeVariants: p.sizeVariants,
            stock: p.stock,
        }));
    } catch (error) {
        console.error("Error fetching latest prices:", error);
        return [];
    }
}
