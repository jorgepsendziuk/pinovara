/**
 * Configuração do Banco de Dados
 * Instância compartilhada do PrismaClient para evitar múltiplas conexões
 */

import { PrismaClient } from '@prisma/client';

// Singleton pattern para PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, use uma variável global para evitar
  // múltiplas instâncias durante hot reload
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;


