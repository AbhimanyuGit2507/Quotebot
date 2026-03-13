"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({ adapter });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prisma;
let PrismaService = class PrismaService {
    prismaClient = prisma;
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
    get $connect() {
        return this.prismaClient.$connect.bind(this.prismaClient);
    }
    get $disconnect() {
        return this.prismaClient.$disconnect.bind(this.prismaClient);
    }
    get $transaction() {
        return this.prismaClient.$transaction.bind(this.prismaClient);
    }
    async onModuleInit() {
        await this.prismaClient.$connect();
        console.log('✅ Prisma connected to database');
    }
    async onModuleDestroy() {
        await this.prismaClient.$disconnect();
        console.log('✅ Prisma disconnected from database');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map