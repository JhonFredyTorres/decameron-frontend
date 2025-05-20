import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const hotelService = {
  getAll: () => api.get('/hotels'),
  get: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
  getRooms: (id) => api.get(`/hotels/${id}/rooms`),
};

export const roomTypeService = {
  getAll: () => api.get('/room-types'),
  getAccommodations: (id) => api.get(`/room-types/${id}/accommodations`),
};

export const accommodationService = {
  getAll: () => api.get('/accommodations'),
};

export const hotelRoomService = {
  getAll: () => api.get('/hotel-rooms'),
  get: (id) => api.get(`/hotel-rooms/${id}`),
  create: (data) => api.post('/hotel-rooms', data),
  update: (id, data) => api.put(`/hotel-rooms/${id}`, data),
  delete: (id) => api.delete(`/hotel-rooms/${id}`),
};

export default api;