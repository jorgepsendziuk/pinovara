"use strict";
/**
 * Serviço de Google Analytics
 * Integração com Google Analytics Data API (GA4)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("@google-analytics/data");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class GoogleAnalyticsService {
    constructor() {
        this.analyticsDataClient = null;
        this.isConfigured = false;
        this.propertyId = process.env.GA_PROPERTY_ID || '';
        this.initializeClient();
    }
    /**
     * Inicializa o cliente do Google Analytics
     */
    initializeClient() {
        try {
            const serviceAccountPath = path_1.default.join(__dirname, '../../service-account.json');
            // Verificar se o arquivo existe
            if (!fs_1.default.existsSync(serviceAccountPath)) {
                console.warn('⚠️ Service Account não encontrado. Google Analytics desabilitado.');
                return;
            }
            // Verificar se o Property ID está configurado
            if (!this.propertyId) {
                console.warn('⚠️ GA_PROPERTY_ID não configurado. Google Analytics desabilitado.');
                return;
            }
            this.analyticsDataClient = new data_1.BetaAnalyticsDataClient({
                keyFilename: serviceAccountPath,
            });
            this.isConfigured = true;
            console.log('✅ Google Analytics Data API configurado com sucesso');
        }
        catch (error) {
            console.error('❌ Erro ao configurar Google Analytics:', error);
            this.isConfigured = false;
        }
    }
    /**
     * Verifica se o serviço está configurado
     */
    isReady() {
        return this.isConfigured && this.analyticsDataClient !== null;
    }
    /**
     * Buscar métricas em tempo real
     */
    async getRealtimeMetrics() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runRealtimeReport({
                property: `properties/${this.propertyId}`,
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' },
                    { name: 'eventCount' },
                ],
            });
            const row = response.rows?.[0];
            if (!row) {
                return {
                    activeUsers: 0,
                    screenPageViews: 0,
                    eventCount: 0,
                };
            }
            return {
                activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
                screenPageViews: parseInt(row.metricValues?.[1]?.value || '0'),
                eventCount: parseInt(row.metricValues?.[2]?.value || '0'),
            };
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas em tempo real:', error);
            return null;
        }
    }
    /**
     * Buscar métricas de tráfego (últimos 7 dias)
     */
    async getTrafficMetrics() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                metrics: [
                    { name: 'totalUsers' },
                    { name: 'newUsers' },
                    { name: 'sessions' },
                    { name: 'averageSessionDuration' },
                    { name: 'bounceRate' },
                ],
            });
            const row = response.rows?.[0];
            if (!row) {
                return {
                    totalUsers: 0,
                    newUsers: 0,
                    sessions: 0,
                    averageSessionDuration: 0,
                    bounceRate: 0,
                };
            }
            return {
                totalUsers: parseInt(row.metricValues?.[0]?.value || '0'),
                newUsers: parseInt(row.metricValues?.[1]?.value || '0'),
                sessions: parseInt(row.metricValues?.[2]?.value || '0'),
                averageSessionDuration: parseFloat(row.metricValues?.[3]?.value || '0'),
                bounceRate: parseFloat(row.metricValues?.[4]?.value || '0'),
            };
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de tráfego:', error);
            return null;
        }
    }
    /**
     * Buscar páginas mais visitadas
     */
    async getTopPages() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pagePath' }],
                metrics: [
                    { name: 'screenPageViews' },
                    { name: 'averageSessionDuration' },
                ],
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                limit: 10,
            });
            if (!response.rows || response.rows.length === 0) {
                return [];
            }
            return response.rows.map(row => ({
                page: row.dimensionValues?.[0]?.value || '',
                views: parseInt(row.metricValues?.[0]?.value || '0'),
                averageTime: parseFloat(row.metricValues?.[1]?.value || '0'),
            }));
        }
        catch (error) {
            console.error('❌ Erro ao buscar páginas mais visitadas:', error);
            return null;
        }
    }
    /**
     * Buscar distribuição por dispositivos
     */
    async getDeviceMetrics() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'activeUsers' }],
            });
            const devices = {
                desktop: 0,
                mobile: 0,
                tablet: 0,
            };
            response.rows?.forEach(row => {
                const deviceType = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
                const users = parseInt(row.metricValues?.[0]?.value || '0');
                if (deviceType === 'desktop')
                    devices.desktop = users;
                else if (deviceType === 'mobile')
                    devices.mobile = users;
                else if (deviceType === 'tablet')
                    devices.tablet = users;
            });
            return devices;
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de dispositivos:', error);
            return null;
        }
    }
    /**
     * Buscar localização dos usuários
     */
    async getLocationMetrics() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'country' }, { name: 'city' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 10,
            });
            if (!response.rows || response.rows.length === 0) {
                return [];
            }
            return response.rows.map(row => ({
                country: row.dimensionValues?.[0]?.value || '',
                city: row.dimensionValues?.[1]?.value || '',
                users: parseInt(row.metricValues?.[0]?.value || '0'),
            }));
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de localização:', error);
            return null;
        }
    }
    /**
     * Buscar eventos mais comuns
     */
    async getEventMetrics() {
        if (!this.isReady()) {
            return null;
        }
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'eventCount' }],
                orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
                limit: 10,
            });
            if (!response.rows || response.rows.length === 0) {
                return [];
            }
            return response.rows.map(row => ({
                eventName: row.dimensionValues?.[0]?.value || '',
                eventCount: parseInt(row.metricValues?.[0]?.value || '0'),
            }));
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de eventos:', error);
            return null;
        }
    }
    /**
     * Buscar todas as métricas do Google Analytics
     */
    async getAllMetrics() {
        if (!this.isReady()) {
            console.log('⚠️ Google Analytics não está configurado. Retornando null.');
            return null;
        }
        try {
            const [realtime, traffic, topPages, devices, locations, events] = await Promise.all([
                this.getRealtimeMetrics(),
                this.getTrafficMetrics(),
                this.getTopPages(),
                this.getDeviceMetrics(),
                this.getLocationMetrics(),
                this.getEventMetrics(),
            ]);
            // Se alguma métrica falhar, retorna null para essa seção
            return {
                realtime: realtime || { activeUsers: 0, screenPageViews: 0, eventCount: 0 },
                traffic: traffic || { totalUsers: 0, newUsers: 0, sessions: 0, averageSessionDuration: 0, bounceRate: 0 },
                topPages: topPages || [],
                devices: devices || { desktop: 0, mobile: 0, tablet: 0 },
                locations: locations || [],
                events: events || [],
            };
        }
        catch (error) {
            console.error('❌ Erro ao buscar todas as métricas do Google Analytics:', error);
            return null;
        }
    }
}
exports.default = new GoogleAnalyticsService();
