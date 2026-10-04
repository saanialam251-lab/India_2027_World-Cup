import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Copy, Mail } from "lucide-react";
import { byId, ROLE_COLOR } from "../data/players";
import { sendSquad, gmailUrl, BCCI_EMAIL } from "../utils/emailService";
import { saveSquad } from "../utils/storage";

export default function SubmitModal({ selected, cap, vc, wk, onClose, onSaved }) {
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [res, setRes] = useState(null), [copied, setCopied] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const tag = id => id === cap ? "C" : id === vc ? "VC" : id === wk ? "WK" : "";

  const submit = async e => {
    e.preventDefault(); setError("");
    const name = f.name.trim(), email = f.email.trim(), phone = f.phone.trim();
    if (!name) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid 10-digit phone number.");
    setBusy(true);
    const squad = { selected, cap, vc, wk, fanName: name, fanEmail: email, fanPhone: phone };
    saveSquad(squad); onSaved?.();            // saved first, so the email includes your own squad in the totals
    setRes(await sendSquad(squad)); setBusy(false);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(`To: ${res.mail.to}\nSubject: ${res.mail.subject}\n\n${res.mail.body}`); setCopied(true); } catch {} };

  return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-4">
    <motion.div initial={{ scale: .94, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .94 }} onClick={e => e.stopPropagation()}
      className="relative bg-[#0a1630] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto scroll-thin shadow-2xl">
      <div className="tricolour h-1 rounded-t-3xl" />
      <div className="p-6 grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="font-oswald text-2xl">{res ? "Your email is ready" : "Send your squad to BCCI"}</h2>
            <p className="text-sm text-white/55 mt-1">{res ? `Addressed to ${BCCI_EMAIL}` : "Review your 15 and add your details."}</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid place-items-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20"><X size={16} /></button>
        </div>

        {res ? (<div className="grid gap-3 text-sm">
          <p className="flex gap-2 items-start text-white/80"><Check size={18} className="text-[#22c55e] shrink-0 mt-0.5" />
            {res.via === "app" ? "Your email app opened with the message written. Press Send there." : res.via === "gmail" ? "No email app on this device, so Gmail opened in a new tab. Press Send there." : "Your browser blocked the Gmail tab. Use a button below."}</p>
          <p className="text-white/50">Nothing is sent until you press Send in your email.</p>
          <div className="flex flex-wrap gap-2">
            <a href={gmailUrl(res.mail)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F52BA] hover:bg-[#1660d6] font-semibold"><Mail size={16} />Open in Gmail</a>
            <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15"><Copy size={16} />{copied ? "Copied" : "Copy email"}</button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 ml-auto">Done</button>
          </div></div>
        ) : (<form onSubmit={submit} className="grid gap-5">
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm bg-white/[.04] rounded-2xl p-4">
            {selected.map((id, i) => <li key={id} className="flex items-center gap-2 min-w-0">
              <span className="text-white/35 w-5 text-right text-xs">{i + 1}</span>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ROLE_COLOR[byId[id].role] }} />
              <span className="truncate">{byId[id].name}</span>
              {tag(id) && <span className="text-[10px] font-bold bg-[#FF9933] text-[#050d1f] rounded px-1.5 py-px">{tag(id)}</span>}
            </li>)}
          </ol>
          <div className="grid gap-3">
            <input value={f.name} onChange={set("name")} placeholder="Your name" autoComplete="name" className="field" />
            <input type="email" value={f.email} onChange={set("email")} placeholder="Your email" autoComplete="email" className="field" />
            <input type="tel" value={f.phone} onChange={set("phone")} placeholder="Phone number" autoComplete="tel" className="field" />
          </div>
          {error && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15">Cancel</button>
            <button disabled={busy} className="px-5 py-2.5 rounded-xl bg-[#0F52BA] hover:bg-[#1660d6] font-semibold disabled:opacity-50">{busy ? "Opening email…" : "Write email to BCCI"}</button>
          </div>
        </form>)}
      </div>
    </motion.div></motion.div>);
}