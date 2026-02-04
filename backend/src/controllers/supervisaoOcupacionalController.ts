import { Response } from 'express';
import { supervisaoOcupacionalService } from '../services/supervisaoOcupacionalService';
import { ApiError } from '../utils/ApiError';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';
import { mapFamiliaFromDB, mapFamiliaToDB } from '../utils/familiaFieldMapper';

class SupervisaoOcupacionalController {
  /**
   * GET /supervisao-ocupacional/dashboard
   */
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dashboard = await supervisaoOcupacionalService.getDashboard();
      res.status(HttpStatus.OK).json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/glebas
   */
  async listGlebas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        estado: req.query.estado ? parseInt(req.query.estado as string) : undefined,
        municipio: req.query.municipio ? parseInt(req.query.municipio as string) : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await supervisaoOcupacionalService.listGlebas(filters);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/glebas/:id
   */
  async getGlebaById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const gleba = await supervisaoOcupacionalService.getGlebaById(id);
      
      if (!gleba) {
        throw new ApiError({
          message: 'Gleba não encontrada',
          statusCode: HttpStatus.NOT_FOUND
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: gleba,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /supervisao-ocupacional/glebas
   */
  async createGleba(req: AuthRequest, res: Response): Promise<void> {
    try {
      const gleba = await supervisaoOcupacionalService.createGleba(req.body);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: gleba,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /supervisao-ocupacional/glebas/:id
   */
  async updateGleba(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const gleba = await supervisaoOcupacionalService.updateGleba(id, req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        data: gleba,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /supervisao-ocupacional/glebas/:id
   */
  async deleteGleba(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await supervisaoOcupacionalService.deleteGleba(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Gleba removida com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/familias
   */
  async listFamilias(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userPermissions = (req as any).userPermissions;
      const userId = (req as any).user?.id;

      const filters: any = {
        gleba: req.query.gleba ? parseInt(req.query.gleba as string) : undefined,
        estado: req.query.estado ? parseInt(req.query.estado as string) : undefined,
        municipio: req.query.municipio ? parseInt(req.query.municipio as string) : undefined,
        validacao: req.query.validacao ? parseInt(req.query.validacao as string) : undefined,
        tecnico: req.query.tecnico ? parseInt(req.query.tecnico as string) : undefined,
        aceitou_visita: req.query.aceitou_visita ? parseInt(req.query.aceitou_visita as string) : undefined,
        quilombo: req.query.quilombo as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      // Se for técnico ou estagiário, filtrar apenas suas próprias famílias
      if (userPermissions?.canViewOwnOnly && !userPermissions.isSystemAdmin && !userPermissions.isModuleAdmin) {
        filters.tecnico = userId;
      }

      const result = await supervisaoOcupacionalService.listFamilias(filters);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/familias/:id
   */
  async getFamiliaById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log('[DEBUG] Controller - Buscando família ID:', id);
      const familia = await supervisaoOcupacionalService.getFamiliaById(id);
      
      if (!familia) {
        throw new ApiError({
          message: 'Família não encontrada',
          statusCode: HttpStatus.NOT_FOUND
        });
      }

      const familiaAny = familia as any;
      console.log('[DEBUG] Controller - Família encontrada no banco:', {
        id: familia.id,
        iuf_ocup_nome: familiaAny.iuf_ocup_nome,
        iuf_ocup_cpf: familiaAny.iuf_ocup_cpf,
        num_imovel: familiaAny.num_imovel,
        aceitou_visita: familiaAny.aceitou_visita
      });

      // Mapear campos do banco para o formato esperado pelo frontend
      const familiaMapped = mapFamiliaFromDB(familia);

      console.log('[DEBUG] Família mapeada:', {
        id: familiaMapped.id,
        iuf_nome_ocupante: familiaMapped.iuf_nome_ocupante,
        g00_0_q1_2: familiaMapped.g00_0_q1_2,
        i_q1_10: familiaMapped.i_q1_10,
        i_q1_17: familiaMapped.i_q1_17
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: familiaMapped,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /supervisao-ocupacional/familias/:id/validacao
   */
  async validateFamilia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { validacao, obs_validacao } = req.body;
      const userId = (req as any).user?.id;
      const userPermissions = (req as any).userPermissions;

      // Verificar permissão de validação
      if (!userPermissions?.canValidate) {
        throw new ApiError({
          message: 'Acesso negado. Apenas administradores e coordenadores podem validar famílias.',
          statusCode: HttpStatus.FORBIDDEN
        });
      }

      // Verificar se família existe
      const familiaExistente = await supervisaoOcupacionalService.getFamiliaById(id);
      if (!familiaExistente) {
        throw new ApiError({
          message: 'Família não encontrada',
          statusCode: HttpStatus.NOT_FOUND
        });
      }

      const familia = await supervisaoOcupacionalService.validateFamilia(id, {
        validacao,
        obs_validacao,
        tecnico: userId
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: familia,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /supervisao-ocupacional/familias/:id
   */
  async updateFamilia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userPermissions = (req as any).userPermissions;
      
      // Verificar permissão de edição
      if (!userPermissions?.canEdit) {
        throw new ApiError({
          message: 'Acesso negado. Apenas administradores e técnicos podem editar famílias.',
          statusCode: HttpStatus.FORBIDDEN
        });
      }
      
      // Verificar se família existe
      const familiaExistente = await supervisaoOcupacionalService.getFamiliaById(id);
      if (!familiaExistente) {
        throw new ApiError({
          message: 'Família não encontrada',
          statusCode: HttpStatus.NOT_FOUND
        });
      }

      // Se for técnico, verificar se a família pertence a ele
      if (userPermissions.isTechnician && !userPermissions.isSystemAdmin && !userPermissions.isModuleAdmin) {
        if (familiaExistente.tecnico !== userPermissions.userId) {
          throw new ApiError({
            message: 'Acesso negado. Você só pode editar famílias atribuídas a você.',
            statusCode: HttpStatus.FORBIDDEN
          });
        }
      }

      // Mapear campos do frontend para o formato do banco de dados
      const dataMapped = mapFamiliaToDB(req.body);

      const familia = await supervisaoOcupacionalService.updateFamilia(id, dataMapped);

      // Mapear resposta de volta para o formato do frontend
      const familiaMapped = mapFamiliaFromDB(familia);

      res.status(HttpStatus.OK).json({
        success: true,
        data: familiaMapped,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/familias/sync/available
   */
  async listODKAvailable(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await supervisaoOcupacionalService.listODKAvailable();
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /supervisao-ocupacional/familias/sync
   */
  async syncFromODK(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { instanceIds } = req.body;
      const userEmail = (req as any).user?.email || 'sistema';
      
      const result = await supervisaoOcupacionalService.syncFromODK(instanceIds || [], userEmail);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/estados
   */
  async getEstados(req: AuthRequest, res: Response): Promise<void> {
    try {
      const estados = await supervisaoOcupacionalService.getEstados();
      res.status(HttpStatus.OK).json({
        success: true,
        data: estados,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/municipios/:estadoId?
   */
  async getMunicipios(req: AuthRequest, res: Response): Promise<void> {
    try {
      const estadoId = req.params.estadoId ? parseInt(req.params.estadoId) : undefined;
      const municipios = await supervisaoOcupacionalService.getMunicipios(estadoId);
      res.status(HttpStatus.OK).json({
        success: true,
        data: municipios,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /supervisao-ocupacional/tecnicos
   */
  async getTecnicos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tecnicos = await supervisaoOcupacionalService.getTecnicos();
      res.status(HttpStatus.OK).json({
        success: true,
        data: tecnicos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('Erro no controller:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const supervisaoOcupacionalController = new SupervisaoOcupacionalController();
