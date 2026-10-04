import { motion } from "framer-motion";
export default function BackgroundFX() {
  return (<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[#071a3d] via-[#050d1f] to-[#050d1f]" />
    {[["#0F52BA", "-top-40 -left-40"], ["#FF9933", "top-1/3 -right-40"], ["#138808", "bottom-0 left-1/4"]].map(([c, pos], i) =>
      <motion.div key={i} className={`absolute ${pos} w-[520px] h-[520px] rounded-full blur-[140px] opacity-25`} style={{ background: c }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "easeInOut" }} />)}
  </div>);
}