import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, UserCircle, LogOut } from "lucide-react";
import { createAccount, loginAccount, errorText } from "../utils/api";

const digits = v => v.replace(/\D/g, "").slice(0, 10);
const Popup = ({ kind, onClose, onCreate }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 bg-black/70 grid place-items-center p-6 rounded-3xl">
    <motion.div initial={{ scale: .8, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", damping: 16, stiffness: 220 }}
      className="bg-[#0a1630] border border-white/15 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
      {kind === "ok" ? (<>
        <motion.svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto mb-3">
          <motion.circle cx="36" cy="36" r="32" fill="none" stroke="#22c55e" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .5 }} />
          <motion.path d="M22 37 l10 10 l19 -22" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: .4, duration: .4 }} />
        </motion.svg>
        <p className="font-oswald text-xl">Logged in successfully</p></>
      ) : (<>
        <motion.div initial={{ rotate: -20, scale: .5 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring" }} className="mx-auto mb-3 w-14 h-14 rounded-full bg-amber-400/15 grid place-items-center text-3xl">!</motion.div>
        <p className="font-oswald text-xl mb-1">Please create a new account</p>
        <p className="text-sm text-white/55 mb-4">We could not find an account with that name and phone number.</p>
        <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10">Try again</button>
          <button onClick={onCreate} className="flex-1 py-2.5 rounded-xl bg-[#0F52BA] font-semibold">Create account</button></div></>)}
    </motion.div></motion.div>);

export default function AuthModal({ start, session, onClose, onLoggedIn, onLogout }) {
  const [view, setView] = useState(session ? "account" : start);
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [popup, setPopup] = useState(null), [created, setCreated] = useState(false);
  const set = k => e => setF({ ...f, [k]: k === "phone" ? digits(e.target.value) : e.target.value });
  const go = v => { setView(v); setError(""); setF({ name: "", email: "", phone: "" }); };

  const login = async e => {
    e.preventDefault(); setError("");
    if (!f.name.trim()) return setError("Please enter your name.");
    if (f.phone.length !== 10) return setError("Phone number must be exactly 10 digits.");
    setBusy(true);
    try {
      const r = await loginAccount(f.name, f.phone);
      if (r.ok) { setPopup("ok"); setTimeout(() => onLoggedIn(r), 1700); } else setPopup("no");
    } catch (er) { setError(errorText(er)); }
    setBusy(false);
  };
  const create = async e => {
    e.preventDefault(); setError("");
    if (f.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError("Please enter a valid email address.");
    if (f.phone.length !== 10) return setError("Phone number must be exactly 10 digits.");
    setBusy(true);
    try {
      const r = await createAccount(f.name.trim(), f.email.trim(), f.phone);
      if (r.ok) { setCreated(true); go("login"); }
      else setError(r.reason === "phone_exists" ? "This phone number already has an account. Please log in." : "Please check your details and try again.");
    } catch (er) { setError(errorText(er)); }
    setBusy(false);
  };

  const title = view === "account" ? "Your account" : view === "create" ? "Create account" : "Login";
  return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={popup === "ok" ? undefined : onClose} className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4">
    <motion.div initial={{ scale: .94, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .94 }} onClick={e => e.stopPropagation()}
      className="relative bg-[#0a1630] border border-white/10 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto scroll-thin shadow-2xl">
      <div className="tricolour h-1 rounded-t-3xl" />
      <div className="p-6 grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-oswald text-2xl flex items-center gap-2"><UserCircle size={26} className="text-[#FF9933]" />{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20"><X size={16} /></button>
        </div>

        {view === "account" && <div className="grid gap-3 text-sm">
          <div className="bg-white/[.04] rounded-2xl p-4 grid gap-1"><p className="font-semibold text-base">{session.name}</p><p className="text-white/60">{session.phone}</p><p className="text-white/60 truncate">{session.email}</p></div>
          <p className="text-xs text-white/45">Your account and squad are saved on the server, so you can log in again on any phone.</p>
          <button onClick={onLogout} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold"><LogOut size={16} />Log out</button></div>}

        {view === "login" && <form onSubmit={login} className="grid gap-4">
          {created && <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl px-4 py-2.5">Account created. Please log in.</p>}
          <input value={f.name} onChange={set("name")} placeholder="Name" autoComplete="name" className="field" />
          <input type="tel" inputMode="numeric" maxLength={10} value={f.phone} onChange={set("phone")} placeholder="Phone number (10 digits)" autoComplete="tel" className="field" />
          {error && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">{error}</p>}
          <button disabled={busy} className="py-3 rounded-xl bg-[#0F52BA] hover:bg-[#1660d6] font-semibold disabled:opacity-50">{busy ? "Logging in…" : "Login"}</button>
          <p className="text-center text-sm text-white/60">New here? <button type="button" onClick={() => { go("create"); setCreated(false); }} className="text-[#FF9933] font-semibold underline">Create a new account</button></p>
        </form>}

        {view === "create" && <form onSubmit={create} className="grid gap-4">
          <input value={f.name} onChange={set("name")} placeholder="Name" autoComplete="name" className="field" />
          <input type="email" value={f.email} onChange={set("email")} placeholder="Email ID" autoComplete="email" className="field" />
          <input type="tel" inputMode="numeric" maxLength={10} value={f.phone} onChange={set("phone")} placeholder="Phone number (10 digits)" autoComplete="tel" className="field" />
          {error && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">{error}</p>}
          <button disabled={busy} className="py-3 rounded-xl bg-[#0F52BA] hover:bg-[#1660d6] font-semibold disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button>
          <p className="text-center text-sm text-white/60">Already have an account? <button type="button" onClick={() => go("login")} className="text-[#FF9933] font-semibold underline">Login</button></p>
        </form>}
      </div>
      <AnimatePresence>{popup && <Popup kind={popup} onClose={() => setPopup(null)} onCreate={() => { setPopup(null); go("create"); }} />}</AnimatePresence>
    </motion.div></motion.div>);
                                                                   }
