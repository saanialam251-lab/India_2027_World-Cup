import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { byId, count, RULES } from "./data/players";
import BackgroundFX from "./components/BackgroundFX"; import HeroJerseys from "./components/HeroJerseys";

import PlayerGrid from "./components/PlayerGrid";
import SquadLocker from "./components/SquadLocker";
import SubmitModal from "./components/SubmitModal";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

const MAX = {
  bat: 7,
  bowl: 8,
  ar: 4,
  wk: 2,
};

const GROUP_NAME = {
  bat: "batters",
  bowl: "bowlers",
  ar: "all-rounders",
  wk: "wicket-keepers",
};

const groupOf = (id) => {
  const r = byId[id].role;
  return r === "fast" || r === "spin" ? "bowl" : r;
};

export default function App() {
  const [sel, setSel] = useState([]);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(0);

  const [roles, setRoles] = useState({
    cap: "",
    vc: "",
    wk: "",
  });

  const [modal, setModal] = useState(false);
  const [tick, setTick] = useState(0);

  const notify = (msg, ok = false) => {
    setToast({ msg, ok });

    if (!ok) {
      setShake((s) => s + 1);
    }

    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const blockReason = (id) => {
    const group = groupOf(id);
    const nextCount = count([...sel, id]);

    if (sel.length >= 15) {
      return "Squad is full";
    }

    if (nextCount[group] > MAX[group]) {
      return `Max ${MAX[group]} ${GROUP_NAME[group]} reached`;
    }

    return "";
  };

  const pick = (id) => {
    // Remove player
    if (sel.includes(id)) {
      setSel(sel.filter((x) => x !== id));

      // Clear C / VC / WK if the removed player had a role
      setRoles((r) => ({
        cap: r.cap === id ? "" : r.cap,
        vc: r.vc === id ? "" : r.vc,
        wk: r.wk === id ? "" : r.wk,
      }));

      return;
    }

    // Check whether player can be added
    const why = blockReason(id);

    if (why) {
      return notify(`${why} – remove a player first`);
    }

    setSel([...sel, id]);
  };

  const c = count(sel);

  const keepers = sel.filter(
    (id) => byId[id].role === "wk"
  );

  const { cap, vc } = roles;

  // Automatically use the only wicket-keeper when there is exactly one.
  const wk =
    roles.wk ||
    (keepers.length === 1 ? keepers[0] : "");

  // Captain and VC must be different players.
  const setRole = (key, id) => {
    setRoles((r) => {
      const next = {
        ...r,
        [key]: r[key] === id ? "" : id,
      };

      if (key === "cap" && next.vc === id) {
        next.vc = "";
      }

      if (key === "vc" && next.cap === id) {
        next.cap = "";
      }

      return next;
    });
  };

  const problem =
    sel.length !== 15
      ? ""
      : c.bat < RULES.bat[0]
        ? "Need at least 4 batters"
        : c.bowl < RULES.bowl[0]
          ? "Need at least 5 bowlers"
          : c.fast < RULES.minFast
            ? "Need at least 3 fast bowlers"
            : c.spin < RULES.minSpin
              ? "Need at least 1 spinner"
              : c.ar < RULES.ar[0]
                ? "Need at least 1 all-rounder"
                : c.wk < RULES.wk[0]
                  ? "Need at least 1 wicket-keeper"
                  : "";

  const ready = sel.length === 15 && !problem;

  const go =
    ready &&
    cap &&
    vc &&
    wk &&
    cap !== vc;

  return (
    <>
      <BackgroundFX />

      <HeroJerseys
        step={go ? 2 : ready ? 1 : 0}
      />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 pb-20 overflow-x-clip">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* PLAYER GRID */}
          <div className="flex-1 min-w-0">
            <PlayerGrid
              selected={sel}
              onPick={pick}
              blockReason={blockReason}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:w-[400px] shrink-0 self-start lg:sticky lg:top-5 w-full min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4">

              <SquadLocker
                selected={sel}
                onRemove={pick}
                shake={shake}
                cap={cap}
                vc={vc}
                wk={wk}
                setRole={setRole}
                problem={problem}
                go={go}
                onFinalize={() => setModal(true)}
              />

            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <AnalyticsDashboard tick={tick} />
      </main>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              y: 40,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm z-50 shadow-xl ${
              toast.ok
                ? "bg-[#138808]"
                : "bg-red-600"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {modal && (
          <SubmitModal
            selected={sel}
            cap={cap}
            vc={vc}
            wk={wk}
            onClose={() => setModal(false)}
            onSaved={() => setTick((t) => t + 1)}
          />
        )}
      </AnimatePresence>
    </>
  );
    }
