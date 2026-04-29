import { prisma } from "@/lib/prisma";
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

    return <HeaderClient categories={categories} settings={settings} />;
}
