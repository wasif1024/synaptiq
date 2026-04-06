import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const agentsAPI = {
  list: () => apiClient.get('/api/agents'),
  get: (id: number) => apiClient.get(`/api/agents/${id}`),
  create: (data: any) => apiClient.post('/api/agents', data),
  update: (id: number, data: any) => apiClient.put(`/api/agents/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/agents/${id}`),
};

export const conversationsAPI = {
  list: () => apiClient.get('/api/conversations'),
  get: (id: number) => apiClient.get(`/api/conversations/${id}`),
  create: (data: any) => apiClient.post('/api/conversations', data),
  delete: (id: number) => apiClient.delete(`/api/conversations/${id}`),
  messages: (id: number) => apiClient.get(`/api/conversations/${id}/messages`),
  chat: (id: number, content: string) => apiClient.post(`/api/conversations/${id}/chat`, { content }),
};

export const knowledgeAPI = {
  list: () => apiClient.get('/api/knowledge'),
  create: (data: any) => apiClient.post('/api/knowledge', data),
  documents: (id: number) => apiClient.get(`/api/knowledge/${id}/documents`),
  addDocument: (id: number, data: any) => apiClient.post(`/api/knowledge/${id}/documents`, data),
  deleteDocument: (kbId: number, docId: number) => apiClient.delete(`/api/knowledge/${kbId}/documents/${docId}`),
};

export default apiClient;