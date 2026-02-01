import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const SplashPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const tagline = "가장 낮은 눈높이에서, 가장 높은 서비스를";
  const [typed, setTyped] = useState(0);

  const TOTAL_MS = 2600;

  useEffect(() => {
    const t = setTimeout(() => navigate("/login"), TOTAL_MS);
    return () => clearTimeout(t);
  }, [navigate]);

  useEffect(() => {
    if (reduce) {
      setTyped(tagline.length);
      return;
    }
    const start = setTimeout(() => setTyped(1), 520);
    return () => clearTimeout(start);
  }, [reduce, tagline.length]);

  useEffect(() => {
    if (reduce) return;
    if (typed <= 0 || typed >= tagline.length) return;
    const t = setTimeout(() => setTyped((p) => p + 1), 32);
    return () => clearTimeout(t);
  }, [typed, tagline.length, reduce]);

  const v = useMemo(() => {
    if (reduce) {
      return {
        page: { initial: { opacity: 1 }, animate: { opacity: 1 } },
        block: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
        logo: { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 } },
        word: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
      };
    }
    return {
      page: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      },
      block: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
      },
      logo: {
        initial: { opacity: 0, scale: 0.96 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.9, delay: 0.05, type: "spring", stiffness: 120, damping: 16 },
        },
      },
      word: {
        initial: { opacity: 0, y: 8, filter: "blur(8px)" },
        animate: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] },
        },
      },
    };
  }, [reduce]);

  return (
    <motion.div
      className="relative min-h-dvh w-full overflow-hidden"
      variants={v.page}
      initial="initial"
      animate="animate"
    >
      {/* bright airport tone background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 560px at 18% 8%, rgba(0,100,255,0.14), rgba(0,100,255,0) 62%)," +
            "radial-gradient(820px 520px at 88% 86%, rgba(90,220,255,0.16), rgba(90,220,255,0) 62%)," +
            "linear-gradient(180deg, #FFFFFF 0%, #F7FBFF 55%, #EEF6FF 100%)",
        }}
      />

      {/* subtle airy glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-36 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(0,100,255,0.18), rgba(0,100,255,0))" }}
        animate={reduce ? {} : { scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }}
        transition={reduce ? {} : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* very light grid (optional but clean) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 30% 18%, black 28%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-screen-2xl items-center justify-center px-5 sm:px-8 lg:px-12">
        <motion.div variants={v.block} className="w-full">
          {/* responsive layout: stack -> row */}
          <div className="mx-auto grid w-full items-center justify-items-center gap-5 md:grid-cols-[auto,1fr] md:justify-items-start md:gap-10">
            {/* logo */}
            <motion.div variants={v.logo} className="relative">
              {/* halo */}
              <div
                aria-hidden
                className="absolute -inset-8 rounded-[28px] blur-2xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(0,100,255,0.18), rgba(0,100,255,0))",
                }}
              />
              <div className="relative grid place-items-center">
                <img
                  src="/images/logo.png"
                  alt="CARRY PORTER Logo"
                  className="h-[clamp(64px,9vw,112px)] w-[clamp(64px,9vw,112px)] object-contain drop-shadow-[0_16px_28px_rgba(0,60,140,0.18)]"
                />
              </div>
            </motion.div>

            {/* wordmark */}
            <motion.div variants={v.word} className="text-center md:text-left">
              <h1 className="select-none font-['Beckman',sans-serif] font-extrabold leading-[0.92] tracking-[-0.02em]">
                <span className="block text-slate-900 text-[clamp(2.2rem,6vw,5.0rem)]">
                  CARRY
                </span>
                <span
                  className="block text-[clamp(2.2rem,6vw,5.0rem)]"
                  style={{
                    color: "#0064FF",
                    textShadow: "0 18px 60px rgba(0,100,255,0.16)",
                  }}
                >
                  PORTER
                </span>
              </h1>

              {/* tagline */}
              <div className="mt-3 min-h-[1.8rem]">
                <p className="font-['Pretendard'] text-[clamp(0.95rem,1.5vw,1.12rem)] font-medium leading-relaxed text-slate-700">
                  {tagline.slice(0, typed)}
                  {!reduce && typed > 0 && typed < tagline.length && (
                    <span
                      aria-hidden
                      className="ml-1 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
                    />
                  )}
                </p>
              </div>

              {/* minimal loading: dots only */}
              <div className="mt-6 flex justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "rgba(0,100,255,0.35)" }}
                      animate={reduce ? {} : { y: [0, -5, 0], opacity: [0.55, 1, 0.55] }}
                      transition={reduce ? {} : { duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* tiny footer (optional). 지우고 싶으면 이 블록 삭제 */}
          <div className="mt-12 flex items-center justify-center">
            <p className="font-['Pretendard'] text-xs text-slate-400">© CARRY PORTER</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashPage;
