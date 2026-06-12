import { api } from '@/lib/api';
import type { SchoolSessionDTO } from '@thenagrik/shared';

export type SchoolSessionResponse = SchoolSessionDTO;

export const getPublicSessions = async (): Promise<SchoolSessionResponse[]> => {
  return api.get('/v1/schools/sessions');
};

export const getSessionBySlug = async (slug: string): Promise<SchoolSessionResponse> => {
  return api.get(`/v1/schools/${slug}`);
};

export const getAdminSessions = async (): Promise<SchoolSessionResponse[]> => {
  return api.get('/v1/schools/admin');
};

export const getAdminSessionById = async (id: string): Promise<SchoolSessionResponse> => {
  return api.get(`/v1/schools/admin/${id}`);
};

export const createSession = async (payload: any): Promise<SchoolSessionResponse> => {
  return api.post('/v1/schools/admin', payload);
};

export const updateSession = async (id: string, payload: any): Promise<SchoolSessionResponse> => {
  return api.put(`/v1/schools/admin/${id}`, payload);
};

export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/v1/schools/admin/${id}`);
};
