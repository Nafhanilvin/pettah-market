const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function main() {
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Food & Beverages', slug: 'food-beverages' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Health & Beauty', slug: 'health-beauty' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        isActive: true
      }
    });
  }

  const adminEmail = 'admin@pettahmarket.com';
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      userType: 'admin',
      isActive: true
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      userType: 'admin',
      isActive: true,
      emailVerified: true
    }
  });

  console.log('✅ Seed complete');
  console.log('Admin login -> email: admin@pettahmarket.com | password: admin123');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
