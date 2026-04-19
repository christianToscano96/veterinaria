const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeader(), ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || 
      (data.error?.details ? JSON.stringify(data.error.details) : 'Request failed');
    throw new Error(errorMsg);
  }

  return data.data;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => fetchApi<unknown>('/auth/me'),
};

// Animals
export const animalsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ animals: unknown[]; pagination: unknown }>(`/animals${query}`);
  },
  get: (id: string) => fetchApi<unknown>(`/animals/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchApi<unknown>('/animals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<unknown>(`/animals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<unknown>(`/animals/${id}`, { method: 'DELETE' }),
};

// Appointments
export const appointmentsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ appointments: unknown[] }>(`/appointments${query}`);
  },
  today: () => fetchApi<{ appointments: unknown[] }>('/appointments/today'),
  get: (id: string) => fetchApi<unknown>(`/appointments/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchApi<unknown>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<unknown>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<unknown>(`/appointments/${id}`, { method: 'DELETE' }),
  complete: (id: string) =>
    fetchApi<unknown>(`/appointments/${id}/complete`, { method: 'POST' }),
  confirm: (id: string) =>
    fetchApi<unknown>(`/appointments/${id}/confirm`, { method: 'POST' }),
};

// Vaccinations
export const vaccinationsApi = {
  byAnimal: (animalId: string) =>
    fetchApi<{ vaccinations: unknown[] }>(`/vaccinations/animal/${animalId}`),
  upcoming: (days = 30) =>
    fetchApi<{ vaccinations: unknown[] }>(`/vaccinations/upcoming?days=${days}`),
  overdue: () => fetchApi<{ vaccinations: unknown[] }>('/vaccinations/overdue'),
  create: (data: Record<string, unknown>) =>
    fetchApi<unknown>('/vaccinations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<unknown>(`/vaccinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<unknown>(`/vaccinations/${id}`, { method: 'DELETE' }),
};

// Dashboard
export const dashboardApi = {
  stats: () => fetchApi<{
    totalAnimals: number;
    appointmentsToday: number;
    pendingVaccinations: number;
    draftPosts: number;
  }>('/dashboard/stats'),
  todayAppointments: () => fetchApi<{ appointments: unknown[] }>('/dashboard/appointments/today'),
  upcomingVaccinations: (days = 30) =>
    fetchApi<{ vaccinations: unknown[] }>(`/dashboard/vaccinations/upcoming?days=${days}`),
  overdueVaccinations: () => fetchApi<{ vaccinations: unknown[] }>('/dashboard/vaccinations/overdue'),
  recentActivity: () => fetchApi<{ activity: unknown[] }>('/dashboard/recent-activity'),
};

// Medical Records
export const medicalRecordsApi = {
  byAnimal: (animalId: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ records: unknown[]; pagination: unknown }>(`/medical-records/animal/${animalId}${query}`);
  },
  get: (id: string) => fetchApi<unknown>(`/medical-records/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchApi<unknown>('/medical-records', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<unknown>(`/medical-records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<unknown>(`/medical-records/${id}`, { method: 'DELETE' }),
};

// Social Posts
export const socialPostsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return fetchApi<{ posts: unknown[]; pagination: unknown }>(`/social-posts${query}`);
  },
  get: (id: string) => fetchApi<unknown>(`/social-posts/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchApi<unknown>('/social-posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<unknown>(`/social-posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<unknown>(`/social-posts/${id}`, { method: 'DELETE' }),
  schedule: (id: string, scheduledDate: string) =>
    fetchApi<unknown>(`/social-posts/${id}/schedule`, { 
      method: 'POST', 
      body: JSON.stringify({ scheduledDate }) 
    }),
  publish: (id: string) =>
    fetchApi<unknown>(`/social-posts/${id}/publish`, { method: 'POST' }),
};