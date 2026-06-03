import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma';
import { CreateLinkDto } from './dto/create-link.dto';

const BASE_URL = process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000';
const CREATED_BY = 'module_03_demo_user';

@Injectable()
export class LinksService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async create(dto: CreateLinkDto) {
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

  async getById(id: string) {
    const link = await this.prisma.link.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return this.toResponse(link);
  }

  async getByCode(code: string) {
    const link = await this.prisma.link.findUnique({ where: { code } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }

    return link;
  }

  private validateLongUrl(input: string) {
    if (typeof input !== 'string') {
      throw new BadRequestException('long_url must be a string');
    }

    const trimmed = input.trim();
    if (trimmed !== input || /[\u0000-\u001F\u007F]/.test(input)) {
      throw new BadRequestException('long_url contains unsafe whitespace or control characters');
    }

    if (trimmed.includes('\\')) {
      throw new BadRequestException('long_url must not contain backslashes');
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('long_url must be a valid absolute URL');
    }

    if (parsed.username || parsed.password) {
      throw new BadRequestException('long_url must not contain userinfo');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('long_url scheme is not allowed');
    }

    return parsed.toString();
  }

  private validateExpiresAt(expiresAt?: string) {
    if (!expiresAt) {
      return;
    }

    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      throw new BadRequestException('expires_at must be in the future');
    }
  }

  private generateCode() {
    return Math.random().toString(36).slice(2, 8);
  }

  private toResponse(link: {
    id: string;
    code: string;
    longUrl: string;
    createdAt: Date;
  }) {
    return {
      id: link.id,
      code: link.code,
      short_url: `${BASE_URL}/r/${link.code}`,
      long_url: link.longUrl,
      created_at: link.createdAt.toISOString(),
    };
  }
}
