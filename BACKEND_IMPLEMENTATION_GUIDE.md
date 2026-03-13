# Quotebot ERP Backend Implementation Guide

This document provides a complete roadmap and code structure for building the Quotebot ERP backend using NestJS, PostgreSQL, and Prisma.

## Architecture Overview

```
quotebot-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── tenant.decorator.ts
│   │   │   ├── user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts
│   │   │   ├── tenant.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── middleware/
│   │   │   └── tenant.middleware.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── parse-csv.pipe.ts
│   │   └── interfaces/
│   │       ├── request.interface.ts
│   │       ├── response.interface.ts
│   │       └── pagination.interface.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── upload.config.ts
│   │   └── env.config.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── dtos/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── change-password.dto.ts
│   │   └── entities/
│   ├── tenants/
│   │   ├── tenants.module.ts
│   │   ├── tenants.controller.ts
│   │   ├── tenants.service.ts
│   │   ├── dtos/
│   │   │   └── create-tenant.dto.ts
│   │   └── entities/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dtos/
│   │   │   └── create-user.dto.ts
│   │   └── repositories/
│   │       └── users.repository.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── dtos/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── filter-products.dto.ts
│   │   └── repositories/
│   │       └── products.repository.ts
│   ├── clients/
│   │   ├── clients.module.ts
│   │   ├── clients.controller.ts
│   │   ├── clients.service.ts
│   │   ├── dtos/
│   │   └── repositories/
│   ├── rfqs/
│   │   ├── rfqs.module.ts
│   │   ├── rfqs.controller.ts
│   │   ├── rfqs.service.ts
│   │   ├── dtos/
│   │   └── repositories/
│   ├── quotations/
│   │   ├── quotations.module.ts
│   │   ├── quotations.controller.ts
│   │   ├── quotations.service.ts
│   │   ├── pdf/
│   │   │   └── quotation-pdf.service.ts
│   │   ├── dtos/
│   │   └── repositories/
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   ├── settings/
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   └── dtos/
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   └── upload.service.ts
│   ├── activities/
│   │   ├── activities.module.ts
│   │   ├── activities.service.ts
│   │   └── repositories/
│   └── audit/
│       ├── audit.module.ts
│       ├── audit.service.ts
│       └── repositories/
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Step-by-Step Implementation

### 1. Initial Setup (Completed)
- ✅ NestJS project initialized
- ✅ Dependencies installed (Prisma, PostgreSQL, JWT, validation)
- ✅ Prisma schema created with all tables

### 2. Database Setup

**Create migration:**
```bash
npx prisma migrate dev --name init
```

**Seed initial data:**
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      permissions_json: JSON.stringify(['*']),
    },
  });

  // Create user role
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      permissions_json: JSON.stringify(['read']),
    },
  });

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      company_name: 'Quotebot Solutions Inc',
      trading_name: 'Quotebot',
      plan: 'professional',
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      tenant_id: tenant.id,
      email: 'admin@quotebot.com',
      name: 'Admin User',
      password_hash: hashedPassword,
      role_id: adminRole.id,
      status: 'active',
    },
  });

  // Create sample product categories
  const hardware = await prisma.productCategory.create({
    data: {
      tenant_id: tenant.id,
      name: 'Hardware',
    },
  });

  const software = await prisma.productCategory.create({
    data: {
      tenant_id: tenant.id,
      name: 'Software',
    },
  });

  // Create sample products  
  await prisma.product.createMany({
    data: [
      {
        tenant_id: tenant.id,
        sku: 'HW-001',
        name: 'Laptop',
        category_id: hardware.id,
        unit: 'Unit',
        price: 50000,
        cost: 40000,
        stock: 10,
        reorder_level: 5,
        hsn: '8471',
        gst_percent: 18,
        description: 'Business Laptop',
        status: 'active',
      },
      {
        tenant_id: tenant.id,
        sku: 'SW-001',
        name: 'Office Software License',
        category_id: software.id,
        unit: 'License',
        price: 5000,
        cost: 3000,
        stock: 100,
        reorder_level: 20,
        hsn: '4921',
        gst_percent: 18,
        description: 'Annual Software License',
        status: 'active',
      },
    ],
  });

  // Create sample client
  await prisma.client.create({
    data: {
      tenant_id: tenant.id,
      name: 'Tech Solutions Ltd',
      type: 'B2B',
      email: 'contact@techsolutions.com',
      phone: '+91-98765-43210',
      gst: '27AABCU9603R1ZM',
      tier: 'gold',
      city: 'Pune',
      state: 'Maharashtra',
    },
  });

  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Run seed:**
```bash
npx prisma db seed
```

### 3. Core Infrastructure Files

#### Common Interfaces (src/common/interfaces/request.interface.ts)
```typescript
import { Request } from 'express';

export interface TenantRequest extends Request {
  tenantId: string;
  userId: string;
  user?: any;
}

export interface PaginationInterface {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponseInterface<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInterface;
  timestamp: string;
}
```

#### Common Decorators (src/common/decorators/tenant.decorator.ts)
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  },
);
```

#### Config - JWT (src/config/jwt.config.ts)
```typescript
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'dev-secret-key',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
});
```

### 4. Authentication Module

Create `src/auth/dtos/login.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

Create `src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      role: user.role.name,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        tenantId: user.tenant_id,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
```

### 5. Products Module

Create `src/products/products.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        tenant_id: tenantId,
      },
      include: { category: true },
    });
  }

  async findAll(tenantId: string, filters: any, skip: number, take: number) {
    const where: any = { tenant_id: tenantId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category_id = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: { category: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id, tenant_id: tenantId },
      include: { category: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenant_id: tenantId },
    });
  }
}
```

### 6. Quotations Module with PDF Generation

Create `src/quotations/pdf/quotation-pdf.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuotationPdfService {
  generatePdfHtml(quotation: any, company: any): string {
    const itemsHtml = quotation.items
      .map(
        (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">₹${item.unit_price.toFixed(2)}</td>
        <td style="text-align: right;">${item.tax_percent}%</td>
        <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quotation ${quotation.number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #007bff; margin-bottom: 30px; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #007bff; }
          .company-gstin { color: #666; font-size: 12px; }
          .bill-to { margin-bottom: 30px; }
          .bill-to-label { font-weight: bold; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          table th, table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          table th { background-color: #f0f0f0; font-weight: bold; }
          .summary { float: right; width: 300px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
          .summary-row.total { font-weight: bold; font-size: 16px; border-bottom: 2px solid #007bff; }
          .terms { margin-top: 40px; font-size: 11px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${company.company_name}</div>
          <div class="company-gstin">GSTIN: ${company.gstin}</div>
        </div>

        <div class="bill-to">
          <div class="bill-to-label">Bill To:</div>
          <strong>${quotation.client.name}</strong><br>
          Email: ${quotation.client.email}<br>
          Phone: ${quotation.client.phone}<br>
          <% if (quotation.client.gst) { %>
          GST: ${quotation.client.gst}<br>
          <% } %>
        </div>

        <table>
          <tr>
            <td><strong>Quote #:</strong> ${quotation.number}</td>
            <td><strong>Date:</strong> ${quotation.date}</td>
            <td><strong>Valid Until:</strong> ${quotation.valid_until}</td>
          </tr>
        </table>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Tax %</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${quotation.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (18%):</span>
            <span>₹${quotation.tax.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>₹${quotation.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="terms">
          <strong>Terms & Conditions:</strong><br>
          ${quotation.terms_conditions || 'Standard terms apply'}
        </div>

        <div style="clear: both; margin-top: 50px; text-align: center; color: #999; font-size: 11px;">
          This is a computer-generated document. No signature required.
        </div>
      </body>
      </html>
    `;
  }

  generatePdf(quotation: any, company: any): Buffer {
    const html = this.generatePdfHtml(quotation, company);
    // Note: In production, use a PDF library like puppeteer or pdfkit
    // For now, returning the HTML as a placeholder
    return Buffer.from(html);
  }
}
```

### 7. Quotations Service

Create `src/quotations/quotations.service.ts`:
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateQuotationDto } from './dtos/create-quotation.dto';
import { UpdateQuotationDto } from './dtos/update-quotation.dto';
import { QuotationPdfService } from './pdf/quotation-pdf.service';

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: QuotationPdfService,
  ) {}

  async create(tenantId: string, dto: CreateQuotationDto) {
    // Generate quotation number
    const lastQuote = await this.prisma.quotation.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { number: 'desc' },
    });

    const nextNumber = lastQuote
      ? parseInt(lastQuote.number.split('/')[2]) + 1
      : 1001;

    const number = `QT/${new Date().getFullYear()}-${new Date().getFullYear() + 1}/${nextNumber}`;

    // Calculate totals
    let subtotal = 0;
    let tax = 0;
    let total = 0;

    const items = dto.items.map((item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemTax = (itemSubtotal * item.tax_percent) / 100;
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      tax += itemTax;
      total += itemTotal;

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        tax_percent: item.tax_percent,
        total: itemTotal,
      };
    });

    const quotation = await this.prisma.quotation.create({
      data: {
        tenant_id: tenantId,
        number,
        client_id: dto.client_id,
        date: dto.date,
        valid_until: dto.valid_until,
        status: 'draft',
        subtotal,
        tax,
        total,
        terms_conditions: dto.terms_conditions,
        items: {
          createMany: {
            data: items,
          },
        },
      },
      include: {
        client: true,
        items: { include: { product: true } },
      },
    });

    // Create version snapshot
    await this.prisma.quotationVersion.create({
      data: {
        quotation_id: quotation.id,
        version_number: 1,
        snapshot_json: JSON.stringify(quotation),
      },
    });

    return quotation;
  }

  async findAll(tenantId: string, filters: any, skip: number, take: number) {
    const where: any = { tenant_id: tenantId };

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip,
        take,
        include: { client: true, items: { include: { product: true } } },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.quotation.findFirst({
      where: { id, tenant_id: tenantId },
      include: { client: true, items: { include: { product: true } }, versions: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateQuotationDto) {
    const quotation = await this.findOne(id, tenantId);
    if (!quotation) throw new BadRequestException('Quotation not found');

    // Recalculate totals
    let subtotal = 0;
    let tax = 0;
    const items = dto.items.map((item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemTax = (itemSubtotal * item.tax_percent) / 100;
      subtotal += itemSubtotal;
      tax += itemTax;
      return { ...item, total: itemSubtotal + itemTax };
    });

    const updated = await this.prisma.quotation.update({
      where: { id },
      data: {
        ...dto,
        subtotal,
        tax,
        total: subtotal + tax,
        items: {
          deleteMany: {},
          createMany: { data: items },
        },
      },
      include: { client: true, items: { include: { product: true } } },
    });

    // Create new version
    const lastVersion = await this.prisma.quotationVersion.findFirst({
      where: { quotation_id: id },
      orderBy: { version_number: 'desc' },
    });

    await this.prisma.quotationVersion.create({
      data: {
        quotation_id: id,
        version_number: (lastVersion?.version_number || 0) + 1,
        snapshot_json: JSON.stringify(updated),
      },
    });

    return updated;
  }

  async duplicate(id: string, tenantId: string) {
    const original = await this.findOne(id, tenantId);
    if (!original) throw new BadRequestException('Quotation not found');

    // Generate new number
    const lastQuote = await this.prisma.quotation.findFirst({
      where: { tenant_id: tenantId },
      orderBy: { number: 'desc' },
    });

    const nextNumber = parseInt(lastQuote.number.split('/')[2]) + 1;
    const number = `QT/${new Date().getFullYear()}-${new Date().getFullYear() + 1}/${nextNumber}`;

    return this.prisma.quotation.create({
      data: {
        tenant_id: tenantId,
        number,
        client_id: original.client_id,
        date: new Date().toISOString().split('T')[0],
        valid_until: original.valid_until,
        status: 'draft',
        subtotal: original.subtotal,
        tax: original.tax,
        total: original.total,
        terms_conditions: original.terms_conditions,
        items: {
          createMany: {
            data: original.items.map((item) => ({
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              tax_percent: item.tax_percent,
              total: item.total,
            })),
          },
        },
      },
      include: { client: true, items: true },
    });
  }

  async generatePdf(id: string, tenantId: string, company: any) {
    const quotation = await this.findOne(id, tenantId);
    if (!quotation) throw new BadRequestException('Quotation not found');

    return this.pdfService.generatePdf(quotation, company);
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.quotation.delete({ where: { id } });
  }
}
```

### 8. Dashboard Service

Create `src/dashboard/dashboard.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(tenantId: string) {
    const [
      totalRfqs,
      pendingRfqs,
      totalQuotes,
      sentQuotes,
      acceptedQuotes,
      declinedQuotes,
      totalProducts,
      activeProducts,
      totalClients,
      goldClients,
    ] = await Promise.all([
      this.prisma.rFQ.count({ where: { tenant_id: tenantId } }),
      this.prisma.rFQ.count({
        where: { tenant_id: tenantId, status: 'pending' },
      }),
      this.prisma.quotation.count({ where: { tenant_id: tenantId } }),
      this.prisma.quotation.count({
        where: { tenant_id: tenantId, status: 'sent' },
      }),
      this.prisma.quotation.count({
        where: { tenant_id: tenantId, status: 'accepted' },
      }),
      this.prisma.quotation.count({
        where: { tenant_id: tenantId, status: 'declined' },
      }),
      this.prisma.product.count({ where: { tenant_id: tenantId } }),
      this.prisma.product.count({
        where: { tenant_id: tenantId, status: 'active' },
      }),
      this.prisma.client.count({ where: { tenant_id: tenantId } }),
      this.prisma.client.count({
        where: { tenant_id: tenantId, tier: 'gold' },
      }),
    ]);

    const conversionRate =
      totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

    return {
      totalRfqs,
      pendingRfqs,
      totalQuotes,
      sentQuotes,
      acceptedQuotes,
      declinedQuotes,
      conversionRate,
      totalProducts,
      activeProducts,
      totalClients,
      goldClients,
    };
  }

  async getRecentActivities(tenantId: string, limit: number = 5) {
    return this.prisma.activity.findMany({
      where: { tenant_id: tenantId },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { user: true },
    });
  }

  async getRFQTrend(tenantId: string, days: number = 7) {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const rfqs = await this.prisma.rFQ.count({
        where: {
          tenant_id: tenantId,
          created_at: {
            gte: new Date(dateStr),
            lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1)),
          },
        },
      });

      const quotes = await this.prisma.quotation.count({
        where: {
          tenant_id: tenantId,
          created_at: {
            gte: new Date(dateStr),
            lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1)),
          },
        },
      });

      data.push({ date: dateStr, rfqs, quotes });
    }
    return data;
  }

  async getQuoteStatusDistribution(tenantId: string) {
    const quotes = await this.prisma.quotation.findMany({
      where: { tenant_id: tenantId },
      select: { status: true },
    });

    const total = quotes.length || 1;
    const accepted = quotes.filter((q) => q.status === 'accepted').length;
    const declined = quotes.filter((q) => q.status === 'declined').length;
    const pending = quotes.filter(
      (q) => q.status === 'draft' || q.status === 'sent',
    ).length;

    return {
      accepted: Math.round((accepted / total) * 100),
      declined: Math.round((declined / total) * 100),
      pending: Math.round((pending / total) * 100),
    };
  }

  async getRFQChannelDistribution(tenantId: string) {
    const rfqs = await this.prisma.rFQ.findMany({
      where: { tenant_id: tenantId },
      select: { channel: true },
    });

    const total = rfqs.length || 1;
    const email = rfqs.filter((r) => r.channel === 'email').length;
    const whatsapp = rfqs.filter((r) => r.channel === 'whatsapp').length;
    const manual = rfqs.filter((r) => r.channel === 'manual').length;

    return [
      { channel: 'Email', pct: Math.round((email / total) * 100) },
      { channel: 'WhatsApp', pct: Math.round((whatsapp / total) * 100) },
      { channel: 'Manual', pct: Math.round((manual / total) * 100) },
    ];
  }
}
```

### 9. Module Files

Create remaining modules following the same pattern:
- `clients.module.ts` / `clients.service.ts` / `clients.controller.ts`
- `rfqs.module.ts` / `rfqs.service.ts` / `rfqs.controller.ts`
- `products.module.ts` / `products.service.ts` / `products.controller.ts`
- `analytics.module.ts` / `analytics.service.ts` / `analytics.controller.ts`
- `settings.module.ts` / `settings.service.ts` / `settings.controller.ts`
- `files.module.ts` / `files.service.ts` / `files.controller.ts`
- `activities.module.ts` / `activities.service.ts`

Due to token limitations, each follows the same pattern as Products/Quotations above.

### 10. Main App Module

Create `src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { ClientsModule } from './clients/clients.module';
import { RFQsModule } from './rfqs/rfqs.module';
import { QuotationsModule } from './quotations/quotations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { FilesModule } from './files/files.module';
import { ActivitiesModule } from './activities/activities.module';
import { jwtConfig } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ useFactory: jwtConfig }),
    AuthModule,
    ProductsModule,
    ClientsModule,
    RFQsModule,
    QuotationsModule,
    DashboardModule,
    AnalyticsModule,
    SettingsModule,
    FilesModule,
    ActivitiesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
```

## Running the Backend

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# Start development server
npm run start:dev

# API will be available at http://localhost:3001/api
```

## Testing Endpoints

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quotebot.com",
    "password": "Admin@123"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-001",
    "name": "Product Name",
    "category_id": "<category_id>",
    "unit": "Unit",
    "price": 1000,
    "cost": 700,
    "stock": 10,
    "reorder_level": 5,
    "hsn": "1234",
    "gst_percent": 18
  }'
```

### Get All Products
```bash
curl http://localhost:3001/api/products?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

## Next Steps for Complete Implementation

1. **Create remaining controllers** for each module (use Products as template)
2. **Implement DTOs** for validation (CreateProductDto, UpdateProductDto, etc.)
3. **Add repository pattern** for complex queries
4. **Implement file upload** with Multer for logos and product images
5. **Add PDF generation** using Puppeteer or pdfkit
6. **Implement activity logging** interceptor
7. **Add audit logging** for CRUD operations
8. **Create analytics** calculations for all reports
9. **Add authentication** guards to all routes
10. **Implement CSV export** endpoints
11. **Add error handling** and logging
12. **Write unit tests** for services
13. **Deploy** to production

## API Response Format

All endpoints follow this format:

**Success (200):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2026-03-12T10:30:00Z"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-03-12T10:30:00Z"
}
```

---

This backend structure provides a solid foundation for your ERP system. All modules follow NestJS best practices and can be extended as needed.
