interface GoogleAnalyticsMetrics {
    realtime: {
        activeUsers: number;
        screenPageViews: number;
        eventCount: number;
    };
    traffic: {
        totalUsers: number;
        newUsers: number;
        sessions: number;
        averageSessionDuration: number;
        bounceRate: number;
    };
    topPages: Array<{
        page: string;
        views: number;
        averageTime: number;
    }>;
    devices: {
        desktop: number;
        mobile: number;
        tablet: number;
    };
    locations: Array<{
        country: string;
        city: string;
        users: number;
    }>;
    events: Array<{
        eventName: string;
        eventCount: number;
    }>;
}
declare class GoogleAnalyticsService {
    private analyticsDataClient;
    private propertyId;
    private isConfigured;
    constructor();
    private initializeClient;
    isReady(): boolean;
    getRealtimeMetrics(): Promise<GoogleAnalyticsMetrics['realtime'] | null>;
    getTrafficMetrics(): Promise<GoogleAnalyticsMetrics['traffic'] | null>;
    getTopPages(): Promise<GoogleAnalyticsMetrics['topPages'] | null>;
    getDeviceMetrics(): Promise<GoogleAnalyticsMetrics['devices'] | null>;
    getLocationMetrics(): Promise<GoogleAnalyticsMetrics['locations'] | null>;
    getEventMetrics(): Promise<GoogleAnalyticsMetrics['events'] | null>;
    getAllMetrics(): Promise<GoogleAnalyticsMetrics | null>;
}
declare const _default: GoogleAnalyticsService;
export default _default;
//# sourceMappingURL=googleAnalyticsService.d.ts.map