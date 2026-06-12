import { api } from '@/lib/api';
import type { TeamMemberDTO } from '@thenagrik/shared';

export const getPublicTeamMembers = async (): Promise<TeamMemberDTO[]> => {
  return api.get('/v1/team');
};

export const getAdminTeamMembers = async (): Promise<TeamMemberDTO[]> => {
  return api.get('/v1/team/admin/all');
};

export const getTeamMemberById = async (id: string): Promise<TeamMemberDTO> => {
  return api.get(`/v1/team/admin/${id}`);
};

export const createTeamMember = async (payload: any): Promise<TeamMemberDTO> => {
  return api.post('/v1/team/admin', payload);
};

export const updateTeamMember = async (id: string, payload: any): Promise<TeamMemberDTO> => {
  return api.put(`/v1/team/admin/${id}`, payload);
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  await api.delete(`/v1/team/admin/${id}`);
};
