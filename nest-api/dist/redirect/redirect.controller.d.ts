import type { Response } from 'express';
import { LinksService } from '../links/links.service';
export declare class RedirectController {
    private readonly linksService;
    constructor(linksService: LinksService);
    redirect(code: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
