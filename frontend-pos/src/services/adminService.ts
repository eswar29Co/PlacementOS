import api from './api';

export const adminService = {
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
};
