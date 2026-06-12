import { api } from '@/lib/api';
import type { BlogPostDTO } from '@thenagrik/shared';

export type BlogResponse = BlogPostDTO;

export const getPublicBlogPosts = async (params?: { categoryId?: string; tag?: string }): Promise<BlogResponse[]> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return api.get(`/v1/blog${query}`);
};

export const getPublicBlogPostBySlug = async (slug: string): Promise<BlogResponse> => {
  return api.get(`/v1/blog/slug/${slug}`);
};

export const getAdminBlogPosts = async (params?: { status?: string; categoryId?: string; tag?: string }): Promise<BlogResponse[]> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return api.get(`/v1/blog/admin${query}`);
};

export const getAdminBlogPostById = async (id: string): Promise<BlogResponse> => {
  return api.get(`/v1/blog/admin/${id}`);
};

export const createBlogPost = async (payload: any): Promise<BlogResponse> => {
  return api.post('/v1/blog/admin', payload);
};

export const updateBlogPost = async (id: string, payload: any): Promise<BlogResponse> => {
  return api.put(`/v1/blog/admin/${id}`, payload);
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await api.delete(`/v1/blog/admin/${id}`);
};
