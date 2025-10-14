import { ArquivoODK, ArquivoSyncResult } from '../types/arquivoSync';
export declare const arquivoSyncService: {
    syncArquivosFromODK(organizacaoId: number, userEmail: string): Promise<ArquivoSyncResult>;
    getArquivosODK(organizacaoUri: string | null): Promise<ArquivoODK[]>;
    buscarArquivosTabela(connectionString: string, escapedUri: string, prefixo: "ORGANIZACAO" | "PINOVARA"): Promise<ArquivoODK[]>;
    salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<void>;
    verificarArquivoExiste(nomeArquivo: string): Promise<boolean>;
    garantirDiretorioExiste(): Promise<void>;
    listarArquivosDisponiveis(organizacaoId: number): Promise<ArquivoODK[]>;
};
//# sourceMappingURL=arquivoSyncService.d.ts.map