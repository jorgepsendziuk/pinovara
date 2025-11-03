const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const repositorioService = {
  // Criar novo arquivo no repositório
  async create(data) {
    return await prisma.$queryRaw`
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
  },

  // Listar arquivos com filtros e paginação
  async list(params) {
    const { page, limit, filtros, sortBy, sortOrder } = params;
    const offset = (page - 1) * limit;

    // Construir condições WHERE
    let whereConditions = 'WHERE rp.ativo = true';
    const queryParams = [];
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

    const countResult = await prisma.$queryRawUnsafe(countQuery, ...queryParams);
    const total = parseInt(countResult[0].total);

    // Query para buscar arquivos
    const dataQuery = `
      SELECT 
        rp.*,
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
      arquivos: arquivos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Buscar arquivo por ID
  async findById(id) {
    const result = await prisma.$queryRaw`
      SELECT 
        rp.*,
        u.name as usuario_nome
      FROM pinovara.repositorio_publico rp
      LEFT JOIN pinovara.users u ON rp.usuario_upload_id = u.id
      WHERE rp.id = ${id} AND rp.ativo = true
    `;

    return result[0] || null;
  },

  // Incrementar contador de downloads
  async incrementDownloads(id) {
    await prisma.$executeRaw`
      UPDATE pinovara.repositorio_publico 
      SET downloads = downloads + 1 
      WHERE id = ${id}
    `;
  },

  // Soft delete - marcar como inativo
  async delete(id) {
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
        COUNT(*) as total_arquivos,
        COUNT(CASE WHEN ativo = true THEN 1 END) as arquivos_ativos,
        SUM(tamanho_bytes) as tamanho_total_bytes,
        SUM(downloads) as total_downloads,
        COUNT(DISTINCT categoria) as total_categorias,
        COUNT(DISTINCT usuario_upload_id) as total_usuarios
      FROM pinovara.repositorio_publico
    `;

    const categorias = await prisma.$queryRaw`
      SELECT 
        categoria,
        COUNT(*) as quantidade
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
      ...stats[0],
      categorias: categorias,
      arquivosRecentes: arquivosRecentes,
      maisBaixados: maisBaixados
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

    return result.map(row => row.categoria);
  },

  // Obter tags mais usadas
  async getTagsPopulares(limit = 20) {
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

    return result;
  }
};

module.exports = { repositorioService };




