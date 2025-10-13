interface CreateDocumentoDTO {
    id_organizacao: number;
    arquivo: string;
    usuario_envio: string;
    obs?: string;
    uri: string;
    ordinal_number: number;
}
interface UpdateDocumentoDTO {
    obs?: string;
    last_update_uri_user?: string;
    last_update_date?: Date;
}
export declare const documentoService: {
    create(data: CreateDocumentoDTO): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        arquivo: string | null;
        id_organizacao: number | null;
    }>;
    findByOrganizacao(organizacaoId: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        arquivo: string | null;
        id_organizacao: number | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        arquivo: string | null;
        id_organizacao: number | null;
    }>;
    update(id: number, data: UpdateDocumentoDTO): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        arquivo: string | null;
        id_organizacao: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        arquivo: string | null;
        id_organizacao: number | null;
    }>;
    count(organizacaoId: number): Promise<number>;
};
export {};
//# sourceMappingURL=documentoService.d.ts.map