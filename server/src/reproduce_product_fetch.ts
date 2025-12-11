
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Connecting to database...');
    try {
        await prisma.$connect();
        console.log('Connected to DB URL:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for security

        const page = 1;
        const limit = 4;
        const skip = (page - 1) * limit;
        const where = { isActive: true };

        console.log('Fetching products...');
        const products = await prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                images: true,
                variants: true,
                attributes: true,
                category: true,
                collection: true,
            },
        });

        console.log('Products fetched successfully. Count:', products.length);
        if (products.length > 0) {
            console.log('First product sample:', JSON.stringify(products[0], null, 2));
        }

    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
