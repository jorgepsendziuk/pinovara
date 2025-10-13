import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateDocumentoDTO {
  id_organizacao: number;
  arquivo: string;
  usuario_envio: string;
  obs?: string;
  uri: string;
  ordinal_number: number;
}

interface UpdateDocumentoDTO {
  obs?: string;
  last_update_uri_user?: string;
  last_update_date?: Date;
}

export const documentoService = {
  // Criar novo documento
  async create(data: CreateDocumentoDTO) {
    const now = new Date();
    return await prisma.organizacao_arquivo.create({
      data: {
        id_organizacao: data.id_organizacao,
        arquivo: data.arquivo,
        obs: data.obs,
        uri: data.uri,
        creator_uri_user: data.usuario_envio,
        creation_date: now,
        last_update_date: now,
        ordinal_number: data.ordinal_number,
      },
    });
  },

  // Buscar documentos de uma organização
  async findByOrganizacao(organizacaoId: number) {
    return await prisma.organizacao_arquivo.findMany({
      where: { id_organizacao: organizacaoId },
      orderBy: { creation_date: 'desc' },
    });
  },

  // Buscar documento por ID
  async findById(id: number) {
    return await prisma.organizacao_arquivo.findUnique({
      where: { id },
    });
  },

  // Atualizar documento
  async update(id: number, data: UpdateDocumentoDTO) {
    return await prisma.organizacao_arquivo.update({
      where: { id },
      data: {
        ...data,
        last_update_date: new Date(),
      },
    });
  },

  // Deletar documento
  async delete(id: number) {
    return await prisma.organizacao_arquivo.delete({
      where: { id },
    });
  },

  // Contar documentos
  async count(organizacaoId: number) {
    return await prisma.organizacao_arquivo.count({
      where: {
        id_organizacao: organizacaoId,
      },
    });
  },
};

