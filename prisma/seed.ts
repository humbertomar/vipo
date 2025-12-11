
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (ordem inversa para respeitar foreign keys)
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.returnStatusHistory.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Banco de dados limpo.');

  // ===================================
  // 1. CATEGORIAS E COLEÇÕES
  // ===================================

  const catSungas = await prisma.category.create({
    data: { name: 'Sungas', slug: 'sungas', description: 'Sungas profissionais para futevôlei', order: 1 }
  });
  const catUniformes = await prisma.category.create({
    data: { name: 'Uniformes', slug: 'uniformes', description: 'Uniformes personalizados', order: 2 }
  });
  const catAcessorios = await prisma.category.create({
    data: { name: 'Acessórios', slug: 'acessorios', description: 'Bonés, meias e mais', order: 3 }
  });

  const colPraia = await prisma.collection.create({
    data: { name: 'Coleção Verão 2024', slug: 'verao-2024', description: 'Novidades para o verão' }
  });
  const colPro = await prisma.collection.create({
    data: { name: 'Linha Pro', slug: 'linha-pro', description: 'Para atletas de alto rendimento' }
  });

  // ===================================
  // 2. PRODUTOS E VARIANTES
  // ===================================

  const productsData = [
    {
      name: 'Sunga ViPO Pro Black',
      slug: 'sunga-vipo-pro-black',
      category: catSungas,
      collection: colPro,
      price: 14990,
      skuBase: 'SNG-PRO-BLK',
      variants: [
        { size: 'P', stock: 15 },
        { size: 'M', stock: 25 },
        { size: 'G', stock: 20 },
        { size: 'GG', stock: 10 },
      ]
    },
    {
      name: 'Sunga Tropical Blue',
      slug: 'sunga-tropical-blue',
      category: catSungas,
      collection: colPraia,
      price: 12990,
      skuBase: 'SNG-TRP-BLU',
      variants: [
        { size: 'P', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'G', stock: 15 },
      ]
    },
    {
      name: 'Uniforme Completo Team',
      slug: 'uniforme-completo-team',
      category: catUniformes,
      collection: colPro,
      price: 29990,
      skuBase: 'UNF-TEAM',
      variants: [
        { size: 'M', stock: 50 },
        { size: 'G', stock: 50 },
      ]
    },
    {
      name: 'Boné ViPO Trucker',
      slug: 'bone-vipo-trucker',
      category: catAcessorios,
      collection: colPraia,
      price: 8990,
      skuBase: 'ACC-CAP-TRK',
      variants: [
        { size: 'U', stock: 100 },
      ]
    }
  ];

  const createdProducts = [];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: p.category.id,
        collectionId: p.collection.id,
        priceInCents: p.price,
        sku: p.skuBase,
        totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
        description: `Descrição premium para ${p.name}.`,
        variants: {
          create: p.variants.map(v => ({
            size: v.size,
            sku: `${p.skuBase}-${v.size}`,
            stock: v.stock,
            priceAdjustment: 0,
          }))
        }
      },
      include: { variants: true }
    });
    createdProducts.push(product);
  }

  console.log(`✓ ${createdProducts.length} produtos criados.`);

  // ===================================
  // 3. USUÁRIOS E CLIENTES
  // ===================================

  // Admin
  await prisma.user.create({
    data: {
      name: 'Admin ViPO',
      email: 'admin@vipo.com',
      openId: 'admin-001',
      role: 'ADMIN',
      passwordHash: 'hashed_secret', // simulado
      customerProfile: {
        create: { phone: '62982419124', cpf: '00011122233' }
      }
    }
  });

  // Clientes
  const customers = [
    { name: 'João Silva', email: 'joao@email.com', openId: 'cust-001' },
    { name: 'Maria Souza', email: 'maria@email.com', openId: 'cust-002' },
    { name: 'Pedro Santos', email: 'pedro@email.com', openId: 'cust-003' },
    { name: 'Ana Costa', email: 'ana@email.com', openId: 'cust-004' },
    { name: 'Lucas Lima', email: 'lucas@email.com', openId: 'cust-005' },
  ];

  const createdUsers = [];
  for (const c of customers) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        openId: c.openId,
        role: 'CUSTOMER',
        customerProfile: {
          create: { phone: '11988887777', cpf: `1234567890${createdUsers.length}` }
        }
      }
    });
    createdUsers.push(user);
  }

  console.log(`✓ ${createdUsers.length} clientes criados.`);

  // ===================================
  // 4. VENDAS (MISTO ONLINE E POS)
  // ===================================

  const usersForOrders = [...createdUsers, null, null]; // Alguns nulos para simular POS sem cadastro
  const paymentMethods = ['PIX', 'CREDIT_CARD', 'CASH', 'POS_DEBIT'];
  const statuses = ['CONFIRMED', 'PENDING', 'DELIVERED', 'PROCESSING'];

  for (let i = 0; i < 15; i++) {
    const user = usersForOrders[i % usersForOrders.length];
    const isPos = !user || i % 3 === 0; // Se não tem user ou é divisível por 3, é POS
    const product = createdProducts[i % createdProducts.length];
    const variant = product.variants[0];
    const qty = Math.floor(Math.random() * 3) + 1;
    const total = (product.priceInCents * qty);

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${2024}${1000 + i}`,
        userId: user?.id,
        status: statuses[i % statuses.length] as any,
        subtotalInCents: total,
        totalInCents: total,
        payment: {
          create: {
            amountInCents: total,
            method: (isPos ? 'POS_DEBIT' : 'PIX') as any,
            status: isPos ? 'CAPTURED' : 'PENDING' as any,
            // dummy fields for specific methods if needed
            pixKey: isPos ? undefined : 'random-pix-key',
          } as any
        },
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            quantity: qty,
            priceInCents: product.priceInCents
          }
        },
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // datas variadas
      }
    });
  }

  console.log('✓ 15 Vendas de exemplo criadas.');
  console.log('✅ Seed finalizado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
