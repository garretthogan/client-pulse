'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Client } from '@/types/domain';

const initialForm = {
  name: '',
  contactName: '',
  contactEmail: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function loadClients() {
    setIsLoading(true);
    setError('');
    api
      .getClients()
      .then(setClients)
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'Unable to load');
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const created = await api.createClient(form);
      setClients((current) => [created, ...current]);
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
          <h1 className="page-title">Clients</h1>
          <p className="page-kicker">Accounts and primary contacts.</p>
        </div>
      </div>

      <div className="grid two-column">
        <div className="stack">
          {error ? <ErrorState message={error} /> : null}
          {isLoading ? <LoadingState label="Loading clients" /> : null}
          {!isLoading && clients.length === 0 ? (
            <EmptyState message="No clients yet." />
          ) : null}
          <div className="list">
            {clients.map((client) => (
              <Link
                className="list-item"
                href={`/clients/${client.id}`}
                key={client.id}
              >
                <div className="item-title">{client.name}</div>
                <div className="meta-row">
                  <span>{client.contactName}</span>
                  <span className="muted">{client.contactEmail}</span>
                  <span className="pill">
                    {client._count?.projects ?? 0} projects
                  </span>
                  <span className="muted">
                    Created {formatDate(client.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="panel">
          <h2 className="section-heading">Create client</h2>
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
              <span>Contact name</span>
              <input
                className="input"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contactName: event.target.value,
                  }))
                }
                required
                value={form.contactName}
              />
            </label>
            <label className="field">
              <span>Contact email</span>
              <input
                className="input"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contactEmail: event.target.value,
                  }))
                }
                required
                type="email"
                value={form.contactEmail}
              />
            </label>
            <button className="button button-wide" disabled={isSaving}>
              {isSaving ? 'Saving' : 'Create client'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
