import { CreateLinkDto } from './dto/create-link.dto';
import { LinksService } from './links.service';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    create(dto: CreateLinkDto): Promise<{
        id: string;
        code: string;
        short_url: string;
        long_url: string;
        created_at: string;
    }>;
    list(page?: string, pageSize?: string): Promise<{
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
}
