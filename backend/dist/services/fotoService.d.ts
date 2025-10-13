interface CreateFotoDTO {
    foto: string;
    obs?: string;
    id_organizacao: number;
    creator_uri_user: string;
}
interface UpdateFotoDTO {
    obs?: string;
}
export declare const fotoService: {
    create(data: CreateFotoDTO): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        grupo: number | null;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        id_organizacao: number | null;
        foto: string | null;
    }>;
    listByOrganizacao(organizacaoId: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        grupo: number | null;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        id_organizacao: number | null;
        foto: string | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        grupo: number | null;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        id_organizacao: number | null;
        foto: string | null;
    } | null>;
    update(id: number, data: UpdateFotoDTO): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        grupo: number | null;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        id_organizacao: number | null;
        foto: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        uri: string;
        obs: string | null;
        creator_uri_user: string;
        creation_date: Date;
        last_update_uri_user: string | null;
        last_update_date: Date;
        grupo: number | null;
        parent_auri: string | null;
        ordinal_number: number;
        top_level_auri: string | null;
        id_organizacao: number | null;
        foto: string | null;
    }>;
};
export {};
//# sourceMappingURL=fotoService.d.ts.map