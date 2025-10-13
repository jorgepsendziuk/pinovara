import { FotoODK, SyncResult } from '../types/fotoSync';
export declare const fotoSyncService: {
    /**
     * Sincroniza fotos do ODK para uma organização
     */
    syncFotosFromODK(organizacaoId: number, userEmail: string): Promise<SyncResult>;
    /**
     * Busca fotos do ODK via dblink
     */
    getFotosODK(organizacaoUri: string | null): Promise<FotoODK[]>;
    /**
     * Salva BLOB como arquivo no disco
     */
    salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<string>;
    /**
     * Lista fotos disponíveis no ODK (sem baixar)
     */
    listarFotosDisponiveis(organizacaoId: number): Promise<{
        total: number;
        fotos: any[];
        mensagem: string;
        ja_sincronizadas?: undefined;
        disponiveis?: undefined;
    } | {
        total: any;
        ja_sincronizadas: number;
        disponiveis: number;
        fotos: any[];
        mensagem?: undefined;
    }>;
};
//# sourceMappingURL=fotoSyncService.d.ts.map