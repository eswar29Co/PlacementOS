import api from './api';

export const collegeService = {
    getColleges: async () => {
        const response = await api.get('/colleges');
        return response.data;
    },

    registerCollege: async (data: any) => {
        const response = await api.post('/colleges/register', data);
        return response.data;
    }
};
