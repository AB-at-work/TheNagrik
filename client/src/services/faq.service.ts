import { api } from '@/lib/api';
import type { FaqEntryDTO } from '@thenagrik/shared';

export const getPublicFaqs = async (params?: { category?: string }): Promise<FaqEntryDTO[]> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return api.get(`/v1/faq${query}`);
};

export const getAdminFaqs = async (params?: { category?: string; isActive?: boolean }): Promise<FaqEntryDTO[]> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return api.get(`/v1/faq/admin${query}`);
};

export const getFaqById = async (id: string): Promise<FaqEntryDTO> => {
  return api.get(`/v1/faq/admin/${id}`);
};

export const createFaq = async (payload: any): Promise<FaqEntryDTO> => {
  return api.post('/v1/faq/admin', payload);
};

export const updateFaq = async (id: string, payload: any): Promise<FaqEntryDTO> => {
  return api.put(`/v1/faq/admin/${id}`, payload);
};

export const deleteFaq = async (id: string): Promise<void> => {
  await api.delete(`/v1/faq/admin/${id}`);
};
