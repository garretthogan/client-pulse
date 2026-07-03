export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETE';
export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestType = 'BUG' | 'FEATURE' | 'QUESTION' | 'CHANGE_REQUEST';

export const PROJECT_STATUSES: ProjectStatus[] = ['ACTIVE', 'PAUSED', 'COMPLETE'];
export const REQUEST_STATUSES: RequestStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE',
];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const REQUEST_TYPES: RequestType[] = [
  'BUG',
  'FEATURE',
  'QUESTION',
  'CHANGE_REQUEST',
];

export type Client = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  _count?: {
    requests: number;
  };
};

export type ClientDetail = Client;

export type RequestItem = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  requestType: RequestType;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
};

export type Comment = {
  id: string;
  requestId: string;
  authorName: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type RequestDetail = RequestItem & {
  project: Project & {
    client: Client;
  };
  comments: Comment[];
};

export type DashboardSummary = {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  blockedRequests: number;
  doneRequests: number;
  highOrUrgentPriorityRequests: number;
};

export type RequestFilters = {
  status: RequestStatus | '';
  priority: Priority | '';
  search: string;
  sort: 'updatedAt_desc' | 'updatedAt_asc';
};
