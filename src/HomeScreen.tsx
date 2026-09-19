import { useEffect, useRef, useState } from "react";

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

// Generate quest nodes based on user's goal category
function getQuestData(answers: Answers) {
  const goalText = answers[1] as string;
  const gap = answers[6] as string;
  const bottleneck = answers[8] as string;
  const evidence = answers[13] as string;
  const firstObjective = answers[15] as string;

  return {
    title: goalText?.slice(0, 32) || "YOUR NEXT CAPABILITY",
    current: firstObjective?.slice(0, 42) || bottleneck?.slice(0, 42) || "MAP THE FIRST SMALL TEST",
    nodes: [
      `CLARIFY: ${bottleneck?.slice(0, 22) || "THE BOTTLENECK"}`,
      `PRACTICE: ${gap?.slice(0, 22) || "THE MISSING PIECE"}`,
      "RUN A REAL-WORLD TEST",
      `CAPTURE: ${evidence?.slice(0, 22) || "VISIBLE EVIDENCE"}`,
      "REVIEW THE SIGNAL",
      "REACH THE FIRST RESULT",
    ],
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
  { icon: "🛒", label: "SHOP" },
  { icon: "📋", label: "MISSIONS" },
  { icon: "🏠", label: "HOME", active: true },
  { icon: "📖", label: "RECORDS" },
  { icon: "👤", label: "PROFILE" },
];

type Theme = "dark";

function BottomNav({ active, onSelect, theme = "default" }: { active: string; onSelect: (label: string) => void; theme?: Theme }) {
  return (
    <div className={`bottom-nav theme-${theme}`} style={{
      display: "flex",
      borderTop: "1px solid var(--nav-border, #0d3a5c)",
      background: "var(--nav-bg, #050f1e)",
      position: "relative",
    }}>
      {/* Top edge glow line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #00c8ff, transparent)", opacity: 0.4 }} />

      {NAV_ITEMS.map((item) => {
        const isActive = item.label === active;
        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.label)}
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
            {/* Active HOME gets a pentagon-ish background */}
            {isActive && (
              <div style={{
                position: "absolute",
                inset: "4px 6px",
                background: "var(--nav-active-bg, rgba(0,200,255,0.08))",
                border: "1px solid var(--nav-active-border, rgba(0,200,255,0.3))",
                clipPath: "polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)",
                boxShadow: "var(--nav-active-shadow, 0 0 16px rgba(0,200,255,0.15))",
              }} />
            )}
            <span style={{ fontSize: "1.1rem", lineHeight: 1, position: "relative" }}>{item.icon}</span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5rem",
              letterSpacing: "0.08em",
              color: isActive ? "var(--nav-active-color, #00c8ff)" : "var(--nav-muted-color, #1a4a66)",
              position: "relative",
              textShadow: isActive ? "var(--nav-active-text-shadow, 0 0 8px rgba(0,200,255,0.5))" : "none",
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
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
  const [missionTypeModal, setMissionTypeModal] = useState(false);
  const [taskCreationModal, setTaskCreationModal] = useState(false);
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
  };

  const openMissionCreation = (type: "Task" | "Habit" | "Daily") => {
    setSelectedMissionType(type);
    setTaskTitle("");
    setTaskNotes("");
    setTaskChecklist("");
    setTaskChecklistItems([]);
    setTaskDifficulty("B");
    setTaskDueDate("");
    setCalendarMonth(new Date());
    setMissionTypeModal(false);
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
    setMissions((current) => [
      ...current,
      { id: `mission-${Date.now()}`, title: title.toUpperCase(), category: selectedMissionType === "Habit" ? "LIFE" : selectedMissionType === "Daily" ? "HEALTH" : "ACADEMIC", status: selectedMissionType || "Task", rank: taskDifficulty, checklist },
    ]);
    setTaskTitle("");
    setTaskNotes("");
    setTaskChecklist("");
    setTaskChecklistItems([]);
    setTaskDueDate("");
    setCalendarMonth(new Date());
    closeMissionModals();
  };

  const toggleMission = (id: string) => {
    setCompleted((current) => ({ ...current, [id]: !current[id] }));
    setMissions((current) => {
      const missionIndex = current.findIndex((mission) => mission.id === id);
      if (missionIndex === -1 || missionIndex === current.length - 1) return current;
      return [...current.slice(0, missionIndex), ...current.slice(missionIndex + 1), current[missionIndex]];
    });
  };

  return (
    <div className={`missions-shell theme-${theme}`}>
      <div className="scanlines" />
      <div className="missions-frame">
        <HudCorners bright size={18} />
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
              <h2 id="task-creation-title">MISSION CREATION</h2>
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
            <article key={mission.id} className={`mission-card${completed[mission.id] ? " mission-card-completed" : ""}${mission.checklist.length ? " mission-card-has-checklist" : ""}`}>
              <div className="mission-card-main">
                <button type="button" className="mission-check" aria-label={`${completed[mission.id] ? "Uncomplete" : "Complete"} ${mission.title}`} aria-pressed={Boolean(completed[mission.id])} onClick={() => toggleMission(mission.id)}>{completed[mission.id] ? "✓" : ""}</button>
                <div className="mission-copy"><h2>{mission.title}</h2><div className="mission-tag">{mission.category}</div></div>
                <div className="mission-meta"><div className="mission-status-line"><span className="mission-label">Status:</span><span className="mission-status-value">{mission.status}</span></div><div className="mission-rank-line"><span className="mission-label">Rank:</span><span className="mission-rank">{mission.rank}</span></div></div>
                <button type="button" className="mission-edit-btn" aria-label={`Edit ${mission.title}`}>✎</button>
              </div>
              {mission.checklist.length > 0 && <><button type="button" className="mission-expand-btn" aria-expanded={Boolean(expandedMissions[mission.id])} onClick={() => setExpandedMissions((current) => ({ ...current, [mission.id]: !current[mission.id] }))}>{expandedMissions[mission.id] ? "HIDE CHECKLIST" : `SHOW CHECKLIST (${mission.checklist.length})`}</button>{expandedMissions[mission.id] && <div className="mission-checklist">{mission.checklist.map((item) => <label className={`mission-checklist-item${item.completed ? " completed" : ""}`} key={item.id}><input type="checkbox" checked={item.completed} onChange={() => setMissions((current) => current.map((currentMission) => currentMission.id === mission.id ? { ...currentMission, checklist: currentMission.checklist.map((currentItem) => currentItem.id === item.id ? { ...currentItem, completed: !currentItem.completed } : currentItem) } : currentMission))} /><span>{item.text}</span></label>)}</div>}</>}
            </article>
          ))}
        </main>

        <div className="missions-nav-wrap">
          <BottomNav active="MISSIONS" onSelect={onNavigate} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function RecordsScreen({ theme, onNavigate }: { theme: Theme; onNavigate: (label: string) => void }) {
  type RecordEntry = { id: string; date: string; title: string; description: string; icon: string; mode: "TEXT" | "IMAGE"; image?: string };
  const initialRecords: RecordEntry[] = [
    { id: "first-step", date: "12/07/26", title: "FIRST STEP TAKEN", description: "Completed Quest 1. Identified my biggest weakness and set my first target. Feels small but it's real.", icon: "🌱", mode: "TEXT" },
    { id: "consistency", date: "12/15/26", title: "CONSISTENCY UNLOCKED", description: "7-day streak achieved. Never made it this far before. The habit is starting to feel automatic.", icon: "🔥", mode: "TEXT" },
    { id: "boss-defeated", date: "12/30/26", title: "FIRST BOSS DEFEATED", description: "Completed the Chapter 1 boss challenge. It was harder than I expected but I did it.", icon: "⚔️", mode: "TEXT" },
  ];
  const [records, setRecords] = useState<RecordEntry[]>(initialRecords);
  const [view, setView] = useState<"TIMELINE" | "GALLERY" | "STATS">("TIMELINE");
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [recordMode, setRecordMode] = useState<"TEXT" | "IMAGE">("TEXT");
  const [recordDate, setRecordDate] = useState(() => new Date().toLocaleDateString("en-GB"));
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordIcon, setRecordIcon] = useState("⭐");
  const [recordImage, setRecordImage] = useState("");
  const icons = ["⭐", "🔥", "⚔️", "🌱", "💪", "🧠", "🏆", "⚡", "🎯", "🌈", "🛡️", "☀️"];

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
    setRecords((current) => [...current, {
      id: `record-${Date.now()}`,
      date: recordDate,
      title: recordTitle.trim().toUpperCase(),
      description: recordDescription.trim() || "Image record added to the archive.",
      icon: recordIcon,
      mode: recordMode,
      image: recordImage || undefined,
    }]);
    resetRecordForm();
  };

  const handleRecordImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRecordImage(typeof reader.result === "string" ? reader.result : "");
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
            {(["TIMELINE", "GALLERY", "STATS"] as const).map((tab) => <button key={tab} type="button" className={view === tab ? "active" : ""} onClick={() => setView(tab)}>{tab}</button>)}
          </nav>
        </header>
        <main className={`records-panel records-${view.toLowerCase()}`}>
          {view === "TIMELINE" && <div className="records-timeline">{records.filter((record) => record.mode === "TEXT").map((record) => <article className="record-timeline-item" key={record.id}><span className="record-node" /><div className="record-card"><div className="record-card-top"><time>{record.date}</time>{renderRecordIcon(record)}</div><h2>{record.title}</h2><p>{record.description}</p></div></article>)}</div>}
          {view === "GALLERY" && <div className="records-gallery">{records.filter((record) => record.mode === "IMAGE").map((record) => <article className="record-gallery-card" key={record.id}>{record.image ? <img src={record.image} alt="" /> : <div className="record-gallery-icon">{record.icon}</div>}<h2>{record.title}</h2><time>{record.date}</time></article>)}</div>}
          {view === "STATS" && <div className="records-stats"><div className="records-chart"><span className="records-section-label">▸ PROGRESS CHART</span><div className="chart-line"><i /><i /><i /><i /><i /><i /></div></div><div className="stat-row"><span>🎯 &nbsp; QUESTS COMPLETED</span><strong>0</strong></div><div className="stat-row"><span>⚔️ &nbsp; BOSSES DEFEATED</span><strong>0</strong></div><div className="stat-row"><span>📖 &nbsp; STORY CHAPTERS DONE</span><strong>0</strong></div><div className="stat-row"><span>🗓️ &nbsp; DAYS ACTIVE</span><strong>{records.length}</strong></div><div className="stat-row"><span>🗓️ &nbsp; CURRENT JOURNEY</span><strong>10 DAYS</strong></div><div className="records-before-now"><span className="records-section-label">▸ BEFORE / NOW</span><div><span>BEFORE<br /><strong>Struggling with social &amp; life</strong></span><span>NOW<br /><strong>{records.length} records logged</strong></span></div></div></div>}
          <button className="add-record-trigger" type="button" onClick={() => setCreateRecordOpen(true)}>+ &nbsp; ADD A NEW RECORD</button>
        </main>
          {createRecordOpen && <div className="record-create-overlay" role="dialog" aria-modal="true" aria-labelledby="new-record-title"><form className="record-create-panel" onSubmit={saveRecord}><div className="record-create-top"><button type="button" onClick={resetRecordForm}>× CLOSE</button></div><div className="record-mode-tabs"><button type="button" className={recordMode === "TEXT" ? "active" : ""} onClick={() => setRecordMode("TEXT")}>TEXT RECORD</button><button type="button" className={recordMode === "IMAGE" ? "active" : ""} onClick={() => setRecordMode("IMAGE")}>IMAGE RECORD</button></div><h2 id="new-record-title">NEW RECORD</h2><label><span>DATE:</span><input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} /></label><label><span>TITLE:</span><input value={recordTitle} onChange={(event) => setRecordTitle(event.target.value)} placeholder="TYPE HERE..." autoFocus /></label>{recordMode === "TEXT" ? <><label><span>DESCRIPTION:</span><textarea value={recordDescription} onChange={(event) => setRecordDescription(event.target.value)} placeholder="TYPE HERE..." rows={4} /></label><div className="record-ai"><span>OR GENERATE WITH AI ✨</span><button type="button" onClick={generateDescription}>✨ &nbsp; GENERATE DESCRIPTION WITH AI</button></div><label><span>ATTACH IMAGE (OPTIONAL):</span><input type="file" accept="image/*" onChange={handleRecordImage} /></label>{recordImage && <img className="record-image-attachment" src={recordImage} alt="Attachment preview" />}</> : <label><span>ADD IMAGE:</span><label className="record-upload"><input type="file" accept="image/*" onChange={handleRecordImage} />{recordImage ? <img src={recordImage} alt="Upload preview" /> : <><span className="record-upload-icon">🌄</span><span>TAP TO UPLOAD PROOF IMAGE</span></>}</label></label>}<div className="record-icon-picker"><span>ICON:</span><div>{icons.map((icon) => <button type="button" className={recordIcon === icon ? "selected" : ""} key={icon} onClick={() => setRecordIcon(icon)}>{icon}</button>)}</div></div><button className="add-record-submit" type="submit" disabled={!recordTitle.trim() || (recordMode === "TEXT" ? !recordDescription.trim() : !recordImage)}>ADD RECORD ✓</button></form></div>}
        <BottomNav active="RECORDS" onSelect={onNavigate} theme={theme} />
      </div>
    </div>
  );
}

function ProfileSettings({ username, onUsernameChange, onClose, onSignOut }: { username: string; onUsernameChange: (value: string) => void; onClose: () => void; onSignOut: () => void }) {
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

  return <div className="profile-settings-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
    <div className="profile-settings-page">
      <header className="profile-settings-header"><div><div className="eyebrow">PROFILE / SYSTEM SETTINGS</div><h2 id="profile-settings-title">SETTINGS</h2></div><button type="button" className="profile-settings-close" onClick={onClose}>× CLOSE</button></header>
      <main className="profile-settings-content">
        <section className="settings-section settings-profile-section"><div className="settings-section-heading"><div><span className="settings-section-index">01</span><h3>{languageCopy.profile}</h3></div><p>Manage the details connected to your LifeOS profile.</p></div><div className="settings-form-grid"><label><span>{languageCopy.username}</span><input value={username} maxLength={25} onChange={(event) => onUsernameChange(event.target.value.slice(0, 25))} /></label><div className="settings-account-row"><span>{languageCopy.email}</span>{editingEmail ? <input type="email" value={email} autoFocus onChange={(event) => updateEmail(event.target.value)} onBlur={() => setEditingEmail(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditingEmail(false); }} /> : <strong>{showEmail ? email : `${email.slice(0, 4)}${email.length > 4 ? "********" : ""}${email.includes("@") ? email.slice(email.indexOf("@")) : ""}`}</strong>}<button type="button" className="settings-reveal" onClick={() => setShowEmail((current) => !current)}>{showEmail ? languageCopy.hide : languageCopy.reveal}</button><button type="button" className="settings-edit-button" onClick={() => setEditingEmail(true)}>{editingEmail ? languageCopy.save : languageCopy.edit}</button></div><div className="settings-account-row"><span>{languageCopy.password}</span>{editingPassword ? <input type={showPassword ? "text" : "password"} value={password} autoFocus placeholder="ENTER NEW PASSWORD" onChange={(event) => setPassword(event.target.value)} onBlur={() => setEditingPassword(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditingPassword(false); }} /> : <strong>{password ? (showPassword ? password : "********") : "NOT SET"}</strong>}<button type="button" className="settings-reveal" onClick={() => setShowPassword((current) => !current)}>{showPassword ? languageCopy.hide : languageCopy.reveal}</button><button type="button" className="settings-edit-button" onClick={() => setEditingPassword(true)}>{editingPassword ? languageCopy.save : languageCopy.edit}</button></div></div><p className="settings-note">Your username is limited to 25 characters. Passwords are kept in this session until account security is connected.</p></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">02</span><h3>PERSONALISATION</h3></div><p>Shape the visual system around the way you work.</p></div><div className="settings-inline-grid"><label><span>FONT SYSTEM</span><select value={font} onChange={(event) => setFont(event.target.value)}><option>ORBITRON / RAJDHANI</option><option>SHARE TECH / RAJDHANI</option><option>CLASSIC / SYSTEM</option></select></label><label><span>SOUND PROFILE</span><select value={soundEnabled ? "ON" : "OFF"} onChange={(event) => setSoundEnabled(event.target.value === "ON")}><option>ON</option><option>OFF</option></select></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">03</span><h3>LANGUAGE &amp; TIME</h3></div><p>Set how dates, times, and system copy appear.</p></div><div className="settings-inline-grid"><label><span>LANGUAGE</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>ENGLISH</option><option>SPANISH</option><option>FRENCH</option><option>GERMAN</option></select></label><label><span>TIME ZONE</span><select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}><option>SYSTEM DEFAULT</option><option>UTC</option><option>US / EASTERN</option><option>US / PACIFIC</option><option>EUROPE / LONDON</option></select></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">04</span><h3>NOTIFICATIONS</h3></div><p>Choose which signals are allowed to reach you.</p></div><div className="settings-toggle-list"><label className="settings-toggle"><span><strong>NOTIFICATIONS</strong><small>Allow LifeOS to send reminders and progress updates.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} /><i /></label><label className="settings-toggle"><span><strong>DAILY REMINDER</strong><small>Prompt me to check in and keep the journey moving.</small></span><input type="checkbox" checked={dailyReminder} onChange={(event) => setDailyReminder(event.target.checked)} /><i /></label><label className="settings-toggle"><span><strong>NOTIFICATION SOUNDS</strong><small>Play a sound when an alert or milestone arrives.</small></span><input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} /><i /></label></div></section>
        <section className="settings-section"><div className="settings-section-heading"><div><span className="settings-section-index">05</span><h3>ACCESSIBILITY &amp; PRIVACY</h3></div><p>Control comfort, motion, and data preferences.</p></div><div className="settings-toggle-list"><label className="settings-toggle"><span><strong>REDUCE MOTION</strong><small>Use fewer animated transitions throughout the interface.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /><i /></label><button type="button" className="settings-action-row"><span><strong>DOWNLOAD MY DATA</strong><small>Export your profile and progress information.</small></span><b>→</b></button><button type="button" className="settings-action-row danger"><span><strong>DELETE PROFILE DATA</strong><small>Remove locally stored profile information.</small></span><b>→</b></button><button type="button" className="settings-action-row" onClick={onSignOut}><span><strong>SIGN OUT</strong><small>End this local session and keep your profile saved.</small></span><b>→</b></button></div></section>
      </main>
    </div>
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

function QuestModal({ success, boss, onClose, onComplete }: { success: boolean; boss: boolean; onClose: () => void; onComplete: () => void }) {
  return (
    <div className={`quest-modal${success ? " success" : ""}${boss ? " boss" : ""}`} role="dialog" aria-modal="true">
      <div className="quest-modal-panel">
        {!success && <button className="quest-modal-close" type="button" aria-label="Close quest" onClick={onClose}>×</button>}
        <div className="eyebrow">{success ? (boss ? "BOSS QUEST LOG UPDATED" : "QUEST LOG UPDATED") : (boss ? "BOSS QUEST / PLACEHOLDER" : "CURRENT QUEST / PLACEHOLDER")}</div>
        {success ? <h2>{boss ? "BOSS QUEST SUCCESSFULLY COMPLETED" : "QUEST SUCCESSFULLY COMPLETED"}</h2> : <button className="complete-quest-btn" type="button" onClick={onComplete}>{boss ? "COMPLETE BOSS QUEST" : "COMPLETE QUEST"}</button>}
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

export default function HomeScreen({ answers, onSignOut = () => undefined }: Props & { onSignOut?: () => void }) {
  const quest = getQuestData(answers);
  const [activeNav, setActiveNav] = useState("HOME");
  const [theme, setTheme] = useState<Theme>("dark");
  const [completedCount, setCompletedCount] = useState(0);
  const [bossCompleted, setBossCompleted] = useState(false);
  const [questModal, setQuestModal] = useState<"closed" | "open" | "boss-open" | "success" | "boss-success">("closed");
  const [reflectionModal, setReflectionModal] = useState<"closed" | "open" | "closing">("closed");
  const [featurePanel, setFeaturePanel] = useState<"coach" | "side-quests" | null>(null);

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

  if (activeNav === "PROFILE") {
    return <AccountScreen theme={theme} setTheme={setTheme} onNavigate={setActiveNav} onSignOut={onSignOut} />;
  }
  if (activeNav === "SHOP") {
    return <ShopScreen theme={theme} onNavigate={setActiveNav} />;
  }
  if (activeNav === "MISSIONS") {
    return <MissionsScreen theme={theme} onNavigate={setActiveNav} />;
  }
  if (activeNav === "RECORDS") {
    return <RecordsScreen theme={theme} onNavigate={setActiveNav} />;
  }

  // New journeys begin with an empty, locked path.
  const nodeStates: NodeState[] = quest.nodes.map((_, i) => i < completedCount ? "done" : i === completedCount ? "current" : "locked");

  // Zigzag offsets for the 6 nodes
  const zigzag = [0, 0, 0, 0, 0, 0];

  const totalMissions = quest.nodes.length + 1;
  const completedMissions = completedCount + (bossCompleted ? 1 : 0);
  const progressPct = (completedMissions / totalMissions) * 100;
  const canAccessBoss = completedCount === quest.nodes.length && !bossCompleted;

  const goalDisplay = quest.title.toUpperCase().slice(0, 32);

  return (
    <div className={`home-shell theme-${theme}`} style={{
      minHeight: "100vh",
      background: "var(--app-bg, #020a14)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Scanlines */}
      <div className="scanlines" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Outer frame — mimics the wireframe phone HUD */}
      <div style={{
        width: "100%",
        maxWidth: "min(92vw, 1200px)",
        minHeight: "calc(100vh - 2rem)",
        maxHeight: "none",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: "1px solid var(--frame-border, #0d3a5c)",
        background: "var(--app-bg, #020a14)",
        zIndex: 1,
        overflow: "hidden",
      }}>
        {/* Outer frame corners */}
        <HudCorners bright size={22} />

        {/* Top edge decoration lines */}
        <div style={{ position: "absolute", top: 0, left: 22, right: 22, height: 1, background: "linear-gradient(90deg, transparent, var(--accent, #00c8ff) 30%, var(--accent, #00c8ff) 70%, transparent)", opacity: 0.6 }} />
        <div style={{ position: "absolute", bottom: 0, left: 22, right: 22, height: 1, background: "linear-gradient(90deg, transparent, var(--accent, #00c8ff) 30%, var(--accent, #00c8ff) 70%, transparent)", opacity: 0.6 }} />

        {/* Side edge notch decorations */}
        {[-1, 1].map((side) => (
          <div key={side} style={{
            position: "absolute",
            top: "40%",
            [side === -1 ? "left" : "right"]: -1,
            width: 4,
            height: 40,
            background: "var(--accent, #00c8ff)",
            opacity: 0.4,
          }} />
        ))}

        {/* ── HEADER ── */}
        <div style={{ padding: "0.7rem 1rem 0.45rem", borderBottom: "1px solid var(--frame-border, #0d3a5c)", flexShrink: 0 }}>
          {/* Goal label */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--accent, #00c8ff)", letterSpacing: "0.12em" }}>
              CURRENT GOAL:
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--header-text, #c8eeff)", letterSpacing: "0.08em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {goalDisplay}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--progress-bg, #071525)", border: "1px solid var(--frame-border, #0d3a5c)", overflow: "visible", position: "relative" }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, var(--progress-start, #0055aa), var(--accent, #00c8ff))",
              boxShadow: "0 0 5px var(--accent-strong, #00e5ff), 0 0 12px var(--accent, #00c8ff), 0 0 24px rgba(0,200,255,0.8)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 3 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--muted-text, #4a7a99)" }}>
              {completedMissions}/{totalMissions} MISSIONS
            </span>
          </div>
        </div>

        {/* ── CURRENT QUEST BANNER ── */}
        <div style={{ padding: "0.55rem 1rem 0", flexShrink: 0 }}>
          <div style={{
            position: "relative",
            background: "var(--surface, #071525)",
            border: "1px solid var(--frame-border, #0d3a5c)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <HudCorners />
            {/* Octagon warning icon */}
            <div style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              background: "var(--accent-soft, rgba(0,200,255,0.05))",
              border: "1px solid var(--accent-border, rgba(0,200,255,0.3))",
              clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}>
              ❗
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", color: "var(--accent, #00c8ff)", fontWeight: 700, letterSpacing: "0.1em" }}>
                CURRENT Chapter:
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--primary-text, #c8eeff)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>
                {quest.current}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA (quest path + side panels) ── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
          {/* AI COACH — left side panel */}
          <div style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 20,
            zIndex: 2,
          }}>
            <button type="button" aria-label="Open AI Coach" onClick={() => setFeaturePanel("coach")} style={{
              position: "relative",
              background: "var(--surface, #071525)",
              border: "1px solid var(--frame-border, #0d3a5c)",
              borderLeft: "none",
              padding: "1.5rem 0.35rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "inherit",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                color: "var(--muted-text, #4a7a99)",
                letterSpacing: "0.1em",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                userSelect: "none",
              }}>
                ‹ AI COACH
              </span>
            </button>
          </div>

          {/* SIDE QUESTS — right side panel */}
          <div style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 20,
            zIndex: 2,
          }}>
            <button type="button" aria-label="Open Side Quests" onClick={() => setFeaturePanel("side-quests")} style={{
              position: "relative",
              background: "var(--surface, #071525)",
              border: "1px solid var(--frame-border, #0d3a5c)",
              borderRight: "none",
              padding: "1.5rem 0.35rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "inherit",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                color: "var(--muted-text, #4a7a99)",
                letterSpacing: "0.1em",
                writingMode: "vertical-rl",
                userSelect: "none",
              }}>
                SIDE QUESTS ›
              </span>
            </button>
          </div>

          {/* ── QUEST PATH ── */}
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0,
            padding: "0.95rem 36px",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 0 }}>
              {quest.nodes.map((label, i) => {
                const offsetX = zigzag[i] || 0;
                const state = nodeStates[i];

                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative" }}>
                    <div style={{ height: i > 0 ? 44 : 0, flexShrink: 0 }} />
                    <QuestNode label={label} state={state} offsetX={offsetX} index={i} onClick={state === "current" ? () => setQuestModal("open") : undefined} />
                  </div>
                );
              })}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "2rem", paddingBottom: "1.5rem" }}>
                <button className={`path-action boss-action${bossCompleted ? " completed" : ""}`} type="button" disabled={!canAccessBoss} onClick={() => setQuestModal("boss-open")}>
                  <span style={{ fontSize: "1rem" }}>⚠️</span>
                  <span>BOSS</span>
                </button>
                <button className="path-action reflection-action" type="button" disabled={!bossCompleted} onClick={() => setReflectionModal("open")}>
                  <span style={{ fontSize: "1rem" }}>🔖</span>
                  <span>
                    <strong>END OF QUEST</strong>
                    <small>REFLECTION</small>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {questModal !== "closed" && (
          <QuestModal
            success={questModal === "success" || questModal === "boss-success"}
            boss={questModal === "boss-open" || questModal === "boss-success"}
            onClose={() => setQuestModal("closed")}
            onComplete={() => {
              if (questModal === "boss-open") {
                setBossCompleted(true);
                setQuestModal("boss-success");
                return;
              }
              setCompletedCount((count) => Math.min(count + 1, quest.nodes.length));
              setQuestModal("success");
            }}
          />
        )}

        {reflectionModal !== "closed" && (
          <ReflectionModal closing={reflectionModal === "closing"} onClose={() => setReflectionModal("closing")} />
        )}

        {featurePanel === "coach" && <CoachPanel answers={answers} onClose={() => setFeaturePanel(null)} />}
        {featurePanel === "side-quests" && <SideQuestsPanel onClose={() => setFeaturePanel(null)} />}

        {/* ── BOTTOM NAV ── */}
        <BottomNav active={activeNav} onSelect={setActiveNav} theme={theme} />
      </div>
    </div>
  );
}
