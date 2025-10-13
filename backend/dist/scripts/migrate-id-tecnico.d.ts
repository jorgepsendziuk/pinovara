interface MigrationResult {
    totalProcessed: number;
    totalVinculados: number;
    totalNaoEncontrados: number;
    totalJaVinculados: number;
    detalhes: {
        organizacaoId: number;
        creatorUri: string | null;
        emailExtraido: string | null;
        usuarioEncontrado: boolean;
        userId?: number;
        motivo?: string;
    }[];
}
export declare function migrateIdTecnico(): Promise<MigrationResult>;
export {};
//# sourceMappingURL=migrate-id-tecnico.d.ts.map