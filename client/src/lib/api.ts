import type {
  Client,
  ClientDetail,
  Comment,
  DashboardSummary,
  Priority,
  Project,
  RequestDetail,
  RequestFilters,
  RequestItem,
  RequestStatus,
} from '@/types/domain';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  demoUser?: string;
  query?: Record<string, string | undefined>;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = new URL(path, API_URL);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-User': options.demoUser ?? 'demo@example.com',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ');
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiClientError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getSummary() {
    return apiRequest<DashboardSummary>('/dashboard/summary');
  },
  getClients() {
    return apiRequest<Client[]>('/clients');
  },
  createClient(body: Pick<Client, 'name' | 'contactName' | 'contactEmail'>) {
    return apiRequest<Client>('/clients', { method: 'POST', body });
  },
  getClient(clientId: string) {
    return apiRequest<ClientDetail>(`/clients/${clientId}`);
  },
  getProjects(clientId: string) {
    return apiRequest<Project[]>(`/clients/${clientId}/projects`);
  },
  createProject(
    clientId: string,
    body: Pick<Project, 'name' | 'description' | 'status'>,
  ) {
    return apiRequest<Project>(`/clients/${clientId}/projects`, {
      method: 'POST',
      body,
    });
  },
  getProject(projectId: string) {
    return apiRequest<Project>(`/projects/${projectId}`);
  },
  getRequests(projectId: string, filters: RequestFilters) {
    return apiRequest<RequestItem[]>(`/projects/${projectId}/requests`, {
      query: {
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
        sort: filters.sort,
      },
    });
  },
  createRequest(
    projectId: string,
    body: Partial<RequestItem>,
    demoUser: string,
  ) {
    return apiRequest<RequestItem>(`/projects/${projectId}/requests`, {
      method: 'POST',
      body,
      demoUser,
    });
  },
  getRequest(requestId: string) {
    return apiRequest<RequestDetail>(`/requests/${requestId}`);
  },
  updateRequest(
    requestId: string,
    body: { status?: RequestStatus; priority?: Priority },
    demoUser: string,
  ) {
    return apiRequest<RequestItem>(`/requests/${requestId}`, {
      method: 'PATCH',
      body,
      demoUser,
    });
  },
  getComments(requestId: string) {
    return apiRequest<Comment[]>(`/requests/${requestId}/comments`);
  },
  createComment(
    requestId: string,
    body: Pick<Comment, 'authorName' | 'body' | 'isInternal'>,
  ) {
    return apiRequest<Comment>(`/requests/${requestId}/comments`, {
      method: 'POST',
      body,
    });
  },
};
