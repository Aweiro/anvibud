"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCallbackRequest(phone: string) {
    try {
        const request = await prisma.callbackRequest.create({
            data: {
                phone,
            }
        });
        revalidatePath("/admin/orders");
        return { success: true, data: request };
    } catch (error: any) {
        console.error("CALLBACK_REQUEST_ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function getCallbackRequests() {
    try {
        const requests = await prisma.callbackRequest.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        return { success: true, data: requests };
    } catch (error: any) {
        console.error("GET_CALLBACKS_ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCallbackStatus(id: string, status: string) {
    try {
        const request = await prisma.callbackRequest.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/admin/orders");
        return { success: true, data: request };
    } catch (error: any) {
        console.error("UPDATE_CALLBACK_ERROR:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCallbackRequest(id: string) {
    try {
        await prisma.callbackRequest.delete({
            where: { id }
        });
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error: any) {
        console.error("DELETE_CALLBACK_ERROR:", error);
        return { success: false, error: error.message };
    }
}
