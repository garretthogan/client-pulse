'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FormEvent,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { useDemoUser } from '@/context/demo-user-context';
import { api } from '@/lib/api';
import { formatDate, formatLabel } from '@/lib/format';
import {
  PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  type Priority,
  type Project,
  type RequestFilters,
  type RequestItem,
  type RequestStatus,
  type RequestType,
} from '@/types/domain';

type FilterAction =
  | { type: 'status'; value: RequestStatus | '' }
  | { type: 'priority'; value: Priority | '' }
  | { type: 'search'; value: string }
  | { type: 'sort'; value: RequestFilters['sort'] };

const initialFilters: RequestFilters = {
  status: '',
  priority: '',
  search: '',
  sort: 'updatedAt_desc',
};

const initialForm: {
  title: string;
  description: string;
  priority: Priority;
  requestType: RequestType;
  assignedTo: string;
} = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  requestType: 'FEATURE',
  assignedTo: '',
};

function filtersReducer(
  state: RequestFilters,
  action: FilterAction,
): RequestFilters {
  return {
    ...state,
    [action.type]: action.value,
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = useMemo(() => String(params.projectId), [params.projectId]);
  const { currentUser } = useDemoUser();
  const [project, setProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);
    setError('');
    Promise.all([api.getProject(projectId), api.getRequests(projectId, filters)])
      .then(([projectResult, requestResults]) => {
        if (!ignore) {
          setProject(projectResult);
          setRequests(requestResults);
        }
      })
      .catch((caught: unknown) => {
        if (!ignore) {
          setError(caught instanceof Error ? caught.message : 'Unable to load');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [filters, projectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const created = await api.createRequest(
        projectId,
        {
          title: form.title,
          description: form.description,
          priority: form.priority,
          requestType: form.requestType,
          assignedTo: form.assignedTo || undefined,
        },
        currentUser,
      );
      setRequests((current) => [created, ...current]);
      setForm(initialForm);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          {project?.client ? (
            <Link className="muted" href={`/clients/${project.client.id}`}>
              {project.client.name}
            </Link>
          ) : null}
          <h1 className="page-title">{project?.name ?? 'Project'}</h1>
          <p className="page-kicker">{project?.description}</p>
        </div>
        {project ? <StatusBadge value={project.status} /> : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading project" /> : null}

      {!isLoading && project ? (
        <div className="stack">
          <section className="panel">
            <h2 className="section-heading">Create request</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="grid two-column">
                <label className="field">
                  <span>Title</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    required
                    value={form.title}
                  />
                </label>
                <label className="field">
                  <span>Assigned to</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assignedTo: event.target.value,
                      }))
                    }
                    value={form.assignedTo}
                  />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea
                  className="textarea"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  required
                  value={form.description}
                />
              </label>
              <div className="filter-bar">
                <label className="field">
                  <span>Type</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        requestType: event.target.value as RequestType,
                      }))
                    }
                    value={form.requestType}
                  >
                    {REQUEST_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {formatLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as Priority,
                      }))
                    }
                    value={form.priority}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatLabel(priority)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button" disabled={isSaving}>
                  {isSaving ? 'Saving' : 'Create request'}
                </button>
              </div>
            </form>
          </section>

          <section className="stack">
            <div className="page-header">
              <div>
                <h2 className="section-heading">Requests</h2>
              </div>
            </div>

            <div className="filter-bar">
              <label className="field">
                <span>Search</span>
                <input
                  className="input"
                  onChange={(event) =>
                    dispatch({ type: 'search', value: event.target.value })
                  }
                  value={filters.search}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  className="select"
                  onChange={(event) =>
                    dispatch({
                      type: 'status',
                      value: event.target.value as RequestStatus | '',
                    })
                  }
                  value={filters.status}
                >
                  <option value="">All</option>
                  {REQUEST_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Priority</span>
                <select
                  className="select"
                  onChange={(event) =>
                    dispatch({
                      type: 'priority',
                      value: event.target.value as Priority | '',
                    })
                  }
                  value={filters.priority}
                >
                  <option value="">All</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Sort</span>
                <select
                  className="select"
                  onChange={(event) =>
                    dispatch({
                      type: 'sort',
                      value: event.target.value as RequestFilters['sort'],
                    })
                  }
                  value={filters.sort}
                >
                  <option value="updatedAt_desc">Newest updated</option>
                  <option value="updatedAt_asc">Oldest updated</option>
                </select>
              </label>
            </div>

            {requests.length === 0 ? (
              <EmptyState message="No requests match the current filters." />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Type</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <Link
                            className="item-title"
                            href={`/requests/${request.id}`}
                          >
                            {request.title}
                          </Link>
                          <div className="muted">{request.assignedTo}</div>
                        </td>
                        <td>
                          <StatusBadge value={request.status} />
                        </td>
                        <td>
                          <PriorityBadge value={request.priority} />
                        </td>
                        <td>{formatLabel(request.requestType)}</td>
                        <td>{formatDate(request.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
