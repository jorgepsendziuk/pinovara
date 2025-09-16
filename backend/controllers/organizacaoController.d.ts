import { Request, Response } from 'express';
export declare const getDashboard: (req: Request, res: Response) => Promise<void>;
export declare const getOrganizacoes: (req: Request, res: Response) => Promise<void>;
export declare const getOrganizacaoById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createOrganizacao: (req: Request, res: Response) => Promise<void>;
export declare const updateOrganizacao: (req: Request, res: Response) => Promise<void>;
export declare const deleteOrganizacao: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=organizacaoController.d.ts.map