"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
            data: { stock: { increment: quantity } }
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

export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        const serializedOrders = orders.map(order => ({
            ...order,
            total: order.total.toString(),
            subtotal: order.subtotal.toString(),
            discountTotal: order.discountTotal.toString(),
            items: order.items.map(item => ({
                ...item,
                unitPrice: item.unitPrice.toString(),
                discountAmount: item.discountAmount.toString(),
                total: item.total.toString(),
                product: {
                    ...item.product,
                    price: item.product.price.toString(),
                    discountAmount: item.product.discountAmount.toString(),
                }
            }))
        }));
        return { success: true, data: serializedOrders };
    } catch (error: any) {
        console.error("GET_ORDERS_ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function updateOrderStatus(id: string, status: any) {
    try {
        const existingOrder = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!existingOrder) throw new Error("Order not found");

        const oldStatus = existingOrder.status;
        const newStatus = status;

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id },
                data: { status }
            });

            // Logic for stock adjustment based on status transition
            if (oldStatus !== "CANCELLED" && newStatus === "CANCELLED") {
                // Return items to stock
                for (const item of existingOrder.items) {
                    await adjustStock(item.productId, item.size, item.quantity);
                }
            } else if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
                // Re-deduct from stock
                for (const item of existingOrder.items) {
                    await adjustStock(item.productId, item.size, -item.quantity);
                }
            }

            return order;
        });

        const serializedOrder = {
            ...updatedOrder,
            total: updatedOrder.total.toString(),
            subtotal: updatedOrder.subtotal.toString(),
            discountTotal: updatedOrder.discountTotal.toString()
        };

        revalidatePath("/admin/orders");
        return { success: true, data: serializedOrder };
    } catch (error: any) {
        console.error("UPDATE_ORDER_ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteOrder(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!order) throw new Error("Order not found");

        await prisma.$transaction(async (tx) => {
            // If it wasn't cancelled yet, return items to stock
            if (order.status !== "CANCELLED") {
                for (const item of order.items) {
                    await adjustStock(item.productId, item.size, item.quantity);
                }
            }
            
            await tx.order.delete({
                where: { id }
            });
        });

        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error: any) {
        console.error("DELETE_ORDER_ERROR:", error);
        return { success: false, error: error.message };
    }
}
