import { Preferences } from "@capacitor/preferences";
// Every submitted squad (name, email, phone, 15 players, C/VC/WK) is kept on this device,
// in localStorage AND in the app's native Preferences, so it survives restarts.
const KEY = "india2027-squads";
export const loadSquads = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = list => { const v = JSON.stringify(list); try { localStorage.setItem(KEY, v); } catch {} Preferences.set({ key: KEY, value: v }).catch(() => {}); };
export const saveSquad = squad => write([...loadSquads(), { ...squad, at: Date.now() }]);
// Called once at start-up: restores from whichever copy has more squads.
export async function restoreSquads() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    const saved = JSON.parse(value || "[]"), local = loadSquads();
    if (saved.length > local.length) localStorage.setItem(KEY, JSON.stringify(saved)); else if (local.length > saved.length) write(local);
  } catch {}
}
