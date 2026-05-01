"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: "global" }
            });
        }

        // Serialize Decimal fields to numbers
        return {
            ...settings,
            freeShippingThreshold: Number(settings.freeShippingThreshold),
            shippingCost: Number(settings.shippingCost),
        };
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
}

export async function updateSiteSettings(data: {
    searchPlaceholders?: string[];
    announcementActive?: boolean;
    announcementBgColor?: string;
    announcementTextColor?: string;
    announcementSpeed?: number;
    announcementItems?: any;
    freeShippingThreshold?: number;
    shippingCost?: number;
}) {
    try {
        await prisma.siteSettings.upsert({
            where: { id: "global" },
            update: data,
            create: { id: "global", ...data }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating settings:", error);
        return { success: false, error: error.message };
    }
}

export async function updateSearchPlaceholders(placeholders: string[]) {
    return updateSiteSettings({ searchPlaceholders: placeholders });
}
