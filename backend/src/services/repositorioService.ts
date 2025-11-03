import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função auxiliar para converter BigInt para Number (evita erro de serialização JSON)
function convertBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigInt);
  if (typeof obj === 'object') {
    const converted: { [key: string]: any } = {};
    for (const key in obj) {
      converted[key] = convertBigInt(obj[key]);
    }
    return converted;
  }
  return obj;
}

export interface RepositorioCreateData {
  nome_arquivo: string;
  nome_original: string;
  caminho_arquivo: string;
  tamanho_bytes: number;
  tipo_mime: string;
  extensao: string;
  descricao?: string | null;
  categoria: string;
  tags: string[];
  usuario_upload: string;
  usuario_upload_id: number;
}

export interface RepositorioListParams {
  page: number;
  limit: number;
  filtros: {
    categoria?: string;
    search?: string;
    tags?: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface RepositorioListResult {
  arquivos: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const repositorioService = {
  // Criar novo arquivo no repositório
  async create(data: RepositorioCreateData) {
    const result = await prisma.$queryRaw`
      INSERT INTO pinovara.repositorio_publico (
        nome_arquivo,
        nome_original,
        caminho_arquivo,
        tamanho_bytes,
        tipo_mime,
        extensao,
        descricao,
        categoria,
        tags,
        usuario_upload,
        usuario_upload_id
      ) VALUES (
        ${data.nome_arquivo},
        ${data.nome_original},
        ${data.caminho_arquivo},
        ${data.tamanho_bytes},
        ${data.tipo_mime},
        ${data.extensao},
        ${data.descricao},
        ${data.categoria},
        ${data.tags},
        ${data.usuario_upload},
        ${data.usuario_upload_id}
      ) RETURNING *;
    `;
    return convertBigInt((result as any[])[0]);
  },

  // Atualizar metadados do arquivo
  async update(id: number, data: { descricao?: string | null; categoria?: string; tags?: string[] }) {
    await prisma.$executeRaw`
      UPDATE pinovara.repositorio_publico
      SET descricao = ${data.descricao ?? null},
          categoria = ${data.categoria ?? 'geral'},
          tags = ${data.tags ?? []},
          updated_at = NOW()
      WHERE id = ${id}
    `;
    const result = await prisma.$queryRaw`
      SELECT 
        rp.*,
        to_char(rp.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(rp.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      WHERE rp.id = ${id}
    `;
    return convertBigInt((result as any[])[0]);
  },

  // Listar arquivos com filtros e paginação
  async list(params: RepositorioListParams): Promise<RepositorioListResult> {
    const { page, limit, filtros, sortBy, sortOrder } = params;
    const offset = (page - 1) * limit;

    // Construir condições WHERE
    let whereConditions = 'WHERE rp.ativo = true';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filtros.categoria) {
      whereConditions += ` AND rp.categoria = $${paramIndex}`;
      queryParams.push(filtros.categoria);
      paramIndex++;
    }

    if (filtros.search) {
      whereConditions += ` AND (
        rp.nome_original ILIKE $${paramIndex} OR 
        rp.descricao ILIKE $${paramIndex} OR 
        EXISTS (
          SELECT 1 FROM unnest(rp.tags) AS tag 
          WHERE tag ILIKE $${paramIndex}
        )
      )`;
      queryParams.push(`%${filtros.search}%`);
      paramIndex++;
    }

    if (filtros.tags) {
      const tagsArray = filtros.tags.split(',').map(tag => tag.trim());
      whereConditions += ` AND rp.tags && $${paramIndex}`;
      queryParams.push(tagsArray);
      paramIndex++;
    }

    // Validar sortBy
    const allowedSortFields = ['created_at', 'nome_original', 'tamanho_bytes', 'downloads', 'categoria'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pinovara.repositorio_publico rp
      ${whereConditions}
    `;

    const countResult = await prisma.$queryRawUnsafe(countQuery, ...queryParams) as any[];
    const total = convertBigInt(countResult[0].total);

    // Query para buscar arquivos
    const dataQuery = `
      SELECT
        rp.id,
        rp.nome_arquivo,
        rp.nome_original,
        rp.caminho_arquivo,
        rp.tamanho_bytes,
        rp.tipo_mime,
        rp.extensao,
        rp.descricao,
        rp.categoria,
        rp.tags,
        rp.usuario_upload,
        rp.usuario_upload_id,
        rp.ativo,
        rp.downloads,
        to_char(rp.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(rp.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      ${whereConditions}
      ORDER BY rp.${validSortBy} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const arquivos = await prisma.$queryRawUnsafe(dataQuery, ...queryParams);

    return {
      arquivos: convertBigInt(arquivos),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Buscar arquivo por ID
  async findById(id: number) {
    const result = await prisma.$queryRaw`
      SELECT 
        rp.*,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      WHERE rp.id = ${id} AND rp.ativo = true
    `;

    return (result as any[])[0] || null;
  },

  // Incrementar contador de downloads
  async incrementDownloads(id: number) {
    await prisma.$executeRaw`
      UPDATE pinovara.repositorio_publico 
      SET downloads = downloads + 1 
      WHERE id = ${id}
    `;
  },

  // Soft delete - marcar como inativo
  async delete(id: number) {
    await prisma.$executeRaw`
      UPDATE pinovara.repositorio_publico 
      SET ativo = false 
      WHERE id = ${id}
    `;
  },

  // Obter estatísticas do repositório
  async getEstatisticas() {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int as total_arquivos,
        COUNT(CASE WHEN ativo = true THEN 1 END)::int as arquivos_ativos,
        COALESCE(SUM(tamanho_bytes), 0)::bigint as tamanho_total_bytes,
        COALESCE(SUM(downloads), 0)::int as total_downloads,
        COUNT(DISTINCT categoria)::int as total_categorias,
        COUNT(DISTINCT usuario_upload_id)::int as total_usuarios
      FROM pinovara.repositorio_publico
    `;

    const categorias = await prisma.$queryRaw`
      SELECT 
        categoria,
        COUNT(*)::int as quantidade
      FROM pinovara.repositorio_publico
      WHERE ativo = true
      GROUP BY categoria
      ORDER BY quantidade DESC
    `;

    const arquivosRecentes = await prisma.$queryRaw`
      SELECT 
        rp.nome_original,
        rp.categoria,
        rp.created_at,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      WHERE rp.ativo = true
      ORDER BY rp.created_at DESC
      LIMIT 5
    `;

    const maisBaixados = await prisma.$queryRaw`
      SELECT 
        rp.nome_original,
        rp.categoria,
        rp.downloads,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      WHERE rp.ativo = true
      ORDER BY rp.downloads DESC
      LIMIT 5
    `;

    return {
      ...(stats as any[])[0],
      categorias: categorias as any[],
      arquivosRecentes: arquivosRecentes as any[],
      maisBaixados: maisBaixados as any[]
    };
  },

  // Obter categorias disponíveis
  async getCategorias() {
    const result = await prisma.$queryRaw`
      SELECT DISTINCT categoria
      FROM pinovara.repositorio_publico
      WHERE ativo = true
      ORDER BY categoria
    `;

    return (result as any[]).map(row => row.categoria);
  },

  // Obter tags mais usadas
  async getTagsPopulares(limit: number = 20) {
    const result = await prisma.$queryRaw`
      SELECT 
        unnest(tags) as tag,
        COUNT(*) as quantidade
      FROM pinovara.repositorio_publico
      WHERE ativo = true AND tags IS NOT NULL
      GROUP BY unnest(tags)
      ORDER BY quantidade DESC
      LIMIT ${limit}
    `;

    return result as any[];
  }
};
