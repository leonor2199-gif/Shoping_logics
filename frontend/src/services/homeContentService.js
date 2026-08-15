import api from './api';

const homeContentService = {
  getPublic: async () => {
    const response = await api.get('/home-content');
    return response.data;
  },
};

export default homeContentService;
