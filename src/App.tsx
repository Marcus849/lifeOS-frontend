import { useEffect, useState } from "react";
import HomeScreen from "./HomeScreen";

type Answers = Record<number, string>;
type Question = { phase: string; question: string; prompt: string; options?: string[] };
type AccountRecord = { email: string; answers: Answers; onboardingComplete: boolean };
type EntryView = "welcome" | "account" | "calibration" | "home";
const ACCOUNT_KEY = "lifeos-account";
const SESSION_KEY = "lifeos-session";

function readAccount(): AccountRecord | null {
  try {
    const stored = window.localStorage.getItem(ACCOUNT_KEY);
    return stored ? JSON.parse(stored) as AccountRecord : null;
  } catch {
    return null;
  }
}

function getResumeStep(answers: Answers) {
  if (Object.keys(answers).length === 0) return 0;
  for (let step = 1; step <= 15; step += 1) if (!answers[step]?.trim()) return step;
  return 16;
}

function readInitialState(): { view: EntryView; answers: Answers; email: string } {
  const account = readAccount();
  const session = window.localStorage.getItem(SESSION_KEY) === "active";
  if (!account || !session) return { view: "welcome", answers: {}, email: account?.email || "" };
  return { view: account.onboardingComplete ? "home" : "calibration", answers: account.answers || {}, email: account.email };
}

const questions: Question[] = [
  { phase: "DESTINATION", question: "What do you want to be able to do that you can't do well right now? (Your goal)", prompt: "Name the capability, not just the subject." },
  { phase: "DESTINATION", question: "What would being really good at this look like to you?", prompt: "Describe the result you would recognize as success." },
  { phase: "DESTINATION", question: "Why do you want to reach that destination?", prompt: "What makes this important to you?" },
  { phase: "BASELINE", question: "How would you describe your current ability in this area?", prompt: "Choose the closest fit. Evidence can refine this later.", options: ["Starting from scratch - little or no experience", "Beginner - I need guidance", "Developing - I can do some things independently", "Capable - I handle most situations", "Advanced - I want the next level",] },
  { phase: "BASELINE", question: "What can you already do confidently in this area?", prompt: "This keeps LifeOS from assigning mastered work." },
  { phase: "BASELINE", question: "What can you not do yet, or what do you struggle with most?", prompt: "Describe the gap between where you are and where you want to be." },
  { phase: "SEQUENCING", question: "What have you already learned, tried, or practiced?", prompt: "Include attempts that stalled or did not work." },
  { phase: "SEQUENCING", question: "What part feels hardest, most confusing, or most frustrating right now?", prompt: "This bottleneck will carry significant weight in your path." },
  { phase: "SEQUENCING", question: "Is there anything you feel you need to learn or improve first?", prompt: "The Advisor will test whether it is truly a prerequisite." },
  { phase: "CUT LIST", question: "What are you spending time on that might not actually help you reach your goal?", prompt: "Name distractions, busywork, or competing habits." },
  { phase: "CUT LIST", question: "What tempting areas are interesting but not necessary right now?", prompt: "The answer becomes a thoughtful 'not now' list." },
  { phase: "CUT LIST", question: "What constraints should your system work around?", prompt: "Time, energy, money, equipment, deadlines, work, school, or family." },
  { phase: "MILESTONES", question: "What could you produce, solve, build, explain, perform, or demonstrate to prove improvement?", prompt: "Choose observable evidence that fits your goal." },
  { phase: "MILESTONES", question: "How would you personally know that you've improved?", prompt: "Include a subjective signal such as confidence, speed, range, or ease." },
  { phase: "MILESTONES", question: "What's the first meaningful result you want to achieve, and when?", prompt: "Make the first destination realistic and specific." },
];
function Blueprint({ answers, onBegin, onEdit }: { answers: Answers; onBegin: () => void; onEdit: () => void }) { const fields = [["DESTINATION", 1], ["SUCCESS", 2], ["MOTIVATION", 3], ["BASELINE", 4], ["STRENGTHS", 5], ["GAPS", 6], ["BOTTLENECK", 8], ["CONSTRAINTS", 12], ["MILESTONE EVIDENCE", 13], ["FIRST OBJECTIVE", 15]] as const; return <div className="blueprint animate-in"><div className="eyebrow">ADVISOR SYNTHESIS / 15 SIGNALS PARSED</div><h1 className="neon-text">YOUR BLUEPRINT</h1><p>LifeOS has identified the gap and is sequencing the shortest realistic path.</p><div className="blueprint-grid">{fields.map(([label, id]) => <div className="blueprint-row" key={label}><span>{label}</span><strong>{answers[id] || "Not captured"}</strong></div>)}</div><div className="advisor-note"><div className="eyebrow">ADVISOR DECISION</div><p>Start with the bottleneck, protect your constraints, and defer interesting work that does not move this destination forward. Your quests will be evidence-based, not generic.</p></div><div className="nav-row"><button className="back-btn" onClick={onEdit}>EDIT ANSWERS</button><button className="cta-btn" onClick={onBegin}>OPEN PERSONALIZED PATH -&gt;</button></div></div>; }

function Welcome({ onEnter, onSignIn }: { onEnter: () => void; onSignIn: () => void }) {
  return <div className="intro welcome-screen animate-in"><div className="sigil">*</div><div className="eyebrow">PERSONAL SYSTEM / READY TO BEGIN</div><h1 className="neon-text">YOUR NEXT<br />CHAPTER STARTS HERE.</h1><p className="welcome-copy">You don't need to have your life figured out. Start with where you are, and LifeOS will help you discover where to go next.</p><div className="tags"><span>PERSONAL SYSTEM</span><span>15 SIGNALS</span><span>ONE STARTING PROFILE</span></div><button className="cta-btn" onClick={onEnter}>ENTER LIFEOS -&gt;</button><button className="text-btn" onClick={onSignIn}>ALREADY HAVE AN ACCOUNT? <strong>SIGN IN</strong></button></div>;
}

function AccountEntry({ initialEmail, onAuthenticated, onBack }: { initialEmail: string; onAuthenticated: (account: AccountRecord) => void; onBack: () => void }) {
  const [mode, setMode] = useState<"create" | "sign-in">("create");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return setError("ENTER AN EMAIL AND PASSWORD TO CONTINUE.");
    const existing = readAccount();
    if (mode === "sign-in") {
      if (!existing || existing.email !== normalizedEmail) return setError("NO LOCAL ACCOUNT FOUND FOR THIS EMAIL.");
      window.localStorage.setItem(SESSION_KEY, "active");
      onAuthenticated(existing);
      return;
    }
    const account = existing?.email === normalizedEmail ? existing : { email: normalizedEmail, answers: {}, onboardingComplete: false };
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    window.localStorage.setItem(SESSION_KEY, "active");
    onAuthenticated(account);
  };

  return <div className="account-entry animate-in"><button className="back-link" onClick={onBack}>← BACK</button><div className="eyebrow">LIFEOS / {mode === "create" ? "NEW OPERATOR" : "RETURNING OPERATOR"}</div><h1 className="neon-text">{mode === "create" ? "WELCOME TO LIFEOS" : "WELCOME BACK"}</h1><p className="account-lead">{mode === "create" ? "Create your personal system and keep your progress with you." : "Sign in to continue with your saved profile and calibration."}</p><div className="account-tabs"><button className={mode === "create" ? "active" : ""} onClick={() => { setMode("create"); setError(""); }}>CREATE ACCOUNT</button><button className={mode === "sign-in" ? "active" : ""} onClick={() => { setMode("sign-in"); setError(""); }}>SIGN IN</button></div><form className="account-form" onSubmit={submit}><label><span>EMAIL</span><input type="email" value={email} autoComplete="email" onChange={(event) => setEmail(event.target.value)} /></label><label><span>PASSWORD</span><input type="password" value={password} autoComplete={mode === "create" ? "new-password" : "current-password"} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="cta-btn" type="submit">{mode === "create" ? "CREATE ACCOUNT" : "SIGN IN"} -&gt;</button></form><p className="account-note">LOCAL DEMO SESSION · CONNECT A REAL AUTH PROVIDER BEFORE SHIPPING</p></div>;
}

export default function App() {
  const initial = readInitialState();
  const [view, setView] = useState<EntryView>(initial.view); const [step, setStep] = useState(initial.view === "calibration" ? getResumeStep(initial.answers) : 0); const [answers, setAnswers] = useState<Answers>(initial.answers); const [email, setEmail] = useState(initial.email);
  const current = questions[step - 1]; const value = answers[step] || ""; const update = (next: string) => setAnswers((old) => ({ ...old, [step]: next }));
  useEffect(() => { if (view !== "calibration") return; const account = readAccount(); if (account) window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...account, email, answers })); }, [answers, email, view]);
  const authenticate = (account: AccountRecord) => { setEmail(account.email); setAnswers(account.answers || {}); setStep(account.onboardingComplete ? 0 : getResumeStep(account.answers || {})); setView(account.onboardingComplete ? "home" : "calibration"); };
  const finishOnboarding = () => { const account = readAccount(); if (account) window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...account, answers, onboardingComplete: true })); setView("home"); };
  if (view === "home") return <HomeScreen answers={answers} onSignOut={() => { window.localStorage.removeItem(SESSION_KEY); setView("welcome"); }} />;
  return <main className="app-shell"><div className="scanlines" /><header className="topbar"><span className="brand">LIFE<span>OS</span></span><span className="online">ADVISOR ONLINE</span></header><section className="app-content">
    {view === "welcome" && <Welcome onEnter={() => setView("account")} onSignIn={() => setView("account")} />}
    {view === "account" && <AccountEntry initialEmail={email} onAuthenticated={authenticate} onBack={() => setView("welcome")} />}
    {view === "calibration" && step === 0 && <div className="calibration-intro animate-in"><div className="eyebrow">PERSONAL SYSTEM / INITIALIZING PROFILE</div><h1 className="neon-text">SYSTEM CALIBRATION</h1><p>15 SIGNALS<br /><span>ONE STARTING PROFILE</span></p><p className="muted">Before your journey begins, LifeOS needs to understand where you're starting from.</p><button className="cta-btn" onClick={() => setStep(answers[1] ? getResumeStep(answers) : 1)}>BEGIN CALIBRATION -&gt;</button></div>}
    {view === "calibration" && step > 0 && step <= questions.length && current && <div className="interview animate-in"><div className="progress-meta"><span>{String(step).padStart(2, "0")} / 15</span><span>{Math.round(step / questions.length * 100)}% CALIBRATED</span></div><div className="progress-track"><div style={{ width: `${step / questions.length * 100}%` }} /></div><div className="eyebrow">{current.phase}</div><h2>{current.question}</h2><p className="prompt">{current.prompt}</p>{current.options ? <div className="options">{current.options.map((option) => <button className={`option-btn${value === option ? " selected" : ""}`} key={option} onClick={() => update(option)}>{option}<span>{value === option ? "  " : ""}</span></button>)}</div> : <textarea className="hud-input" rows={5} autoFocus value={value} onChange={(event) => update(event.target.value)} placeholder="Write freely. The Advisor is listening..." />}<div className="nav-row">{step > 1 && <button className="back-btn" onClick={() => setStep(step - 1)}>BACK</button>}<button className="cta-btn" disabled={!value.trim()} onClick={() => setStep(step + 1)}>{step === questions.length ? "BUILD BLUEPRINT" : "CONTINUE"}</button></div></div>}
    {view === "calibration" && step > questions.length && <Blueprint answers={answers} onBegin={finishOnboarding} onEdit={() => setStep(questions.length)} />}
  </section></main>;
}
