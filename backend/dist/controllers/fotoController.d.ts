import { Request, Response } from 'express';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const fotoController: {
    upload(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    list(req: Request, res: Response): Promise<void>;
    view(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    download(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=fotoController.d.ts.map