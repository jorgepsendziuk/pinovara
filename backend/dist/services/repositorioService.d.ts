export interface RepositorioCreateData {
    nome_arquivo: string;
    nome_original: string;
    caminho_arquivo: string;
    tamanho_bytes: number;
    tipo_mime: string;
    extensao: string;
    descricao?: string | null;
    categoria: string;
    tags: string[];
    usuario_upload: string;
    usuario_upload_id: number;
}
export interface RepositorioListParams {
    page: number;
    limit: number;
    filtros: {
        categoria?: string;
        search?: string;
        tags?: string;
    };
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
export interface RepositorioListResult {
    arquivos: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const repositorioService: {
    create(data: RepositorioCreateData): Promise<any>;
    update(id: number, data: {
        descricao?: string | null;
        categoria?: string;
        tags?: string[];
    }): Promise<any>;
    list(params: RepositorioListParams): Promise<RepositorioListResult>;
    findById(id: number): Promise<any>;
    incrementDownloads(id: number): Promise<void>;
    delete(id: number): Promise<void>;
    getEstatisticas(): Promise<any>;
    getCategorias(): Promise<any[]>;
    getTagsPopulares(limit?: number): Promise<any[]>;
};
//# sourceMappingURL=repositorioService.d.ts.map