import { useEffect, useRef, useState, type ReactNode } from "react";
import HomeScreen from "./HomeScreen";
import "./welcome.css";

type Answers = {
  goal: string;
  startingPoint: string;
  obstacle: string;
};

const guideSteps = [
  {
    title: "Define your goal",
    description: "Your goal is the destination you want to reach. It describes what you ultimately want to achieve.",
  },
  {
    title: "Know where you are",
    description: "Before you can find the right path, you need to understand your starting point.",
  },
  {
    title: "Identify the block",
    description: "Your block is what’s standing between you and your goal.",
  },
];

const prompts = [
  {
    title: "Define your goal",
    question: "What is your goal?",
    key: "goal",
    options: ["become more confident.", "get into my dream university.", "I will become physically stronger."],
  },
  {
    title: "Know where you are",
    question: "Where are you currently?",
    key: "startingPoint",
    options: ["I know the basics", "I’m making progress", "I’m stuck"],
  },
  {
    title: "Identify the block",
    question: "What is stopping you?",
    key: "obstacle",
    options: ["don’t know where to start", "keep losing motivation", "don’t know how to get there"],
  },
] as const;

const exampleGoal = "build my first business";
const exampleStartingPoint = "have an idea, but I don’t know how to turn it into a real business";

function getStartingPointPhrase(startingPoint: string) {
  const answer = startingPoint || "starting point";
  return /^(i|i’m|i'm)\b/i.test(answer) ? answer : `I ${answer}`;
}

function getObstaclePhrase(obstacle: string) {
  const answer = obstacle || "block holding you back";
  return answer.replace(/^(i|i’m|i'm)\b\s*/i, "");
}

function getGoalPhrase(goal: string) {
  return goal.replace(/^I will\s+/i, "").replace(/[.!?]+$/, "");
}

function getPromptText(answers: Answers, key: keyof Answers) {
  if (key === "goal") return `I will ${getGoalPhrase(answers.goal || "goal")}.`;
  if (key === "startingPoint") return `Right now ${getStartingPointPhrase(answers.startingPoint)},`;
  return `but I ${getObstaclePhrase(answers.obstacle)}.`;
}

function TreeArt({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" role="presentation" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength="1" d="M0 244 C28 239 48 251 76 246 C106 240 120 252 149 246 C180 239 201 251 229 245 C257 240 278 249 300 244" />
        <path pathLength="1" d="M0 263 C34 257 53 270 84 263 C111 257 127 269 151 263 C180 256 206 271 235 263 C260 257 280 267 300 262" />
        <path pathLength="1" d="M149 273 C143 258 155 242 150 223 C146 207 139 197 139 180 C138 164 149 151 150 133 C151 113 143 102 148 86" />
        <path pathLength="1" d="M150 221 C132 216 121 208 113 195 C105 183 102 171 92 160 M143 206 C124 204 111 201 99 191 M149 187 C160 180 171 169 177 156 C183 143 183 132 193 120 M151 204 C168 197 182 194 196 183 M148 160 C132 151 122 139 118 125 C114 111 115 99 106 89 M151 142 C166 133 173 121 177 108 C181 96 179 86 188 77" />
        <path pathLength="1" d="M150 85 C141 77 138 67 143 59 C148 50 160 53 164 61 C169 49 182 50 186 59 C196 51 207 57 206 67 C218 62 227 71 222 81 C235 82 240 94 231 102 C243 110 239 123 229 127 C236 139 227 149 216 148 C219 162 207 170 197 163 C190 176 177 177 171 166 C160 177 148 171 149 159 C136 170 125 164 127 151 C112 158 101 149 107 138 C94 141 86 131 94 121 C81 113 84 101 96 97 C88 85 96 75 108 76 C107 63 119 57 129 65 C133 54 146 55 150 67 C155 57 168 58 171 69 C180 60 192 64 192 75 C204 69 215 77 210 88 C222 88 228 99 220 108 C231 117 225 129 213 131 C219 143 208 152 197 146 C191 159 177 159 171 149 C162 160 151 154 152 143" />
        <path pathLength="1" d="M12 243 C43 240 64 235 91 238 C116 241 132 234 149 228 M288 243 C258 240 238 235 211 238 C185 241 168 234 150 228" />
        <path pathLength="1" d="M142 272 C138 263 126 261 117 262 M157 271 C163 260 176 261 185 263 M148 272 C148 263 149 254 151 247" />
      </g>
    </svg>
  );
}

function HoldTreeButton({ className, label, ariaLabel, onHold, children }: {
  className: string;
  label: string;
  ariaLabel: string;
  onHold: () => void;
  children: ReactNode;
}) {
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);

  const startHold = () => {
    if (holdTimer.current !== null) return;
    setIsHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setIsHolding(false);
      onHold();
    }, 1650);
  };

  const cancelHold = () => {
    if (holdTimer.current === null) return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setIsHolding(false);
  };

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  return (
      <button
        className={`${className}${isHolding ? " is-holding" : ""}`}
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isHolding}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          startHold();
        }}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onLostPointerCapture={cancelHold}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            startHold();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            cancelHold();
          }
        }}
        onBlur={cancelHold}
        onContextMenu={(event) => event.preventDefault()}
      >
        <TreeArt className="welcome-tree" />
        {children}
        <span className="hold-tree-label">{isHolding ? "KEEP HOLDING" : label}</span>
      </button>
  );
}

function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="welcome-entry-screen">
      <HoldTreeButton
        className="welcome-entry-button"
        label="PRESS AND HOLD TO GET STARTED"
        ariaLabel="Press and hold to get started"
        onHold={onBegin}
      >
        <span className="welcome-entry-promise">
          <span>I will</span>
          <strong>take action</strong>
          <span>to make my dreams</span>
          <span>come true</span>
        </span>
      </HoldTreeButton>
    </section>
  );
}

function GoalIntro({ onCreateGoal }: { onCreateGoal: () => void }) {
  const phrases = ["Create your goal", "Stick to your goal", "Achieve your goal"];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="goal-intro-screen">
      <h1 className="goal-intro-title">{phrases[phraseIndex]}</h1>
      <div className="goal-intro-actions">
        <button className="goal-intro-primary" type="button" onClick={onCreateGoal}>Create your first goal</button>
        <button className="goal-intro-secondary" type="button">Continue with an account</button>
      </div>
    </section>
  );
}

function GoalSetup({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <section className="goal-setup-screen">
      <button className="goal-setup-close" type="button" aria-label="Go back" onClick={onBack}>×</button>
      <h1>Let’s get your first goal set up</h1>
      <p className="goal-setup-caption">Your goals start with a clear direction.</p>
      <HoldTreeButton
        className="goal-setup-canvas"
        label="PRESS AND HOLD TO CREATE YOUR FIRST GOAL"
        ariaLabel="Press and hold to start creating your first goal"
        onHold={onStart}
      >
        <span className="goal-setup-promise">
          <span>I will</span>
          <strong>[action]</strong>
          <span>so that I can</span>
          <strong>[achieve the goal]</strong>
        </span>
      </HoldTreeButton>
    </section>
  );
}

function GoalGuide({ step, onSkip, onBack, onNext }: {
  step: number;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const guide = guideSteps[step - 1];
  return (
    <section className={`goal-flow-card guide-card guide-step-${step}`} aria-label={`Goal guide step ${step} of 3`}>
      <header className="guide-header">
        <span>{step}/3</span>
        <strong>HOW TO CREATE A GOAL</strong>
        <button type="button" onClick={onSkip}>Skip</button>
      </header>
      <div className="guide-content" aria-live="polite">
        <span className="guide-step-number">{step}</span>
        <h1>{guide.title}</h1>
        <p>{guide.description}</p>
        <div className="guide-example">
          <em>
            {step === 1 ? <u>I will {exampleGoal}.</u> : <>I will {exampleGoal}.</>}
            <br />
            {step === 3 ? (
              <>Right now I have an idea, <u>but I</u> <u>don’t know how to turn it into a real business.</u></>
            ) : (
              <>Right now I have an idea, <u>but I don’t know how to turn it into a real business.</u></>
            )}
          </em>
        </div>
      </div>
      <nav className="goal-flow-nav" aria-label="Goal guide navigation">
        <button type="button" className="text-button" onClick={onBack}>Back</button>
        <button type="button" className="pill-button" onClick={onNext}>Next</button>
      </nav>
    </section>
  );
}

function GoalFlow() {
  const [screen, setScreen] = useState<"welcome" | "goal-intro" | "goal-setup" | "guide" | "map" | "create" | "answers" | "review" | "home">("welcome");
  const [guideStep, setGuideStep] = useState(1);
  const [answerStep, setAnswerStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ goal: "", startingPoint: "", obstacle: "" });
  const currentPrompt = prompts[answerStep];
  const updateAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [currentPrompt.key]: value }));
  };

  const answerHome = {
    1: answers.goal,
    2: answers.startingPoint,
    3: answers.obstacle,
    8: answers.obstacle,
  };

  const resetOnboarding = () => {
    setAnswers({ goal: "", startingPoint: "", obstacle: "" });
    setAnswerStep(0);
    setGuideStep(1);
  };

  if (screen === "home") return <HomeScreen answers={answerHome} onSignOut={() => { resetOnboarding(); setScreen("welcome"); }} />;

  return (
    <main className={`goal-flow-shell${screen === "goal-intro" ? " is-goal-intro" : ""}`}>
      {screen === "welcome" && <WelcomeScreen onBegin={() => { resetOnboarding(); setScreen("goal-intro"); }} />}
      {screen === "goal-intro" && <GoalIntro onCreateGoal={() => setScreen("goal-setup")} />}
      {screen === "goal-setup" && <GoalSetup onBack={() => setScreen("goal-intro")} onStart={() => { setGuideStep(1); setScreen("guide"); }} />}
      {screen === "guide" && (
        <GoalGuide
          step={guideStep}
          onSkip={() => setScreen("map")}
          onBack={() => {
            if (guideStep === 1) setScreen("map");
            else setGuideStep((step) => step - 1);
          }}
          onNext={() => {
            if (guideStep === guideSteps.length) setScreen("map");
            else setGuideStep((step) => step + 1);
          }}
        />
      )}

      {screen === "map" && (
        <section className="goal-flow-card map-card">
          <h1>We’ll create the map for you<br />to reach your goal</h1>
          <div className="map-copy">
            <p>You don’t need the whole journey<br />figured out.</p>
            <p>You just need to know where you’re<br />going.</p>
          </div>
          <nav className="goal-flow-nav">
            <button type="button" className="text-button" onClick={() => { setScreen("guide"); setGuideStep(3); }}>Back</button>
            <button type="button" className="pill-button" onClick={() => setScreen("create")}>Get Started</button>
          </nav>
        </section>
      )}

      {screen === "create" && (
        <section className="goal-flow-card create-card">
          <h1 className="simple-header">CREATE YOUR GOAL</h1>
          <p className="goal-preview">
            <span>I will <u>goal</u>.</span><br />
            <span>Right now I <u>starting point</u>, <u>but I</u></span><br />
            <span><u>block holding you back</u></span>
          </p>
          <div className="create-note">Every journey begins with three things: a destination, a starting point, and something to overcome.</div>
          <button className="wide-button" type="button" onClick={() => { setAnswerStep(0); setScreen("answers"); }}>Define your goal</button>
        </section>
      )}

      {screen === "answers" && currentPrompt && (
        <section className="goal-flow-card answer-card">
          <h1 className="simple-header">{currentPrompt.title}</h1>
          <div className="answer-content">
            <div className="answer-intro">
              <p className="answer-preview">
                <span className={`preview-text${answerStep === 0 ? " is-current" : " is-complete"}`}>
                  I will <u>{getGoalPhrase(answers.goal || "goal")}</u>.
                </span>
                <br />
                <span className={`preview-text${answerStep === 1 ? " is-current" : " is-complete"}`}>
                  Right now {getStartingPointPhrase(answers.startingPoint)},
                </span>
                {" "}
                <span className={`preview-text${answerStep === 2 ? " is-current" : " is-upcoming"}`}>
                  {answerStep === 2 ? <u>but I</u> : "but I"} <u>{getObstaclePhrase(answers.obstacle)}</u>.
                </span>
              </p>
            </div>
            <label className="answer-question" htmlFor={`goal-answer-${currentPrompt.key}`}>{currentPrompt.question}</label>
            <p className="answer-instruction">Select from below or type your own</p>
            <div className="answer-options">
              {currentPrompt.options.map((option) => (
                <button
                  key={option}
                  className={`answer-option${answers[currentPrompt.key] === option ? " is-selected" : ""}`}
                  type="button"
                  onClick={() => updateAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="answer-dock">
            <div className="answer-entry-row">
              <textarea
                id={`goal-answer-${currentPrompt.key}`}
                aria-label={currentPrompt.question}
                value={answers[currentPrompt.key]}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder={currentPrompt.key === "goal" ? "goal" : currentPrompt.key === "startingPoint" ? "starting point" : "block holding you back"}
                rows={2}
              />
              <nav className="answer-navigation" aria-label="Goal details">
                {answerStep > 0 && (
                  <button type="button" className="round-nav-button" aria-label="Previous question" onClick={() => setAnswerStep((step) => step - 1)}>‹</button>
                )}
                <button
                  type="button"
                  className="round-nav-button"
                  aria-label={answerStep === prompts.length - 1 ? "Review your goal" : "Next question"}
                  disabled={!answers[currentPrompt.key].trim()}
                  onClick={() => {
                    if (answerStep === prompts.length - 1) setScreen("review");
                    else setAnswerStep((step) => step + 1);
                  }}
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </section>
      )}

      {screen === "review" && (
        <section className="goal-flow-card review-card">
          <h1 className="simple-header">YOUR GOAL</h1>
          <p className="review-preview">
            I will <u>{getGoalPhrase(answers.goal)}</u>.<br />
            {getPromptText(answers, "startingPoint")}<br />
            {getPromptText(answers, "obstacle")}
          </p>
          <div className="review-actions">
            <button className="review-note" type="button" onClick={() => { setAnswerStep(2); setScreen("answers"); }}>You did it! Review if this goal feel meaningful to you</button>
            <button className="wide-button" type="button" onClick={() => setScreen("home")}>Continue</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default function App() {
  return <GoalFlow />;
}
