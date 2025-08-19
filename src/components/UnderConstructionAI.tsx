import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Inbox,
  Rocket,
  Briefcase,
  //   Calendar,
  Compass,
  Sparkles,
  CheckCircle2,
  Bell,
} from "lucide-react";
// --- Minimal UI components for @/components/ui/ ---
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import TextArea from "./ui/TextArea";
import CardHeader from "./ui/CardHeader";
import CardTitle from "./ui/CardTitle";
import CardContent from "./ui/CardContent";

// --- Construction Cone Themed UI Components ---
export function ConeCard(props: React.ComponentProps<typeof Card>) {
  return (
    <Card
      {...props}
      className={`border-2 border-orange-400 bg-orange-50 shadow-lg ${
        props.className ?? ""
      }`}
    >
      <div className="absolute -top-6 left-4 flex items-center">
        <span className="inline-block h-6 w-6 rounded-full bg-orange-400 border-2 border-white shadow-md" />
        <span className="ml-1 text-xs font-bold text-orange-700">🚧</span>
      </div>
      {props.children}
    </Card>
  );
}

export function ConeButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={`bg-gradient-to-r from-orange-400 to-yellow-300 text-white border-orange-500 border-2 shadow-orange-200 hover:from-orange-500 hover:to-yellow-400 ${
        props.className ?? ""
      }`}
    >
      {/* <span className="mr-2">🦺</span> */}
      {props.children}
    </Button>
  );
}

export function ConeInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={`border-orange-400 focus:ring-orange-400 focus:border-orange-500 ${
        props.className ?? ""
      }`}
    />
  );
}

export function ConeTextArea(props: React.ComponentProps<typeof TextArea>) {
  return (
    <TextArea
      {...props}
      className={`border-orange-400 focus:ring-orange-400 focus:border-orange-500 ${
        props.className ?? ""
      }`}
    />
  );
}

// -----------------------------------------------------------------------------
// Under Construction AI — Hire‑Ready MVP
// Features:
//  • Dashboard with daily “construction” meter
//  • Applications board (localStorage-backed) with pipeline stages
//  • Showcase slot for live widgets (includes MemeCube teaser + Quote hint)
//  • Mood switcher to help regulate energy while working
//  • Clean, corporate-friendly style with playful edge
// -----------------------------------------------------------------------------

// Simple localStorage helpers
const load = (k: string, fallback: string | [] | AppItem[]) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k: string, v: string | [] | AppItem[]) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

// Types
type AppItem = {
  id: string;
  role: string;
  company: string;
  link?: string;
  notes?: string;
  stage: "Prospecting" | "Applied" | "Interview" | "Offer" | "Closed";
  createdAt: number;
};

const STAGES: AppItem["stage"][] = [
  "Prospecting",
  "Applied",
  "Interview",
  "Offer",
  "Closed",
];

// Tiny ID
const uid = () => Math.random().toString(36).slice(2, 8);

// Store (lightweight without external libs)
function useAppStore() {
  const [items, setItems] = useState<AppItem[]>(() => load("ucai_items", []));
  const [mood, setMood] = useState<string>(() => load("ucai_mood", "Focused"));
  const [quote, setQuote] = useState<string>(() =>
    load("ucai_quote", "Ship small. Ship daily. Iterate kindly.")
  );

  const update = (fn: (x: AppItem[]) => AppItem[]) => {
    setItems((prev) => {
      const next = fn(prev);
      save("ucai_items", next);
      return next;
    });
  };
  const setMoodWrapped = (m: string) => {
    setMood(m);
    save("ucai_mood", m);
  };
  const setQuoteWrapped = (q: string) => {
    setQuote(q);
    save("ucai_quote", q);
  };
  return {
    items,
    update,
    mood,
    setMood: setMoodWrapped,
    quote,
    setQuote: setQuoteWrapped,
  };
}

// Progress meter derived from stages
function useConstructionMeter(items: AppItem[]) {
  return useMemo(() => {
    if (!items.length) return 10; // baseline
    const weights = {
      Prospecting: 1,
      Applied: 3,
      Interview: 6,
      Offer: 10,
      Closed: 1,
    } as const;
    const score = items.reduce((s, it) => s + (weights as any)[it.stage], 0);
    const capped = Math.min(
      100,
      Math.round((score / (items.length * 10)) * 100)
    );
    return Math.max(10, capped);
  }, [items]);
}

export default function UnderConstructionAI() {
  const { items, update, mood, setMood, quote, setQuote } = useAppStore();
  const [tab, setTab] = useState<"dashboard" | "apps" | "showcase" | "mood">(
    "dashboard"
  );
  const meter = useConstructionMeter(items);

  return (
    <div className="w-full bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex flex-wrap justify-center max-w-6xl items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-200/80 shadow-inner">
              <Sparkles size={18} />
            </span>
            <h1 className="text-xl font-semibold">
              Under Construction AI – Hire‑Ready
            </h1>
          </div>
          <nav className="ml-auto flex gap-2">
            <TopTab
              icon={<Compass size={16} />}
              label="Dashboard"
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            />
            <TopTab
              icon={<Briefcase size={16} />}
              label="Applications"
              active={tab === "apps"}
              onClick={() => setTab("apps")}
            />
            <TopTab
              icon={<Rocket size={16} />}
              label="Showcase"
              active={tab === "showcase"}
              onClick={() => setTab("showcase")}
            />
            <TopTab
              icon={<Bell size={16} />}
              label="Mood"
              active={tab === "mood"}
              onClick={() => setTab("mood")}
            />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <AnimatePresence mode="wait">
          {tab === "dashboard" && (
            <motion.section
              key="dash"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <ConeCard className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket size={18} /> Daily Build Meter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-neutral-200">
                      <motion.div
                        className="h-full bg-neutral-900"
                        initial={{ width: 0 }}
                        animate={{ width: meter + "%" }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 120,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums">
                      {meter}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    Score blends stage-weighted applications. Ship one small
                    thing today.
                  </p>
                </CardContent>
              </ConeCard>

              <ConeCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Inbox size={18} /> Quick Add
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickAdd onAdd={(it) => update((prev) => [it, ...prev])} />
                </CardContent>
              </ConeCard>

              <ConeCard className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Pipeline Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <Pipeline
                    items={items}
                    onMove={(id, stage) =>
                      update((prev) =>
                        prev.map((it) => (it.id === id ? { ...it, stage } : it))
                      )
                    }
                  />
                </CardContent>
              </ConeCard>
            </motion.section>
          )}

          {tab === "apps" && (
            <motion.section
              key="apps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <ConeCard className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Applications Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <Board items={items} onUpdate={(fn) => update(fn)} />
                </CardContent>
              </ConeCard>
              <ConeCard>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>{/* <FilterHint /> */}</CardContent>
              </ConeCard>
            </motion.section>
          )}

          {tab === "showcase" && (
            <motion.section
              key="show"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <ConeCard className="md:col-span-2">
                <CardHeader>
                  <CardTitle>MemeCube (teaser)</CardTitle>
                </CardHeader>
                <CardContent>
                  <MemeCube />
                </CardContent>
              </ConeCard>
              <ConeCard>
                <CardHeader>
                  <CardTitle>Quote Hint</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteBox quote={quote} setQuote={setQuote} />
                </CardContent>
              </ConeCard>
            </motion.section>
          )}

          {tab === "mood" && (
            <motion.section
              key="mood"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <ConeCard>
                <CardHeader>
                  <CardTitle>Mood Switcher</CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodPicker value={mood} onChange={setMood} />
                </CardContent>
              </ConeCard>
              <ConeCard>
                <CardHeader>
                  <CardTitle>Micro‑rituals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul
                    style={{ listStyleType: "none" }}
                    className="space-y-2 pl-5 text-sm text-neutral-700"
                  >
                    <li>
                      Two‑minute sweep: close tabs, rename branches, breathe.
                    </li>
                    <li>One message sent: reach out, follow up, thank you.</li>
                    <li>
                      One pixel better: nudge a corner radius, refine copy.
                    </li>
                  </ul>
                </CardContent>
              </ConeCard>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-6xl p-6 text-center text-xs text-neutral-500">
        <p>
          © {new Date().getFullYear()} Under Construction AI — Keep shipping.
          Keep it kind.
        </p>
      </footer>
    </div>
  );
}

// --------------------------------- UI Bits ----------------------------------
function TopTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition ${
        active ? "bg-neutral-900 text-white shadow" : "hover:bg-neutral-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function QuickAdd({ onAdd }: { onAdd: (it: AppItem) => void }) {
  const roleRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const role = roleRef.current?.value?.trim() || "";
    const company = companyRef.current?.value?.trim() || "";
    if (!role || !company) return;
    const it: AppItem = {
      id: uid(),
      role,
      company,
      link: linkRef.current?.value?.trim() || undefined,
      notes: notesRef.current?.value?.trim() || undefined,
      stage: "Prospecting",
      createdAt: Date.now(),
    };
    onAdd(it);
    if (roleRef.current) roleRef.current.value = "";
    if (companyRef.current) companyRef.current.value = "";
    if (linkRef.current) linkRef.current.value = "";
    if (notesRef.current) notesRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <ConeInput ref={roleRef} placeholder="Role (e.g., Frontend Engineer)" />
      <ConeInput ref={companyRef} placeholder="Company" />
      <ConeInput ref={linkRef} placeholder="Job link (optional)" />
      <ConeTextArea ref={notesRef} placeholder="Notes (optional)" />
      <ConeButton
        style={{ color: "black" }}
        className="w-full"
        onClick={submit}
      >
        {/* <Plus className="mr-2 h-4 w-4" /> */}+ Add
      </ConeButton>
    </div>
  );
}

function Pipeline({
  items,
  onMove,
}: {
  items: AppItem[];
  onMove: (id: string, stage: AppItem["stage"]) => void;
}) {
  return (
    <div className="grid grid-center gap-3 md:grid-cols-5">
      {STAGES.map((stage) => (
        <div key={stage} className="rounded-2xl border bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">{stage}</h3>
            <span className="text-xs text-neutral-500">
              {items.filter((i) => i.stage === stage).length}
            </span>
          </div>
          <div className="space-y-2">
            {items
              .filter((i) => i.stage === stage)
              .map((it) => (
                <div key={it.id} className="rounded-xl border p-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{it.role}</div>
                      <div className="text-neutral-600">{it.company}</div>
                    </div>
                    <StageSelect
                      value={it.stage}
                      onChange={(s) => onMove(it.id, s)}
                    />
                  </div>
                  {it.link && (
                    <a
                      href={it.link}
                      target="_blank"
                      className="mt-1 block truncate text-xs text-blue-700 underline"
                    >
                      {it.link}
                    </a>
                  )}
                </div>
              ))}
            {!items.filter((i) => i.stage === stage).length && (
              <div className="rounded-xl border border-dashed p-3 text-center text-xs text-neutral-500">
                Empty
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StageSelect({
  value,
  onChange,
}: {
  value: AppItem["stage"];
  onChange: (v: AppItem["stage"]) => void;
}) {
  return (
    <select
      className="rounded-lg border bg-white px-2 py-1 text-xs"
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function Board({
  items,
  onUpdate,
}: {
  items: AppItem[];
  onUpdate: (fn: (x: AppItem[]) => AppItem[]) => void;
}) {
  const remove = (id: string) =>
    onUpdate((prev) => prev.filter((i) => i.id !== id));
  const bump = (id: string) =>
    onUpdate((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stage: nextStage(i.stage) } : i))
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Card key={it.id} className="group transition hover:shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {it.role}{" "}
              <span className="text-sm text-neutral-500">@ {it.company}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 size={14} /> <span>{it.stage}</span>
            </div>
            {it.notes && (
              <p className="text-sm text-neutral-700 line-clamp-3">
                {it.notes}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => bump(it.id)}>
                Advance
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => remove(it.id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {!items.length && (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">
          Nothing here yet. Add an application on the Dashboard → Quick Add.
        </div>
      )}
    </div>
  );
}

function nextStage(s: AppItem["stage"]): AppItem["stage"] {
  const i = STAGES.indexOf(s);
  return STAGES[Math.min(STAGES.length - 1, i + 1)];
}

function QuoteBox({
  quote,
  setQuote,
}: {
  quote: string;
  setQuote: (q: string) => void;
}) {
  const [draft, setDraft] = useState(quote);
  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-white p-3 text-sm italic">
        “{quote}”
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Edit quote…"
      />
      <ConeButton style={{ color: "black" }} onClick={() => setQuote(draft)}>
        Save
      </ConeButton>
      <p className="text-xs text-neutral-500">
        (You can later swap this to an API quote feed.)
      </p>
    </div>
  );
}

function MoodPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const moods = ["Focused", "Playful", "Gritty", "Gentle", "Epic"];
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((m) => (
        <ConeButton
          key={m}
          onClick={() => onChange(m)}
          style={{ color: "black" }}
          className={`rounded-2xl border px-3 py-1.5 text-sm transition ${
            value === m ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
          }`}
        >
          {m}
        </ConeButton>
      ))}
    </div>
  );
}

// Minimal 3D-ish MemeCube teaser (CSS perspective)
function MemeCube() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="[perspective:800px]">
        <div className="relative h-40 w-40 [transform-style:preserve-3d] animate-[spin_12s_linear_infinite]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 grid place-items-center rounded-xl border bg-white text-xs font-medium text-neutral-600 shadow-sm"
              style={{ transform: faceTransform(i) }}
            >
              Meme {i + 1}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-neutral-500">
        Point this later at a folder picker + file URLs to map real memes on
        faces.
      </p>
    </div>
  );
}

function faceTransform(i: number) {
  const t = 80; // translateZ distance
  switch (i) {
    case 0:
      return `rotateY(0deg) translateZ(${t}px)`;
    case 1:
      return `rotateY(90deg) translateZ(${t}px)`;
    case 2:
      return `rotateY(180deg) translateZ(${t}px)`;
    case 3:
      return `rotateY(-90deg) translateZ(${t}px)`;
    case 4:
      return `rotateX(90deg) translateZ(${t}px)`;
    case 5:
      return `rotateX(-90deg) translateZ(${t}px)`;
    default:
      return "";
  }
}
