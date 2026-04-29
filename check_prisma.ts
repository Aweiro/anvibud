import { prisma } from "./lib/prisma";

async function check() {
    console.log("Prisma keys:", Object.keys(prisma));
    // @ts-ignore
    console.log("SiteSettings model:", prisma.siteSettings);
}

check();
