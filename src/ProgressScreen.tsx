import { useState, type FormEvent } from "react";

export type QuestCompletion = {
  title: string;
  completedAt: string;
  kind: "quest" | "chapter";
};

type ReflectionEntry = {
  id: string;
  kind: "reflection" | "evidence";
  title: string;
  body: string;
  prompt: string;
  relatedQuest: string;
  createdAt: string;
  updatedAt: string;
};

type ProgressScreenProps = {
  userId: string;
  chapter: string;
  goal: string;
  progressPercent: number;
  completedQuestTitles: string[];
  completionHistory: QuestCompletion[];
};

const reflectionPrompts = [
  "What did I learn?",
  "What challenged me, and how did I respond?",
  "What am I proud of?",
  "What could I do differently next time?",
  "What evidence shows that I've grown?",
];

const reflectionStorageKey = (userId: string) => `lifeos-reflections-${userId}`;

function isReflectionEntry(value: unknown): value is ReflectionEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<ReflectionEntry>;
  return typeof entry.id === "string"
    && (entry.kind === "reflection" || entry.kind === "evidence")
    && typeof entry.title === "string"
    && typeof entry.body === "string"
    && typeof entry.prompt === "string"
    && typeof entry.relatedQuest === "string"
    && typeof entry.createdAt === "string"
    && Number.isFinite(new Date(entry.createdAt).getTime())
    && typeof entry.updatedAt === "string"
    && Number.isFinite(new Date(entry.updatedAt).getTime());
}

function loadReflections(userId: string) {
  try {
    const saved = window.localStorage.getItem(reflectionStorageKey(userId));
    if (!saved) return { entries: [] as ReflectionEntry[], error: "" };
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isReflectionEntry)) {
      throw new Error("Saved reflections have an unexpected format.");
    }
    return { entries: parsed, error: "" };
  } catch {
    return {
      entries: [] as ReflectionEntry[],
      error: "Your saved reflections couldn't be loaded. Check this browser's storage and try again.",
    };
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
}

export default function ProgressScreen({
  userId,
  chapter,
  goal,
  progressPercent,
  completedQuestTitles,
  completionHistory,
}: ProgressScreenProps) {
  const [initialData] = useState(() => loadReflections(userId));
  const [entries, setEntries] = useState(initialData.entries);
  const [storageError, setStorageError] = useState(initialData.error);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kind, setKind] = useState<ReflectionEntry["kind"]>("reflection");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [prompt, setPrompt] = useState("");
  const [relatedQuest, setRelatedQuest] = useState("");
  const [notice, setNotice] = useState("");

  const completedCount = completionHistory.filter((item) => item.kind === "quest").length;
  const recentCompletions = completionHistory
    .filter((item) => {
      const completedAt = new Date(item.completedAt).getTime();
      return completedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000 && completedAt <= Date.now();
    })
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const sortedEntries = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const sortedHistory = [...completionHistory].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  const openNewEntry = (entryKind: ReflectionEntry["kind"], selectedPrompt = "") => {
    setEditingId(null);
    setKind(entryKind);
    setTitle("");
    setBody("");
    setPrompt(selectedPrompt);
    setRelatedQuest("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditEntry = (entry: ReflectionEntry) => {
    setEditingId(entry.id);
    setKind(entry.kind);
    setTitle(entry.title);
    setBody(entry.body);
    setPrompt(entry.prompt);
    setRelatedQuest(entry.relatedQuest);
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const now = new Date().toISOString();
    const existingEntry = entries.find((entry) => entry.id === editingId);
    const nextEntry: ReflectionEntry = {
      id: existingEntry?.id ?? `reflection-${globalThis.crypto.randomUUID()}`,
      kind,
      title: title.trim(),
      body: body.trim(),
      prompt,
      relatedQuest,
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now,
    };
    const nextEntries = existingEntry
      ? entries.map((entry) => entry.id === existingEntry.id ? nextEntry : entry)
      : [...entries, nextEntry];

    setSaving(true);
    try {
      window.localStorage.setItem(reflectionStorageKey(userId), JSON.stringify(nextEntries));
      setEntries(nextEntries);
      setStorageError("");
      setNotice(editingId ? "Your reflection has been updated." : "Your entry has been saved.");
      closeForm();
    } catch {
      setStorageError("This entry couldn't be saved. Your browser may be out of storage space.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = (entry: ReflectionEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? This can't be undone.`)) return;
    const nextEntries = entries.filter((current) => current.id !== entry.id);
    try {
      window.localStorage.setItem(reflectionStorageKey(userId), JSON.stringify(nextEntries));
      setEntries(nextEntries);
      setStorageError("");
      setNotice("Your entry was deleted.");
    } catch {
      setStorageError("This entry couldn't be deleted. Please check this browser's storage and try again.");
    }
  };

  return (
    <div className="progress-content">
      <section className="progress-section" aria-labelledby="growth-overview-title">
        <div className="progress-section-heading">
          <span className="progress-kicker">YOUR JOURNEY</span>
          <h2 id="growth-overview-title">Growth overview</h2>
          <p>A gentle look at where you are and what you've already done.</p>
        </div>

        <article className="growth-overview-card">
          <span className="progress-kicker">CURRENT CHAPTER</span>
          <h3>{chapter}</h3>
          <p className="growth-goal">Moving toward <strong>{goal}</strong></p>
          <div className="growth-progress-label">
            <span>Chapter progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="growth-progress-track" role="progressbar" aria-label="Chapter progress" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          {completedCount === 0 && (
            <p className="growth-empty-copy">Every journey starts somewhere. Your progress will take shape as you move forward.</p>
          )}
        </article>

        <div className="growth-stat-grid">
          <article className="growth-stat-card">
            <span className="progress-kicker">QUESTS COMPLETED</span>
            <strong>{completedCount}</strong>
            <span>{completedCount === 1 ? "step taken" : "steps taken"}</span>
          </article>
          <article className="growth-stat-card">
            <span className="progress-kicker">PAST 7 DAYS</span>
            <strong>{recentCompletions.length}</strong>
            <span>{recentCompletions.length === 1 ? "moment of progress" : "moments of progress"}</span>
          </article>
        </div>

        <section className="progress-history-card" aria-labelledby="progress-history-title">
          <div className="progress-card-heading">
            <div>
              <span className="progress-kicker">THE STEPS YOU'VE TAKEN</span>
              <h3 id="progress-history-title">Progress history</h3>
            </div>
          </div>
          {sortedHistory.length > 0 ? (
            <ol className="completion-history">
              {sortedHistory.map((completion, index) => (
                <li key={`${completion.completedAt}-${index}`}>
                  <span className="completion-history-dot" aria-hidden="true" />
                  <div><strong>{completion.title}</strong><time dateTime={completion.completedAt}>{formatDate(completion.completedAt)}</time></div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="progress-empty-copy">Your completed quests will appear here, ready for you to look back on.</p>
          )}
        </section>
      </section>

      <section className="progress-section reflection-section" aria-labelledby="reflections-title">
        <div className="progress-section-heading">
          <span className="progress-kicker">A PRIVATE RECORD OF YOUR GROWTH</span>
          <h2 id="reflections-title">Reflections &amp; evidence</h2>
          <p>Capture the lessons and real-life moments that make your progress meaningful.</p>
        </div>

        <div className="reflection-actions">
          <button type="button" className="reflection-primary-action" onClick={() => openNewEntry("reflection")}>Write a reflection</button>
          <button type="button" className="reflection-secondary-action" onClick={() => openNewEntry("evidence")}>Record evidence</button>
        </div>

        <div className="reflection-prompts">
          <span className="progress-kicker">A QUESTION TO START WITH</span>
          <div>
            {reflectionPrompts.map((reflectionPrompt) => (
              <button key={reflectionPrompt} type="button" onClick={() => openNewEntry("reflection", reflectionPrompt)}>{reflectionPrompt}</button>
            ))}
          </div>
        </div>

        {storageError && <p className="progress-storage-error" role="alert">{storageError}</p>}
        {notice && <p className="progress-save-notice" role="status">{notice}</p>}

        <section className="reflection-history" aria-label="Your reflection history">
          {sortedEntries.length > 0 ? sortedEntries.map((entry) => (
            <article className="reflection-entry-card" key={entry.id}>
              <div className="reflection-entry-meta">
                <span>{entry.kind === "evidence" ? "EVIDENCE OF GROWTH" : "PERSONAL REFLECTION"}</span>
                <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
              </div>
              <h3>{entry.title}</h3>
              {entry.prompt && <p className="reflection-entry-prompt">{entry.prompt}</p>}
              <p className="reflection-entry-body">{entry.body}</p>
              {entry.relatedQuest && <p className="reflection-connection">Connected to {entry.relatedQuest}</p>}
              <div className="reflection-entry-actions">
                <button type="button" onClick={() => openEditEntry(entry)}>Edit</button>
                <button type="button" onClick={() => deleteEntry(entry)}>Delete</button>
              </div>
            </article>
          )) : (
            <div className="reflection-empty-state">
              <span aria-hidden="true">✳</span>
              <h3>Your story is still unfolding</h3>
              <p>Take a moment to capture what you're learning. Your small discoveries may become your biggest milestones.</p>
              <button type="button" onClick={() => openNewEntry("reflection")}>Write your first reflection</button>
            </div>
          )}
        </section>
      </section>

      {formOpen && (
        <div className="progress-form-overlay" role="presentation" onClick={closeForm}>
          <form className="progress-entry-form" role="dialog" aria-modal="true" aria-labelledby="progress-entry-title" onSubmit={saveEntry} onClick={(event) => event.stopPropagation()}>
            <div className="progress-form-top">
              <span className="progress-kicker">{editingId ? "MAKE IT YOUR OWN" : "A MOMENT FOR YOU"}</span>
              <button type="button" aria-label="Close entry form" onClick={closeForm}>×</button>
            </div>
            <h2 id="progress-entry-title">{editingId ? "Edit your entry" : kind === "evidence" ? "Record evidence" : "Write a reflection"}</h2>
            <div className="progress-kind-switch" role="group" aria-label="Entry type">
              <button type="button" className={kind === "reflection" ? "active" : ""} onClick={() => setKind("reflection")}>Reflection</button>
              <button type="button" className={kind === "evidence" ? "active" : ""} onClick={() => setKind("evidence")}>Evidence</button>
            </div>
            <label><span>Give this moment a title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={90} placeholder={kind === "evidence" ? "A skill I demonstrated..." : "A moment worth remembering..."} required /></label>
            {kind === "reflection" && (
              <label>
                <span>Optional reflection prompt</span>
                <select value={prompt} onChange={(event) => setPrompt(event.target.value)}>
                  <option value="">Choose a prompt</option>
                  {reflectionPrompts.map((reflectionPrompt) => <option key={reflectionPrompt} value={reflectionPrompt}>{reflectionPrompt}</option>)}
                </select>
              </label>
            )}
            <label><span>{kind === "evidence" ? "What happened?" : "What would you like to remember?"}</span><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} maxLength={3000} placeholder="Write in your own words. This is just for you." required /></label>
            <label>
              <span>Connect to your goal or a completed quest (optional)</span>
              <select value={relatedQuest} onChange={(event) => setRelatedQuest(event.target.value)}>
                <option value="">No connection</option>
                <option value={`Goal: ${goal}`}>Goal: {goal}</option>
                {completedQuestTitles.map((questTitle, index) => <option key={`${questTitle}-${index}`} value={`Quest: ${questTitle}`}>{questTitle}</option>)}
              </select>
            </label>
            {storageError && <p className="progress-storage-error" role="alert">{storageError}</p>}
            <button className="reflection-primary-action progress-save-button" type="submit" disabled={!title.trim() || !body.trim() || saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Save entry"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
