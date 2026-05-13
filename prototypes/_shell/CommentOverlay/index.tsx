import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CommentOverlay.module.scss';

type Mode = 'off' | 'placing' | 'panel-open';

type PendingPin = {
  pinX: number;
  pinY: number;
  viewportW: number;
  viewportH: number;
  selector: string | null;
};

type Comment = {
  id: number;
  prototype_slug: string;
  anchor_selector: string | null;
  viewport_w: number;
  viewport_h: number;
  pin_x: number;
  pin_y: number;
  route: string | null;
  comment_md: string;
  author_email: string;
  status: 'open' | 'resolved' | 'archived';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  parent_comment_id: number | null;
};

function structuralSelector(target: Element): string | null {
  // First preference: walk up to a [data-comment-id] anchor.
  const anchored = target.closest('[data-comment-id]') as HTMLElement | null;
  if (anchored?.dataset.commentId) {
    return `[data-comment-id="${anchored.dataset.commentId}"]`;
  }

  // Fallback: build a structural path of up to 4 ancestors.
  const path: string[] = [];
  let el: Element | null = target;
  for (let i = 0; i < 4 && el && el !== document.body; i++) {
    const tag = el.tagName.toLowerCase();
    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.children).filter(
        (c) => c.tagName === el!.tagName,
      );
      const idx = siblings.indexOf(el) + 1;
      path.unshift(`${tag}:nth-of-type(${idx})`);
    } else {
      path.unshift(tag);
    }
    el = el.parentElement;
  }
  return path.length > 0 ? path.join(' > ') : null;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

type PanelPlacement = {
  left: number;
  top: number;
  side: 'right' | 'left';
};

function computePanelPlacement(pin: { x: number; y: number }): PanelPlacement {
  const PANEL_WIDTH = 320;
  const PANEL_MAX_HEIGHT = Math.min(480, window.innerHeight - 32);
  const GUTTER = 16;
  const PIN_OFFSET = 20;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // pin.x / pin.y are page coords (scroll-inclusive). Convert to viewport coords
  // because the panel uses `position: fixed`.
  const pinViewportX = pin.x - window.scrollX;
  const pinViewportY = pin.y - window.scrollY;

  // Horizontal: prefer right of pin; flip to left when pin sits in the right 40%.
  let left: number;
  let side: 'right' | 'left';
  if (pinViewportX > viewportW * 0.6) {
    side = 'left';
    left = pinViewportX - PIN_OFFSET - PANEL_WIDTH;
    if (left < GUTTER) left = GUTTER;
  } else {
    side = 'right';
    left = pinViewportX + PIN_OFFSET;
    if (left + PANEL_WIDTH > viewportW - GUTTER) {
      left = viewportW - GUTTER - PANEL_WIDTH;
    }
  }

  // Vertical: center on pin, then clamp to viewport with a gutter.
  let top = pinViewportY - PANEL_MAX_HEIGHT / 2;
  if (top < GUTTER) top = GUTTER;
  if (top + PANEL_MAX_HEIGHT > viewportH - GUTTER) {
    top = viewportH - GUTTER - PANEL_MAX_HEIGHT;
  }

  return { left, top, side };
}

// Editor uses position: absolute with document-coord left/top (pinX/pinY include
// scroll). Clamp to viewport by translating current scroll + viewport edges into
// document space.
function clampEditorPosition(pinX: number, pinY: number): { left: number; top: number } {
  const EDITOR_WIDTH = 280;
  const EDITOR_HEIGHT_ESTIMATE = 200;
  const GUTTER = 8;
  const maxLeft = window.scrollX + window.innerWidth - EDITOR_WIDTH - GUTTER;
  const maxTop = window.scrollY + window.innerHeight - EDITOR_HEIGHT_ESTIMATE - GUTTER;
  const minLeft = window.scrollX + GUTTER;
  const minTop = window.scrollY + GUTTER;
  return {
    left: Math.max(minLeft, Math.min(pinX, maxLeft)),
    top: Math.max(minTop, Math.min(pinY, maxTop)),
  };
}

function pinPosition(comment: Comment): { x: number; y: number; stale: boolean } {
  if (comment.anchor_selector) {
    try {
      const el = document.querySelector(comment.anchor_selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
          stale: false,
        };
      }
    } catch {
      // Invalid selector (e.g. data-attr with weird characters) — fall through.
    }
  }
  return { x: comment.pin_x, y: comment.pin_y, stale: true };
}

export function CommentOverlay() {
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('off');
  const [pending, setPending] = useState<PendingPin | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draftBody, setDraftBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinsVisible, setPinsVisible] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem('blaze-design:pins-visible');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [showResolved, setShowResolved] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('blaze-design:show-resolved') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [panelPlacement, setPanelPlacement] = useState<PanelPlacement | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  // Replies scroll state — drives the bottom fade indicator (hidden when scrolled
  // to the bottom OR when there's no overflow at all).
  const repliesRef = useRef<HTMLDivElement>(null);
  const [repliesOverflow, setRepliesOverflow] = useState(false);
  const [repliesAtBottom, setRepliesAtBottom] = useState(false);

  const recomputeRepliesScrollState = useCallback(() => {
    const el = repliesRef.current;
    if (!el) {
      setRepliesOverflow(false);
      setRepliesAtBottom(false);
      return;
    }
    const overflow = el.scrollHeight - el.clientHeight > 1;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 2;
    setRepliesOverflow(overflow);
    setRepliesAtBottom(atBottom);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tick, setTick] = useState(0);

  const selectedComment =
    selectedCommentId !== null
      ? (comments.find((c) => c.id === selectedCommentId) ?? null)
      : null;

  // Pins represent THREADS — only top-level (parent) comments get a pin. Replies
  // live inside the parent's side panel.
  const topLevelComments = useMemo(
    () => comments.filter((c) => c.parent_comment_id === null),
    [comments],
  );

  // Replies grouped by parent id, sorted oldest-first (natural reading order
  // within a thread). Backend returns flat newest-first; we re-sort here.
  const repliesByParent = useMemo(() => {
    const map = new Map<number, Comment[]>();
    for (const c of comments) {
      if (c.parent_comment_id !== null) {
        const arr = map.get(c.parent_comment_id) ?? [];
        arr.push(c);
        map.set(c.parent_comment_id, arr);
      }
    }
    for (const [, arr] of map) {
      arr.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }
    return map;
  }, [comments]);

  // Derive slug from the in-app path. Examples:
  //   /              → '' (index, hide overlay)
  //   /h2/organic-social  → 'h2/organic-social'
  //   /h2/organic-social/new  → 'h2/organic-social/new' (we still use this for the slug)
  // Note: BrowserRouter's basename already strips `/prototypes/` or `/prototypes/pr/<n>/`,
  // so location.pathname is just the in-app path.
  const slug = location.pathname.replace(/^\//, '').replace(/\/$/, '');

  // Comments only render in production builds (i.e., the deployed bundle behind
  // IAP at qa.blaze.ai). Local `pnpm dev` has no IAP, no auth header, and the
  // API endpoints would either CORS-fail or return 401 — broken UX for designers.
  // Reviewers see comments on the deployed previews; designers iterate locally
  // without overlay noise.
  const enabled = slug !== '' && import.meta.env.PROD;

  // Fetch existing comments on mount + whenever the slug or showResolved changes.
  // status=all when showResolved (returns open + resolved); status=open otherwise.
  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const statusParam = showResolved ? 'all' : 'open';
    fetch(
      `/api/prototype-feedback?prototype=${encodeURIComponent(slug)}&status=${statusParam}`,
      {
        credentials: 'same-origin',
        signal: controller.signal,
      },
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((rows: Comment[]) => setComments(rows))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        console.warn('[comment-overlay] fetch failed', err);
      });
    return () => controller.abort();
  }, [enabled, slug, showResolved]);

  // Persist pin visibility preference across reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem('blaze-design:pins-visible', String(pinsVisible));
    } catch {
      // ignore — incognito or storage quota; non-fatal.
    }
  }, [pinsVisible]);

  // Persist show-resolved preference across reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem('blaze-design:show-resolved', String(showResolved));
    } catch {
      // ignore
    }
  }, [showResolved]);

  // Cheap re-render every 500ms keeps selector-following pins glued to their
  // anchors as the underlying DOM scrolls/resizes/mutates. ResizeObserver +
  // MutationObserver is the M2 polish; 500ms is plenty for v1.
  useEffect(() => {
    if (!enabled || comments.length === 0) return;
    const interval = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(interval);
  }, [enabled, comments.length]);

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'c') return;
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }
      setMode((m) => (m === 'placing' ? 'off' : 'placing'));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);

  // Reset mode + any open editor on route change.
  useEffect(() => {
    setMode('off');
    setPending(null);
    setDraftBody('');
    setError(null);
    setSelectedCommentId(null);
    setEditingBody(null);
    setPanelError(null);
    setReplyDraft('');
  }, [location.pathname]);

  // Escape closes the panel.
  useEffect(() => {
    if (!enabled || selectedCommentId === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedCommentId(null);
        setEditingBody(null);
        setPanelError(null);
        setReplyDraft('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, selectedCommentId]);

  // Recompute panel placement whenever a different pin is selected, or the
  // window resizes. We don't recompute on scroll: the panel is position: fixed
  // and the pin coords are page-absolute, so the panel-to-pin spatial relation
  // is preserved by the browser. The `selectedComment` derivation may produce a
  // new reference on every render (find()), so we key the effect on the id +
  // raw pin coords to avoid an infinite loop.
  useEffect(() => {
    if (!selectedComment) {
      setPanelPlacement(null);
      return;
    }
    const pinPos = pinPosition(selectedComment);
    setPanelPlacement(computePanelPlacement({ x: pinPos.x, y: pinPos.y }));

    function onResize() {
      if (!selectedComment) return;
      const updated = pinPosition(selectedComment);
      setPanelPlacement(computePanelPlacement({ x: updated.x, y: updated.y }));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComment?.id, selectedComment?.pin_x, selectedComment?.pin_y]);

  // Recompute replies scroll/overflow whenever the open thread changes or
  // its reply count changes (e.g. new reply submitted).
  useEffect(() => {
    if (!selectedComment) return;
    // Defer one frame so the DOM has the latest .replies content sized.
    const raf = requestAnimationFrame(recomputeRepliesScrollState);
    return () => cancelAnimationFrame(raf);
  }, [selectedComment?.id, repliesByParent, recomputeRepliesScrollState]);

  // Click handler — captures pin in placing mode.
  useEffect(() => {
    if (mode !== 'placing') return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Ignore clicks on overlay chrome (toggle, hint, editor) so we don't drop
      // pins on our own UI or while interacting with the editor itself.
      if (
        target.closest(`.${styles.toggle}`) ||
        target.closest(`.${styles.placingHint}`) ||
        target.closest(`.${styles.editor}`)
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      setPending({
        pinX: Math.round(e.clientX + window.scrollX),
        pinY: Math.round(e.clientY + window.scrollY),
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        selector: structuralSelector(target),
      });
      setMode('off');
      setDraftBody('');
      setError(null);
    }

    // Capture phase so we beat any underlying click handlers in the prototype.
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [mode]);

  const patchComment = useCallback(
    async (id: number, path: string, body?: object): Promise<Comment | null> => {
      setActionInFlight(true);
      setPanelError(null);
      try {
        const res = await fetch(`/api/prototype-feedback/${id}${path}`, {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: body ? { 'Content-Type': 'application/json' } : {},
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}) as { error?: string });
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }
        const updated: Comment = await res.json();
        setComments((cs) => {
          // If a parent was resolved and the user has Show Resolved off, drop
          // the entire thread from local state (parent + its replies). Same
          // logic mirrored when reopening: if status flips back to open we
          // can just patch in place.
          if (
            updated.parent_comment_id === null &&
            updated.status === 'resolved' &&
            !showResolved
          ) {
            return cs.filter((c) => c.id !== updated.id && c.parent_comment_id !== updated.id);
          }
          return cs.map((c) => (c.id === id ? updated : c));
        });
        // Close the panel if we just dropped the selected thread.
        if (
          updated.parent_comment_id === null &&
          updated.status === 'resolved' &&
          !showResolved &&
          selectedCommentId === updated.id
        ) {
          setSelectedCommentId(null);
        }
        return updated;
      } catch (e) {
        setPanelError(e instanceof Error ? e.message : 'Action failed');
        return null;
      } finally {
        setActionInFlight(false);
      }
    },
    [showResolved, selectedCommentId],
  );

  const deleteComment = useCallback(async (id: number): Promise<boolean> => {
    setActionInFlight(true);
    setPanelError(null);
    try {
      const res = await fetch(`/api/prototype-feedback/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok && res.status !== 204) {
        const errBody = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      setComments((cs) => cs.filter((c) => c.id !== id));
      setSelectedCommentId(null);
      return true;
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : 'Delete failed');
      return false;
    } finally {
      setActionInFlight(false);
    }
  }, []);

  const submitComment = useCallback(async () => {
    if (!pending || !draftBody.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/prototype-feedback', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prototype_slug: slug,
          anchor_selector: pending.selector,
          viewport_w: pending.viewportW,
          viewport_h: pending.viewportH,
          pin_x: pending.pinX,
          pin_y: pending.pinY,
          route: location.pathname,
          comment_md: draftBody.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const newComment: Comment = await res.json();
      setComments((cs) => [newComment, ...cs]);
      setPending(null);
      setDraftBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }, [pending, draftBody, slug, location.pathname]);

  const submitReply = useCallback(async () => {
    if (!selectedComment || !replyDraft.trim()) return;
    setActionInFlight(true);
    setPanelError(null);
    try {
      const res = await fetch('/api/prototype-feedback', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prototype_slug: slug,
          // Replies have no pin of their own but the backend columns are
          // NOT NULL — reuse the parent's coords to satisfy the constraint.
          viewport_w: selectedComment.viewport_w,
          viewport_h: selectedComment.viewport_h,
          pin_x: selectedComment.pin_x,
          pin_y: selectedComment.pin_y,
          route: location.pathname,
          comment_md: replyDraft.trim(),
          parent_comment_id: selectedComment.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const newReply: Comment = await res.json();
      setComments((cs) => [newReply, ...cs]);
      setReplyDraft('');
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : 'Reply failed');
    } finally {
      setActionInFlight(false);
    }
  }, [selectedComment, replyDraft, slug, location.pathname]);

  if (!enabled) return null;

  return (
    <>
      {pinsVisible &&
        topLevelComments.map((c) => {
          if (c.status === 'archived') return null;
          const pos = pinPosition(c);
          return (
            <button
              key={c.id}
              type="button"
              className={`${styles.pin} ${styles[`pin_${c.status}`]} ${pos.stale ? styles.pinStale : ''}`}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => setSelectedCommentId(c.id)}
              aria-label={`Comment by ${c.author_email}`}
            />
          );
        })}
      <div className={styles.toggleCluster}>
        {topLevelComments.length > 0 && (
          <button
            type="button"
            className={`${styles.resolvedToggle} ${showResolved ? styles.resolvedToggleOn : ''}`}
            onClick={() => setShowResolved((v) => !v)}
            aria-label={showResolved ? 'Hide resolved comments' : 'Show resolved comments'}
            title={showResolved ? 'Hide resolved' : 'Show resolved'}
          >
            ✓ {showResolved ? 'Hide resolved' : 'Show resolved'}
          </button>
        )}
        {topLevelComments.length > 0 && (
          <button
            type="button"
            className={`${styles.pinToggle} ${pinsVisible ? '' : styles.pinToggleHidden}`}
            onClick={() => setPinsVisible((v) => !v)}
            aria-label={
              pinsVisible
                ? `Hide ${topLevelComments.length} pin${topLevelComments.length === 1 ? '' : 's'}`
                : `Show ${topLevelComments.length} pin${topLevelComments.length === 1 ? '' : 's'}`
            }
            title={pinsVisible ? 'Hide pins' : 'Show pins'}
          >
            {pinsVisible ? '👁' : '👁‍🗨'} {topLevelComments.length}
          </button>
        )}
        <button
          type="button"
          className={`${styles.toggle} ${mode === 'placing' ? styles.toggleActive : ''}`}
          onClick={() => setMode((m) => (m === 'placing' ? 'off' : 'placing'))}
          aria-label="Toggle comment mode (c)"
          title="Comment mode (press c)"
        >
          💬
        </button>
      </div>
      {mode === 'placing' && (
        <div className={styles.placingOverlay} aria-hidden="true">
          <div className={styles.placingHint}>Click anywhere to drop a comment pin</div>
        </div>
      )}
      {pending && (
        <div
          className={styles.editor}
          style={clampEditorPosition(pending.pinX, pending.pinY)}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPending(null);
                setDraftBody('');
                setError(null);
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void submitComment();
              }
            }}
            placeholder="Leave a comment… (Cmd+Enter to submit)"
            rows={3}
          />
          {error && <div className={styles.editorError}>{error}</div>}
          <div className={styles.editorActions}>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                setDraftBody('');
                setError(null);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitComment()}
              disabled={submitting || !draftBody.trim()}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      )}
      {selectedComment && panelPlacement && (
        <>
          <div
            className={styles.panelBackdrop}
            onClick={() => {
              setSelectedCommentId(null);
              setEditingBody(null);
              setPanelError(null);
              setReplyDraft('');
            }}
            aria-hidden="true"
          />
          <aside
            className={`${styles.panel} ${styles[`panel_${panelPlacement.side}`]}`}
            style={{
              left: panelPlacement.left,
              top: panelPlacement.top,
              maxHeight: Math.min(480, window.innerHeight - 32),
            }}
            aria-label="Comment details"
          >
            <header className={styles.panelHeader}>
              <div className={styles.panelMeta}>
                <span className={styles.panelAuthor}>{selectedComment.author_email}</span>
                <span className={styles.panelTime}>
                  {relativeTime(selectedComment.created_at)}
                  {selectedComment.updated_at !== selectedComment.created_at && ' • edited'}
                </span>
              </div>
              <span
                className={`${styles.panelBadge} ${styles[`panelBadge_${selectedComment.status}`]}`}
              >
                {selectedComment.status}
              </span>
            </header>

            {editingBody === null ? (
              <div className={styles.panelBody}>{selectedComment.comment_md}</div>
            ) : (
              <textarea
                className={styles.panelTextarea}
                value={editingBody}
                onChange={(e) => setEditingBody(e.target.value)}
                rows={4}
                autoFocus
              />
            )}

            {selectedComment.status === 'resolved' && selectedComment.resolved_by && (
              <div className={styles.panelResolvedNote}>
                Resolved by {selectedComment.resolved_by}
                {selectedComment.resolved_at && ` ${relativeTime(selectedComment.resolved_at)}`}
              </div>
            )}

            {panelError && <div className={styles.panelError}>{panelError}</div>}

            {(repliesByParent.get(selectedComment.id) ?? []).length > 0 && (
              <div className={styles.repliesWrap}>
                <div
                  className={styles.replies}
                  ref={repliesRef}
                  onScroll={recomputeRepliesScrollState}
                >
                  {(repliesByParent.get(selectedComment.id) ?? []).map((reply) => (
                    <div key={reply.id} className={styles.reply}>
                      <div className={styles.replyMeta}>
                        <span className={styles.replyAuthor}>{reply.author_email}</span>
                        <span className={styles.replyTime}>
                          {relativeTime(reply.created_at)}
                        </span>
                      </div>
                      <div className={styles.replyBody}>{reply.comment_md}</div>
                      <button
                        type="button"
                        className={styles.replyDelete}
                        onClick={() => {
                          if (window.confirm('Delete this reply?')) {
                            void deleteComment(reply.id);
                          }
                        }}
                        disabled={actionInFlight}
                        aria-label="Delete reply"
                        title="Delete (author only)"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {repliesOverflow && !repliesAtBottom && (
                  <div className={styles.repliesFade} aria-hidden="true" />
                )}
              </div>
            )}

            <div className={styles.replyInput}>
              <textarea
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="Reply… (Cmd+Enter to submit)"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    void submitReply();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void submitReply()}
                disabled={!replyDraft.trim() || actionInFlight}
              >
                Reply
              </button>
            </div>

            <div className={styles.panelActions}>
              {editingBody === null ? (
                <>
                  {selectedComment.status === 'open' ? (
                    <button
                      type="button"
                      onClick={() => void patchComment(selectedComment.id, '/resolve')}
                      disabled={actionInFlight}
                      className={styles.actionPrimary}
                    >
                      Resolve
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void patchComment(selectedComment.id, '/reopen')}
                      disabled={actionInFlight}
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingBody(selectedComment.comment_md)}
                    disabled={actionInFlight}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this comment?')) {
                        void deleteComment(selectedComment.id);
                      }
                    }}
                    disabled={actionInFlight}
                    className={styles.actionDanger}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBody(null);
                      setPanelError(null);
                    }}
                    disabled={actionInFlight}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingBody?.trim()) return;
                      const updated = await patchComment(selectedComment.id, '', {
                        comment_md: editingBody.trim(),
                      });
                      if (updated) setEditingBody(null);
                    }}
                    disabled={actionInFlight || !editingBody?.trim()}
                    className={styles.actionPrimary}
                  >
                    {actionInFlight ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
