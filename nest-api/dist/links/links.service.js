"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksService = void 0;
const common_1 = require("@nestjs/common");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../../../generated/prisma");
const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000';
const CREATED_BY = 'module_03_demo_user';
let LinksService = class LinksService {
    prisma;
    constructor() {
        const adapter = new adapter_pg_1.PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        this.prisma = new prisma_1.PrismaClient({ adapter });
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
    async create(dto) {
        const longUrl = this.validateLongUrl(dto.long_url);
        this.validateExpiresAt(dto.expires_at);
        const link = await this.prisma.link.upsert({
            where: {
                longUrl_createdBy: {
                    longUrl,
                    createdBy: CREATED_BY,
                },
            },
            update: {},
            create: {
                code: this.generateCode(),
                longUrl,
                createdBy: CREATED_BY,
            },
        });
        return this.toResponse(link);
    }
    async list(page = 1, pageSize = 20) {
        const take = Math.min(Math.max(pageSize, 1), 50);
        const skip = (Math.max(page, 1) - 1) * take;
        const links = await this.prisma.link.findMany({
            where: { createdBy: CREATED_BY },
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' }
            ],
            skip,
            take,
        });
        return links.map((link) => this.toResponse(link));
    }
    async getById(id) {
        const link = await this.prisma.link.findUnique({ where: { id } });
        if (!link) {
            throw new common_1.NotFoundException('Link not found');
        }
        return this.toResponse(link);
    }
    async getByCode(code) {
        const link = await this.prisma.link.findUnique({ where: { code } });
        if (!link) {
            throw new common_1.NotFoundException('Link not found');
        }
        return link;
    }
    validateLongUrl(input) {
        if (typeof input !== 'string') {
            throw new common_1.BadRequestException('long_url must be a string');
        }
        const trimmed = input.trim();
        if (trimmed !== input || /[\u0000-\u001F\u007F]/.test(input)) {
            throw new common_1.BadRequestException('long_url contains unsafe whitespace or control characters');
        }
        if (trimmed.includes('\\')) {
            throw new common_1.BadRequestException('long_url must not contain backslashes');
        }
        let parsed;
        try {
            parsed = new URL(trimmed);
        }
        catch {
            throw new common_1.BadRequestException('long_url must be a valid absolute URL');
        }
        if (parsed.username || parsed.password) {
            throw new common_1.BadRequestException('long_url must not contain userinfo');
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new common_1.BadRequestException('long_url scheme is not allowed');
        }
        return parsed.toString();
    }
    validateExpiresAt(expiresAt) {
        if (!expiresAt) {
            return;
        }
        const date = new Date(expiresAt);
        if (Number.isNaN(date.getTime()) || date <= new Date()) {
            throw new common_1.BadRequestException('expires_at must be in the future');
        }
    }
    generateCode() {
        return Math.random().toString(36).slice(2, 8);
    }
    toResponse(link) {
        return {
            id: link.id,
            code: link.code,
            short_url: `${BASE_URL}/r/${link.code}`,
            long_url: link.longUrl,
            created_at: link.createdAt.toISOString(),
        };
    }
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LinksService);
//# sourceMappingURL=links.service.js.map