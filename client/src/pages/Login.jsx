import { motion } from "framer-motion";
import { ChefHat, Sparkles } from "lucide-react";
import { useAuth } from "../context/auth";

export function Login() {
  const { login } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f3e8] text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(183,247,214,0.9),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(239,96,79,0.22),transparent_28%),linear-gradient(135deg,#fffaf0,#eaf6ee_52%,#f8efe0)]" />
      <section className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold shadow-soft backdrop-blur">
            <Sparkles size={16} />
            Your fridge, translated into dinner
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-normal text-ink md:text-7xl">
              FridgeChef
            </h1>
            <p className="max-w-xl text-lg leading-8 text-steel">
              Track what you have, open a living fridge, and turn the ingredients you already own into polished recipe matches.
            </p>
          </div>
          <button
            onClick={login}
            className="group inline-flex items-center gap-3 rounded-2xl bg-ink px-6 py-4 text-base font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-basil"
          >
            <ChefHat size={20} />
            Continue with Google
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative min-h-[420px] rounded-[2rem] border border-white/75 bg-white/45 p-6 shadow-soft backdrop-blur-xl"
        >
          <div className="absolute inset-6 rounded-[1.5rem] bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
          <div className="absolute inset-6 rounded-[1.5rem] bg-gradient-to-br from-ink/75 via-ink/25 to-transparent" />
          <div className="relative flex h-full min-h-[370px] flex-col justify-end p-6 text-white">
            <p className="max-w-sm text-3xl font-black leading-tight">
              A calmer way to answer the nightly “what can I cook?” question.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
