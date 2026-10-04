// Submitted squads are kept in this browser so the analytics dashboard can show trends.
const KEY = "india2027-squads";
export const loadSquads = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export const saveSquad = squad => { try { localStorage.setItem(KEY, JSON.stringify([...loadSquads(), { ...squad, at: Date.now() }])); } catch {} };