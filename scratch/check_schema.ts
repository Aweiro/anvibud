
import { prisma } from "../lib/prisma";

async function check() {
  try {
    const categories = await prisma.category.findMany({ take: 1 });
    console.log("Categories fetched successfully:", categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
