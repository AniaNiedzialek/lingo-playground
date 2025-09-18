// src/pages/Home.jsx
import { useLayoutEffect, useRef } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Link } from "react-router-dom";
import logoUrl from "/logo.png";
import * as THREE from "three";

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const card = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.08 * i, duration: 0.45, ease: "easeOut" },
  }),
  hover: { y: -4, scale: 1.01, transition: { type: "spring", stiffness: 240, damping: 20 } },
};

export default function Home() {
  const vantaRef = useRef(null);
  const vanta = useRef(null);

  useLayoutEffect(() => {
    let cancelled = false;

    (async () => {
      const mod = await import("vanta/dist/vanta.waves.min");
      if (cancelled || !vantaRef.current) return;

      const WAVES = mod.default;
      vanta.current = WAVES({
        el: vantaRef.current,
        THREE,

        // Controls
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,

        // Make it clearly visible
        backgroundColor: 0xF59827,  
        color: 0xB8884F,            // deeper accent
        waveHeight: 36.0,
        waveSpeed: 0.5,
        shininess: 40.0,
        zoom: 0.9,
      });
    })();

    return () => {
      cancelled = true;
      vanta.current?.destroy();
      vanta.current = null;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/* Vanta canvas behind everything */}
      <div ref={vantaRef} className="fixed inset-0 -z-10" />

      {/* No solid background on main; let Vanta show through */}
      <main className="relative min-h-screen">
        <section className="relative max-w-4xl mx-auto px-4 py-14">
          <div className="grid gap-6 md:grid-cols-[auto,1fr] items-center 
                bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 
                transition hover:shadow-2xl hover:ring-2 hover:ring-orange-400/60">
            <motion.img
              src={logoUrl}
              alt="Lingo Playground"
              className="h-20 w-20 rounded-full shadow-md"
              initial={{ scale: 0.8, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
            />
            <div>
            <motion.h1
                className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg"
                variants={fadeInUp}
                initial="hidden"
                animate="show"
                >
                Welcome to{" "}
                <span className="text-orange-700">
                    Lingo Playground
                </span>
                </motion.h1>

            <motion.p
                className="mt-2 text-gray-900 max-w-prose drop-shadow"
                variants={fadeInUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1 }}
            >
                Practice Spanish verb tenses with quick drills, streaks, and a bit of sparkle!
            </motion.p>

              <motion.div
                className="mt-5 flex flex-wrap gap-3"
                initial="hidden"
                animate="show"
                variants={fadeInUp}
                transition={{ delay: 0.18 }}
              >
                <Link
                  to="/present"
                  className="px-4 py-2 rounded-xl bg-green-800 text-white shadow-sm hover:shadow hover:scale-[1.02] transition"
                >
                  Start practicing
                </Link>
                <Link
                  to="/past"
                  className="px-4 py-2 rounded-xl bg-white text-gray-800 border shadow-sm hover:bg-gray-100 transition"
                >
                  Explore tenses
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Presente", to: "/present", desc: "Regular + irregular drills" },
              { title: "Pretérito", to: "/past", desc: "Indefinido & Imperfecto" },
              { title: "Futuro", to: "/future", desc: "Simple + ir a + inf." },
              { title: "Accents", to: "/present", desc: "Quick á/é/í/ó/ú/ñ helper" },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                className="group rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow"
                custom={i}
                variants={card}
                initial="hidden"
                animate="show"
                whileHover="hover"
              >
                <Link to={c.to} className="block">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <span className="text-2xl group-hover:translate-x-0.5 transition">→</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
