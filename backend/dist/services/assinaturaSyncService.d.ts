export interface AssinaturaODK {
    uri: string;
    parent_auri: string;
    creation_date: Date;
    assinatura_blob: Buffer;
    tamanho_bytes: number;
    nome_arquivo: string;
    tipo: 'responsavel' | 'participante';
    participante_nome?: string;
}
export interface SyncResult {
    success: boolean;
    total_odk: number;
    ja_existentes: number;
    baixadas: number;
    erros: number;
    detalhes: SyncDetail[];
    mensagem: string;
}
export interface SyncDetail {
    uri: string;
    status: 'baixada' | 'existente' | 'erro';
    mensagem: string;
    nome_arquivo: string;
    tipo?: 'responsavel' | 'participante';
}
export declare const assinaturaSyncService: {
    syncAssinaturasFromODK(organizacaoId: number, userEmail: string): Promise<SyncResult>;
    getAssinaturasODK(organizacaoUri: string | null): Promise<AssinaturaODK[]>;
    buscarAssinaturasResponsavel(connectionString: string, escapedUri: string): Promise<AssinaturaODK[]>;
    buscarAssinaturasParticipantes(connectionString: string, escapedUri: string): Promise<AssinaturaODK[]>;
    salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<string>;
    listarAssinaturasDisponiveis(organizacaoId: number): Promise<{
        total: number;
        assinaturas: never[];
        mensagem: string;
        ja_sincronizadas?: undefined;
        disponiveis?: undefined;
    } | {
        total: number;
        ja_sincronizadas: number;
        disponiveis: number;
        assinaturas: {
            uri: string;
            tipo: "responsavel" | "participante";
            participante_nome: string | undefined;
            nome_arquivo: string;
            creation_date: Date;
            tamanho_mb: string;
            ja_sincronizada: boolean;
        }[];
        mensagem?: undefined;
    }>;
};
//# sourceMappingURL=assinaturaSyncService.d.ts.map