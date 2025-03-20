import { apiUrl } from './apiConfig';

interface RequestConfig extends RequestInit {
    _retry?: boolean;
    responseType?: 'blob' | 'json' | 'text';
}

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
    console.log('Processing queued requests:', failedQueue.length);
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getAuthHeaders = (token?: string) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    console.log('🔄 Attempting to refresh token...');
    try {
        const response = await fetch(`${apiUrl}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (!response.ok) {
            console.error('❌ Token refresh failed:', response.status);
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        console.log('✅ Token refresh successful');
        return data.access;
    } catch (error) {
        console.error('❌ Error refreshing token:', error);
        return null;
    }
}

async function handleRequest(url: string, config: RequestConfig = {}): Promise<Response> {
    const session = localStorage.getItem('AUTH_SESSION');
    
    if (!session) {
        console.log('No session found, proceeding without authentication');
        const response = await fetch(url, config);
        if (!response.ok) {
            const error = new Error('Request failed') as any;
            error.status = response.status;
            throw error;
        }
        return response;
    }

    const { accessToken, refreshToken } = JSON.parse(session);
    
    // Add auth header if we have a token
    if (accessToken) {
        config.headers = {
            ...config.headers,
            ...getAuthHeaders(accessToken)
        };
    }

    try {
        console.log(`🌐 Making request to: ${url}`);
        const response = await fetch(url, config);

        // If response is OK, return it
        if (response.ok) {
            return response;
        }

        console.log(`📡 Response status: ${response.status}`);

        // If response is 401 and we haven't retried yet, try to refresh token
        if (response.status === 401 && !config._retry) {
            console.log('🔑 Got 401, attempting token refresh...');
            if (isRefreshing) {
                console.log('Token refresh already in progress, queuing request');
                // Wait for the other refresh to complete
                try {
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    config.headers = {
                        ...config.headers,
                        ...getAuthHeaders(token as string)
                    };
                    const retryResponse = await fetch(url, config);
                    if (!retryResponse.ok) {
                        const error = new Error('Request failed after token refresh') as any;
                        error.status = retryResponse.status;
                        throw error;
                    }
                    return retryResponse;
                } catch (err) {
                    throw err;
                }
            }

            isRefreshing = true;
            config._retry = true;

            try {
                const newAccessToken = await refreshAccessToken(refreshToken);
                
                if (!newAccessToken) {
                    throw new Error('Failed to refresh token');
                }

                // Update session storage
                const sessionData = JSON.parse(session);
                const updatedSession = {
                    ...sessionData,
                    accessToken: newAccessToken
                };
                localStorage.setItem('AUTH_SESSION', JSON.stringify(updatedSession));

                // Update request headers with new token
                config.headers = {
                    ...config.headers,
                    ...getAuthHeaders(newAccessToken)
                };

                // Process any queued requests
                processQueue(null, newAccessToken);
                
                console.log('🔄 Retrying original request with new token');
                // Retry the original request
                const retryResponse = await fetch(url, config);
                if (!retryResponse.ok) {
                    const error = new Error('Request failed after token refresh') as any;
                    error.status = retryResponse.status;
                    throw error;
                }
                return retryResponse;
            } catch (error) {
                console.error('❌ Token refresh failed completely:', error);
                processQueue(error, null);
                localStorage.removeItem('AUTH_SESSION');
                window.location.href = '/login';
                throw error;
            } finally {
                isRefreshing = false;
            }
        }

        // If we get here, the response wasn't OK and we either couldn't or didn't need to refresh
        const error = new Error('Request failed') as any;
        error.status = response.status;
        throw error;
    } catch (error) {
        console.error('❌ Request failed:', error);
        throw error;
    }
}

const apiClient = {
    async get(endpoint: string, config: RequestConfig = {}) {
        const response = await handleRequest(`${apiUrl}${endpoint}`, {
            ...config,
            method: 'GET'
        });
        return config.responseType === 'blob' ? response.blob() : response.json();
    },

    async post(endpoint: string, data?: any, config: RequestConfig = {}) {
        const response = await handleRequest(`${apiUrl}${endpoint}`, {
            ...config,
            method: 'POST',
            body: JSON.stringify(data)
        });
        return config.responseType === 'blob' ? response.blob() : response.json();
    },

    async put(endpoint: string, data?: any, config: RequestConfig = {}) {
        const response = await handleRequest(`${apiUrl}${endpoint}`, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return config.responseType === 'blob' ? response.blob() : response.json();
    },

    async patch(endpoint: string, data?: any, config: RequestConfig = {}) {
        const response = await handleRequest(`${apiUrl}${endpoint}`, {
            ...config,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return config.responseType === 'blob' ? response.blob() : response.json();
    },

    async delete(endpoint: string, config: RequestConfig = {}) {
        const response = await handleRequest(`${apiUrl}${endpoint}`, {
            ...config,
            method: 'DELETE'
        });
        return config.responseType === 'blob' ? response.blob() : response.json();
    }
};

export default apiClient;