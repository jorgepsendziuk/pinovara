import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { repositorioService } from '../services/repositorioService';
import { AuthRequest } from '../middleware/auth';

// Pasta para arquivos do repositório público
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/pinovara/shared/uploads/repositorio' 
  : '/Users/jorgepsendziuk/Documents/pinovara/uploads/repositorio';

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar pasta se não existir
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nomeOriginalLimpo = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '-')   // Substitui especiais por hífen
      .replace(/-+/g, '-')              // Remove hífens duplicados
      .replace(/^-|-$/g, '')            // Remove hífens início/fim
      .toLowerCase()
      .substring(0, 50);
    const nomeArquivoFinal = `repo-${nomeOriginalLimpo}-${timestamp}${ext}`;
    cb(null, nomeArquivoFinal);
  }
});

// Filtro de arquivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, imagens, documentos Office, texto e arquivos compactados são aceitos.'));
  }
};

// Configurar upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

class RepositorioController {
  // Upload de arquivo para o repositório
  async uploadArquivo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { descricao, categoria, tags } = req.body;

      if (!file) {
        res.status(400).json({
          success: false,
          error: { message: 'Nenhum arquivo foi enviado' }
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuário não autenticado' }
        });
        return;
      }

      // Processar tags (string separada por vírgulas)
      const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

      // Criar registro no banco
      const arquivo = await repositorioService.create({
        nome_arquivo: file.filename,
        nome_original: file.originalname,
        caminho_arquivo: path.join(UPLOAD_DIR, file.filename),
        tamanho_bytes: file.size,
        tipo_mime: file.mimetype,
        extensao: path.extname(file.originalname).toLowerCase(),
        descricao: descricao || null,
        categoria: categoria || 'geral',
        tags: tagsArray,
        usuario_upload: req.user.email,
        usuario_upload_id: req.user.id,
      });

      res.status(201).json({
        success: true,
        data: arquivo,
        message: 'Arquivo enviado com sucesso para o repositório público'
      });
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao fazer upload de arquivo' }
      });
    }
  }

  // Atualizar metadados (apenas dono ou admin)
  async updateArquivo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const arquivoId = parseInt(id);
      const { descricao, categoria, tags } = req.body;

      if (isNaN(arquivoId)) {
        res.status(400).json({ success: false, error: { message: 'ID do arquivo inválido' } });
        return;
      }

      if (!req.user) {
        res.status(401).json({ success: false, error: { message: 'Usuário não autenticado' } });
        return;
      }

      const arquivo = await repositorioService.findById(arquivoId);
      if (!arquivo) {
        res.status(404).json({ success: false, error: { message: 'Arquivo não encontrado' } });
        return;
      }

      const isAdmin = (req as any).userPermissions?.isAdmin === true || req.user.roles?.some(r => r.name === 'admin' && r.module?.name === 'sistema');
      if (arquivo.usuario_upload_id !== req.user.id && !isAdmin) {
        res.status(403).json({ success: false, error: { message: 'Sem permissão para editar este arquivo' } });
        return;
      }

      const tagsArray = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];
      const result = await repositorioService.update(arquivoId, {
        descricao: descricao ?? null,
        categoria: categoria || arquivo.categoria,
        tags: tagsArray
      });

      res.json({ success: true, data: (result as any[])[0] });
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error);
      res.status(500).json({ success: false, error: { message: 'Erro ao atualizar arquivo' } });
    }
  }

  // Listar arquivos do repositório (todos podem ver)
  async listArquivos(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        categoria, 
        search, 
        tags,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const filtros = {
        categoria: categoria as string,
        search: search as string,
        tags: tags as string,
      };

      const arquivos = await repositorioService.list({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filtros,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json({
        success: true,
        data: arquivos
      });
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao listar arquivos' }
      });
    }
  }

  // Download de arquivo
  async downloadArquivo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const arquivoId = parseInt(id);

      if (isNaN(arquivoId)) {
        res.status(400).json({
          success: false,
          error: { message: 'ID do arquivo inválido' }
        });
        return;
      }

      const arquivo = await repositorioService.findById(arquivoId);

      if (!arquivo || !arquivo.ativo) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado' }
        });
        return;
      }

      // Verificar se arquivo existe fisicamente
      if (!fs.existsSync(arquivo.caminho_arquivo)) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado no servidor' }
        });
        return;
      }

      // Incrementar contador de downloads
      await repositorioService.incrementDownloads(arquivoId);

      // Enviar arquivo
      res.download(arquivo.caminho_arquivo, arquivo.nome_original, (err) => {
        if (err) {
          console.error('Erro ao enviar arquivo:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: { message: 'Erro ao baixar arquivo' }
            });
          }
        }
      });
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao baixar arquivo' }
      });
    }
  }

  // Obter detalhes de um arquivo
  async getArquivo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const arquivoId = parseInt(id);

      if (isNaN(arquivoId)) {
        res.status(400).json({
          success: false,
          error: { message: 'ID do arquivo inválido' }
        });
        return;
      }

      const arquivo = await repositorioService.findById(arquivoId);

      if (!arquivo || !arquivo.ativo) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado' }
        });
        return;
      }

      res.json({
        success: true,
        data: arquivo
      });
    } catch (error) {
      console.error('Erro ao obter arquivo:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao obter arquivo' }
      });
    }
  }

  // Deletar arquivo (apenas admin/coordenador/supervisor)
  async deleteArquivo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const arquivoId = parseInt(id);

      if (isNaN(arquivoId)) {
        res.status(400).json({
          success: false,
          error: { message: 'ID do arquivo inválido' }
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuário não autenticado' }
        });
        return;
      }

      const arquivo = await repositorioService.findById(arquivoId);

      if (!arquivo) {
        res.status(404).json({
          success: false,
          error: { message: 'Arquivo não encontrado' }
        });
        return;
      }

      // Permitir deletar o dono do arquivo ou administrador
      const isAdmin = (req as any).userPermissions?.isAdmin === true || req.user.roles?.some(r => r.name === 'admin' && r.module?.name === 'sistema');
      if (arquivo.usuario_upload_id !== req.user.id && !isAdmin) {
        res.status(403).json({
          success: false,
          error: { message: 'Apenas o proprietário do arquivo pode remover este item.' }
        });
        return;
      }

      // Soft delete - marcar como inativo
      await repositorioService.delete(arquivoId);

      res.json({
        success: true,
        message: 'Arquivo removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao deletar arquivo' }
      });
    }
  }

  // Obter estatísticas do repositório
  async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const estatisticas = await repositorioService.getEstatisticas();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro ao obter estatísticas' }
      });
    }
  }
}

export const repositorioController = new RepositorioController();
