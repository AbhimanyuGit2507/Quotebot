import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient = prisma;

  get user() {
    return this.prismaClient.user;
  }

  get tenant() {
    return this.prismaClient.tenant;
  }

  get role() {
    return this.prismaClient.role;
  }

  get product() {
    return this.prismaClient.product;
  }

  get productCategory() {
    return this.prismaClient.productCategory;
  }

  get client() {
    return this.prismaClient.client;
  }

  get rFQ() {
    return this.prismaClient.rFQ;
  }

  get quotation() {
    return this.prismaClient.quotation;
  }

  async onModuleInit() {
    await this.prismaClient.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
    console.log('✅ Prisma disconnected from database');
  }
}
