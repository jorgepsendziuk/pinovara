"use strict";
/**
 * Configuração do Banco de Dados
 * Instância compartilhada do PrismaClient para evitar múltiplas conexões
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Singleton pattern para PrismaClient
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new client_1.PrismaClient();
}
else {
    // Em desenvolvimento, use uma variável global para evitar
    // múltiplas instâncias durante hot reload
    if (!global.prisma) {
        global.prisma = new client_1.PrismaClient({
            log: ['error', 'warn'],
        });
    }
    prisma = global.prisma;
}
exports.default = prisma;
