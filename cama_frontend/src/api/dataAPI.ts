import { Study, Experiment, Effect } from "./newTypes.ts"
import apiClient from './apiClient';

export const fetchFieldDefinitions = async (): Promise<any> => {
    try {
        const response = await apiClient.get('/api/field-definitions/');
        return response;
    } catch (error) {
        console.error('Error fetching field definitions:', error);
        return null;
    }
};

export const addStudy = async (study: Study): Promise<Study | null> => {
    try {
        const storedSession = localStorage.getItem("AUTH_SESSION");
        if (!storedSession) {
            throw new Error('No session found');
        }

        const session = JSON.parse(storedSession);
        const { orcid } = session;

        if (!orcid) {
            throw new Error('No ORCID found');
        }

        const requestBody = {
            uploader: orcid,
            nr_downloads: 0,
            ...study,
        };

        console.log("Request body:", JSON.stringify(requestBody));

        const response = await apiClient.post('/api/studies/all', requestBody);
        return response;
    } catch (error) {
        console.error('Error submitting study:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        return null;
    }
};

export const approveStudy = async (study_id: number): Promise<Study | null> => {
    try {
        const response = await apiClient.patch(`/api/study/${study_id}/`);
        return response.data;
    } catch (error) {
        console.error('Error approving study:', error);
        return null;
    }
};

export const fetchApprovedStudies = async (): Promise<Study[] | null> => {
    try {
        const response = await apiClient.get('/api/studies/approved');
        return response;
    } catch (error: any) {
        if (error?.status === 401) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login';
            return null;
        }
        console.error('Error getting studies:', error);
        return null;
    }
};

export const fetchAllStudies = async (): Promise<Study[] | null> => {
    try {
        const response = await apiClient.get('/api/studies/all');
        return response;
    } catch (error: any) {
        if (error?.status === 401) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login';
            return null;
        }
        console.error('Error getting studies:', error);
        return null;
    }
};

export const fetchStudyById = async (id: number): Promise<Study | null> => {
    try {
        const response = await apiClient.get(`/api/studies/${id}/`);
        return response;
    } catch (error: any) {
        if (error?.status === 401) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login';
            return null;
        }
        console.error(`Error fetching study with ID ${id}:`, error);
        return null;
    }
};

export const searchStudy = async (search_term: string): Promise<Study[] | null> => {
    try {
        const response = await apiClient.get(`/api/studies-search/?title=${search_term}`);
        return response;
    } catch (error: any) {
        if (error?.status === 401) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login';
            return null;
        }
        console.error(`Error searching for study with title ${search_term}:`, error);
        return null;
    }
};

export const updateStudy = async (id: number, study: Study): Promise<Study | null> => {
    try {
        const response = await apiClient.put(`/studies/${id}`, study);
        return response.data;
    } catch (error) {
        console.error('Error updating study:', error);
        return null;
    }
};

export const deleteStudy = async (id: number): Promise<boolean> => {
    try {
        await apiClient.delete(`/studies/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting study:', error);
        return false;
    }
};

export const addExperiment = async (experiment: Experiment): Promise<Experiment | null> => {
    try {
        const response = await apiClient.post('/api/experiments/', experiment);
        return response;
    } catch (error) {
        console.error('Error adding experiment:', error);
        return null;
    }
};

export const fetchExperiments = async (studyId: number): Promise<Experiment[] | null> => {
    try {
        const response = await apiClient.get(`/studies/${studyId}/experiments`);
        return response;
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return null;
    }
};

export const fetchExperimentById = async (id: number): Promise<Experiment | null> => {
    try {
        const response = await apiClient.get(`/experiments/${id}`);
        return response;
    } catch (error) {
        console.error(`Error fetching experiment with ID ${id}:`, error);
        return null;
    }
};

export const updateExperiment = async (id: number, experiment: Experiment): Promise<Experiment | null> => {
    try {
        const response = await apiClient.put(`/experiments/${id}`, experiment);
        return response.data;
    } catch (error) {
        console.error('Error updating experiment:', error);
        return null;
    }
};

export const deleteExperiment = async (id: number): Promise<boolean> => {
    try {
        await apiClient.delete(`/experiments/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting experiment:', error);
        return false;
    }
};

export const addEffect = async (effect: Effect): Promise<Effect | null> => {
    try {
        const response = await apiClient.post('/api/effect-data/', effect);
        return response;
    } catch (error) {
        console.error('Error adding effect:', error);
        return null;
    }
};

export const fetchEffects = async (experimentId: number): Promise<Effect[] | null> => {
    try {
        const response = await apiClient.get(`/experiments/${experimentId}/effects`);
        return response;
    } catch (error) {
        console.error('Error fetching effects:', error);
        return null;
    }
};

export const fetchEffectById = async (id: number): Promise<Effect | null> => {
    try {
        const response = await apiClient.get(`/effects/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching effect with ID ${id}:`, error);
        return null;
    }
};

export const updateEffect = async (id: number, effect: Effect): Promise<Effect | null> => {
    try {
        const response = await apiClient.put(`/effects/${id}`, effect);
        return response.data;
    } catch (error) {
        console.error('Error updating effect:', error);
        return null;
    }
};

export const deleteEffect = async (id: number): Promise<boolean> => {
    try {
        await apiClient.delete(`/effects/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting effect:', error);
        return false;
    }
};

export const downloadFilteredData = async (filters: any): Promise<void> => {
    try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await apiClient.get(`/api/download-effects/?${queryString}`, {
            responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (error) {
        console.error('Error downloading data:', error);
    }
};

export const fetchStudiesByCategory = async (category: string): Promise<Study[] | null> => {
    try {
        const response = await apiClient.get(`/api/studies-filterd/?category__name=${category}`);
        return response;
    } catch (error: any) {
        if (error?.status === 401) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login';
            return null;
        }
        console.error(`Error fetching studies for category ${category}:`, error);
        return null;
    }
};

export const download = async (study_id: string) => {
    try {
        const response = await apiClient.get(`/api/study/${study_id}/download/`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        console.error('Error downloading study:', error);
        throw error;
    }
};
