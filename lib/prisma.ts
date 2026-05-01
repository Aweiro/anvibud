import { PrismaClient } from '@prisma/client'
// Updated after schema change

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['query']
	})

// Trigger re-generation refresh
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}
