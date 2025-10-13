import { FotoODK, SyncResult } from '../types/fotoSync';
export declare const fotoSyncService: {
    syncFotosFromODK(organizacaoId: number, userEmail: string): Promise<SyncResult>;
    getFotosODK(organizacaoUri: string | null): Promise<FotoODK[]>;
    salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<string>;
    listarFotosDisponiveis(organizacaoId: number): Promise<{
        total: number;
        fotos: never[];
        mensagem: string;
        ja_sincronizadas?: undefined;
        disponiveis?: undefined;
    } | {
        total: number;
        ja_sincronizadas: number;
        disponiveis: number;
        fotos: {
            uri: string;
            grupo: string | null;
            obs: string | null;
            nome_arquivo: string;
            creation_date: Date;
            tamanho_mb: string;
            ja_sincronizada: boolean;
        }[];
        mensagem?: undefined;
    }>;
};
//# sourceMappingURL=fotoSyncService.d.ts.map