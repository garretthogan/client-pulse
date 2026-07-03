'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState, ErrorState, LoadingState } from '@/components/page-state';
import { useDemoUser } from '@/context/demo-user-context';
import { api } from '@/lib/api';
import { formatDate, formatLabel } from '@/lib/format';
import {
  PRIORITIES,
  REQUEST_STATUSES,
  type Comment,
  type Priority,
  type RequestDetail,
  type RequestStatus,
} from '@/types/domain';

const initialCommentForm = {
  authorName: 'Demo User',
  body: '',
  isInternal: false,
};

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = useMemo(() => String(params.requestId), [params.requestId]);
  const { currentUser } = useDemoUser();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<RequestStatus>('NEW');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState('');

  function loadRequest() {
    setIsLoading(true);
    setError('');
    api
      .getRequest(requestId)
      .then((result) => {
        setRequest(result);
        setComments(result.comments);
        setStatus(result.status);
        setPriority(result.priority);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : 'Unable to load');
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      const updated = await api.updateRequest(
        requestId,
        { status, priority },
        currentUser,
      );
      setRequest((current) => (current ? { ...current, ...updated } : current));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCommenting(true);
    setError('');

    try {
      const created = await api.createComment(requestId, commentForm);
      setComments((current) => [...current, created]);
      setCommentForm(initialCommentForm);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to comment');
    } finally {
      setIsCommenting(false);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          {request ? (
            <Link className="muted" href={`/projects/${request.project.id}`}>
              {request.project.name}
            </Link>
          ) : null}
          <h1 className="page-title">{request?.title ?? 'Request'}</h1>
          {request ? (
            <p className="page-kicker">
              {request.project.client.name} · Created by {request.createdBy}
            </p>
          ) : null}
        </div>
        {request ? (
          <div className="meta-row">
            <StatusBadge value={request.status} />
            <PriorityBadge value={request.priority} />
          </div>
        ) : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {isLoading ? <LoadingState label="Loading request" /> : null}

      {!isLoading && request ? (
        <div className="detail-grid">
          <div className="stack">
            <section className="panel">
              <h2 className="section-heading">Details</h2>
              <div className="compact-stack">
                <p>{request.description}</p>
                <div className="meta-row">
                  <span className="pill">{formatLabel(request.requestType)}</span>
                  <span className="pill">
                    Assigned to {request.assignedTo ?? 'Unassigned'}
                  </span>
                  <span className="muted">
                    Updated {formatDate(request.updatedAt)}
                  </span>
                </div>
              </div>
            </section>

            <section className="panel">
              <h2 className="section-heading">Comments</h2>
              {comments.length === 0 ? (
                <EmptyState message="No comments yet." />
              ) : null}
              <div className="stack">
                {comments.map((comment) => (
                  <article className="comment" key={comment.id}>
                    <div className="meta-row">
                      <strong>{comment.authorName}</strong>
                      <span className="badge">
                        {comment.isInternal ? 'Internal' : 'External'}
                      </span>
                      <span className="muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="stack">
            <section className="panel">
              <h2 className="section-heading">Update request</h2>
              <form className="form-grid" onSubmit={handleUpdate}>
                <label className="field">
                  <span>Status</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setStatus(event.target.value as RequestStatus)
                    }
                    value={status}
                  >
                    {REQUEST_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {formatLabel(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select
                    className="select"
                    onChange={(event) =>
                      setPriority(event.target.value as Priority)
                    }
                    value={priority}
                  >
                    {PRIORITIES.map((item) => (
                      <option key={item} value={item}>
                        {formatLabel(item)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button button-wide" disabled={isUpdating}>
                  {isUpdating ? 'Updating' : 'Update request'}
                </button>
              </form>
            </section>

            <section className="panel">
              <h2 className="section-heading">Add comment</h2>
              <form className="form-grid" onSubmit={handleComment}>
                <label className="field">
                  <span>Author</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setCommentForm((current) => ({
                        ...current,
                        authorName: event.target.value,
                      }))
                    }
                    required
                    value={commentForm.authorName}
                  />
                </label>
                <label className="field">
                  <span>Comment</span>
                  <textarea
                    className="textarea"
                    onChange={(event) =>
                      setCommentForm((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                    required
                    value={commentForm.body}
                  />
                </label>
                <label className="checkbox-row">
                  <input
                    checked={commentForm.isInternal}
                    onChange={(event) =>
                      setCommentForm((current) => ({
                        ...current,
                        isInternal: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Internal</span>
                </label>
                <button className="button button-wide" disabled={isCommenting}>
                  {isCommenting ? 'Saving' : 'Add comment'}
                </button>
              </form>
            </section>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
