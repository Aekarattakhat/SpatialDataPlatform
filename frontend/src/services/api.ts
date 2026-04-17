import axios from 'axios';
import type { Feature, CreateLocationPayload, UpdateLocationPayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Response Error:', error);

        // Handle network errors
        if (!error.response) {
            throw new Error('Network error. Please check your connection.');
        }

        // Handle HTTP errors
        const status = error.response.status;
        let message = 'An error occurred';

        switch (status) {
            case 400:
                message = 'Invalid request. Please check your input.';
                break;
            case 401:
                message = 'Unauthorized. Please log in again.';
                break;
            case 403:
                message = 'You do not have permission to perform this action.';
                break;
            case 404:
                message = 'Resource not found.';
                break;
            case 500:
                message = 'Server error. Please try again later.';
                break;
            default:
                message = error.response.data?.message || 'An unexpected error occurred.';
        }

        throw new Error(message);
    }
);

export interface LocationsResponse {
    data: Feature[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const locationService = {
    getLocations: async (page = 1, limit = 100): Promise<LocationsResponse> => {
        const response = await apiClient.get<LocationsResponse>('/locations', {
            params: { page, limit }
        });
        return response.data;
    },

    createLocation: async (payload: CreateLocationPayload): Promise<Feature> => {
        const response = await apiClient.post<Feature>('/locations', payload);
        return response.data;
    },

    updateLocation: async (id: string, payload: UpdateLocationPayload): Promise<Feature> => {
        const response = await apiClient.put<Feature>(`/locations/${id}`, payload);
        return response.data;
    },

    deleteLocation: async (id: string): Promise<void> => {
        await apiClient.delete(`/locations/${id}`);
    }
};
