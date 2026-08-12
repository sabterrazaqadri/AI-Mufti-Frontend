"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_VIDEO_WORDS,
  MIN_VIDEO_WORDS,
  publishableFailures,
  videoItemsApi,
  wordCount,
  type Darja,
  type QueueCounts,
  type SourceChunk,
  type VideoCategory,
  type VideoItem,
} from "../../lib/api";
import styles from "./review.module.css";

const CATEGORIES: VideoCategory[] = ["hadith", "tafsir", "hikayat", "fiqh"];
const DARJAT: Darja[] = ["sahih", "hasan", "zaeef", "na_maloom"];
const CITATION_FIELDS = ["kitab", "jild", "safha", "hadith_no", "rawi"] as const;
/** v1 launch target across hadith + tafsir + hikayat. */
const LAUNCH_TARGET = 200;

/* ── Highlighting the extracted text inside its source ─────────────────────
   The whole point of this screen is that approval is verification: the reviewer
   must SEE the proposed text sitting in the book page it came from. Diacritics and
   line breaks differ between the two, so the match is done on a normalised copy and
   the offsets are mapped back to the original string for rendering. */

/** Same set the backend normalises away (video_items._HARAKAT_RE). */
const HARAKAT = /[ً-ْٰۖ-ۭـ‌‍]/;

function normaliseWithMap(s: string): { norm: string; map: number[] } {
  const out: string[] = [];
  const map: number[] = [];
  let lastWasSpace = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (HARAKAT.test(ch)) continue;
    if (/\s/.test(ch)) {
      if (lastWasSpace || out.length === 0) continue;
      out.push(" ");
      map.push(i);
      lastWasSpace = true;
      continue;
    }
    out.push(ch);
    map.push(i);
    lastWasSpace = false;
  }
  while (out.length && out[out.length - 1] === " ") {
    out.pop();
    map.pop();
  }
  return { norm: out.join(""), map };
}

function normalise(s: string): string {
  return normaliseWithMap(s).norm;
}

/** [start, end) of `needle` inside `haystack`, in haystack's own indices. */
function findSpan(haystack: string, needle: string): [number, number] | null {
  const n = normalise(needle);
  if (n.length < 8) return null;
  const { norm, map } = normaliseWithMap(haystack);
  const at = norm.indexOf(n);
  if (at === -1) return null;
  return [map[at], map[at + n.length - 1] + 1];
}

function Highlighted({ text, needle }: { text: string; needle: string }) {
  const span = useMemo(() => findSpan(text, needle), [text, needle]);
  if (!span) return <>{text}</>;
  return (
    <>
      {text.slice(0, span[0])}
      <mark className={styles.mark}>{text.slice(span[0], span[1])}</mark>
      {text.slice(span[1])}
    </>
  );
}

/* ── The queue ─────────────────────────────────────────────────────────── */

type Filters = { category: string; incomplete: string };

export default function ReviewQueue() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [cursor, setCursor] = useState(0);
  const [filters, setFilters] = useState<Filters>({ category: "", incomplete: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // True once a fetch comes back short of a full batch: there is nothing more to
  // refill with, so the low-water refetch below must stop asking.
  const [exhausted, setExhausted] = useState(false);

  // Local, editable copy of the item under review. Edits are PATCHed on save and
  // just before an approval, so an approved item is the text the reviewer actually saw.
  const [draft, setDraft] = useState<VideoItem | null>(null);
  const [dirty, setDirty] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const rejectRef = useRef<HTMLInputElement>(null);

  const current = items[cursor] ?? null;

  const BATCH = 25;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await videoItemsApi.list({
        status: "draft",
        category: filters.category || undefined,
        citation_incomplete:
          filters.incomplete === "" ? undefined : filters.incomplete === "yes",
        limit: BATCH,
      });
      if (res.status === 401) {
        setError("Sign in first — this page needs an admin account.");
        setItems([]);
        return;
      }
      if (res.status === 403) {
        setError(
          "Your account is not on the admin allowlist. Add your email to ADMIN_EMAILS on the backend."
        );
        setItems([]);
        return;
      }
      if (res.status === 503) {
        setError(
          "Admin access is not configured on the backend. Set ADMIN_EMAILS (or ADMIN_USER_IDS) and restart it."
        );
        setItems([]);
        return;
      }
      if (!res.ok) {
        setError(`Could not load the queue (HTTP ${res.status}).`);
        return;
      }
      const data = await res.json();
      const batch: VideoItem[] = data.items ?? [];
      setItems(batch);
      setCounts(data.counts ?? null);
      setCursor(0);
      setExhausted(batch.length < BATCH);
    } catch {
      setError("Could not reach the backend.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  // A fresh card resets the edit buffer; otherwise one item's edits would bleed
  // into the next one the reviewer sees.
  useEffect(() => {
    setDraft(current ? { ...current, citation: { ...current.citation } } : null);
    setDirty(false);
    setRejectNote("");
  }, [current]);

  const fails = useMemo(
    () => (draft ? publishableFailures(draft) : ["nothing to review"]),
    [draft]
  );
  const words = draft ? wordCount(draft.text_ur) : 0;

  const setField = useCallback(<K extends keyof VideoItem>(key: K, value: VideoItem[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setDirty(true);
  }, []);

  const setCitationField = useCallback((key: string, value: string) => {
    setDraft((d) =>
      d ? { ...d, citation: { ...d.citation, [key]: value || null } } : d
    );
    setDirty(true);
  }, []);

  const persistEdits = useCallback(async (): Promise<boolean> => {
    if (!draft || !dirty) return true;
    const res = await videoItemsApi.update(draft.id, {
      text_ur: draft.text_ur,
      text_roman: draft.text_roman,
      citation: draft.citation,
      citation_display: draft.citation_display,
      citation_incomplete: draft.citation_incomplete,
      darja: draft.darja,
      category: draft.category,
      maslak_tag: draft.maslak_tag,
    });
    if (!res.ok) {
      setError(`Saving the edit failed (HTTP ${res.status}).`);
      return false;
    }
    setDirty(false);
    return true;
  }, [draft, dirty]);

  /** Drop the decided item and land on the next one without moving the cursor. */
  const advancePast = useCallback(
    (id: string) => {
      setItems((list) => {
        const next = list.filter((i) => i.id !== id);
        setCursor((c) => Math.min(c, Math.max(next.length - 1, 0)));
        return next;
      });
    },
    []
  );

  const decide = useCallback(
    async (action: "video" | "novideo" | "reject") => {
      if (!draft || busy) return;
      if (action === "video" && fails.length) return;
      if (action === "reject" && !rejectNote.trim()) {
        rejectRef.current?.focus();
        setFlash("A rejection needs a note — say what is wrong with it.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        if (!(await persistEdits())) return;
        const res =
          action === "reject"
            ? await videoItemsApi.reject(draft.id, rejectNote.trim())
            : await videoItemsApi.approve(draft.id, action === "video");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const why = body?.detail?.failures?.join("; ") || body?.detail || res.status;
          setError(`Could not save that decision: ${why}`);
          return;
        }
        setFlash(
          action === "video"
            ? "Approved for video."
            : action === "novideo"
              ? "Approved (not for video)."
              : "Rejected."
        );
        advancePast(draft.id);
        setCounts((c) =>
          c && action === "video"
            ? {
                ...c,
                video_ready_total: c.video_ready_total + 1,
                video_ready_by_category: {
                  ...c.video_ready_by_category,
                  [draft.category]: (c.video_ready_by_category[draft.category] ?? 0) + 1,
                },
              }
            : c
        );
      } finally {
        setBusy(false);
      }
    },
    [draft, busy, fails, rejectNote, persistEdits, advancePast]
  );

  // Refill before the reviewer runs out of cards. `exhausted` is what stops this
  // from re-fetching forever once the queue itself is down to its last few items.
  useEffect(() => {
    if (!loading && !exhausted && items.length > 0 && items.length <= 2) void load();
  }, [items.length, loading, exhausted, load]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 2500);
    return () => clearTimeout(t);
  }, [flash]);

  /* Keyboard: hundreds of these get reviewed by hand, so the shortcuts are the
     interface and the mouse is the fallback. Suppressed while typing. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typing && e.key !== "Escape") return;
      switch (e.key) {
        case "a":
          e.preventDefault();
          void decide("video");
          break;
        case "n":
          e.preventDefault();
          void decide("novideo");
          break;
        case "r":
          e.preventDefault();
          if (rejectNote.trim()) void decide("reject");
          else rejectRef.current?.focus();
          break;
        case "ArrowDown":
        case "ArrowRight":
        case "j":
          e.preventDefault();
          setCursor((c) => Math.min(c + 1, items.length - 1));
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "k":
          e.preventDefault();
          setCursor((c) => Math.max(c - 1, 0));
          break;
        case "Escape":
          (document.activeElement as HTMLElement | null)?.blur();
          break;
        default:
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, items.length, rejectNote]);

  const ready = counts?.video_ready_by_category ?? {};
  const readyTotal = counts?.video_ready_total ?? 0;

  return (
    <main className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <span className="eyebrow">Curation</span>
          <h1 className={styles.title}>Video item review</h1>
          <p className={styles.sub}>
            Every item here was proposed by the extractor from a book page. Approving it
            means <strong>you have read it against the source on the right</strong> and the
            text and its citation match. Nothing reaches AutoTube any other way.
          </p>
        </div>
        <div className={styles.counters}>
          {(["hadith", "tafsir", "hikayat"] as const).map((c) => (
            <div key={c} className={styles.counter}>
              <b>{ready[c] ?? 0}</b>
              <span>{c}</span>
            </div>
          ))}
          <div className={`${styles.counter} ${styles.counterTotal}`}>
            <b>
              {readyTotal}
              <small>/{LAUNCH_TARGET}</small>
            </b>
            <span>video-ready</span>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label>
          Category
          <select
            className={styles.select}
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">all</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c} ({counts?.drafts_by_category?.[c] ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label>
          Citation
          <select
            className={styles.select}
            value={filters.incomplete}
            onChange={(e) => setFilters((f) => ({ ...f, incomplete: e.target.value }))}
          >
            <option value="">any</option>
            <option value="no">complete only</option>
            <option value="yes">incomplete only</option>
          </select>
        </label>
        <span className={styles.queueInfo}>
          {items.length ? `${cursor + 1} of ${items.length} loaded` : "—"}
          {counts ? ` · ${counts.by_status?.draft ?? 0} drafts total` : ""}
        </span>
        <span className={styles.keys}>
          <kbd>a</kbd> approve+video · <kbd>n</kbd> approve · <kbd>r</kbd> reject ·{" "}
          <kbd>↑</kbd>
          <kbd>↓</kbd> move
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {flash && <p className={styles.flash}>{flash}</p>}

      {loading && <p className={styles.muted}>Loading the queue…</p>}
      {!loading && !error && !current && (
        <p className={styles.muted}>
          No drafts match this filter. Run{" "}
          <code>python extract_video_items.py --book &lt;slug&gt;</code> to propose more.
        </p>
      )}

      {draft && (
        <div className={styles.split}>
          {/* ── Left: the proposed item ─────────────────────────────── */}
          <section className={styles.pane}>
            <div className={styles.paneHead}>
              <h2>Proposed item</h2>
              <span className={words >= MIN_VIDEO_WORDS && words <= MAX_VIDEO_WORDS
                ? styles.okBadge : styles.warnBadge}>
                {words} words
              </span>
            </div>

            <label className={styles.label}>
              Text (Urdu) — must be verbatim from the source
              <textarea
                className={styles.urduArea}
                dir="rtl"
                lang="ur"
                rows={8}
                value={draft.text_ur}
                onChange={(e) => setField("text_ur", e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Roman Urdu (optional)
              <textarea
                className={styles.area}
                rows={3}
                value={draft.text_roman ?? ""}
                onChange={(e) => setField("text_roman", e.target.value)}
              />
            </label>

            <div className={styles.grid2}>
              <label className={styles.label}>
                Category
                <select
                  className={styles.select}
                  value={draft.category}
                  onChange={(e) => setField("category", e.target.value as VideoCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Darja (hadith only — only if the page says so)
                <select
                  className={styles.select}
                  value={draft.darja ?? ""}
                  onChange={(e) =>
                    setField("darja", (e.target.value || null) as Darja | null)
                  }
                  disabled={draft.category !== "hadith"}
                >
                  <option value="">—</option>
                  {DARJAT.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className={styles.citation}>
              <legend>Citation</legend>
              <div className={styles.grid3}>
                {CITATION_FIELDS.map((f) => (
                  <label key={f} className={styles.label}>
                    {f}
                    <input
                      className={styles.input}
                      value={(draft.citation?.[f] as string) ?? ""}
                      onChange={(e) => setCitationField(f, e.target.value)}
                    />
                  </label>
                ))}
                <label className={styles.label}>
                  maslak_tag
                  <input
                    className={styles.input}
                    value={draft.maslak_tag ?? ""}
                    onChange={(e) => setField("maslak_tag", e.target.value || null)}
                  />
                </label>
              </div>
              <label className={styles.label}>
                On-screen citation line
                <input
                  className={styles.input}
                  value={draft.citation_display}
                  onChange={(e) => setField("citation_display", e.target.value)}
                />
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={draft.citation_incomplete}
                  onChange={(e) => setField("citation_incomplete", e.target.checked)}
                />
                Citation is incomplete (a required field is not printed in the source)
              </label>
            </fieldset>

            <div className={styles.actions}>
              <button
                className="btn btn-primary"
                disabled={busy || fails.length > 0}
                onClick={() => void decide("video")}
                title={fails.length ? fails.join("; ") : "Approve and allow video"}
              >
                Approve &amp; allow video <kbd>a</kbd>
              </button>
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => void decide("novideo")}
              >
                Approve (no video) <kbd>n</kbd>
              </button>
              <button
                className="btn btn-ghost"
                disabled={busy || !dirty}
                onClick={() => void persistEdits()}
              >
                Save edits
              </button>
            </div>

            {fails.length > 0 && (
              <p className={styles.blocked}>
                Not video-eligible: {fails.join("; ")}.
              </p>
            )}

            <div className={styles.rejectRow}>
              <input
                ref={rejectRef}
                className={styles.input}
                placeholder="Reason for rejection (required)"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectNote.trim()) void decide("reject");
                }}
              />
              <button
                className="btn btn-ghost"
                disabled={busy || !rejectNote.trim()}
                onClick={() => void decide("reject")}
              >
                Reject <kbd>r</kbd>
              </button>
            </div>

            <p className={styles.meta}>
              {draft.extractor_version} · proposed{" "}
              {new Date(draft.created_at).toLocaleString()} · {draft.source_chunk_ids.length}{" "}
              source chunk(s)
            </p>
          </section>

          {/* ── Right: the source it came from ──────────────────────── */}
          <section className={styles.pane}>
            <div className={styles.paneHead}>
              <h2>Source text</h2>
              <span className={styles.hint}>the proposed text is highlighted</span>
            </div>
            {(draft.source_chunks ?? []).length === 0 && (
              <p className={styles.muted}>No source chunks are linked to this item.</p>
            )}
            {(draft.source_chunks ?? []).map((chunk: SourceChunk) => (
              <article key={chunk.id} className={styles.chunk}>
                <p className={styles.ref}>{chunk.reference || "(no reference line)"}</p>
                <div className={styles.chunkBody} dir="rtl" lang="ur">
                  <Highlighted text={chunk.content} needle={draft.text_ur} />
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
