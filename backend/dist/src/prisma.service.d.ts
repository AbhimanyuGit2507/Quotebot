import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private prismaClient;
    get user(): import("@prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get tenant(): import("@prisma/client").Prisma.TenantDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get role(): import("@prisma/client").Prisma.RoleDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get product(): import("@prisma/client").Prisma.ProductDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get productCategory(): import("@prisma/client").Prisma.ProductCategoryDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get client(): import("@prisma/client").Prisma.ClientDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get rFQ(): import("@prisma/client").Prisma.RFQDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get quotation(): import("@prisma/client").Prisma.QuotationDelegate<import("@prisma/client/runtime/client").DefaultArgs, {
        adapter: PrismaPg;
    }>;
    get $connect(): any;
    get $disconnect(): any;
    get $transaction(): any;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
