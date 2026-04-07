import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchArticles(params: {
  tab?: string;
  city?: string;
  category?: string;
  q?: string;
}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  const res = await fetch(`${API_URL}/api/articles?${query}`);
  return res.json();
}

export async function fetchArticle(id: string) {
  const res = await fetch(`${API_URL}/api/articles/${id}`);
  return res.json();
}

export async function submitArticle(payload: {
  title: string;
  body: string;
  category: string;
  location_text: string;
  image_url?: string;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/articles`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchMyProfile() {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/users/me`, { headers });
  return res.json();
}

export async function updateProfile(payload: { name: string; city: string }) {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/users/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function uploadImage(uri: string): Promise<string | null> {
  const fileName = `${Date.now()}.jpg`;
  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type: 'image/jpeg' } as any);

  const { data, error } = await supabase.storage
    .from('article-images')
    .upload(`public/${fileName}`, formData as any, { contentType: 'image/jpeg' });

  if (error) return null;

  const { data: urlData } = supabase.storage
    .from('article-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
