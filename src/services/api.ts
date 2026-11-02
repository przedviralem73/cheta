import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const coupleAPI = {
  create: (userId: number, userName: string) =>
    api.post('/couple/create', { userId, userName }),
  
  join: (inviteCode: string, userId: number, userName: string) =>
    api.post('/couple/join', { inviteCode, userId, userName }),
  
  getMe: (userId: number) =>
    api.get(`/couple/me/${userId}`),
};

export const wishlistAPI = {
  getAll: (coupleId: string, status?: 'wanted' | 'bought') =>
    api.get(`/wishlist/${coupleId}`, { params: { status } }),
  
  parseWB: (url: string) =>
    api.post('/wishlist/parse-wb', { url }),
  
  addFromUrl: (url: string, coupleId: string, userId: number, userName: string) =>
    api.post('/wishlist/add', { url, coupleId, userId, userName }),
  
  addManual: (data: {
    title: string;
    imageUrl: string;
    link: string;
    coupleId: string;
    userId: number;
    userName: string;
  }) => api.post('/wishlist/add-manual', data),
  
  markBought: (wishId: string, userId: number, userName: string) =>
    api.patch(`/wishlist/${wishId}/bought`, { userId, userName }),
  
  markWanted: (wishId: string) =>
    api.patch(`/wishlist/${wishId}/unwant`),
  
  delete: (wishId: string) =>
    api.delete(`/wishlist/${wishId}`),
};

export default api;
