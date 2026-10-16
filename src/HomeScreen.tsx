import { useEffect, useRef, useState } from "react";
import ProgressScreen, { type QuestCompletion } from "./ProgressScreen";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answers {
  [key: number]: string | string[] | number;
}

interface Props {
  answers: Answers;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HudCorners({ bright = false, size = 16 }: { bright?: boolean; size?: number }) {
  const c = bright ? "var(--accent, #00c8ff)" : "var(--frame-border, #0d5a80)";
  const s = size;
  return (
    <>
      <span style={{ position: "absolute", top: -1, left: -1, width: s, height: s, borderTop: `2px solid ${c}`, borderLeft: `2px solid ${c}`, zIndex: 3 }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: s, height: s, borderTop: `2px solid ${c}`, borderRight: `2px solid ${c}`, zIndex: 3 }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: s, height: s, borderBottom: `2px solid ${c}`, borderLeft: `2px solid ${c}`, zIndex: 3 }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: s, height: s, borderBottom: `2px solid ${c}`, borderRight: `2px solid ${c}`, zIndex: 3 }} />
    </>
  );
}

type QuestStep = { title: string; focusLabel: string; focus: string; reason: string };

function getQuestAnswer(value: Answers[number] | undefined, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length >= 3 ? text : fallback;
}

function getQuestData(answers: Answers) {
  const goal = getQuestAnswer(answers[1], "a goal that matters to you")
    .replace(/^I will\s+/i, "")
    .replace(/[.!?]+$/, "");
  const obstacle = getQuestAnswer(answers[8] || answers[2] || answers[6], "the main obstacle you're facing");
  const context = getQuestAnswer(answers[12] || answers[3], "the time and energy you can realistically give");
  const isBusinessGoal = /\b(business|startup|company|customers?)\b/i.test(goal);

  return {
    title: goal,
    chapter: "Find the Opportunity",
    chapterNumber: 1,
    nodes: [
      {
        title: isBusinessGoal ? "Talk to 3 potential customers" : "Define your direction",
        focusLabel: isBusinessGoal ? "YOUR FIRST CONVERSATIONS" : "YOUR DIRECTION",
        focus: isBusinessGoal ? "Ask three people who might use your idea what they need most." : goal,
        reason: isBusinessGoal
          ? "Real conversations help you discover what people need before you invest in building a solution."
          : "A clear destination gives your journey direction.",
      },
      { title: "Name the friction", focusLabel: "WHAT'S IN THE WAY", focus: obstacle, reason: "Understanding the obstacle helps you choose a useful response." },
      { title: "Make a plan that fits", focusLabel: "YOUR REAL-LIFE RHYTHM", focus: context, reason: "A plan shaped around real life is easier to return to." },
      { title: "Take one practical step", focusLabel: "YOUR NEXT MOVE", focus: "Choose one small action you can complete today.", reason: "Small actions turn intention into momentum." },
      { title: "Notice what changed", focusLabel: "WHAT YOU LEARNED", focus: "What felt easier, harder, or different than you expected?", reason: "Noticing what happened helps you build on what works." },
      { title: "Choose what comes next", focusLabel: "YOUR NEXT DIRECTION", focus: `Use what you learned to move toward ${goal}.`, reason: "Progress gives you better information for the next step." },
    ] satisfies QuestStep[],
  };
}

// ─── Quest Node ───────────────────────────────────────────────────────────────

type NodeState = "done" | "current" | "locked";

function QuestNode({
  label,
  state,
  offsetX = 0,
  index,
  onClick,
}: {
  label: string;
  state: NodeState;
  offsetX?: number;
  index: number;
  onClick?: () => void;
}) {
  const isDone = state === "done";
  const isCurrent = state === "current";
  const isLocked = state === "locked";

  const borderColor = isDone ? "var(--accent, #00c8ff)" : isCurrent ? "var(--accent-strong, #00e5ff)" : "var(--node-border, #1a3a55)";
  const bgColor = isDone ? "var(--node-done-bg, rgba(0,200,255,0.08))" : isCurrent ? "var(--node-current-bg, rgba(0,200,255,0.16))" : "var(--node-locked-bg, rgba(10,20,35,0.8))";
  const glowColor = isDone ? "0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.2)" : isCurrent ? "0 0 12px #00e5ff, 0 0 28px rgba(0,200,255,0.85), 0 0 52px rgba(0,150,255,0.45)" : "none";
  const size = isDone ? 54 : isCurrent ? 52 : 48;

  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateX(${offsetX}px)`, position: "relative", cursor: onClick ? "pointer" : "default" }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px ${isDone ? "solid" : isLocked ? "dashed" : "dashed"} ${borderColor}`,
        background: bgColor,
        boxShadow: glowColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "all 0.3s",
      }}>
        {isDone && (
          <span style={{ color: "var(--accent, #00c8ff)", fontSize: "1.2rem", textShadow: "0 0 8px var(--accent, #00c8ff)" }}>✓</span>
        )}
        {!isDone && <span className={isCurrent ? "pulse-neon" : ""} style={{ color: isCurrent ? "var(--primary-text, #d9fbff)" : "var(--muted-text, #1a4a66)", fontSize: "0.7rem", fontFamily: "var(--font-mono)", textShadow: isCurrent ? "0 0 8px var(--accent-strong, #00e5ff)" : "none" }}>{index + 1}</span>}
      </div>
      <div style={{
        marginTop: 5,
        fontFamily: "var(--font-mono)",
        fontSize: "0.42rem",
        color: isDone ? "var(--muted-text, #4a9ab5)" : isCurrent ? "var(--muted-text, #4a7a99)" : "var(--node-border, #1a3a55)",
        letterSpacing: "0.06em",
        textAlign: "center",
        maxWidth: 78,
        lineHeight: 1.2,
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── Dashed Connector ─────────────────────────────────────────────────────────

function Connector({ fromX, toX, done }: { fromX: number; toX: number; done: boolean }) {
  const dx = toX - fromX;
  const dy = 80; // vertical distance between nodes
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div style={{
      position: "absolute",
      width: len,
      height: 0,
      borderTop: `2px dashed ${done ? "var(--connector-done, rgba(0,200,255,0.4))" : "var(--connector, rgba(13,90,128,0.5))"}`,
      transformOrigin: "0 0",
      transform: `rotate(${angle}deg)`,
      left: "50%",
      marginLeft: fromX,
      top: 28,
      pointerEvents: "none",
    }} />
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: "⌖", label: "MISSIONS", destination: "MISSIONS" },
  { icon: "⌂", label: "HOME", destination: "HOME" },
  { icon: "◷", label: "RECORDS", destination: "RECORDS" },
];

type Theme = "dark";

function BottomNav({ active, onSelect, theme = "default" }: { active: string; onSelect: (label: string) => void; theme?: Theme }) {
  return (
    <nav className={`bottom-nav theme-${theme}`} aria-label="Main navigation" style={{
      display: "flex",
      borderTop: "1px solid var(--nav-border, #0d3a5c)",
      background: "var(--nav-bg, #050f1e)",
      position: "relative",
    }}>
      {/* Top edge glow line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #00c8ff, transparent)", opacity: 0.4 }} />

      {NAV_ITEMS.map((item) => {
        const isActive = item.destination === active;
        return (
          <button
            key={item.destination}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(item.destination)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.6rem 0.25rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
              gap: 3,
            }}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-label" style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              color: isActive ? "var(--nav-active-color, #00c8ff)" : "var(--nav-muted-color, #1a4a66)",
              position: "relative",
              textShadow: isActive ? "var(--nav-active-text-shadow, 0 0 8px rgba(0,200,255,0.5))" : "none",
            }}>
              {item.label}
            </span>
            <span className="nav-indicator" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

type ShopItem = { name: string; icon: string; rarity: string; description: string; price: number; image?: string };

const SHOP_SECTIONS: { label: string; items: ShopItem[] }[] = [
  { label: "FEATURED", items: [
    { name: "XP BOOST", icon: "⚡", rarity: "A", description: "Accelerates your next mission and gets momentum moving again.", price: 80 },
    { name: "STREAK SHIELD", icon: "🛡️", rarity: "S", description: "Protects one day of progress when real life interrupts the run.", price: 60 },
    { name: "NEON FRAME", icon: "🔷", rarity: "B", description: "A bright profile frame for operators who keep showing up.", price: 100 },
    { name: "CYBER CAT", icon: "🐱", rarity: "SS", description: "A small digital companion with an unusually sharp eye for patterns.", price: 150 },
  ] },
  { label: "ALL", items: [
    { name: "XP BOOST", icon: "⚡", rarity: "A", description: "Accelerates your next mission and gets momentum moving again.", price: 80 },
    { name: "STREAK SHIELD", icon: "🛡️", rarity: "S", description: "Protects one day of progress when real life interrupts the run.", price: 60 },
    { name: "NEON FRAME", icon: "🔷", rarity: "B", description: "A bright profile frame for operators who keep showing up.", price: 100 },
    { name: "CYBER CAT", icon: "🐱", rarity: "SS", description: "A small digital companion with an unusually sharp eye for patterns.", price: 150 },
    { name: "FOCUS CORE", icon: "💠", rarity: "SSS", description: "A rare focus protocol for protecting your best working hours.", price: 240 },
    { name: "RESTORE KIT", icon: "🔋", rarity: "C", description: "Recharges a tired system before the next meaningful push.", price: 45 },
  ] },
  { label: "ITEMS", items: [
    { name: "XP BOOST", icon: "⚡", rarity: "A", description: "Accelerates your next mission and gets momentum moving again.", price: 80 },
    { name: "RESTORE KIT", icon: "🔋", rarity: "C", description: "Recharges a tired system before the next meaningful push.", price: 45 },
  ] },
  { label: "ARMOR", items: [
    { name: "STREAK SHIELD", icon: "🛡️", rarity: "S", description: "Protects one day of progress when real life interrupts the run.", price: 60 },
    { name: "NEON FRAME", icon: "🔷", rarity: "B", description: "A bright profile frame for operators who keep showing up.", price: 100 },
    { name: "FOCUS CORE", icon: "💠", rarity: "SSS", description: "A rare focus protocol for protecting your best working hours.", price: 240 },
  ] },
  { label: "PERSONAL", items: [] },
];

function ShopScreen({ theme, onNavigate }: { theme: Theme; onNavigate: (label: string) => void }) {
  const [section, setSection] = useState("FEATURED");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [personalItems, setPersonalItems] = useState<ShopItem[]>([]);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemPrice, setItemPrice] = useState("50");
  const visibleItems = section === "PERSONAL" ? personalItems : SHOP_SECTIONS.find((entry) => entry.label === section)?.items || [];

  const closeCreateItem = () => {
    setCreateItemOpen(false);
    setItemTitle("");
    setItemDescription("");
    setItemImage("");
    setItemPrice("50");
  };

  const saveItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = itemTitle.trim();
    const description = itemDescription.trim();
    const price = Number(itemPrice);
    if (!title || !description || !Number.isFinite(price) || price < 0) return;
    setPersonalItems((current) => [...current, {
      name: title.toUpperCase(),
      icon: itemImage ? "" : "◇",
      image: itemImage || undefined,
      rarity: "CUSTOM",
      description,
      price: Math.round(price),
    }]);
    setSection("PERSONAL");
    closeCreateItem();
  };

  const handleItemImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setItemImage(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  return (
    <div className={`shop-shell theme-${theme}`}>
      <div className="scanlines" />
      <div className="shop-frame">
        <HudCorners bright size={22} />
        <header className="shop-header">
          <h1>SHOP</h1>
          <div className="coin-balance"><span>🪙</span><strong>120</strong></div>
        </header>
        <nav className="shop-tabs" aria-label="Shop sections">
          {SHOP_SECTIONS.map((entry) => (
            <button key={entry.label} className={section === entry.label ? "active" : ""} type="button" onClick={() => setSection(entry.label)}>{entry.label}</button>
          ))}
        </nav>
        <div className="shop-tools"><button type="button">▼ &nbsp; FILTER</button><button type="button" onClick={() => setCreateItemOpen(true)}>CREATE</button><button type="button">DEFAULT ▾</button></div>
        <main className="shop-grid">
          {visibleItems.map((item) => (
            <button className="shop-item" key={item.name} type="button" onClick={() => setSelectedItem(item)}>
              <span className="shop-item-dot" />
              {item.image ? <img className="shop-item-image" src={item.image} alt="" /> : <span className="shop-item-icon">{item.icon}</span>}
              <strong>{item.name}</strong>
              <small>🪙 {item.price}</small>
            </button>
          ))}
        </main>
        {createItemOpen && (
          <div className="shop-create-overlay" role="dialog" aria-modal="true" aria-labelledby="shop-create-title">
            <form className="shop-create-panel" onSubmit={saveItem}>
              <div className="task-creation-actions">
                <button type="button" onClick={closeCreateItem}>CANCEL</button>
                <button type="submit" disabled={!itemTitle.trim() || !itemDescription.trim()}>SAVE</button>
              </div>
              <h2 id="shop-create-title">ITEM CREATION</h2>
              <label><span>ITEM TITLE:</span><input value={itemTitle} onChange={(event) => setItemTitle(event.target.value)} placeholder="TYPE HERE..." autoFocus /></label>
              <label><span>DESCRIPTION:</span><textarea value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} placeholder="TYPE HERE..." rows={3} /></label>
              <label><span>IMAGE:</span><input type="file" accept="image/*" onChange={handleItemImage} /></label>
              {itemImage && <img className="shop-create-preview" src={itemImage} alt="Item preview" />}
              <label><span>COIN VALUE:</span><input type="number" min="0" step="1" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} /></label>
            </form>
          </div>
        )}
        {selectedItem && (
          <div className="shop-detail-overlay" role="dialog" aria-modal="true">
            <div className="shop-detail-panel">
              <button className="shop-detail-close" type="button" aria-label="Close item details" onClick={() => setSelectedItem(null)}>×</button>
              {selectedItem.image ? <img className="shop-detail-image" src={selectedItem.image} alt="" /> : <span className="shop-detail-icon">{selectedItem.icon}</span>}
              <div className="eyebrow">ITEM DATABASE / {selectedItem.rarity}</div>
              <h2>{selectedItem.name}</h2>
              <div className="shop-rarity">RARITY: {selectedItem.rarity}</div>
              <p>{selectedItem.description}</p>
              <div className="shop-detail-price">🪙 {selectedItem.price} COINS</div>
              <button className="shop-buy-btn" type="button" onClick={() => setSelectedItem(null)}>BUY</button>
            </div>
          </div>
        )}
        <BottomNav active="SHOP" onSelect={onNavigate} theme={theme} />
      </div>
    </div>
  );
}

function MissionsScreen({ theme, onNavigate }: { theme: Theme; onNavigate: (label: string) => void }) {
  const initialMissions = [
    { id: "math-homework", title: "MATH HOMEWORK", category: "ACADEMIC", status: "Task", rank: "B", checklist: [] },
    { id: "take-out-trash", title: "TAKE OUT TRASH", category: "LIFE", status: "Habit", rank: "F", checklist: [] },
    { id: "cold-shower", title: "COLD SHOWER", category: "HEALTH", status: "Daily", rank: "A", checklist: [] },
    { id: "return-library-book", title: "RETURN LIBRARY BOOK", category: "ACADEMIC", status: "Task", rank: "A", checklist: [] },
    { id: "get-a-plus-on-test", title: "GET A+ ON TEST", category: "ACADEMIC", status: "Task", rank: "SSS", checklist: [] },
  ];
  const [missions, setMissions] = useState(initialMissions);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expandedMissions, setExpandedMissions] = useState<Record<string, boolean>>({});
  const [holdingMissionId, setHoldingMissionId] = useState<string | null>(null);
  const [missionTypeModal, setMissionTypeModal] = useState(false);
  const [taskCreationModal, setTaskCreationModal] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [selectedMissionType, setSelectedMissionType] = useState<"Task" | "Habit" | "Daily" | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskChecklist, setTaskChecklist] = useState("");
  const [taskChecklistItems, setTaskChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [taskDifficulty, setTaskDifficulty] = useState("B");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDays = Array.from(
    { length: new Date(calendarYear, calendarMonthIndex + 1, 0).getDate() },
    (_, index) => index + 1,
  );
  const calendarLeadingDays = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarDateKey = (day: number) => `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  useEffect(() => {
    if (!missionTypeModal && !taskCreationModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMissionTypeModal(false);
        setTaskCreationModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [missionTypeModal, taskCreationModal]);

  const openMissionTypeModal = () => {
    setSelectedMissionType(null);
    setMissionTypeModal(true);
  };

  const closeMissionModals = () => {
    setMissionTypeModal(false);
    setTaskCreationModal(false);
    setEditingMissionId(null);
  };

  const openMissionCreation = (type: "Task" | "Habit" | "Daily") => {
    setSelectedMissionType(type);
    setTaskTitle("");
    setTaskNotes("");
    setTaskChecklist("");
    setTaskChecklistItems([]);
    setTaskDifficulty("B");
    setTaskDueDate("");
    setEditingMissionId(null);
    setCalendarMonth(new Date());
    setMissionTypeModal(false);
    setTaskCreationModal(true);
  };

  const openMissionEdit = (mission: (typeof missions)[number]) => {
    setSelectedMissionType(mission.status as "Task" | "Habit" | "Daily");
    setEditingMissionId(mission.id);
    setTaskTitle(mission.title);
    setTaskNotes("");
    setTaskChecklist("");
    setTaskChecklistItems(mission.checklist);
    setTaskDifficulty(mission.rank);
    setTaskDueDate("");
    setCalendarMonth(new Date());
    setTaskCreationModal(true);
  };

  const addChecklistItem = () => {
    const text = taskChecklist.trim();
    if (!text) return;
    setTaskChecklistItems((current) => [...current, { id: `checklist-${Date.now()}-${current.length}`, text, completed: false }]);
    setTaskChecklist("");
  };

  const saveTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const checklist = taskChecklist.trim()
      ? [...taskChecklistItems, { id: `checklist-${Date.now()}-${taskChecklistItems.length}`, text: taskChecklist.trim(), completed: false }]
      : taskChecklistItems;
    if (editingMissionId) {
      setMissions((current) => current.map((mission) => mission.id === editingMissionId
        ? { ...mission, title: title.toUpperCase(), rank: taskDifficulty, checklist }
        : mission));
    } else {
      setMissions((current) => [
        ...current,
        { id: `mission-${Date.now()}`, title: title.toUpperCase(), category: selectedMissionType === "Habit" ? "LIFE" : selectedMissionType === "Daily" ? "HEALTH" : "ACADEMIC", status: selectedMissionType || "Task", rank: taskDifficulty, checklist },
      ]);
    }
    setTaskTitle("");
    setTaskNotes("");
    setTaskChecklist("");
    setTaskChecklistItems([]);
    setTaskDueDate("");
    setCalendarMonth(new Date());
    closeMissionModals();
  };

  const toggleMissionCompletion = (id: string) => {
    const wasCompleted = Boolean(completed[id]);
    setCompleted((current) => ({ ...current, [id]: !wasCompleted }));
    setMissions((current) => {
      const index = current.findIndex((mission) => mission.id === id);
      if (index === -1) return current;
      const remaining = [...current.slice(0, index), ...current.slice(index + 1)];
      return wasCompleted ? [current[index], ...remaining] : [...remaining, current[index]];
    });
  };

  const startMissionHold = (id: string, event?: React.PointerEvent<HTMLElement>) => {
    if ((event && event.button !== 0) || holdingMissionId !== null) return;
    if (event && (event.target as HTMLElement).closest("button, input, label")) return;
    if (event) event.currentTarget.setPointerCapture(event.pointerId);
    setHoldingMissionId(id);
  };

  const cancelMissionHold = () => {
    setHoldingMissionId(null);
  };

  return (
    <div className={`missions-shell missions-redesign theme-${theme}`}>
      <div className="scanlines" />
      <div className="missions-frame">
        <header className="missions-header">
          <h1>MISSIONS</h1>
          <button type="button" className="missions-add-btn" aria-label="Add mission" onClick={openMissionTypeModal}>+</button>
        </header>

        {missionTypeModal && (
          <div className="mission-type-overlay" role="dialog" aria-modal="true" aria-labelledby="mission-type-title" onClick={closeMissionModals}>
            <div className="mission-type-panel" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="mission-type-close" aria-label="Close mission type selection" onClick={closeMissionModals}>×</button>
              <h2 id="mission-type-title">Are you making a Task, Habit, or Daily?</h2>
              <div className="mission-type-options">
                {(["Task", "Habit", "Daily"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`mission-type-btn${selectedMissionType === type ? " selected" : ""}`}
                    onClick={() => openMissionCreation(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {taskCreationModal && (
          <div className="task-creation-overlay" role="dialog" aria-modal="true" aria-labelledby="task-creation-title">
            <form className="task-creation-panel" onSubmit={saveTask}>
              <div className="task-creation-actions">
                <button type="button" onClick={closeMissionModals}>CANCEL</button>
                <button type="submit" disabled={!taskTitle.trim()}>SAVE</button>
              </div>
              <h2 id="task-creation-title">{editingMissionId ? "EDIT MISSION" : "MISSION CREATION"}</h2>
              <label><span>MISSION TITLE:</span><input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="TYPE HERE..." autoFocus /></label>
              <label><span>NOTES:</span><textarea value={taskNotes} onChange={(event) => setTaskNotes(event.target.value)} placeholder="TYPE HERE..." rows={2} /></label>
              <label>
                <span>CHECKLIST:</span>
                <div className="task-checklist-editor">
                  {taskChecklistItems.map((item) => <div className="task-checklist-saved" key={item.id}>{item.text}</div>)}
                  <input value={taskChecklist} onChange={(event) => setTaskChecklist(event.target.value)} onBlur={addChecklistItem} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addChecklistItem(); } }} placeholder="NEW CHECKLIST ITEM:" />
                </div>
              </label>
              <label><span>DIFFICULTY RANK:</span><select value={taskDifficulty} onChange={(event) => setTaskDifficulty(event.target.value)}>{['F', 'D', 'C', 'B', 'A', 'S', 'SSS'].map((rank) => <option key={rank}>{rank}</option>)}</select></label>
              {selectedMissionType === "Task" && (
                <div className="task-calendar">
                  <span className="task-calendar-label">DUE DATE:</span>
                  <div className="task-calendar-header"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))}>‹</button><strong>{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}</strong><button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))}>›</button></div>
                  <div className="task-calendar-weekdays">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <span key={day}>{day}</span>)}</div>
                  <div className="task-calendar-grid">{Array.from({ length: calendarLeadingDays }, (_, index) => <span className="task-calendar-empty" key={`empty-${index}`} />)}{calendarDays.map((day) => { const dateKey = calendarDateKey(day); return <button key={dateKey} type="button" className={taskDueDate === dateKey ? "selected" : ""} onClick={() => setTaskDueDate(dateKey)}>{day}</button>; })}</div>
                </div>
              )}
            </form>
          </div>
        )}

        <main className="missions-list">
          {missions.map((mission) => (
            <article
              key={mission.id}
              className={`mission-card${completed[mission.id] ? " mission-card-completed" : ""}${holdingMissionId === mission.id ? " is-holding" : ""}${mission.checklist.length ? " mission-card-has-checklist" : ""}`}
              tabIndex={0}
              onPointerDown={(event) => startMissionHold(mission.id, event)}
              onPointerUp={cancelMissionHold}
              onPointerCancel={cancelMissionHold}
              onLostPointerCapture={cancelMissionHold}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget.querySelector(".mission-hold-outline path")
                  && event.animationName === "quest-outline-draw"
                  && holdingMissionId === mission.id) {
                  setHoldingMissionId(null);
                  toggleMissionCompletion(mission.id);
                }
              }}
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && (event.key === " " || event.key === "Enter") && !event.repeat) {
                  event.preventDefault();
                  startMissionHold(mission.id);
                }
              }}
              onKeyUp={(event) => {
                if (event.target === event.currentTarget && (event.key === " " || event.key === "Enter")) {
                  event.preventDefault();
                  cancelMissionHold();
                }
              }}
              onBlur={cancelMissionHold}
              onContextMenu={(event) => event.preventDefault()}
              aria-label={`Press and hold to ${completed[mission.id] ? "undo completion for" : "complete"} ${mission.title}`}
            >
              <svg className="mission-hold-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M50 1 H94 Q99 1 99 6 V94 Q99 99 94 99 H6 Q1 99 1 94 V6 Q1 1 6 1 H50" /></svg>
              <div className="mission-card-main">
                <div className="mission-copy"><h2>{mission.title}</h2></div>
                <div className="mission-meta"><div className="mission-status-line"><span className="mission-label">Status:</span><span className="mission-status-value">{mission.status}</span></div><div className="mission-rank-line"><span className="mission-label">Rank:</span><span className="mission-rank">{mission.rank}</span></div></div>
                <button type="button" className="mission-edit-btn" aria-label={`Edit ${mission.title}`} onClick={() => openMissionEdit(mission)}>✎</button>
              </div>
              {mission.checklist.length > 0 && <><button type="button" className="mission-expand-btn" aria-expanded={Boolean(expandedMissions[mission.id])} onClick={() => setExpandedMissions((current) => ({ ...current, [mission.id]: !current[mission.id] }))}>{expandedMissions[mission.id] ? "HIDE CHECKLIST" : `SHOW CHECKLIST (${mission.checklist.length})`}</button>{expandedMissions[mission.id] && <div className="mission-checklist">{mission.checklist.map((item) => <label className={`mission-checklist-item${item.completed ? " completed" : ""}`} key={item.id}><input type="checkbox" checked={item.completed} onChange={() => setMissions((current) => current.map((currentMission) => currentMission.id === mission.id ? { ...currentMission, checklist: currentMission.checklist.map((currentItem) => currentItem.id === item.id ? { ...currentItem, completed: !currentItem.completed } : currentItem) } : currentMission))} /><span>{item.text}</span></label>)}</div>}</>}
            </article>
          ))}
        </main>

        <p className="mission-hold-hint">Press and hold to complete</p>
        <div className="missions-nav-wrap">
          <BottomNav active="MISSIONS" onSelect={onNavigate} theme={theme} />
        </div>
      </div>
    </div>
  );
}

type RecordEntry = {
  id: string;
  date: string;
  createdAt: string;
  title: string;
  description: string;
  icon: string;
  mode: "TEXT" | "IMAGE";
  image?: string;
};

function isRecordEntry(value: unknown): value is RecordEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<RecordEntry>;
  return typeof entry.id === "string"
    && typeof entry.date === "string"
    && typeof entry.createdAt === "string"
    && Number.isFinite(new Date(entry.createdAt).getTime())
    && typeof entry.title === "string"
    && typeof entry.description === "string"
    && typeof entry.icon === "string"
    && (entry.mode === "TEXT" || entry.mode === "IMAGE")
    && (entry.image === undefined || typeof entry.image === "string");
}

type RecordsScreenProps = {
  theme: Theme;
  onNavigate: (label: string) => void;
  userId: string;
  signupDate: string;
  signupStorageError: string;
  progressStorageError: string;
  goal: string;
  chapter: string;
  progressPercent: number;
  completedQuestTitles: string[];
  completionHistory: QuestCompletion[];
};

function RecordsScreen({
  theme,
  onNavigate,
  userId,
  signupDate,
  signupStorageError,
  progressStorageError,
  goal,
  chapter,
  progressPercent,
  completedQuestTitles,
  completionHistory,
}: RecordsScreenProps) {
  const recordsStorageKey = `lifeos-records-${userId}`;
  const [initialData] = useState(() => {
    try {
      const saved = window.localStorage.getItem(recordsStorageKey);
      if (!saved) return { records: [] as RecordEntry[], error: "" };
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isRecordEntry)) {
        throw new Error("Saved records have an unexpected format.");
      }
      return { records: parsed, error: "" };
    } catch {
      return {
        records: [] as RecordEntry[],
        error: "Your saved records couldn't be loaded. Check this browser's storage and try again.",
      };
    }
  });
  const [records, setRecords] = useState<RecordEntry[]>(initialData.records);
  const [storageError, setStorageError] = useState(initialData.error);
  const [view, setView] = useState<"TIMELINE" | "GALLERY" | "PROGRESS">("TIMELINE");
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [recordMode, setRecordMode] = useState<"TEXT" | "IMAGE">("TEXT");
  const [recordDate, setRecordDate] = useState(() => new Date().toLocaleDateString("en-GB"));
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordIcon, setRecordIcon] = useState("⭐");
  const [recordImage, setRecordImage] = useState("");
  const icons = ["⭐", "🔥", "⚔️", "🌱", "💪", "🧠", "🏆", "⚡", "🎯", "🌈", "🛡️", "☀️"];
  const signupDateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(signupDate));

  useEffect(() => {
    if (!createRecordOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") resetRecordForm();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [createRecordOpen]);

  const resetRecordForm = () => {
    setCreateRecordOpen(false);
    setRecordMode("TEXT");
    setRecordDate(new Date().toLocaleDateString("en-GB"));
    setRecordTitle("");
    setRecordDescription("");
    setRecordIcon("⭐");
    setRecordImage("");
  };

  const saveRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recordTitle.trim() || (recordMode === "TEXT" && !recordDescription.trim()) || (recordMode === "IMAGE" && !recordImage)) return;
    const nextRecord: RecordEntry = {
      id: `record-${globalThis.crypto.randomUUID()}`,
      date: recordDate,
      createdAt: new Date().toISOString(),
      title: recordTitle.trim().toUpperCase(),
      description: recordDescription.trim() || "Image record added to the archive.",
      icon: recordIcon,
      mode: recordMode,
      image: recordImage || undefined,
    };
    const nextRecords = [...records, nextRecord];
    try {
      window.localStorage.setItem(recordsStorageKey, JSON.stringify(nextRecords));
      setRecords(nextRecords);
      setStorageError("");
      resetRecordForm();
    } catch {
      setStorageError("This record couldn't be saved. The image may be too large for this browser's storage.");
    }
  };

  const handleRecordImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setRecordImage(reader.result);
      else setStorageError("This image couldn't be read. Please choose another image.");
    };
    reader.onerror = () => setStorageError("This image couldn't be read. Please choose another image.");
    reader.readAsDataURL(file);
  };

  const generateDescription = () => {
    if (recordTitle.trim()) setRecordDescription(`A meaningful moment recorded while working toward ${recordTitle.trim().toLowerCase()}.`);
  };

  const renderRecordIcon = (record: RecordEntry) => record.image ? <img className="record-image-thumb" src={record.image} alt="" /> : <span>{record.icon}</span>;

  return (
    <div className={`records-shell theme-${theme}`}>
      <div className="scanlines" />
      <div className="records-frame">
        <HudCorners bright size={18} />
        <header className="records-header">
          <div className="records-title-row"><h1>RECORDS</h1><span className="records-info">ⓘ</span></div>
          <nav className="records-tabs" aria-label="Record views">
            {(["TIMELINE", "GALLERY", "PROGRESS"] as const).map((tab) => <button key={tab} type="button" className={view === tab ? "active" : ""} onClick={() => setView(tab)}>{tab}</button>)}
          </nav>
        </header>
        <main className={`records-panel records-${view.toLowerCase()}`}>
          {view === "TIMELINE" && (
            <div className="records-timeline">
              <article className="record-timeline-item signup-timeline-item">
                <span className="record-node" />
                <div className="record-card">
                  <div className="record-card-top"><time dateTime={signupDate}>{signupDateLabel}</time><span aria-hidden="true">✳</span></div>
                  <h2>YOUR JOURNEY BEGAN</h2>
                  <p>You joined LifeOS. The next steps in your story are yours to add.</p>
                </div>
              </article>
              {[...records].filter((record) => record.mode === "TEXT").sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((record) => (
                <article className="record-timeline-item" key={record.id}>
                  <span className="record-node" />
                  <div className="record-card"><div className="record-card-top"><time>{record.date}</time>{renderRecordIcon(record)}</div><h2>{record.title}</h2><p>{record.description}</p></div>
                </article>
              ))}
            </div>
          )}
          {view === "GALLERY" && (
            records.some((record) => record.mode === "IMAGE") ? (
              <div className="records-gallery">
                {[...records].filter((record) => record.mode === "IMAGE").sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((record) => (
                  <article className="record-gallery-card" key={record.id}>
                    {record.image ? <img src={record.image} alt={record.title} /> : <div className="record-gallery-icon">{record.icon}</div>}
                    <h2>{record.title}</h2><time>{record.date}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="records-empty-state"><span aria-hidden="true">✳</span><h2>Your gallery is waiting</h2><p>Add an image to keep a meaningful moment close.</p></div>
            )
          )}
          {view === "PROGRESS" && (
            <ProgressScreen
              userId={userId}
              chapter={chapter}
              goal={goal}
              progressPercent={progressPercent}
              completedQuestTitles={completedQuestTitles}
              completionHistory={completionHistory}
            />
          )}
          {[storageError, signupStorageError, progressStorageError].filter(Boolean).length > 0 && (
            <p className="records-storage-error" role="alert">{[storageError, signupStorageError, progressStorageError].filter(Boolean).join(" ")}</p>
          )}
          {view !== "PROGRESS" && <button className="add-record-trigger" type="button" onClick={() => { setStorageError(""); setCreateRecordOpen(true); }}>+ &nbsp; ADD A NEW RECORD</button>}
        </main>
          {createRecordOpen && (
            <div className="record-create-overlay" role="presentation" onClick={resetRecordForm}>
              <form className="record-create-panel" role="dialog" aria-modal="true" aria-labelledby="new-record-title" onSubmit={saveRecord} onClick={(event) => event.stopPropagation()}>
                <div className="record-create-top"><button type="button" onClick={resetRecordForm}>× CLOSE</button></div>
                <div className="record-mode-tabs">
                  <button type="button" className={recordMode === "TEXT" ? "active" : ""} onClick={() => setRecordMode("TEXT")}>TEXT RECORD</button>
                  <button type="button" className={recordMode === "IMAGE" ? "active" : ""} onClick={() => setRecordMode("IMAGE")}>IMAGE RECORD</button>
                </div>
                <h2 id="new-record-title">NEW RECORD</h2>
                {storageError && <p className="records-storage-error" role="alert">{storageError}</p>}
                <label><span>DATE:</span><input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} /></label>
                <label><span>TITLE:</span><input value={recordTitle} onChange={(event) => setRecordTitle(event.target.value)} placeholder="TYPE HERE..." autoFocus /></label>
                {recordMode === "TEXT" ? (
                  <>
                    <label><span>DESCRIPTION:</span><textarea value={recordDescription} onChange={(event) => setRecordDescription(event.target.value)} placeholder="TYPE HERE..." rows={4} /></label>
                    <div className="record-ai"><span>OR START WITH A SUGGESTION</span><button type="button" onClick={generateDescription}>✨ &nbsp; USE A WRITING SUGGESTION</button></div>
                    <label><span>ATTACH IMAGE (OPTIONAL):</span><input type="file" accept="image/*" onChange={handleRecordImage} /></label>
                    {recordImage && <img className="record-image-attachment" src={recordImage} alt="Attachment preview" />}
                  </>
                ) : (
                  <div className="record-image-field">
                    <span>ADD IMAGE:</span>
                    <label className="record-upload">
                      <input type="file" accept="image/*" onChange={handleRecordImage} />
                      {recordImage ? <img src={recordImage} alt="Upload preview" /> : <><span className="record-upload-icon">🌄</span><span>TAP TO UPLOAD PROOF IMAGE</span></>}
                    </label>
                  </div>
                )}
                <div className="record-icon-picker"><span>ICON:</span><div>{icons.map((icon) => <button type="button" className={recordIcon === icon ? "selected" : ""} key={icon} onClick={() => setRecordIcon(icon)}>{icon}</button>)}</div></div>
                <button className="add-record-submit" type="submit" disabled={!recordTitle.trim() || (recordMode === "TEXT" ? !recordDescription.trim() : !recordImage)}>ADD RECORD ✓</button>
              </form>
            </div>
          )}
        <BottomNav active="RECORDS" onSelect={onNavigate} theme={theme} />
      </div>
    </div>
  );
}

function SettingsScreen({ theme, onNavigate, onSignOut }: { theme: Theme; onNavigate: (label: string) => void; onSignOut: () => void }) {
  const [username, setUsername] = useState(() => (window.localStorage.getItem("lifeos-username") || "USERNAME").slice(0, 25));
  const updateUsername = (value: string) => {
    const next = value.trim().slice(0, 25) || "USERNAME";
    setUsername(next);
    window.localStorage.setItem("lifeos-username", next);
  };

  return <ProfileSettings username={username} onUsernameChange={updateUsername} theme={theme} onNavigate={onNavigate} onClose={() => onNavigate("HOME")} onSignOut={onSignOut} />;
}

function ProfileSettings({ username, onUsernameChange, theme, onNavigate, onClose, onSignOut }: { username: string; onUsernameChange: (value: string) => void; theme: Theme; onNavigate: (label: string) => void; onClose: () => void; onSignOut: () => void }) {
  const [email, setEmail] = useState(() => window.localStorage.getItem("lifeos-email") || "operator@lifeos.app");
  const [password, setPassword] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [font, setFont] = useState(() => window.localStorage.getItem("lifeos-font") || "ORBITRON / RAJDHANI");
  const [language, setLanguage] = useState(() => window.localStorage.getItem("lifeos-language") || "ENGLISH");
  const [timeZone, setTimeZone] = useState("SYSTEM DEFAULT");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const updateEmail = (value: string) => { setEmail(value); window.localStorage.setItem("lifeos-email", value); };
  const languageCopy = language === "SPANISH" ? { profile: "INFORMACION DEL PERFIL", personalize: "PERSONALIZACION", languageTime: "IDIOMA Y HORA", notifications: "NOTIFICACIONES", accessibility: "ACCESIBILIDAD Y PRIVACIDAD", username: "NOMBRE DE USUARIO", email: "CORREO ELECTRONICO", password: "CONTRASENA", edit: "EDITAR", reveal: "MOSTRAR", hide: "OCULTAR", save: "GUARDAR", font: "SISTEMA DE FUENTE", sound: "PERFIL DE SONIDO", language: "IDIOMA", timeZone: "ZONA HORARIA" } : language === "FRENCH" ? { profile: "INFORMATIONS DU PROFIL", personalize: "PERSONNALISATION", languageTime: "LANGUE ET HEURE", notifications: "NOTIFICATIONS", accessibility: "ACCESSIBILITE ET CONFIDENTIALITE", username: "NOM D'UTILISATEUR", email: "E-MAIL", password: "MOT DE PASSE", edit: "MODIFIER", reveal: "AFFICHER", hide: "MASQUER", save: "ENREGISTRER", font: "SYSTEME DE POLICE", sound: "PROFIL SONORE", language: "LANGUE", timeZone: "FUSEAU HORAIRE" } : language === "GERMAN" ? { profile: "PROFILINFORMATIONEN", personalize: "PERSONALISIERUNG", languageTime: "SPRACHE UND ZEIT", notifications: "BENACHRICHTIGUNGEN", accessibility: "BARRIEREFREIHEIT UND DATENSCHUTZ", username: "BENUTZERNAME", email: "E-MAIL", password: "PASSWORT", edit: "BEARBEITEN", reveal: "ANZEIGEN", hide: "AUSBLENDEN", save: "SPEICHERN", font: "SCHRIFTSYSTEM", sound: "SOUNDPROFIL", language: "SPRACHE", timeZone: "ZEITZONE" } : { profile: "PROFILE INFORMATION", personalize: "PERSONALISATION", languageTime: "LANGUAGE & TIME", notifications: "NOTIFICATIONS", accessibility: "ACCESSIBILITY & PRIVACY", username: "USERNAME", email: "EMAIL", password: "PASSWORD", edit: "EDIT", reveal: "REVEAL", hide: "HIDE", save: "SAVE", font: "FONT SYSTEM", sound: "SOUND PROFILE", language: "LANGUAGE", timeZone: "TIME ZONE" };

  useEffect(() => {
    document.documentElement.lang = language === "SPANISH" ? "es" : language === "FRENCH" ? "fr" : language === "GERMAN" ? "de" : "en";
    window.localStorage.setItem("lifeos-language", language);
  }, [language]);

  useEffect(() => {
    const fontValues = font === "SHARE TECH / RAJDHANI"
      ? { display: "'Share Tech Mono', monospace", body: "'Rajdhani', sans-serif", mono: "'Share Tech Mono', monospace" }
      : font === "CLASSIC / SYSTEM"
        ? { display: "Georgia, serif", body: "Georgia, serif", mono: "'Courier New', monospace" }
        : { display: "'Orbitron', monospace", body: "'Rajdhani', sans-serif", mono: "'Share Tech Mono', monospace" };
    document.documentElement.style.setProperty("--font-display", fontValues.display);
    document.documentElement.style.setProperty("--font-body", fontValues.body);
    document.documentElement.style.setProperty("--font-mono", fontValues.mono);
    window.localStorage.setItem("lifeos-font", font);
  }, [font]);

  return <div className="profile-settings-overlay settings-screen">
    <div className="profile-settings-page">
      <header className="profile-settings-header"><div><div className="eyebrow">LIFEOS / SYSTEM SETTINGS</div><h2 id="profile-settings-title">SETTINGS</h2></div><button type="button" className="profile-settings-close" onClick={onClose}>× HOME</button></header>
      <main className="profile-settings-content">
        <section className="settings-section settings-profile-section"><div className="settings-section-heading"><div><span className="settings-section-index">01</span><h3>{languageCopy.profile}</h3></div><p>Manage the details connected to your LifeOS profile.</p></div><div className="settings-form-grid"><label><span>{languageCopy.username}</span><input value={username} maxLength={25} onChange={(event) => onUsernameChange(event.target.value.slice(0, 25))} /></label><div className="settings-account-row"><span>{languageCopy.email}</span>{editingEmail ? <input type="email" value={email} autoFocus onChange={(event) => updateEmail(event.target.value)} onBlur={() => setEditingEmail(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditingEmail(false); }} /> : <strong>{showEmail ? email : `${email.slice(0, 4)}${email.length > 4 ? "********" : ""}${email.includes("@") ? email.slice(email.indexOf("@")) : ""}`}</strong>}<button type="button" className="settings-reveal" onClick={() => setShowEmail((current) => !current)}>{showEmail ? languageCopy.hide : languageCopy.reveal}</button><button type="button" className="settings-edit-button" onClick={() => setEditingEmail(true)}>{editingEmail ? languageCopy.save : languageCopy.edit}</button></div><div className="settings-account-row"><span>{languageCopy.password}</span>{editingPassword ? <input type={showPassword ? "text" : "password"} value={password} autoFocus placeholder="ENTER NEW PASSWORD" onChange={(event) => setPassword(event.target.value)} onBlur={() => setEditingPassword(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditingPassword(false); }} /> : <strong>{password ? (showPassword ? password : "********") : "NOT SET"}</strong>}<button type="button" className="settings-reveal" onClick={() => setShowPassword((current) => !current)}>{showPassword ? languageCopy.hide : languageCopy.reveal}</button><button type="button" className="settings-edit-button" onClick={() => setEditingPassword(true)}>{editingPassword ? languageCopy.save : languageCopy.edit}</button></div></div><p className="settings-note">Your username is limited to 25 characters. Passwords are kept in this session until account security is connected.</p></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">02</span><h3>PERSONALISATION</h3></div><p>Shape the visual system around the way you work.</p></div><div className="settings-inline-grid"><label><span>FONT SYSTEM</span><select value={font} onChange={(event) => setFont(event.target.value)}><option>ORBITRON / RAJDHANI</option><option>SHARE TECH / RAJDHANI</option><option>CLASSIC / SYSTEM</option></select></label><label><span>SOUND PROFILE</span><select value={soundEnabled ? "ON" : "OFF"} onChange={(event) => setSoundEnabled(event.target.value === "ON")}><option>ON</option><option>OFF</option></select></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">03</span><h3>LANGUAGE &amp; TIME</h3></div><p>Set how dates, times, and system copy appear.</p></div><div className="settings-inline-grid"><label><span>LANGUAGE</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>ENGLISH</option><option>SPANISH</option><option>FRENCH</option><option>GERMAN</option></select></label><label><span>TIME ZONE</span><select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option>SYSTEM DEFAULT</option><option>UTC</option><option>US / EASTERN</option><option>US / PACIFIC</option><option>EUROPE / LONDON</option></select></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">04</span><h3>NOTIFICATIONS</h3></div><p>Choose which signals are allowed to reach you.</p></div><div className="settings-toggle-list"><label className="settings-toggle"><span><strong>NOTIFICATIONS</strong><small>Allow LifeOS to send reminders and progress updates.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} /><i /></label><label className="settings-toggle"><span><strong>DAILY REMINDER</strong><small>Prompt me to check in and keep the journey moving.</small></span><input type="checkbox" checked={dailyReminder} onChange={(event) => setDailyReminder(event.target.checked)} /><i /></label><label className="settings-toggle"><span><strong>NOTIFICATION SOUNDS</strong><small>Play a sound when an alert or milestone arrives.</small></span><input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} /><i /></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">05</span><h3>ACCESSIBILITY &amp; PRIVACY</h3></div><p>Control comfort, motion, and data preferences.</p></div><div className="settings-toggle-list"><label className="settings-toggle"><span><strong>REDUCE MOTION</strong><small>Use fewer animated transitions throughout the interface.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><i /></label><button type="button" className="settings-action-row"><span><strong>DOWNLOAD MY DATA</strong><small>Export your profile and progress information.</small></span><b>→</b></button><button type="button" className="settings-action-row danger"><span><strong>DELETE PROFILE DATA</strong><small>Remove locally stored profile information.</small></span><b>→</b></button><button type="button" className="settings-action-row" onClick={onSignOut}><span><strong>SIGN OUT</strong><small>End this local session and keep your profile saved.</small></span><b>→</b></button></div></section>
      </main>
    </div>
    <BottomNav active="SETTINGS" onSelect={onNavigate} theme={theme} />
  </div>;
}

function AccountScreen({ theme, setTheme, onNavigate, onSignOut }: { theme: Theme; setTheme: (theme: Theme) => void; onNavigate: (label: string) => void; onSignOut: () => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [username, setUsername] = useState(() => (window.localStorage.getItem("lifeos-username") || "USERNAME").slice(0, 25));
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const cancelUsernameEdit = useRef(false);
  const [profileImage, setProfileImage] = useState(() => window.localStorage.getItem("lifeos-profile-image") || "");
  const [accountOverlay, setAccountOverlay] = useState<"title" | "class" | "streak" | "abilities" | "inventory" | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("SUPER RUNNER");
  const [selectedClass, setSelectedClass] = useState("MAGE");
  const [growthPoints, setGrowthPoints] = useState(99999);
  const [statValues, setStatValues] = useState<Record<string, number>>({ MIND: 1000, BODY: 1000, WILL: 1000, SPIRIT: 1000, INFLUENCE: 1000 });
  const [abilitySlots, setAbilitySlots] = useState<(string | null)[]>(["BLADE FOCUS", null, null]);
  const [inventorySlots, setInventorySlots] = useState<(string | null)[]>(["XP BOOST", "STREAK SHIELD", null, null, null]);
  const [favoriteAbilities, setFavoriteAbilities] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogSlot, setCatalogSlot] = useState(0);
  const titles = [{ name: "SUPER RUNNER", description: "For operators who keep moving when the path gets difficult.", ability: "10% XP BOOST" }, { name: "FIRST STEP", description: "Awarded for beginning the journey and taking action.", ability: "5% STARTER XP" }, { name: "BOSS BREAKER", description: "Earned by overcoming a major challenge.", ability: "8% BOSS DAMAGE" }];
  const classes = [{ name: "MAGE", description: "A strategic class built around focus and deliberate progress.", ability: "15% MP REGEN" }, { name: "RUNNER", description: "A momentum class for fast, consistent operators.", ability: "10% STREAK XP" }, { name: "GUARDIAN", description: "A resilient class built to protect long-term progress.", ability: "10% STREAK SHIELD" }];
  const abilityCatalog = [{ name: "BLADE FOCUS", icon: "⚔️", rarity: "RARE", description: "Sharpens attention for the next meaningful action.", cooldown: "24 HOURS" }, { name: "XP SURGE", icon: "⚡", rarity: "EPIC", description: "Temporarily increases earned experience.", cooldown: "12 HOURS" }, { name: "SECOND WIND", icon: "🌬️", rarity: "RARE", description: "Restores momentum after an interrupted run.", cooldown: "48 HOURS" }, { name: "STREAK GUARD", icon: "🛡️", rarity: "LEGENDARY", description: "Protects a streak from one missed day.", cooldown: "7 DAYS" }, { name: "DEEP WORK", icon: "🧠", rarity: "EPIC", description: "Creates a focused window for difficult work.", cooldown: "24 HOURS" }];
  const inventoryCatalog = [{ name: "XP BOOST", icon: "⚡", rarity: "A", description: "Accelerates the next mission.", cooldown: "ONE USE" }, { name: "STREAK SHIELD", icon: "🛡️", rarity: "S", description: "Protects one day of progress.", cooldown: "ONE USE" }, { name: "NEON FRAME", icon: "🔷", rarity: "B", description: "A bright profile frame.", cooldown: "PASSIVE" }, { name: "FOCUS CORE", icon: "💠", rarity: "SSS", description: "Protects your best working hours.", cooldown: "PASSIVE" }, { name: "RESTORE KIT", icon: "🔋", rarity: "C", description: "Recharges a tired system.", cooldown: "ONE USE" }];
  const stats = [["🧠", "MIND"], ["💪", "BODY"], ["🔥", "WILL"], ["◎", "SPIRIT"], ["👥", "INFLUENCE"]];
  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setProfileImage(reader.result);
      window.localStorage.setItem("lifeos-profile-image", reader.result);
    };
    reader.readAsDataURL(file);
  };
  const updateUsername = (value: string) => { const next = value.trim().slice(0, 25) || "USERNAME"; setUsername(next); window.localStorage.setItem("lifeos-username", next); setEditingUsername(false); };
  const beginUsernameEdit = () => { cancelUsernameEdit.current = false; setUsernameDraft(username); setEditingUsername(true); };
  const handleUsernameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") updateUsername(usernameDraft);
    if (event.key === "Escape") { cancelUsernameEdit.current = true; setEditingUsername(false); }
  };
  const spendGrowthPoint = (label: string) => { if (growthPoints <= 0) return; setGrowthPoints((current) => current - 1); setStatValues((current) => ({ ...current, [label]: current[label] + 1 })); };
  const filteredCatalog = accountOverlay === "abilities" ? abilityCatalog.filter((item) => item.name.includes(catalogSearch.toUpperCase())) : inventoryCatalog.filter((item) => item.name.includes(catalogSearch.toUpperCase()));
  const selectCatalogItem = (name: string) => { if (accountOverlay === "abilities") { setAbilitySlots((current) => current.map((slot, index) => index === catalogSlot ? name : slot)); } else { setInventorySlots((current) => current.map((slot, index) => index === catalogSlot ? name : slot)); } setAccountOverlay(null); setCatalogSearch(""); };
  const openCatalog = (type: "abilities" | "inventory", slot = 0) => { setCatalogSlot(slot); setCatalogSearch(""); setAccountOverlay(type); };

  return (
    <div className={`account-shell theme-${theme}`}>
      <div className="scanlines" />
      <div className="account-frame">
        <header className="account-main-header"><h1>PROFILE</h1><button type="button" className="account-settings-btn" aria-label="Open appearance settings" onClick={() => setSettingsOpen(true)}>⚙</button></header>
        <main className="account-content">
          <section className="account-profile hud-panel"><label className="account-avatar-upload" aria-label="Upload profile picture">{profileImage ? <img src={profileImage} alt="Profile" /> : <span>●</span>}<input type="file" accept="image/*" onChange={handleProfileImage} /></label><div className="account-identity">{editingUsername ? <input className="account-name-input" type="text" value={usernameDraft} maxLength={25} autoFocus aria-label="Username" onChange={(event) => setUsernameDraft(event.target.value)} onBlur={() => { if (cancelUsernameEdit.current) { cancelUsernameEdit.current = false; return; } updateUsername(usernameDraft); }} onKeyDown={handleUsernameKeyDown} /> : <button type="button" className="account-name-button" aria-label="Edit username" onClick={beginUsernameEdit}>{username}</button>}<span>LVL: 9999999</span><button type="button" className="account-detail-button" onClick={() => setAccountOverlay("title")}><b>TITLE:</b> {selectedTitle} <b>10% XP BOOST</b></button><button type="button" className="account-detail-button" onClick={() => setAccountOverlay("class")}><b>CLASS:</b> {selectedClass} <b>RANK:</b> SSS <b onClick={(event) => { event.stopPropagation(); setAccountOverlay("streak"); }}>STREAK:</b> 100 DAYS</button></div></section>
          <section className="account-bars"><div><span>✚ &nbsp; HP</span><strong>9999999 / 9999999</strong><i><em /></i></div><div><span>✦ &nbsp; MP</span><strong>9999999 / 9999999</strong><i><em /></i></div></section>
          <section className="account-stats-wrap"><div className="account-stats">{stats.map(([icon, label]) => <div key={label}><span>{icon}</span><b>{label}</b><strong>{statValues[label]}</strong><button type="button" onClick={() => spendGrowthPoint(label)} aria-label={`Increase ${label}`}>+</button></div>)}</div><div className="growth-card"><span>▰</span><small>AVAILABLE<br />GROWTH POINTS:</small><strong>{growthPoints}</strong></div></section>
          <section><button type="button" className="account-section-title account-section-button" onClick={() => openCatalog("abilities", abilitySlots.length - 1)}>ABILITIES »</button><div className="ability-grid">{abilitySlots.map((ability, index) => { const item = abilityCatalog.find((entry) => entry.name === ability); return <button type="button" className="ability-slot" key={index} title={item ? `${item.name} / ${item.rarity} / ${item.description} / COOLDOWN: ${item.cooldown}` : "Empty ability slot"} onClick={() => openCatalog("abilities", index)}><span>{item?.icon || "⚔️"}</span>{item && favoriteAbilities.includes(item.name) && <small>♥</small>}</button>; })}</div></section>
          <section><button type="button" className="account-section-title account-section-button" onClick={() => openCatalog("inventory", inventorySlots.length - 1)}>INVENTORY »</button><span className="account-subtitle">RECENTLY OBTAINED</span><div className="inventory-grid">{inventorySlots.map((itemName, index) => { const item = inventoryCatalog.find((entry) => entry.name === itemName); return <button type="button" className="inventory-slot" key={index} title={item ? `${item.name} / ${item.rarity} / ${item.description} / ${item.cooldown}` : "Empty inventory slot"} onClick={() => openCatalog("inventory", index)}>{item?.icon || "▣"}{item && favoriteItems.includes(item.name) && <small>♥</small>}</button>; })}</div></section>
        </main>
        <div className="account-nav"><BottomNav active="PROFILE" onSelect={onNavigate} theme={theme} /></div>
        {settingsOpen && <ProfileSettings username={username} onUsernameChange={(value) => { const next = value.trim().slice(0, 25) || "USERNAME"; setUsername(next); window.localStorage.setItem("lifeos-username", next); }} onClose={() => setSettingsOpen(false)} onSignOut={onSignOut} />}
        {accountOverlay && <div className="account-detail-overlay" role="dialog" aria-modal="true"><div className="account-detail-panel"><button type="button" className="account-settings-close" onClick={() => setAccountOverlay(null)}>× CLOSE</button>{accountOverlay === "title" && <><div className="eyebrow">PROFILE / TITLES</div><h2>CHOOSE TITLE</h2>{titles.map((title) => <button type="button" className={`account-choice${selectedTitle === title.name ? " active" : ""}`} key={title.name} onClick={() => { setSelectedTitle(title.name); setAccountOverlay(null); }}><strong>{title.name}</strong><span>{title.description}</span><small>ABILITY: {title.ability}</small></button>)}</>}{accountOverlay === "class" && <><div className="eyebrow">PROFILE / CLASSES</div><h2>CHOOSE CLASS</h2>{classes.map((entry) => <button type="button" className={`account-choice${selectedClass === entry.name ? " active" : ""}`} key={entry.name} onClick={() => { setSelectedClass(entry.name); setAccountOverlay(null); }}><strong>{entry.name}</strong><span>{entry.description}</span><small>ABILITY: {entry.ability}</small></button>)}</>}{accountOverlay === "streak" && <><div className="eyebrow">PROFILE / STREAK</div><h2>100 DAY STREAK</h2><p className="account-overlay-copy">You have shown up for 100 days. Keep the chain alive and protect the next milestone.</p><div className="streak-meter"><em /></div><div className="streak-milestones"><span>7 DAYS<br /><b>UNLOCKED</b></span><span>30 DAYS<br /><b>UNLOCKED</b></span><span>100 DAYS<br /><b>CURRENT</b></span></div></>}{(accountOverlay === "abilities" || accountOverlay === "inventory") && <><div className="eyebrow">PROFILE / {accountOverlay.toUpperCase()}</div><h2>{accountOverlay === "abilities" ? "ABILITY DATABASE" : "ITEM DATABASE"}</h2><input className="account-catalog-search" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="SEARCH..." />{filteredCatalog.map((item) => <button type="button" className="account-catalog-item" key={item.name} onClick={() => selectCatalogItem(item.name)}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.rarity} / {item.cooldown}<br />{item.description}</small></div><button type="button" className="catalog-heart" onClick={(event) => { event.stopPropagation(); if (accountOverlay === "abilities") setFavoriteAbilities((current) => current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name]); else setFavoriteItems((current) => current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name]); }}>{(accountOverlay === "abilities" ? favoriteAbilities : favoriteItems).includes(item.name) ? "♥" : "♡"}</button></button>)}</>}</div></div>}
      </div>
    </div>
  );
}

function QuestModal({ success, boss, error, onClose, onComplete }: { success: boolean; boss: boolean; error?: string; onClose: () => void; onComplete: () => void }) {
  return (
    <div className={`quest-modal${success ? " success" : ""}${boss ? " boss" : ""}`} role="dialog" aria-modal="true">
      <div className="quest-modal-panel">
        {!success && <button className="quest-modal-close" type="button" aria-label="Close quest" onClick={onClose}>×</button>}
        <div className="eyebrow">{success ? (boss ? "CHAPTER CHALLENGE COMPLETE" : "PROGRESS RECORDED") : (boss ? "CHAPTER CHALLENGE" : "CURRENT QUEST")}</div>
        {error && <p className="progress-storage-error" role="alert">{error}</p>}
        {success ? <h2>{boss ? "Chapter complete" : "Quest complete"}</h2> : <button className="complete-quest-btn" type="button" onClick={onComplete}>{boss ? "Complete chapter challenge" : "Mark quest complete"}</button>}
      </div>
    </div>
  );
}

function ReflectionModal({ closing, onClose }: { closing: boolean; onClose: () => void }) {
  return (
    <div className={`reflection-modal${closing ? " closing" : ""}`} role="dialog" aria-modal="true">
      <div className="reflection-modal-panel">
        <button className="reflection-close-btn" type="button" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

type CoachMessage = { role: "coach" | "user"; text: string };

const COACH_WELCOME: CoachMessage = { role: "coach", text: "What's on your mind?\n\nYour advisor can help you understand your goals, work through obstacles, and decide what to do next." };
const COACH_STARTERS = ["Help me clarify a goal", "I'm feeling stuck", "Help me make a plan", "Review my progress", "I have an idea"];

function getCoachReply(message: string, answers: Answers) {
  const text = message.toLowerCase();
  const goal = typeof answers[1] === "string" ? answers[1] : "your current direction";
  if (text.includes("stuck") || text.includes("obstacle")) return "Let's make the friction visible. What is the smallest part of this situation that feels blocked right now?";
  if (text.includes("plan") || text.includes("next")) return `Let's turn ${goal.toLowerCase()} into a next move. What result would you like to have by the end of this week?`;
  if (text.includes("progress") || text.includes("review")) return "A useful review looks for evidence, not judgment. What did you try, what changed, and where did momentum slow down?";
  if (text.includes("idea")) return "Good ideas become useful when they meet a real need. Who would this help, and what is the smallest version you could test?";
  return "I hear you. To understand this properly, what outcome matters most to you, and what is making it difficult today?";
}

function CoachPanel({ answers, onClose }: { answers: Answers; onClose: () => void }) {
  const [messages, setMessages] = useState<CoachMessage[]>(() => {
    try {
      const saved = window.localStorage.getItem("lifeos-coach-messages");
      return saved ? JSON.parse(saved) as CoachMessage[] : [COACH_WELCOME];
    } catch { return [COACH_WELCOME]; }
  });
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { window.localStorage.setItem("lifeos-coach-messages", JSON.stringify(messages)); }, [messages]);

  const send = (text = draft) => {
    const next = text.trim();
    if (!next || loading) return;
    setDraft("");
    setError("");
    setMessages((current) => [...current, { role: "user", text: next }]);
    setLoading(true);
    window.setTimeout(() => {
      try {
        setMessages((current) => [...current, { role: "coach", text: getCoachReply(next, answers) }]);
      } catch { setError("THE ADVISOR COULD NOT RESPOND. TRY AGAIN."); }
      finally { setLoading(false); }
    }, 450);
  };

  return <div className="feature-overlay" role="dialog" aria-modal="true" aria-labelledby="coach-title"><div className="feature-panel coach-panel"><header className="feature-header"><div><div className="eyebrow">LIFEOS / ADVISOR ONLINE</div><h2 id="coach-title">AI COACH</h2><p>YOUR PERSONAL ADVISOR</p></div><button className="feature-close" type="button" onClick={onClose}>×</button></header><div className="coach-messages">{messages.length === 1 && <div className="coach-intro-note">THINK · UNDERSTAND · PLAN</div>}{messages.map((message, index) => <div className={`coach-message ${message.role}`} key={`${message.role}-${index}`}><span className="eyebrow">{message.role === "coach" ? "COACH" : "YOU"}</span><p>{message.text}</p></div>)}{loading && <div className="coach-message coach"><span className="eyebrow">COACH</span><p className="typing">ADVISOR IS THINKING...</p></div>}</div>{messages.length === 1 && <div className="coach-starters">{COACH_STARTERS.map((starter) => <button type="button" key={starter} onClick={() => send(starter)}>{starter}<span>→</span></button>)}</div>}{error && <p className="feature-error">{error}</p>}<form className="coach-input-row" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Tell your advisor what's on your mind..." disabled={loading} /><button className="cta-btn" type="submit" disabled={!draft.trim() || loading}>SEND →</button></form><div className="feature-footnote">OFFLINE ADVISOR PREVIEW · CONNECT AN AI SERVICE TO ENABLE LIVE RESPONSES</div></div></div>;
}

function AiChatScreen({ answers, theme, onNavigate }: { answers: Answers; theme: Theme; onNavigate: (label: string) => void }) {
  return <div className="chat-screen-shell">
    <CoachPanel answers={answers} onClose={() => onNavigate("HOME")} />
    <BottomNav active="AI CHAT" onSelect={onNavigate} theme={theme} />
  </div>;
}

type SideQuest = { id: string; title: string; description: string; purpose: string; objective: string; time: string; difficulty: string; reward: number; category: string; prompt: string };
const SIDE_QUESTS: SideQuest[] = [
  { id: "next-step", title: "CLARIFY YOUR NEXT STEP", description: "Turn one vague goal into a clear, actionable next step.", purpose: "Reduce uncertainty by naming the smallest useful move.", objective: "Write one sentence beginning with: My next step is...", time: "3 MIN", difficulty: "EASY", reward: 20, category: "DIRECTION", prompt: "My next step is..." },
  { id: "one-minute", title: "EXPLAIN ONE IDEA", description: "Practise explaining something you know in one minute.", purpose: "Build confidence and notice where your thinking becomes unclear.", objective: "Explain one idea simply, as if speaking to a curious friend.", time: "5 MIN", difficulty: "EASY", reward: 25, category: "CONFIDENCE", prompt: "The idea I can explain is..." },
  { id: "reset-space", title: "RESET ONE SPACE", description: "Make one small part of your environment easier to use.", purpose: "Remove a little friction from the place where you work or rest.", objective: "Choose one surface, drawer, or digital folder and reset it.", time: "10 MIN", difficulty: "EASY", reward: 30, category: "DISCIPLINE", prompt: "I reset... and it feels..." },
  { id: "energy-check", title: "READ YOUR ENERGY", description: "Notice what is helping or draining your energy today.", purpose: "Spot a pattern you can respond to instead of pushing through blindly.", objective: "Name one energy source and one energy drain from today.", time: "4 MIN", difficulty: "EASY", reward: 20, category: "MIND", prompt: "My energy source is... My energy drain is..." },
];

type QuestProgress = Record<string, "active" | "completed">;
function SideQuestsPanel({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<"RECOMMENDED" | "EXPLORE" | "ACTIVE" | "COMPLETED">("RECOMMENDED");
  const [progress, setProgress] = useState<QuestProgress>(() => { try { return JSON.parse(window.localStorage.getItem("lifeos-side-quests") || "{}"); } catch { return {}; } });
  const [selected, setSelected] = useState<SideQuest | null>(null);
  const [draft, setDraft] = useState("");
  const [complete, setComplete] = useState(false);
  useEffect(() => { window.localStorage.setItem("lifeos-side-quests", JSON.stringify(progress)); }, [progress]);
  const status = selected ? progress[selected.id] : undefined;
  const visible = SIDE_QUESTS.filter((quest) => section === "RECOMMENDED" ? !progress[quest.id] : section === "EXPLORE" ? !progress[quest.id] : progress[quest.id] === section.toLowerCase());
  const openQuest = (quest: SideQuest) => { setSelected(quest); setDraft(""); setComplete(false); };
  const accept = () => { if (!selected) return; setProgress((current) => ({ ...current, [selected.id]: "active" })); };
  const finish = () => { if (!selected || !draft.trim()) return; setProgress((current) => ({ ...current, [selected.id]: "completed" })); setComplete(true); };
  return <div className="feature-overlay" role="dialog" aria-modal="true" aria-labelledby="side-quests-title"><div className="feature-panel quests-panel"><header className="feature-header"><div><div className="eyebrow">LIFEOS / OPTIONAL MISSIONS</div><h2 id="side-quests-title">SIDE QUESTS</h2><p>DISCOVER · DO · PROGRESS</p></div><button className="feature-close" type="button" onClick={onClose}>×</button></header>{selected ? <div className="quest-detail"><button className="back-link" type="button" onClick={() => setSelected(null)}>← QUEST BOARD</button>{complete ? <div className="quest-complete"><div className="eyebrow">PROGRESS RECORDED</div><h3>QUEST COMPLETE</h3><strong>+{selected.reward} XP</strong><p>That small action is now part of your record.</p><button className="cta-btn" type="button" onClick={() => { setSelected(null); setSection("COMPLETED"); }}>RETURN TO QUESTS →</button></div> : <><div className="eyebrow">SIDE QUEST / {selected.category}</div><h3>{selected.title}</h3><p className="quest-detail-copy">{selected.description}</p><div className="quest-facts"><span>TIME<strong>{selected.time}</strong></span><span>DIFFICULTY<strong>{selected.difficulty}</strong></span><span>REWARD<strong>+{selected.reward} XP</strong></span></div><div className="quest-purpose"><span className="eyebrow">PURPOSE</span><p>{selected.purpose}</p><span className="eyebrow">OBJECTIVE</span><p>{selected.objective}</p></div>{status !== "active" && status !== "completed" ? <button className="cta-btn" type="button" onClick={accept}>ACCEPT QUEST →</button> : status === "active" ? <form className="quest-action" onSubmit={(event) => { event.preventDefault(); finish(); }}><label><span>{selected.prompt}</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} /></label><button className="cta-btn" type="submit" disabled={!draft.trim()}>COMPLETE QUEST →</button></form> : <p className="quest-completed-label">QUEST ALREADY COMPLETED · +{selected.reward} XP</p>}</>}</div> : <><nav className="feature-tabs">{(["RECOMMENDED", "EXPLORE", "ACTIVE", "COMPLETED"] as const).map((tab) => <button type="button" className={section === tab ? "active" : ""} key={tab} onClick={() => setSection(tab)}>{tab}</button>)}</nav><div className="quest-board">{visible.length ? visible.map((quest) => <button type="button" className="side-quest-card" key={quest.id} onClick={() => openQuest(quest)}><div className="eyebrow">{quest.category} / {progress[quest.id] || "AVAILABLE"}</div><h3>{quest.title}</h3><p>{quest.description}</p><div><span>{quest.time}</span><span>{quest.difficulty}</span><strong>+{quest.reward} XP</strong></div><b>VIEW QUEST →</b></button>) : <div className="empty-feature"><span className="eyebrow">NO QUESTS IN THIS CHANNEL</span><p>Choose another section when you are ready.</p></div>}</div><p className="feature-footnote">OPTIONAL MISSIONS · YOUR MAIN PATH REMAINS THE PRIORITY</p></>}</div></div>;
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

type StoredQuestProgress = { completionHistory: QuestCompletion[] };

function getOrCreateLocalUserId() {
  try {
    const saved = window.localStorage.getItem("lifeos-local-user-id");
    if (saved) return saved;
    const userId = globalThis.crypto.randomUUID();
    window.localStorage.setItem("lifeos-local-user-id", userId);
    return userId;
  } catch {
    return "guest-local";
  }
}

function getLocalProfileValue(key: string, fallback: string) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function isQuestCompletion(value: unknown): value is QuestCompletion {
  if (!value || typeof value !== "object") return false;
  const completion = value as Partial<QuestCompletion>;
  return typeof completion.title === "string"
    && typeof completion.completedAt === "string"
    && Number.isFinite(new Date(completion.completedAt).getTime())
    && (completion.kind === "quest" || completion.kind === "chapter");
}

function loadQuestProgress(userId: string) {
  try {
    const saved = window.localStorage.getItem(`lifeos-progress-${userId}`);
    if (!saved) return { progress: { completionHistory: [] } as StoredQuestProgress, error: "" };
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || !("completionHistory" in parsed)
      || !Array.isArray(parsed.completionHistory) || !parsed.completionHistory.every(isQuestCompletion)) {
      throw new Error("Saved progress has an unexpected format.");
    }
    return { progress: parsed as StoredQuestProgress, error: "" };
  } catch {
    return {
      progress: { completionHistory: [] } as StoredQuestProgress,
      error: "Your saved quest progress couldn't be loaded. Check this browser's storage and try again.",
    };
  }
}

function ProfileSheet({
  onClose,
  onDeleteData,
}: {
  onClose: () => void;
  onDeleteData: () => boolean;
}) {
  const [name, setName] = useState(() => getLocalProfileValue("lifeos-username", "Guest user"));
  const [email, setEmail] = useState(() => getLocalProfileValue("lifeos-email", ""));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const saveName = (value: string) => {
    const next = value.slice(0, 25);
    setName(next);
    try {
      window.localStorage.setItem("lifeos-username", next);
      setNotice("");
    } catch {
      setNotice("Your name couldn't be saved in this browser.");
    }
  };

  const saveEmail = (value: string) => {
    setEmail(value);
    try {
      window.localStorage.setItem("lifeos-email", value);
      setNotice("");
    } catch {
      setNotice("Your email couldn't be saved in this browser.");
    }
  };

  const continueWithAccount = () => {
    setNotice("Account creation isn't connected yet. Your progress is saved on this device.");
  };

  const deleteData = () => {
    if (!window.confirm("Delete your saved records, reflections, and quest progress from this device? This can't be undone.")) return;
    if (onDeleteData()) {
      setName("Guest user");
      setEmail("");
      setNotice("Your local records, reflections, and quest progress have been deleted.");
    } else {
      setNotice("Your data couldn't be deleted. Please check this browser's storage and try again.");
    }
  };

  return (
    <div className="profile-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="profile-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-sheet-title" onClick={(event) => event.stopPropagation()}>
        <header className="profile-sheet-header">
          <span className="profile-sheet-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 20v-1.2a7.5 7.5 0 0 1 15 0V20z" /></svg>
          </span>
          <button className="profile-sheet-close" type="button" aria-label="Close profile" autoFocus onClick={onClose}>×</button>
        </header>
        <main className="profile-sheet-content">
          <h2 id="profile-sheet-title">{name || "Guest user"}</h2>
          <section className="guest-account-card">
            <span className="guest-account-badge">Guest account</span>
            <p>Create an account for the best LifeOS experience:</p>
            <ul><li>Keep your progress</li><li>Continue wherever you are</li><li>Build your story over time</li></ul>
            <button type="button" onClick={continueWithAccount}>Continue with an account</button>
          </section>

          <h3 className="profile-account-heading">Account information</h3>
          <div className="profile-account-details">
            <details>
              <summary>Name <span aria-hidden="true">›</span></summary>
              <label><span>Your name</span><input value={name} maxLength={25} onChange={(event) => saveName(event.target.value)} /></label>
            </details>
            <details>
              <summary>Email <span aria-hidden="true">›</span></summary>
              <label><span>Email address</span><input type="email" value={email} onChange={(event) => saveEmail(event.target.value)} placeholder="Not added" /></label>
            </details>
            <details>
              <summary>Password <span aria-hidden="true">›</span></summary>
              <p className="profile-sheet-note">Passwords aren't available until account sign-up is connected.</p>
            </details>
            <details>
              <summary>Account plan <span aria-hidden="true">›</span></summary>
              <p className="profile-sheet-note">Guest account · Your entries are stored on this device.</p>
            </details>
          </div>

          {notice && <p className="profile-sheet-notice" role="status">{notice}</p>}
          <button className="profile-sheet-continue" type="button" onClick={continueWithAccount}>Continue with an account</button>
          <button className="profile-sheet-delete" type="button" onClick={deleteData}>Delete account data</button>
        </main>
      </section>
    </div>
  );
}

export default function HomeScreen({ answers, onSignOut = () => undefined }: Props & { onSignOut?: () => void }) {
  const quest = getQuestData(answers);
  const [userId] = useState(getOrCreateLocalUserId);
  const [signupDetails] = useState(() => {
    const key = `lifeos-signup-date-${userId}`;
    const createdAt = new Date().toISOString();
    try {
      const saved = window.localStorage.getItem(key);
      if (saved && Number.isFinite(new Date(saved).getTime())) return { date: saved, error: "" };
      window.localStorage.setItem(key, createdAt);
      return { date: createdAt, error: "" };
    } catch {
      return { date: createdAt, error: "Your journey start date couldn't be saved in this browser." };
    }
  });
  const signupDate = signupDetails.date;
  const signupStorageError = signupDetails.error;
  const [initialQuestProgress] = useState(() => loadQuestProgress(userId));
  const [questProgress, setQuestProgress] = useState(initialQuestProgress.progress);
  const [progressStorageError, setProgressStorageError] = useState(initialQuestProgress.error);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [activeNav, setActiveNav] = useState("HOME");
  const [theme, setTheme] = useState<Theme>("dark");
  const [questModal, setQuestModal] = useState<"closed" | "open" | "boss-open" | "success" | "boss-success">("closed");
  const [reflectionModal, setReflectionModal] = useState<"closed" | "open" | "closing">("closed");
  const [whyOpen, setWhyOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const [featurePanel, setFeaturePanel] = useState<"coach" | "side-quests" | null>(null);
  const [selectedQuestIndex, setSelectedQuestIndex] = useState(0);

  useEffect(() => {
    if (questModal !== "success" && questModal !== "boss-success") return;
    const timer = window.setTimeout(() => setQuestModal("closed"), 1600);
    return () => window.clearTimeout(timer);
  }, [questModal]);

  useEffect(() => {
    if (reflectionModal !== "closing") return;
    const timer = window.setTimeout(() => setReflectionModal("closed"), 220);
    return () => window.clearTimeout(timer);
  }, [reflectionModal]);

  useEffect(() => {
    if (!whyOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setWhyOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [whyOpen]);

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  const completionHistory = questProgress.completionHistory;
  const completedQuestTitles = completionHistory
    .filter((completion) => completion.kind === "quest")
    .slice(0, quest.nodes.length)
    .map((completion) => completion.title);
  const completedCount = completedQuestTitles.length;
  const bossCompleted = completionHistory.some((completion) => completion.kind === "chapter");
  const homeStorageNotice = progressStorageError || signupStorageError;
  const totalMissions = quest.nodes.length + 1;
  const completedMissions = completedCount + (bossCompleted ? 1 : 0);
  const progressPct = (completedMissions / totalMissions) * 100;
  const progressPercent = Math.round(progressPct);

  if (activeNav === "SETTINGS") {
    return <SettingsScreen theme={theme} onNavigate={setActiveNav} onSignOut={onSignOut} />;
  }
  if (activeNav === "AI CHAT") {
    return <AiChatScreen answers={answers} theme={theme} onNavigate={setActiveNav} />;
  }
  if (activeNav === "MISSIONS") {
    return <MissionsScreen theme={theme} onNavigate={setActiveNav} />;
  }
  if (activeNav === "RECORDS") {
    return (
      <RecordsScreen
        theme={theme}
        onNavigate={setActiveNav}
        userId={userId}
        signupDate={signupDate}
        signupStorageError={signupStorageError}
        progressStorageError={progressStorageError}
        goal={quest.title}
        chapter={quest.chapter}
        progressPercent={progressPercent}
        completedQuestTitles={completedQuestTitles}
        completionHistory={completionHistory}
      />
    );
  }

  const canAccessBoss = completedCount === quest.nodes.length && !bossCompleted;
  const selectedIsTask = selectedQuestIndex < quest.nodes.length;
  const selectedIsBoss = selectedQuestIndex === quest.nodes.length;
  const selectedIsReflection = selectedQuestIndex === quest.nodes.length + 1;
  const selectedIsComplete = selectedIsTask && selectedQuestIndex < completedCount || selectedIsBoss && bossCompleted;
  const selectedIsCurrent = selectedIsTask && selectedQuestIndex === completedCount || selectedIsBoss && canAccessBoss || selectedIsReflection && bossCompleted;
  const selectedIsLocked = !selectedIsComplete && !selectedIsCurrent;
  const selectedStep = selectedIsTask ? quest.nodes[selectedQuestIndex] : null;
  const selectedTitle = selectedStep?.title ?? (selectedIsBoss ? "Meet the chapter challenge" : "Look back with intention");
  const selectedReason = selectedStep?.reason ?? (selectedIsBoss ? "Bring the pieces together and notice how far you've come." : "A moment of reflection helps you carry the useful parts forward.");

  const saveQuestCompletion = (completion: QuestCompletion) => {
    const nextProgress = { completionHistory: [...completionHistory, completion] };
    try {
      window.localStorage.setItem(`lifeos-progress-${userId}`, JSON.stringify(nextProgress));
      setQuestProgress(nextProgress);
      setProgressStorageError("");
      return true;
    } catch {
      setProgressStorageError("Your quest couldn't be recorded. Check this browser's storage and try again.");
      return false;
    }
  };

  const deleteLocalUserData = () => {
    try {
      window.localStorage.removeItem(`lifeos-records-${userId}`);
      window.localStorage.removeItem(`lifeos-reflections-${userId}`);
      window.localStorage.removeItem(`lifeos-progress-${userId}`);
      window.localStorage.removeItem("lifeos-username");
      window.localStorage.removeItem("lifeos-email");
      setQuestProgress({ completionHistory: [] });
      setProgressStorageError("");
      return true;
    } catch {
      return false;
    }
  };

  const startQuestHold = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if ((event && event.button !== 0) || holdTimer.current !== null) return;
    if (event) event.currentTarget.setPointerCapture(event.pointerId);
    setIsHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setIsHolding(false);
      if (selectedIsCurrent && selectedIsTask) setQuestModal("open");
      else if (selectedIsCurrent && selectedIsBoss) setQuestModal("boss-open");
      else if (selectedIsCurrent && selectedIsReflection) setReflectionModal("open");
    }, 1400);
  };

  const cancelQuestHold = () => {
    if (holdTimer.current === null) return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setIsHolding(false);
  };

  return (
    <div className={`home-shell home-redesign theme-${theme}`}>
      <div className="home-frame">
        <header className="home-progress">
          <button ref={profileButtonRef} className="home-profile-button" type="button" aria-label="Open profile" aria-haspopup="dialog" aria-expanded={profileOpen} onClick={() => setProfileOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 20v-1.2a7.5 7.5 0 0 1 15 0V20z" /></svg>
          </button>
          <h1 className="home-goal">I will <strong>{quest.title}</strong>.</h1>
          <div className="home-progress-copy">
            <span>{progressPercent}% complete</span>
          </div>
          <div className="home-progress-track" role="progressbar" aria-label="Chapter progress" aria-valuenow={progressPercent} aria-valuemax={100}>
            <span style={{ width: `${progressPct}%` }} />
          </div>
        </header>

        <section className="home-chapter" aria-label="Current chapter">
          <span>CHAPTER {quest.chapterNumber}</span>
          <h2>{quest.chapter}</h2>
        </section>

        <main className="quest-stage" aria-label="Current quest">
          <article className={`quest-card${selectedIsBoss ? " boss-card" : ""}${selectedIsLocked ? " locked-card" : ""}${selectedIsComplete ? " completed-card" : ""}`}>
            <h2>{selectedTitle}</h2>
            {selectedIsComplete ? (
              <span className="quest-complete-label">✓ &nbsp; QUEST COMPLETE</span>
            ) : selectedIsLocked ? (
              <p className="quest-card-notice">Complete the earlier quests to unlock this step.</p>
            ) : (
              <button
                className={`quest-hold-target${isHolding ? " is-holding" : ""}`}
                type="button"
                aria-label={`Press and hold to begin: ${selectedTitle}`}
                aria-pressed={isHolding}
                onPointerDown={startQuestHold}
                onPointerUp={cancelQuestHold}
                onPointerCancel={cancelQuestHold}
                onLostPointerCapture={cancelQuestHold}
                onKeyDown={(event) => {
                  if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                    event.preventDefault();
                    startQuestHold();
                  }
                }}
                onKeyUp={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    cancelQuestHold();
                  }
                }}
                onBlur={cancelQuestHold}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="M50 2 H74 A24 24 0 0 1 98 26 V74 A24 24 0 0 1 74 98 H26 A24 24 0 0 1 2 74 V26 A24 24 0 0 1 26 2 H50" /></svg>
              </button>
            )}
          </article>
          <p className={`home-hold-label${isHolding ? " is-holding" : ""}`}>{isHolding ? "KEEP HOLDING" : "PRESS AND HOLD TO BEGIN"}</p>
          <button className="why-matters-button" type="button" onClick={() => setWhyOpen(true)}>
            <svg className="why-bulb" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4m-2-20a7 7 0 0 0-4 12.7c.8.5 1 1.3 1 2.3h6c0-1 .2-1.8 1-2.3A7 7 0 0 0 12 1Z" /><path d="M12 1v-1m8 4 1-.6M4 4l-1-.6M22 12h1M1 12H0" /></svg>
            <span>Why this matters?</span>
            <span className="why-chevron" aria-hidden="true">›</span>
          </button>
        </main>

        <BottomNav active={activeNav} onSelect={setActiveNav} theme={theme} />
        {homeStorageNotice && <p className="home-storage-error" role="alert">{homeStorageNotice}</p>}
        {profileOpen && <ProfileSheet onClose={() => { setProfileOpen(false); profileButtonRef.current?.focus(); }} onDeleteData={deleteLocalUserData} />}

        {questModal !== "closed" && (
          <QuestModal
            success={questModal === "success" || questModal === "boss-success"}
            boss={questModal === "boss-open" || questModal === "boss-success"}
            error={progressStorageError}
            onClose={() => setQuestModal("closed")}
            onComplete={() => {
              if (questModal === "boss-open") {
                if (!saveQuestCompletion({ title: selectedTitle, completedAt: new Date().toISOString(), kind: "chapter" })) return;
                setSelectedQuestIndex(quest.nodes.length + 1);
                setQuestModal("boss-success");
                return;
              }
              if (!saveQuestCompletion({ title: selectedTitle, completedAt: new Date().toISOString(), kind: "quest" })) return;
              setSelectedQuestIndex((index) => Math.min(index + 1, quest.nodes.length));
              setQuestModal("success");
            }}
          />
        )}

        {reflectionModal !== "closed" && (
          <ReflectionModal closing={reflectionModal === "closing"} onClose={() => setReflectionModal("closing")} />
        )}

        {whyOpen && (
          <div className="why-matters-overlay" role="presentation" onClick={() => setWhyOpen(false)}>
            <section className="why-matters-sheet" role="dialog" aria-modal="true" aria-labelledby="why-matters-title" onClick={(event) => event.stopPropagation()}>
              <button className="why-matters-close" type="button" aria-label="Close" onClick={() => setWhyOpen(false)}>×</button>
              <h2 id="why-matters-title">{selectedTitle}</h2>
              <h3>Why this matters?</h3>
              <p>{selectedReason}</p>
            </section>
          </div>
        )}

        {featurePanel === "coach" && <CoachPanel answers={answers} onClose={() => setFeaturePanel(null)} />}
        {featurePanel === "side-quests" && <SideQuestsPanel onClose={() => setFeaturePanel(null)} />}
      </div>
    </div>
  );
}
