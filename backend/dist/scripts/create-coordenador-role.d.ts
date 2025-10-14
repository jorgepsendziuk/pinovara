interface Result {
    success: boolean;
    message: string;
    details: {
        moduloId?: number;
        roleId?: number;
        userId?: number;
        roleJaExistia: boolean;
        usuarioJaExistia: boolean;
    };
}
export declare function createCoordenadorRole(): Promise<Result>;
export {};
//# sourceMappingURL=create-coordenador-role.d.ts.map