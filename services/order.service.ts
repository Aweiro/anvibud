import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validations/checkout";

async function adjustStock(productId: string, size: string | null, quantity: number) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true, sizeVariants: true, baseSize: true }
    });

    if (!product) return;

    // 1. If it's the base size or no size specified
    if (!size || size === product.baseSize) {
        await prisma.product.update({
            where: { id: productId },
            data: { stock: { increment: quantity } } // quantity can be negative for deduction
        });
        return;
    }

    // 2. If it's a variant size
    if (product.sizeVariants) {
        const variants = [...(product.sizeVariants as any[])];
        const variantIndex = variants.findIndex(v => v.size === size);
        
        if (variantIndex !== -1) {
            const currentStock = variants[variantIndex].stock ? parseInt(variants[variantIndex].stock, 10) : 0;
            variants[variantIndex].stock = Math.max(0, currentStock + quantity).toString();
            
            await prisma.product.update({
                where: { id: productId },
                data: { sizeVariants: variants }
            });
        }
    }
}

export async function createOrder(data: CheckoutInput) {
    // Use transaction to ensure order and stock update happen together
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                customerName: data.name,
                customerPhone: data.phone,
                subtotal: data.subtotal,
                discountTotal: 0,
                shippingCost: data.shippingCost,
                total: data.total,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        discountAmount: 0,
                        total: item.price * item.quantity,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // Deduct stock for each item
        for (const item of data.items) {
            await adjustStock(item.productId, item.size || null, -item.quantity);
        }

        return order;
    });
}
