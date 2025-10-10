import { Request, Response } from 'express';
import { fotoService } from '../services/fotoService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do Multer para upload de fotos
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';

// Garantir que o diretório existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const organizacaoId = req.params.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '_')    // Substitui caracteres especiais
      .replace(/_+/g, '_')               // Remove underscores duplicados
      .replace(/^_|_$/g, '')             // Remove underscores no início/fim
      .toLowerCase();
    
    const cleanName = `foto_org${organizacaoId}_${baseName}_${timestamp}${ext}`;
    cb(null, cleanName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

export const uploadMiddleware = upload.single('foto');

export const fotoController = {
  // Upload de foto
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        });
      }

      const organizacaoId = parseInt(req.params.id);
      const { obs } = req.body;
      const userEmail = (req as any).user?.email || 'sistema';

      const foto = await fotoService.create({
        foto: req.file.filename,
        obs,
        id_organizacao: organizacaoId,
        creator_uri_user: userEmail
      });

      res.json({
        success: true,
        data: foto
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload de foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao fazer upload de foto'
      });
    }
  },

  // Listar fotos de uma organização
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const fotos = await fotoService.listByOrganizacao(organizacaoId);

      res.json({
        success: true,
        data: fotos
      });
    } catch (error: any) {
      console.error('Erro ao listar fotos:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar fotos'
      });
    }
  },

  // Download de foto
  async download(req: Request, res: Response) {
    try {
      const fotoId = parseInt(req.params.fotoId);
      const foto = await fotoService.findById(fotoId);

      if (!foto || !foto.foto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }

      const filePath = path.join(UPLOAD_DIR, foto.foto);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Arquivo não encontrado no servidor'
        });
      }

      res.download(filePath, foto.foto);
    } catch (error: any) {
      console.error('Erro ao fazer download de foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao fazer download de foto'
      });
    }
  },

  // Deletar foto
  async delete(req: Request, res: Response) {
    try {
      const fotoId = parseInt(req.params.fotoId);
      const foto = await fotoService.findById(fotoId);

      if (!foto) {
        return res.status(404).json({
          success: false,
          error: 'Foto não encontrada'
        });
      }

      // Deletar arquivo físico
      if (foto.foto) {
        const filePath = path.join(UPLOAD_DIR, foto.foto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Deletar registro do banco
      await fotoService.delete(fotoId);

      res.json({
        success: true,
        message: 'Foto deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao deletar foto'
      });
    }
  }
};

