import api from './api';

const adminHomeContentService = {
  list: async () => (await api.get('/home-content/admin')).data,
  create: async (data) => (await api.post('/home-content/admin', data)).data,
  update: async (id, data) => (await api.patch(`/home-content/admin/${id}`, data)).data,
  remove: async (id) => (await api.delete(`/home-content/admin/${id}`)).data,
};

export default adminHomeContentService;
