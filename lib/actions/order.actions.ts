"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });
        const serializedOrder = {
            ...order,
            total: order.total.toString(),
            subtotal: order.subtotal.toString(),
            discountTotal: order.discountTotal.toString()
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
        await prisma.order.delete({
            where: { id }
        });
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error: any) {
        console.error("DELETE_ORDER_ERROR:", error);
        return { success: false, error: error.message };
    }
}
