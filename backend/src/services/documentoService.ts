import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateDocumentoDTO {
  id_organizacao: number;
  tipo_documento: string;
  arquivo: string;
  usuario_envio: string;
  obs?: string;
}

interface UpdateDocumentoDTO {
  obs?: string;
}

export const documentoService = {
  // Criar novo documento
  async create(data: CreateDocumentoDTO) {
    return await prisma.organizacao_documento.create({
      data: {
        id_organizacao: data.id_organizacao,
        tipo_documento: data.tipo_documento,
        arquivo: data.arquivo,
        usuario_envio: data.usuario_envio,
        obs: data.obs,
      },
    });
  },

  // Buscar documentos de uma organização
  async findByOrganizacao(organizacaoId: number) {
    return await prisma.organizacao_documento.findMany({
      where: { id_organizacao: organizacaoId },
      orderBy: { data_envio: 'desc' },
    });
  },

  // Buscar documento por ID
  async findById(id: number) {
    return await prisma.organizacao_documento.findUnique({
      where: { id },
    });
  },

  // Atualizar documento
  async update(id: number, data: UpdateDocumentoDTO) {
    return await prisma.organizacao_documento.update({
      where: { id },
      data,
    });
  },

  // Deletar documento
  async delete(id: number) {
    return await prisma.organizacao_documento.delete({
      where: { id },
    });
  },

  // Contar documentos por tipo
  async countByTipo(organizacaoId: number, tipo: string) {
    return await prisma.organizacao_documento.count({
      where: {
        id_organizacao: organizacaoId,
        tipo_documento: tipo,
      },
    });
  },
};

