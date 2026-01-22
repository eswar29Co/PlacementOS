import api from './api';

export const adminService = {
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
    getStudentHistory: async (id: string) => {
        const response = await api.get(`/admin/students/${id}/history`);
        return response.data;
    },
    getProfessionalHistory: async (id: string) => {
        const response = await api.get(`/admin/professionals/${id}/history`);
        return response.data;
    }
};
