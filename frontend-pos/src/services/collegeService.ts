import api from './api';

export const collegeService = {
    getColleges: async () => {
        const response = await api.get('/colleges');
        return response.data;
    },

    getAllColleges: async () => {
        const response = await api.get('/colleges/all');
        return response.data;
    },

    registerCollege: async (data: any) => {
        const response = await api.post('/colleges/register', data);
        return response.data;
    },

    approveCollege: async (id: string) => {
        const response = await api.patch(`/colleges/${id}/approve`);
        return response.data;
    },

    rejectCollege: async (id: string, reason: string) => {
        const response = await api.patch(`/colleges/${id}/reject`, { reason });
        return response.data;
    }
};
