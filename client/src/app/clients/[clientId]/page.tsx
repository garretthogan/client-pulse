'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/badges';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import {
  PROJECT_STATUSES,
  type ClientDetail,
  type Project,
  type ProjectStatus,
} from '@/types/domain';

const initialForm: {
  name: string;
  description: string;
  status: ProjectStatus;
} = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = useMemo(() => String(params.clientId), [params.clientId]);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function loadClient() {
    setIsLoading(true);
    setError('');
    Promise.all([api.getClient(clientId), api.getProjects(clientId)])
      .then(([clientResult, projectResults]) => {
        setClient(clientResult);
        setProjects(projectResults);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'Unable to load');
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadClient();
  }, [clientId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const created = await api.createProject(clientId, {
        ...form,
        description: form.description || undefined,
      });
      setProjects((current) => [created, ...current]);
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
          <Link className="muted" href="/clients">
            Clients
          </Link>
          <h1 className="page-title">{client?.name ?? 'Client'}</h1>
          {client ? (
            <p className="page-kicker">
              {client.contactName} · {client.contactEmail}
            </p>
          ) : null}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading client" /> : null}

      {!isLoading && client ? (
        <div className="grid two-column">
          <div className="stack">
            <div className="panel">
              <h2 className="section-heading">Client details</h2>
              <div className="compact-stack">
                <div>
                  <span className="muted">Contact</span>
                  <div>{client.contactName}</div>
                </div>
                <div>
                  <span className="muted">Email</span>
                  <div>{client.contactEmail}</div>
                </div>
                <div>
                  <span className="muted">Created</span>
                  <div>{formatDate(client.createdAt)}</div>
                </div>
              </div>
            </div>

            <div className="stack">
              <h2 className="section-heading">Projects</h2>
              {projects.length === 0 ? (
                <EmptyState message="No projects yet." />
              ) : null}
              <div className="list">
                {projects.map((project) => (
                  <Link
                    className="list-item"
                    href={`/projects/${project.id}`}
                    key={project.id}
                  >
                    <div className="item-title">{project.name}</div>
                    <p className="muted">{project.description}</p>
                    <div className="meta-row">
                      <StatusBadge value={project.status} />
                      <span className="pill">
                        {project._count?.requests ?? 0} requests
                      </span>
                      <span className="muted">
                        Created {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="panel">
            <h2 className="section-heading">Create project</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span>Name</span>
                <input
                  className="input"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  value={form.name}
                />
              </label>
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
                  value={form.description}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  className="select"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ProjectStatus,
                    }))
                  }
                  value={form.status}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-wide" disabled={isSaving}>
                {isSaving ? 'Saving' : 'Create project'}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
