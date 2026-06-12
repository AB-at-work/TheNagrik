import { api } from '@/lib/api';
import type { ProjectDTO } from '@thenagrik/shared';

export const getPublicProjects = async (): Promise<ProjectDTO[]> => {
  return api.get('/v1/projects');
};

export const getPublicProjectBySlug = async (slug: string): Promise<ProjectDTO> => {
  return api.get(`/v1/projects/slug/${slug}`);
};

export const getAdminProjects = async (params?: { status?: string }): Promise<ProjectDTO[]> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return api.get(`/v1/projects/admin${query}`);
};

export const getAdminProjectById = async (id: string): Promise<ProjectDTO> => {
  return api.get(`/v1/projects/admin/${id}`);
};

export const createProject = async (payload: any): Promise<ProjectDTO> => {
  return api.post('/v1/projects/admin', payload);
};

export const updateProject = async (id: string, payload: any): Promise<ProjectDTO> => {
  return api.put(`/v1/projects/admin/${id}`, payload);
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/v1/projects/admin/${id}`);
};
