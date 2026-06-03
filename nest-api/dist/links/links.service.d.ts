import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
export declare class LinksService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    create(dto: CreateLinkDto): Promise<{
        id: string;
        code: string;
        short_url: string;
        long_url: string;
        created_at: string;
    }>;
    list(page?: number, pageSize?: number): Promise<{
        id: string;
        code: string;
        short_url: string;
        long_url: string;
        created_at: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        code: string;
        short_url: string;
        long_url: string;
        created_at: string;
    }>;
    getByCode(code: string): Promise<{
        id: string;
        code: string;
        longUrl: string;
        createdBy: string;
        createdAt: Date;
    }>;
    private validateLongUrl;
    private validateExpiresAt;
    private generateCode;
    private toResponse;
}
