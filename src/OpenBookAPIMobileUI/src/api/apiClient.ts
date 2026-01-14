import { API_CONFIG } from '../constants/config';
import { ApiError } from '../types/api.types';

class ApiClient {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error: ApiError = await response.json().catch(() => ({
                    type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
                    title: 'An error occurred',
                    status: response.status,
                    detail: response.statusText,
                }));
                throw error;
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw {
                    type: 'timeout',
                    title: 'Request Timeout',
                    status: 408,
                    detail: 'The request took too long to complete',
                } as ApiError;
            }

            throw error;
        }
    }

    async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
        let url = endpoint;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url = `${endpoint}?${queryString}`;
            }
        }

        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

export const apiClient = new ApiClient();
