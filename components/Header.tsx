import { prisma } from "@/lib/prisma";
// Header component
import { HeaderClient } from "./HeaderClient";

export async function Header() {
    const [categories, settings] = await Promise.all([
        prisma.category.findMany({
            include: {
                subcategories: true,
            },
            orderBy: {
                name: "asc",
            },
        }),
        prisma.siteSettings.findUnique({
            where: { id: "global" }
        })
    ]);

    const serializedSettings = settings ? {
        ...settings,
        freeShippingThreshold: Number(settings.freeShippingThreshold),
        shippingCost: Number(settings.shippingCost),
    } : null;

    return <HeaderClient categories={categories} settings={serializedSettings} />;
}
