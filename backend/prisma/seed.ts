/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============ ROLES ============
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      permissions_json: JSON.stringify(['*']),
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      permissions_json: JSON.stringify(['read']),
    },
  });

  await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      permissions_json: JSON.stringify(['read', 'write']),
    },
  });
  // managerRole is used implicitly through role definitions

  console.log('✅ Roles created');

  // ============ TENANT ============
  console.log('Creating tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { company_name: 'Quotebot Solutions Inc' },
    update: {},
    create: {
      company_name: 'Quotebot Solutions Inc',
      trading_name: 'Quotebot',
      plan: 'professional',
    },
  });

  console.log('✅ Tenant created:', tenant.id);

  // ============ USERS ============
  console.log('Creating users...');
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedUserPassword = await bcrypt.hash('User@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@quotebot.com' },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: 'admin@quotebot.com',
      name: 'Admin User',
      password_hash: hashedAdminPassword,
      role_id: adminRole.id,
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@quotebot.com' },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: 'user@quotebot.com',
      name: 'Regular User',
      password_hash: hashedUserPassword,
      role_id: userRole.id,
      status: 'active',
    },
  });
  // regularUser created for multi-user testing

  console.log('✅ Users created');

  // ============ PRODUCT CATEGORIES ============
  console.log('Creating product categories...');
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { tenant_id_name: { tenant_id: tenant.id, name: 'Hardware' } },
      update: {},
      create: {
        tenant_id: tenant.id,
        name: 'Hardware',
      },
    }),
    prisma.productCategory.upsert({
      where: { tenant_id_name: { tenant_id: tenant.id, name: 'Software' } },
      update: {},
      create: {
        tenant_id: tenant.id,
        name: 'Software',
      },
    }),
    prisma.productCategory.upsert({
      where: { tenant_id_name: { tenant_id: tenant.id, name: 'Services' } },
      update: {},
      create: {
        tenant_id: tenant.id,
        name: 'Services',
      },
    }),
  ]);

  console.log('✅ Product categories created');

  // ============ PRODUCTS ============
  console.log('Creating products...');
  await prisma.product.createMany({
    data: [
      {
        tenant_id: tenant.id,
        sku: 'HW-LAP-001',
        name: 'Business Laptop',
        category_id: categories[0].id,
        unit: 'Unit',
        price: 50000.0,
        cost: 40000.0,
        stock: 10,
        reorder_level: 5,
        hsn: '8471',
        gst_percent: 18.0,
        description: 'High-performance business laptop with Intel i7',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'HW-LAP-002',
        name: 'Gaming Laptop',
        category_id: categories[0].id,
        unit: 'Unit',
        price: 80000.0,
        cost: 65000.0,
        stock: 5,
        reorder_level: 3,
        hsn: '8471',
        gst_percent: 18.0,
        description: 'Gaming laptop with RTX 3060',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'SW-OFF-001',
        name: 'Office Software License',
        category_id: categories[1].id,
        unit: 'License',
        price: 5000.0,
        cost: 3000.0,
        stock: 100,
        reorder_level: 20,
        hsn: '4921',
        gst_percent: 18.0,
        description: 'Annual Office Software License',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'SW-ANTV-001',
        name: 'Antivirus Software',
        category_id: categories[1].id,
        unit: 'License',
        price: 2000.0,
        cost: 1200.0,
        stock: 50,
        reorder_level: 10,
        hsn: '4921',
        gst_percent: 18.0,
        description: 'Annual Antivirus License',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'SRV-CONS-001',
        name: 'IT Consultation Service',
        category_id: categories[2].id,
        unit: 'Hour',
        price: 500.0,
        cost: 300.0,
        stock: 1000,
        reorder_level: 100,
        hsn: '9954',
        gst_percent: 18.0,
        description: 'Professional IT Consultation',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'HW-MON-001',
        name: 'Monitor 27 Inch',
        category_id: categories[0].id,
        unit: 'Unit',
        price: 15000.0,
        cost: 11000.0,
        stock: 20,
        reorder_level: 5,
        hsn: '8528',
        gst_percent: 18.0,
        description: '4K Monitor 27 inch',
        status: 'active',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Products created');

  // ============ CLIENTS ============
  console.log('Creating clients...');
  await prisma.client.createMany({
    data: [
      {
        tenant_id: tenant.id,
        name: 'Tech Solutions Ltd',
        type: 'B2B',
        email: 'contact@techsolutions.com',
        phone: '+91-98765-43210',
        website: 'www.techsolutions.com',
        gst: '27AABCU9603R1ZM',
        pan: 'AABCU9603R',
        address: 'Plot 42, MIDC Industrial Area',
        city: 'Pune',
        state: 'Maharashtra',
        tier: 'gold',
        total_orders: 0,
        total_value: 0,
      },
      {
        tenant_id: tenant.id,
        name: 'Digital Innovations Pvt Ltd',
        type: 'B2B',
        email: 'sales@diginnovate.com',
        phone: '+91-99876-54321',
        website: 'www.diginnovate.com',
        gst: '27AABCT1234R1ZM',
        pan: 'AABCT1234R',
        address: '123 Tech Park, Baner',
        city: 'Bangalore',
        state: 'Karnataka',
        tier: 'silver',
        total_orders: 0,
        total_value: 0,
      },
      {
        tenant_id: tenant.id,
        name: 'StartUp India Ventures',
        type: 'B2B',
        email: 'info@startupindia.com',
        phone: '+91-88765-32109',
        website: 'www.startupindia.com',
        gst: '06AABCT1234R1ZM',
        pan: 'AABCT1234S',
        address: 'Sector 3, Delhi NCR',
        city: 'Noida',
        state: 'Uttar Pradesh',
        tier: 'bronze',
        total_orders: 0,
        total_value: 0,
      },
      {
        tenant_id: tenant.id,
        name: 'Enterprise Corporation',
        type: 'B2B',
        email: 'procurement@entcorp.com',
        phone: '+91-77654-21098',
        gst: '33AABCT1234R1ZM',
        pan: 'AABCT1234T',
        address: '456 Business Plaza, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        tier: 'gold',
        total_orders: 0,
        total_value: 0,
      },
      {
        tenant_id: tenant.id,
        name: 'Individual Customer',
        type: 'B2C',
        email: 'customer@email.com',
        phone: '+91-66543-10987',
        tier: 'regular',
        city: 'Pune',
        state: 'Maharashtra',
        total_orders: 0,
        total_value: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Clients created');

  // ============ RFQs ============
  console.log('Creating RFQs...');
  const clients = await prisma.client.findMany({
    where: { tenant_id: tenant.id },
    take: 3,
  });

  const rfqNumbers: Array<{ id: string }> = [];
  for (let i = 0; i < clients.length; i++) {
    const rfq = await prisma.rFQ.create({
      data: {
        tenant_id: tenant.id,
        number: `RFQ/${new Date().getFullYear()}-${new Date().getFullYear() + 1}/${2001 + i}`,
        client_id: clients[i].id,
        channel: ['email', 'whatsapp', 'manual'][i % 3] as unknown as string,
        priority: ['high', 'medium', 'low'][i % 3] as unknown as string,
        status: ['pending', 'quoted', 'converted'][i % 3] as unknown as string,
        confidence_score: 80 - i * 10,
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      },
    });
    rfqNumbers.push(rfq);
  }

  console.log('✅ RFQs created');

  // ============ RFQ ITEMS ============
  console.log('Creating RFQ items...');
  const products = await prisma.product.findMany({
    where: { tenant_id: tenant.id },
    take: 3,
  });

  for (let i = 0; i < rfqNumbers.length; i++) {
    await prisma.rFQItem.create({
      data: {
        rfq_id: rfqNumbers[i].id,
        product_id: products[i % products.length].id,
        product_name: products[i % products.length].name,
        quantity: 2 + i,
        unit: products[i % products.length].unit,
        notes: `Requested quantity for ${products[i % products.length].name}`,
      },
    });
  }

  console.log('✅ RFQ items created');

  // ============ QUOTATIONS ============
  console.log('Creating quotations...');
  for (let i = 0; i < clients.length; i++) {
    const items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit: string;
      unit_price: number;
      tax_percent: number;
      total: number;
    }> = [];
    for (let j = 0; j < 2; j++) {
      items.push({
        product_id: products[j % products.length].id,
        product_name: products[j % products.length].name,
        quantity: 1 + j,
        unit: products[j % products.length].unit,
        unit_price: products[j % products.length].price,
        tax_percent: 18,
        total: (1 + j) * products[j % products.length].price * (1 + 18 / 100),
      });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    const tax = (subtotal * 18) / 100;
    const total = subtotal + tax;

    await prisma.quotation.create({
      data: {
        tenant_id: tenant.id,
        number: `QT/${new Date().getFullYear()}-${new Date().getFullYear() + 1}/${1001 + i}`,
        client_id: clients[i].id,
        date: new Date().toISOString().split('T')[0],
        valid_until: new Date(new Date().setDate(new Date().getDate() + 30))
          .toISOString()
          .split('T')[0],
        status: ['draft', 'sent', 'accepted', 'declined'][
          i % 4
        ] as unknown as string,
        subtotal,
        tax,
        total,
        terms_conditions:
          'Payment due within 30 days. All prices are in INR including GST.',
        items: {
          createMany: {
            data: items,
          },
        },
      },
    });
  }

  console.log('✅ Quotations created');

  // ============ SETTINGS ============
  console.log('Creating settings...');
  await prisma.settingsCompany.upsert({
    where: { tenant_id: tenant.id },
    update: {},
    create: {
      tenant_id: tenant.id,
      currency: 'INR',
    },
  });

  await prisma.settingsNotifications.upsert({
    where: { tenant_id: tenant.id },
    update: {},
    create: {
      tenant_id: tenant.id,
      new_rfq: true,
      quote_sent: true,
      quote_viewed: true,
      quote_accepted: true,
      quote_declined: true,
    },
  });

  console.log('✅ Settings created');

  // ============ ACTIVITIES ============
  console.log('Creating activities...');
  const productCount = await prisma.product.count({
    where: { tenant_id: tenant.id },
  });

  for (let i = 0; i < Math.min(5, productCount); i++) {
    await prisma.activity.create({
      data: {
        tenant_id: tenant.id,
        entity_type: 'Product',
        entity_id: products[i % products.length].id,
        action: 'created',
        user_id: adminUser.id,
      },
    });
  }

  console.log('✅ Activities created');

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ Database seeding completed!');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('📝 Test Credentials:');
  console.log('  Email: admin@quotebot.com');
  console.log('  Password: Admin@123');
  console.log('  Tenant ID:', tenant.id);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
